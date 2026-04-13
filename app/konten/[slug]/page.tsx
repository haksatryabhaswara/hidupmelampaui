"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import {
  ArrowLeft, BookOpen, Play, Lock, ShoppingCart, CheckCircle, ChevronRight,
  Award, Layers, Video, FileText, ClipboardList, AlignLeft, List, Send,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { allContents, type Content, type StepContent } from "@/lib/content-data";
import { Certificate } from "@/components/certificate";
import { useProgress } from "@/lib/progress";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type ContentTest, type ContentQuestion } from "@/lib/content-data";

// ─── Minimal YouTube IFrame API types ────────────────────────────────────────
declare global {
  interface Window {
    YT?: {
      Player: new (
        id: string | HTMLElement,
        opts: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onStateChange?: (e: { data: number }) => void;
            onError?: () => void;
          };
        }
      ) => { destroy(): void };
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: (() => void) | null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRupiah(n: number) {
  // Avoid Intl.NumberFormat locale differences between Node.js (small-icu) and browser.
  return "Rp\u00A0" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<iframe\b[^>]*\/>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
}

function HtmlBody({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm max-w-none text-[var(--muted-foreground)] [&_h1]:text-[var(--foreground)] [&_h2]:text-[var(--foreground)] [&_h3]:text-[var(--foreground)] [&_h4]:text-[var(--foreground)] [&_strong]:text-[var(--foreground)] [&_a]:text-[var(--primary)] [&_blockquote]:border-[var(--primary)] [&_hr]:border-[var(--border)]"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

// ─── YouTube player hook ──────────────────────────────────────────────────────
function useYouTubePlayer(
  youtubeId: string | null,
  divId: string,
  onEnded: () => void,
  active: boolean,
) {
  const onEndedRef = useRef(onEnded);
  useEffect(() => { onEndedRef.current = onEnded; });

  useEffect(() => {
    if (!youtubeId || !active) return;
    let player: { destroy(): void } | null = null;
    // Create a child slot for YT to replace with its iframe.
    // This keeps the parent div (managed by React) untouched, preventing
    // removeChild errors when React reconciles or the component unmounts.
    let slot: HTMLDivElement | null = null;

    function create() {
      const container = document.getElementById(divId);
      if (!container || !window.YT?.Player) return;
      slot = document.createElement("div");
      container.appendChild(slot);
      player = new window.YT.Player(slot, {
        videoId: youtubeId!,
        width: "100%",
        height: "100%",
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange(e) { if (e.data === 0) onEndedRef.current(); },
        },
      });
    }

    if (window.YT?.Player) {
      create();
    } else {
      const prev = window.onYouTubeIframeAPIReady ?? null;
      window.onYouTubeIframeAPIReady = () => { prev?.(); create(); };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }
    return () => {
      // player.destroy() internally calls removeChild on its iframe.
      // If the parent was already removed by React, that throws — catch it.
      try { player?.destroy(); } catch { /* detached node — safe to ignore */ }
      try { if (slot?.parentNode) slot.parentNode.removeChild(slot); } catch { /* already detached */ }
    };
  }, [youtubeId, divId, active]);
}

// ─── Article scroll tracking ──────────────────────────────────────────────────
function useScrolledToEnd(resetKey: string) {
  const endRef = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(false);
  const [trackedKey, setTrackedKey] = useState(resetKey);
  if (trackedKey !== resetKey) {
    setTrackedKey(resetKey);
    setReached(false);
  }
  useEffect(() => {
    if (!endRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setReached(true); },
      { threshold: 0.6 },
    );
    obs.observe(endRef.current);
    return () => obs.disconnect();
  }, [resetKey]);
  return { endRef, reached };
}

// ─── VideoSection ─────────────────────────────────────────────────────────────
function VideoSection({ youtubeId, itemId, onComplete, alreadyDone }: {
  youtubeId: string; itemId: string; onComplete: () => void; alreadyDone: boolean;
}) {
  const divId = `yt-${itemId}`;
  useYouTubePlayer(youtubeId, divId, onComplete, !alreadyDone);
  return (
    <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
      {alreadyDone ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title="Video" className="w-full h-full" allowFullScreen
        />
      ) : (
        <div id={divId} className="w-full h-full" />
      )}
    </div>
  );
}

// ─── ArticleSection ───────────────────────────────────────────────────────────
function ArticleSection({ body, itemId, onComplete, alreadyDone }: {
  body: string; itemId: string; onComplete: () => void; alreadyDone: boolean;
}) {
  const { endRef, reached } = useScrolledToEnd(itemId);
  return (
    <div>
      <HtmlBody html={body} />
      <div ref={endRef} className="h-1" />
      {!alreadyDone && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onComplete}
            disabled={!reached}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              reached
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {reached ? "Tandai Selesai Membaca" : "Gulir ke bawah untuk menyelesaikan"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── AccessGate ───────────────────────────────────────────────────────────────
function AccessGate({ step, user, openAuthModal, parentSlug }: {
  step: StepContent;
  user: { email?: string | null; uid?: string } | null;
  openAuthModal: (redirect?: string) => void;
  parentSlug: string;
}) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!user?.email) { openAuthModal(`/konten/${parentSlug}`); return; }
    setPurchasing(true);
    setPurchaseError(null);
    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: step.id,
          contentTitle: step.title,
          price: step.price ?? 0,
          userId: (user as { uid: string }).uid,
          userEmail: user.email,
          successRedirectUrl: `${window.location.origin}/konten/${parentSlug}?paidStep=${step.id}`,
          failureRedirectUrl: `${window.location.origin}/konten/${parentSlug}?payment=failed`,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Gagal membuat invoice");
      }
      const data = (await res.json()) as { invoiceUrl: string };
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setPurchaseError((err as Error).message ?? "Terjadi kesalahan.");
    } finally {
      setPurchasing(false);
    }
  };

  if (step.access === "login") {
    return (
      <div className="my-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center space-y-4">
        <Lock className="w-10 h-10 text-blue-500 mx-auto" />
        <h2 className="text-xl font-bold text-[var(--foreground)]">Login Diperlukan</h2>
        <p className="text-[var(--muted-foreground)] text-sm">Langkah ini gratis — cukup login atau daftar akun.</p>
        <button
          onClick={() => openAuthModal(`/konten/${parentSlug}`)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
        >
          Masuk / Daftar Gratis
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center space-y-4">
      <ShoppingCart className="w-10 h-10 text-amber-500 mx-auto" />
      <h2 className="text-xl font-bold text-[var(--foreground)]">Langkah Berbayar</h2>
      <p className="text-[var(--muted-foreground)] text-sm max-w-sm mx-auto">Beli langkah ini untuk membuka akses selamanya.</p>
      {step.price && <p className="text-3xl font-bold text-amber-600">{formatRupiah(step.price)}</p>}
      {purchaseError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{purchaseError}</p>}
      {!user ? (
        <button onClick={() => openAuthModal(`/konten/${parentSlug}`)}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
          <Lock className="w-4 h-4" /> Login untuk Membeli
        </button>
      ) : (
        <button onClick={handleBuy} disabled={purchasing}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          <ShoppingCart className="w-4 h-4" />
          {purchasing ? "Memproses..." : "Beli Sekarang"}
        </button>
      )}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>{done}/{total} langkah selesai</span><span>{pct}%</span>
      </div>
      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── SingleVideoSetup (side-effect only) ─────────────────────────────────────
function SingleVideoSetup({ youtubeId, contentId, onComplete }: {
  youtubeId: string; contentId: string; onComplete: () => void;
}) {
  useYouTubePlayer(youtubeId, `yt-${contentId}`, onComplete, true);
  return null;
}

// ─── ContentTestSection ───────────────────────────────────────────────────────
function ContentTestSection({ test, contentId, contentSlug, user }: {
  test: ContentTest;
  contentId: string;
  contentSlug: string;
  user: { uid: string; email?: string | null; displayName?: string | null } | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkingPrev, setCheckingPrev] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user already submitted an answer for this content
  useEffect(() => {
    if (!user) { setCheckingPrev(false); return; }
    getDocs(
      query(
        collection(db, "content_test_answers"),
        where("contentId", "==", contentId),
        where("userId", "==", user.uid),
      ),
    )
      .then((snap) => { if (!snap.empty) setSubmitted(true); })
      .catch(() => {})
      .finally(() => setCheckingPrev(false));
  }, [user, contentId]);

  const setAnswer = (questionId: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, "content_test_answers"), {
        contentId,
        contentSlug,
        userId: user.uid,
        userEmail: user.email ?? "",
        userName: user.displayName ?? user.email ?? "",
        answers: test.questions.map((q) => ({
          questionId: q.id,
          question: q.question,
          type: q.type,
          answer: answers[q.id] ?? "",
        })),
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      setError("Gagal mengirim jawaban. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingPrev) {
    return (
      <div className="mt-8 flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-8 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-3">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-lg font-bold text-[var(--foreground)]">Tes Sudah Dikerjakan!</h3>
        <p className="text-[var(--muted-foreground)] text-sm">Jawaban Anda telah tersimpan.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-[var(--muted)]/30 border-b border-[var(--border)]">
        <ClipboardList className="w-5 h-5 text-[var(--primary)]" />
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">Tes Pemahaman</h3>
          <p className="text-xs text-[var(--muted-foreground)]">{test.questions.length} pertanyaan · Opsional</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {!user && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
            Anda harus login untuk mengirim jawaban tes.
          </div>
        )}
        {test.questions.map((q: ContentQuestion, idx: number) => (
          <div key={q.id} className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    q.type === "essay"
                      ? "bg-blue-100 dark:bg-blue-950/40 text-blue-600"
                      : "bg-purple-100 dark:bg-purple-950/40 text-purple-600"
                  }`}>
                    {q.type === "essay" ? <AlignLeft className="w-3 h-3" /> : <List className="w-3 h-3" />}
                    {q.type === "essay" ? "Esai" : "Pilihan Ganda"}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{q.question}</p>
                {q.type === "essay" ? (
                  <textarea
                    rows={4}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] resize-none"
                    placeholder="Tulis jawaban Anda di sini..."
                    disabled={!user || submitting}
                  />
                ) : (
                  <div className="space-y-2">
                    {(q.options ?? []).map((opt) => (
                      <label key={opt.label} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[q.id] === opt.label
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-[var(--border)] hover:bg-[var(--muted)]/50"
                      }`}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.label}
                          checked={answers[q.id] === opt.label}
                          onChange={() => setAnswer(q.id, opt.label)}
                          className="sr-only"
                          disabled={!user || submitting}
                        />
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          answers[q.id] === opt.label
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border)] text-[var(--muted-foreground)]"
                        }`}>
                          {opt.label}
                        </span>
                        <span className="text-sm text-[var(--foreground)]">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!user || submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Mengirim..." : "Kirim Jawaban"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════
function KontenDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, openAuthModal, loading } = useAuth();

  const slug = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const [content, setContent] = useState<Content | undefined>(allContents.find((c) => c.slug === slug));

  // Try loading from Firestore first, fall back to static data
  useEffect(() => {
    if (!slug) return;
    getDocs(query(collection(db, "contents"), where("slug", "==", slug)))
      .then((snap) => {
        if (!snap.empty) {
          const newContent = { ...(snap.docs[0].data() as Content), id: snap.docs[0].id };
          setContent(newContent);
          // Set initial active step id async (avoids synchronous setState in effect)
          if (newContent.isSteppedContent && newContent.steps?.length) {
            setActiveStepId((prev) => prev ?? newContent.steps![0].id);
          }
        }
      })
      .catch(() => {
        // keep static fallback already in state
      });
  }, [slug]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Progress backed by Firestore (authenticated) or localStorage (guest)
  const { completed, started, paid, progressLoading, markCompleted, markStarted, markPaid } = useProgress(user);

  // Log that user has started this content (fires once per content per user)
  useEffect(() => {
    if (!progressLoading && slug) {
      void markStarted(slug);
    }
  }, [progressLoading, slug, markStarted]);

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const paymentStatus = searchParams?.get("payment");

  // Persist paid step from ?paidStep= URL param
  useEffect(() => {
    const paidStep = searchParams?.get("paidStep");
    if (paidStep) void markPaid(paidStep);
  }, [searchParams, markPaid]);

  // Use the stable numeric id for progress; slug is only for URLs

  const [activeStepId, setActiveStepId] = useState<string | null>(
    content?.isSteppedContent && content.steps?.length ? content.steps[0].id : null
  );
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (!loading && !user && content && !content.isSteppedContent && content.access !== "free") {
      openAuthModal(`/konten/${slug}`);
    }
  }, [loading, user, content, slug, openAuthModal]);

  const handleMarkDone = useCallback((itemId: string) => {
    void markCompleted(itemId);
  }, [markCompleted]);

  if (!content) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-[var(--muted-foreground)] mx-auto" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Konten tidak ditemukan</h1>
          <Link href="/konten" className="text-[var(--primary)] hover:underline">← Kembali ke daftar konten</Link>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STEPPED CONTENT
  // ───────────────────────────────────────────────────────────────────────────
  if (content.isSteppedContent && content.steps) {
    const steps = content.steps;
    const activeStep = steps.find((s) => s.id === activeStepId) ?? steps[0];
    const stepIndex = steps.findIndex((s) => s.id === activeStep.id);
    const completedCount = steps.filter((s) => completed.has(s.id)).length;
    const allDone = completedCount === steps.length;

    const stepPrevLocked = (idx: number) => idx > 0 && !completed.has(steps[idx - 1].id);

    const stepAccessBlocked = (step: StepContent): boolean => {
      if (step.access === "free") return false;
      if (step.access === "login") return !user;
      if (step.access === "paid") return !paid.has(step.id);
      return false;
    };

    const accessBadge = (step: StepContent) => {
      if (step.access === "login")
        return <span className="text-[10px] bg-blue-100 dark:bg-blue-950/50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Login</span>;
      if (step.access === "paid")
        return <span className="text-[10px] bg-amber-100 dark:bg-amber-950/50 text-amber-600 px-1.5 py-0.5 rounded font-medium">{step.price ? formatRupiah(step.price) : "Berbayar"}</span>;
      return <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">Gratis</span>;
    };

    return (
      <div className="min-h-screen bg-[var(--background)]">
        {showCertificate && (
          <Certificate
            userName={user?.displayName ?? user?.email ?? "Peserta"}
            contentTitle={content.title}
            completedAt={new Date()}
            onClose={() => setShowCertificate(false)}
          />
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/konten" className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Konten
          </Link>

          {/* Series header */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[var(--primary)] text-xs font-semibold uppercase tracking-wider">{content.category}</span>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                    Seri Bertahap · {steps.length} Langkah
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">{content.title}</h1>
                <p className="text-[var(--muted-foreground)] text-sm mb-4">{content.description}</p>
                <ProgressBar done={completedCount} total={steps.length} />
              </div>
            </div>

            {allDone && (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-700 dark:text-emerald-300 text-sm flex-1">
                  Selamat! Anda telah menyelesaikan semua langkah. Sertifikat Anda siap.
                </p>
                <button
                  onClick={() => setShowCertificate(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Award className="w-4 h-4" /> Dapatkan Sertifikat
                </button>
              </div>
            )}
          </div>

          {/* Sidebar + Step content */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
            {/* Steps sidebar */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 px-1">Daftar Langkah</h2>
              {steps.map((step, idx) => {
                const isDone = completed.has(step.id);
                const isActive = step.id === activeStep.id;
                const prevLocked = stepPrevLocked(idx);
                const accessBlocked = !prevLocked && stepAccessBlocked(step);

                return (
                  <button
                    key={step.id}
                    onClick={() => !prevLocked && setActiveStepId(step.id)}
                    disabled={prevLocked}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--accent)]"
                        : prevLocked
                          ? "border-[var(--border)] bg-[var(--muted)]/30 opacity-50 cursor-not-allowed"
                          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 hover:bg-[var(--accent)]/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                        isDone ? "bg-emerald-500 text-white" : isActive ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}>
                        {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : prevLocked ? <Lock className="w-3 h-3" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-snug mb-1 ${isActive ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
                          {step.title}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {step.type === "video" ? <Video className="w-3 h-3 text-[var(--muted-foreground)]" /> : <FileText className="w-3 h-3 text-[var(--muted-foreground)]" />}
                          <span className="text-[10px] text-[var(--muted-foreground)]">{step.duration}</span>
                          {accessBadge(step)}
                          {accessBlocked && <Lock className="w-3 h-3 text-amber-500" />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active step content */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[var(--border)]">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Langkah {stepIndex + 1} dari {steps.length}</span>
                  {completed.has(activeStep.id) && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Selesai
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">{activeStep.title}</h2>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">{activeStep.description}</p>
              </div>

              <div className="p-6">
                {progressLoading ? (
                  <div className="py-16 flex justify-center">
                    <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {completed.has(activeStep.id) && (
                      <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-6 text-emerald-700 dark:text-emerald-300 text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" /> Anda sudah menyelesaikan langkah ini.
                      </div>
                    )}

                    {stepPrevLocked(stepIndex) ? (
                      <div className="text-center py-12 space-y-4">
                        <Lock className="w-12 h-12 text-[var(--muted-foreground)] mx-auto" />
                        <h3 className="font-bold text-[var(--foreground)]">Langkah Terkunci</h3>
                        <p className="text-[var(--muted-foreground)] text-sm max-w-xs mx-auto">
                          Selesaikan <strong>{steps[stepIndex - 1].title}</strong> terlebih dahulu.
                        </p>
                        <button
                          onClick={() => setActiveStepId(steps[stepIndex - 1].id)}
                          className="inline-flex items-center gap-2 text-sm text-[var(--primary)] font-medium hover:underline"
                        >
                          <ArrowLeft className="w-4 h-4" /> Kembali ke langkah sebelumnya
                        </button>
                      </div>
                    ) : stepAccessBlocked(activeStep) ? (
                      <AccessGate step={activeStep} user={user} openAuthModal={openAuthModal} parentSlug={slug} />
                    ) : activeStep.type === "video" && activeStep.youtubeId ? (
                      <div className="space-y-4">
                        <VideoSection
                          youtubeId={activeStep.youtubeId}
                          itemId={activeStep.id}
                          alreadyDone={completed.has(activeStep.id)}
                          onComplete={() => handleMarkDone(activeStep.id)}
                        />
                        {!completed.has(activeStep.id) && (
                          <>
                            <p className="text-xs text-[var(--muted-foreground)] text-center">
                              Video otomatis ditandai selesai saat berakhir, atau tandai manual:
                            </p>
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleMarkDone(activeStep.id)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" /> Tandai sudah ditonton
                              </button>
                            </div>
                          </>
                        )}
                        {activeStep.body && (
                          <div className="pt-4 border-t border-[var(--border)]">
                            <HtmlBody html={activeStep.body} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <ArticleSection
                        body={activeStep.body ?? ""}
                        itemId={activeStep.id}
                        alreadyDone={completed.has(activeStep.id)}
                        onComplete={() => handleMarkDone(activeStep.id)}
                      />
                    )}

                    {completed.has(activeStep.id) && stepIndex < steps.length - 1 && (
                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={() => setActiveStepId(steps[stepIndex + 1].id)}
                          className="flex items-center gap-2 bg-[var(--primary)] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl transition-opacity text-sm"
                        >
                          Langkah Berikutnya <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Test section — shown when all steps are done */}
          {allDone && content.test?.enabled && content.test.questions.length > 0 && (
            <ContentTestSection
              test={content.test}
              contentId={content.id}
              contentSlug={slug}
              user={user}
            />
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SINGLE CONTENT
  // ───────────────────────────────────────────────────────────────────────────
  const canAccess =
    content.access === "free" ||
    (content.access === "login" && !!user) ||
    (content.access === "paid" && !!user && (paymentStatus === "success" || paid.has(content.id)));

  const alreadyDone = completed.has(slug);
  const handleSingleComplete = () => handleMarkDone(slug);

  const handlePurchase = async () => {
    if (!user?.email) { openAuthModal(`/konten/${slug}`); return; }
    setPurchasing(true);
    setPurchaseError(null);
    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          contentTitle: content.title,
          price: content.price ?? 0,
          userId: (user as { uid: string }).uid,
          userEmail: user.email,
          contentSlug: content.slug,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Gagal membuat invoice");
      }
      const data = (await res.json()) as { invoiceUrl: string };
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setPurchaseError((err as Error).message ?? "Terjadi kesalahan.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {showCertificate && (
        <Certificate
          userName={user?.displayName ?? user?.email ?? "Peserta"}
          contentTitle={content.title}
          completedAt={new Date()}
          onClose={() => setShowCertificate(false)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/konten" className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Konten
        </Link>

        {paymentStatus === "success" && (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-6 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" /> Pembayaran berhasil! Selamat menikmati konten ini.
          </div>
        )}
        {paymentStatus === "failed" && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-6 text-red-700 dark:text-red-300 text-sm">
            <Lock className="w-5 h-5 flex-shrink-0" /> Pembayaran gagal atau dibatalkan.
          </div>
        )}

        {alreadyDone && (
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-6">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm flex-1">
              <CheckCircle className="w-5 h-5 flex-shrink-0" /> Anda telah menyelesaikan konten ini.
            </div>
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              <Award className="w-4 h-4" /> Lihat Sertifikat
            </button>
          </div>
        )}

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {content.type === "video" && (
            <div className="aspect-video bg-slate-900">
              {canAccess && content.youtubeId ? (
                alreadyDone ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${content.youtubeId}?rel=0&modestbranding=1`}
                    title={content.title} className="w-full h-full" allowFullScreen
                  />
                ) : (
                  <div id={`yt-${content.id}`} className="w-full h-full" />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">{!user ? "Masuk untuk mengakses konten ini" : "Beli konten ini untuk menonton"}</p>
                </div>
              )}
            </div>
          )}

          {canAccess && content.type === "video" && content.youtubeId && !alreadyDone && (
            <SingleVideoSetup youtubeId={content.youtubeId} contentId={content.id} onComplete={handleSingleComplete} />
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-block bg-[var(--accent)] text-[var(--primary)] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">{content.category}</span>
              {content.access === "login" && (
                <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950/50 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" /> Login Diperlukan
                </span>
              )}
              {content.access === "paid" && (
                <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/50 text-amber-600 text-xs font-semibold px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" /> Berbayar
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">{content.title}</h1>
            <p className="text-[var(--muted-foreground)] mb-6">{content.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)] pb-6 border-b border-[var(--border)]">
              <span>Instruktur: <strong className="text-[var(--foreground)]">{content.instructor}</strong></span>
              <span>Durasi: <strong className="text-[var(--foreground)]">{content.duration}</strong></span>
              <span className="flex items-center gap-1">
                {content.type === "video" ? <Play className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {content.type === "video" ? "Video" : "Artikel"}
              </span>
            </div>

            {content.access === "paid" && user && !canAccess && (
              <div className="my-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center space-y-4">
                <ShoppingCart className="w-10 h-10 text-amber-500 mx-auto" />
                <h2 className="text-xl font-bold text-[var(--foreground)]">Konten Berbayar</h2>
                <p className="text-[var(--muted-foreground)] text-sm max-w-md mx-auto">Beli sekali, akses selamanya.</p>
                {content.price && <p className="text-3xl font-bold text-amber-600">{formatRupiah(content.price)}</p>}
                {purchaseError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{purchaseError}</p>}
                <button onClick={handlePurchase} disabled={purchasing}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  <ShoppingCart className="w-4 h-4" />
                  {purchasing ? "Memproses..." : "Beli Sekarang"}
                </button>
              </div>
            )}

            {content.access === "login" && !user && !loading && (
              <div className="my-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center space-y-4">
                <Lock className="w-10 h-10 text-blue-500 mx-auto" />
                <h2 className="text-xl font-bold text-[var(--foreground)]">Login Diperlukan</h2>
                <p className="text-[var(--muted-foreground)] text-sm">Konten ini gratis — Anda hanya perlu login atau daftar.</p>
                <button onClick={() => openAuthModal(`/konten/${slug}`)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
                  Masuk / Daftar Gratis
                </button>
              </div>
            )}

            {canAccess && content.body && (
              content.type === "article" ? (
                <div className="pt-6">
                  <ArticleSection body={content.body} itemId={slug} alreadyDone={alreadyDone} onComplete={handleSingleComplete} />
                </div>
              ) : (
                <div className="pt-6">
                  <HtmlBody html={content.body} />
                  {!alreadyDone && (
                    <div className="mt-6 flex justify-center">
                      <button onClick={handleSingleComplete}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors">
                        <CheckCircle className="w-4 h-4" /> Tandai sudah ditonton
                      </button>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Test section — shown when content is done */}
            {alreadyDone && canAccess && content.test?.enabled && content.test.questions.length > 0 && (
              <ContentTestSection
                test={content.test}
                contentId={content.id}
                contentSlug={slug}
                user={user}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KontenDetailPage() {
  return (
    <Suspense>
      <KontenDetailPageContent />
    </Suspense>
  );
}
