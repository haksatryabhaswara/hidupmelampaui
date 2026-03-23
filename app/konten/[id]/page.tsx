"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, BookOpen, Play, Lock, ShoppingCart, CheckCircle, ChevronRight,
  Award, Layers, Video, FileText,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { allContents, type StepContent } from "@/lib/content-data";
import { Certificate } from "@/components/certificate";
import {
  markCompleted, getCompletedSet, markPaid, isPaid, getPaidSet,
} from "@/lib/progress";

// ─── Minimal YouTube IFrame API types ────────────────────────────────────────
declare global {
  interface Window {
    YT?: {
      Player: new (
        id: string,
        opts: {
          videoId: string;
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
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function renderBody(body: string) {
  return body.split("\n").map((line, i) => {
    if (line.startsWith("## "))   return <h2 key={i} className="text-xl font-bold text-[var(--foreground)] mt-6 mb-3">{line.slice(3)}</h2>;
    if (line.startsWith("### "))  return <h3 key={i} className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">{line.slice(4)}</h3>;
    if (line.startsWith("> "))    return <blockquote key={i} className="border-l-4 border-[var(--primary)] pl-4 italic text-[var(--muted-foreground)] my-4">{line.slice(2)}</blockquote>;
    if (line.startsWith("---"))   return <hr key={i} className="border-[var(--border)] my-6" />;
    if (line.startsWith("- "))    return <li key={i} className="text-[var(--muted-foreground)] ml-4">{line.slice(2)}</li>;
    if (/^\d+\. /.test(line))     return <li key={i} className="text-[var(--muted-foreground)] ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
    if (line.trim() === "")       return <br key={i} />;
    return <p key={i} className="text-[var(--muted-foreground)] leading-relaxed my-2">{line}</p>;
  });
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

    function create() {
      const el = document.getElementById(divId);
      if (!el || !window.YT?.Player) return;
      player = new window.YT.Player(divId, {
        videoId: youtubeId!,
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
    return () => { player?.destroy(); };
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
    <div className="prose prose-sm max-w-none">
      {renderBody(body)}
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
function AccessGate({ step, user, openAuthModal, parentId }: {
  step: StepContent;
  user: { email?: string | null; uid?: string } | null;
  openAuthModal: (redirect?: string) => void;
  parentId: string;
}) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!user?.email) { openAuthModal(`/konten/${parentId}`); return; }
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
          successRedirectUrl: `${window.location.origin}/konten/${parentId}?paidStep=${step.id}`,
          failureRedirectUrl: `${window.location.origin}/konten/${parentId}?payment=failed`,
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
          onClick={() => openAuthModal(`/konten/${parentId}`)}
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
        <button onClick={() => openAuthModal(`/konten/${parentId}`)}
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

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════
export default function KontenDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, openAuthModal, loading } = useAuth();

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const content = allContents.find((c) => c.id === id);

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const paymentStatus = searchParams?.get("payment");

  // Progress (loaded from localStorage on client)
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [paid, setPaid] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompleted(getCompletedSet());
    setPaid(getPaidSet());
  }, []);

  // Persist paid step from ?paidStep= URL param
  useEffect(() => {
    const paidStep = searchParams?.get("paidStep");
    if (paidStep) {
      markPaid(paidStep);
      setPaid((prev) => new Set([...prev, paidStep]));
    }
  }, [searchParams]);

  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (content?.isSteppedContent && content.steps?.length && !activeStepId) {
      setActiveStepId(content.steps[0].id);
    }
  }, [content, activeStepId]);

  useEffect(() => {
    if (!loading && !user && content && !content.isSteppedContent && content.access !== "free") {
      openAuthModal(`/konten/${id}`);
    }
  }, [loading, user, content, id, openAuthModal]);

  const handleMarkDone = useCallback((itemId: string) => {
    markCompleted(itemId);
    setCompleted((prev) => new Set([...prev, itemId]));
  }, []);

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
      if (step.access === "paid") return !paid.has(step.id) && !isPaid(step.id);
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
                  <AccessGate step={activeStep} user={user} openAuthModal={openAuthModal} parentId={id} />
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
                      <div className="prose prose-sm max-w-none pt-4 border-t border-[var(--border)]">
                        {renderBody(activeStep.body)}
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
              </div>
            </div>
          </div>
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

  const alreadyDone = completed.has(content.id);
  const handleSingleComplete = () => handleMarkDone(content.id);

  const handlePurchase = async () => {
    if (!user?.email) { openAuthModal(`/konten/${id}`); return; }
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
                <button onClick={() => openAuthModal(`/konten/${id}`)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
                  Masuk / Daftar Gratis
                </button>
              </div>
            )}

            {canAccess && content.body && (
              content.type === "article" ? (
                <div className="pt-6">
                  <ArticleSection body={content.body} itemId={content.id} alreadyDone={alreadyDone} onComplete={handleSingleComplete} />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none pt-6">
                  {renderBody(content.body)}
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
          </div>
        </div>
      </div>
    </div>
  );
}
