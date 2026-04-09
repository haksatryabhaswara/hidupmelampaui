"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DIMENSIONS_72,
  ANSWER_SCALE_72,
  INITIAL_QUESTIONS_72,
  INITIAL_SCORING_72,
  type ScriQuestion72,
  type ScriScoring72,
} from "@/lib/scri72-data";
import { useAuth } from "@/lib/auth-context";
import { Scri72Certificate } from "@/components/scri72-certificate";
import { CheckCircle, Clock, HelpCircle, ChevronRight, Star, CreditCard, Unlock } from "lucide-react";

type Step = "landing" | "welcome" | "instructions" | "assessment" | "results";

const BREAKPOINT_QUOTES = [
  {
    afterDimensionIdx: 3,
    quote:
      "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.",
    author: "Viktor E. Frankl",
  },
  {
    afterDimensionIdx: 7,
    quote:
      "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle",
  },
];

export default function Scri72Page() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("landing");
  const [questions, setQuestions] = useState<ScriQuestion72[]>([]);
  const [scorings, setScorings] = useState<ScriScoring72[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(false);

  // Payment gate state
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseChecking, setPurchaseChecking] = useState(true);
  const [paymentBypassed, setPaymentBypassed] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Assessment state
  const [currentDimensionIdx, setCurrentDimensionIdx] = useState(0);
  const [showBreakpoint, setShowBreakpoint] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Results state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savedRef = useRef(false);
  const [showCert, setShowCert] = useState(false);

  // Check purchase status
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setPurchaseChecking(false); return; }
    let cancelled = false;
    getDoc(doc(db, "purchases", `${user.uid}_scri72`))
      .then((snap) => {
        if (!cancelled) setHasPurchased(snap.exists() && snap.data()?.status === "paid");
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPurchaseChecking(false); });
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Handle ?payment=success redirect from Xendit
  useEffect(() => {
    if (searchParams?.get("payment") === "success" && user) {
      setHasPurchased(true);
    }
  }, [searchParams, user]);

  // Group and sort questions by dimension
  const questionsByDimension = useMemo(
    () =>
      DIMENSIONS_72.map((dim) =>
        questions
          .filter((q) => q.dimension === dim.id)
          .sort((a, b) => a.order - b.order)
      ),
    [questions]
  );

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // Prefetch data on the instructions step
  useEffect(() => {
    if (step !== "instructions") return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(false);

    async function fetchData() {
      try {
        const [qSnap, sSnap] = await Promise.all([
          getDocs(collection(db, "scri72_questions")),
          getDocs(query(collection(db, "scri72_scoring"), orderBy("order"))),
        ]);

        const qs: ScriQuestion72[] = qSnap.empty
          ? INITIAL_QUESTIONS_72.map((q) => ({ ...q, id: `${q.dimension}_${q.order}` }))
          : qSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ScriQuestion72));

        const ss: ScriScoring72[] = sSnap.empty
          ? INITIAL_SCORING_72.map((s, i) => ({ ...s, id: `scoring72_${i}` }))
          : sSnap.docs.map((d) => d.data() as ScriScoring72);

        if (!cancelled) {
          setQuestions(qs);
          setScorings(ss);
        }
      } catch {
        if (!cancelled) setDataError(true);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [step]);

  // Auto-save result when user reaches the results step
  useEffect(() => {
    if (step !== "results") return;
    if (savedRef.current || !user) return;
    savedRef.current = true;

    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const dimScores: Record<string, number> = {};
    DIMENSIONS_72.forEach((dim, idx) => {
      dimScores[dim.id] = (questionsByDimension[idx] ?? []).reduce(
        (sum, q) => sum + (answers[q.id] ?? 0),
        0
      );
    });
    const matched = scorings.find(
      (s) => totalScore >= s.minScore && totalScore <= s.maxScore
    );

    setSaving(true);
    addDoc(collection(db, "scri72_results"), {
      userId: user.uid,
      userName: user.displayName ?? "",
      userEmail: user.email ?? "",
      totalScore,
      dimensionScores: dimScores,
      answers,
      scoringLabel: matched?.label ?? "",
      scoringMessage: matched?.message ?? "",
      completedAt: serverTimestamp(),
    })
      .then(() => setSaved(true))
      .catch(() => setSaveError(true))
      .finally(() => setSaving(false));
  }, [step, user, answers, questionsByDimension, scorings]);

  // Derived values for results display
  const totalScore = useMemo(
    () => Object.values(answers).reduce((a, b) => a + b, 0),
    [answers]
  );

  const dimensionScores = useMemo(() => {
    const map: Record<string, number> = {};
    DIMENSIONS_72.forEach((dim, idx) => {
      map[dim.id] = (questionsByDimension[idx] ?? []).reduce(
        (sum, q) => sum + (answers[q.id] ?? 0),
        0
      );
    });
    return map;
  }, [answers, questionsByDimension]);

  const matchedScoring = useMemo(
    () =>
      scorings.find((s) => totalScore >= s.minScore && totalScore <= s.maxScore) ??
      null,
    [scorings, totalScore]
  );

  const currentDimension = DIMENSIONS_72[currentDimensionIdx];
  const currentQuestions = questionsByDimension[currentDimensionIdx] ?? [];
  const allCurrentAnswered =
    currentQuestions.length > 0 &&
    currentQuestions.every((q) => answers[q.id] !== undefined);

  function handleAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNextSection() {
    const isBreakpoint = BREAKPOINT_QUOTES.some(
      (b) => b.afterDimensionIdx === currentDimensionIdx
    );
    if (isBreakpoint) {
      setShowBreakpoint(true);
    } else if (currentDimensionIdx < DIMENSIONS_72.length - 1) {
      setCurrentDimensionIdx((i) => i + 1);
    } else {
      setStep("results");
    }
  }

  function handleBreakpointContinue() {
    setShowBreakpoint(false);
    if (currentDimensionIdx < DIMENSIONS_72.length - 1) {
      setCurrentDimensionIdx((i) => i + 1);
    } else {
      setStep("results");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleReset() {
    setStep("landing");
    setAnswers({});
    setCurrentDimensionIdx(0);
    setShowBreakpoint(false);
    setSaved(false);
    setSaveError(false);
    setShowCert(false);
    savedRef.current = false;
  }

  async function handlePurchase() {
    if (!user) { openAuthModal("/scri72"); return; }
    setPurchasing(true);
    setPurchaseError(null);
    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: "scri72",
          contentTitle: "Akses SCRI-72 Extended Assessment",
          price: 150000,
          userId: user.uid,
          userEmail: user.email ?? "",
          successRedirectUrl: `${window.location.origin}/scri72?payment=success`,
          failureRedirectUrl: `${window.location.origin}/scri72?payment=failed`,
        }),
      });
      const data = await res.json() as { invoiceUrl?: string; error?: string };
      if (!res.ok || !data.invoiceUrl) {
        setPurchaseError(data.error ?? "Gagal membuat invoice. Coba lagi.");
        return;
      }
      window.location.href = data.invoiceUrl;
    } catch {
      setPurchaseError("Terjadi kesalahan. Periksa koneksi internet Anda.");
    } finally {
      setPurchasing(false);
    }
  }

  // ── Auth loading ─────────────────────────────────────────────────────────────
  if (authLoading || purchaseChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Step 1: Landing ──────────────────────────────────────────────────────────
  if (step === "landing") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-block px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-semibold tracking-widest uppercase">
              Assessment Extended
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
              Self-Command Readiness Index
              <span className="block text-violet-600 dark:text-violet-400 text-2xl sm:text-3xl mt-1">Extended 72</span>
            </h1>
            <p className="text-lg text-[var(--muted-foreground)]">
              Eksplorasi lebih mendalam kesiapan diri Anda melalui 6 dimensi.
            </p>
          </div>

          <div className="bg-[var(--card)] rounded-2xl p-6 text-left border border-[var(--border)] space-y-4">
            <p className="text-sm text-[var(--muted-foreground)] font-medium uppercase tracking-widest">
              Tentang Assessment
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              Versi lengkap yang mencakup{" "}
              <span className="font-semibold">6 dimensi Self-Command</span> — termasuk dimensi baru: Mental Clarity, Physical Vitality, Spiritual Grounding, Creative Expression, Leadership Presence, dan Economic Stewardship.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <HelpCircle className="w-4 h-4 shrink-0 text-violet-500" />
                <span>72 pertanyaan</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Clock className="w-4 h-4 shrink-0 text-violet-500" />
                <span>±10–15 menit</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <CheckCircle className="w-4 h-4 shrink-0 text-violet-500" />
                <span>Hasil langsung muncul</span>
              </div>
            </div>
          </div>

          {/* CTA buttons — conditional on purchase/bypass/login */}
          {!user ? (
            <>
              <button
                onClick={() => openAuthModal("/scri72")}
                className="w-full py-4 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-lg active:scale-[0.98] transition-all"
              >
                Masuk untuk Lanjut
              </button>
              <p className="text-sm text-[var(--muted-foreground)]">
                Login diperlukan sebelum melakukan pembayaran.
              </p>
            </>
          ) : hasPurchased || paymentBypassed ? (
            <button
              onClick={() => setStep("welcome")}
              className="w-full py-4 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-lg active:scale-[0.98] transition-all"
            >
              Mulai Assessment
            </button>
          ) : (
            <div className="space-y-3">
              {/* Payment required notice */}
              <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl px-5 py-4 flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Akses Berbayar</p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                    Rp 150.000 — satu kali akses seumur hidup
                  </p>
                </div>
              </div>

              {purchaseError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-2 text-center">
                  {purchaseError}
                </p>
              )}

              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full py-4 px-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-wait text-white rounded-xl font-semibold text-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Beli Akses — Rp 150.000
                  </>
                )}
              </button>

              {/* Bypass button for testing */}
              <button
                onClick={() => setPaymentBypassed(true)}
                className="w-full py-2.5 px-6 border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors flex items-center justify-center gap-2"
              >
                <Unlock className="w-3.5 h-3.5" />
                Bypass / Akses Testing (tanpa bayar)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 2: Welcome ──────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-4xl">
              ✨
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] leading-snug">
              Perjalanan Lebih Dalam
              <br />
              Mengenal Diri Anda
            </h1>
          </div>

          <div className="bg-[var(--card)] rounded-2xl p-7 border border-[var(--border)] space-y-4 text-left">
            <p className="text-[var(--foreground)] font-semibold leading-relaxed text-lg">
              Tidak ada jawaban benar atau salah.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              Jawablah dengan jujur sesuai kondisi Anda{" "}
              <span className="italic">saat ini</span>.
            </p>
            <p className="text-[var(--muted-foreground)] leading-relaxed text-sm">
              Assessment ini mencakup 6 dimensi dan dirancang untuk memberikan gambaran menyeluruh tentang kesiapan diri Anda.
            </p>
          </div>

          <button
            onClick={() => setStep("instructions")}
            className="w-full py-3.5 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-base active:scale-[0.98] transition-all"
          >
            Saya Siap
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Instructions ─────────────────────────────────────────────────────
  if (step === "instructions") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Cara Menjawab
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Setiap pernyataan menunjukkan kondisi atau sikap tertentu.
            </p>
          </div>

          <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] space-y-5">
            <p className="text-[var(--foreground)]">
              Pilih jawaban yang paling sesuai dengan diri Anda.
            </p>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                Skala Penilaian
              </p>
              {ANSWER_SCALE_72.map((scale) => (
                <div key={scale.value} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full border-2 border-violet-500 flex items-center justify-center text-sm font-bold text-violet-600 shrink-0">
                    {scale.value}
                  </div>
                  <span className="text-[var(--foreground)] text-sm">{scale.label}</span>
                </div>
              ))}
            </div>
          </div>

          {dataError && (
            <p className="text-center text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
              Gagal memuat pertanyaan. Pastikan koneksi internet Anda aktif.
            </p>
          )}

          <button
            disabled={dataLoading}
            onClick={() => {
              if (!dataLoading && !dataError) setStep("assessment");
            }}
            className="w-full py-3.5 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            {dataLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Memuat pertanyaan...
              </span>
            ) : (
              "Mulai Pertanyaan"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 4: Assessment ───────────────────────────────────────────────────────
  if (step === "assessment") {
    // ── Breakpoint screen ─────────────────────────────────────────────────────
    if (showBreakpoint) {
      const bp = BREAKPOINT_QUOTES.find(
        (b) => b.afterDimensionIdx === currentDimensionIdx
      )!;
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full text-center space-y-8">
            <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center mx-auto text-4xl">
              ✨
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium text-[var(--foreground)] leading-relaxed italic">
              &ldquo;{bp.quote}&rdquo;
            </blockquote>
            <p className="text-sm text-[var(--muted-foreground)]">— {bp.author}</p>

            <div className="bg-[var(--card)] rounded-xl px-5 py-3 border border-[var(--border)] flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Progres</span>
              <span>
                <span className="font-semibold text-violet-600">{answeredCount}</span>
                <span className="text-[var(--muted-foreground)]"> / {totalQuestions} pertanyaan</span>
              </span>
            </div>

            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-300"
                style={{
                  width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>

            <button
              onClick={handleBreakpointContinue}
              className="w-full py-3.5 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-base active:scale-[0.98] transition-all"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      );
    }

    // ── Question screen ────────────────────────────────────────────────────────
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Sticky progress header */}
          <div className="sticky top-16 bg-[var(--background)] pt-4 pb-3 z-10 space-y-2 border-b border-[var(--border)]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[var(--foreground)]">
                {currentDimension?.label}
              </span>
              <span className="text-[var(--muted-foreground)]">
                <span className="text-violet-600 font-bold">{answeredCount}</span>
                {" / "}
                {totalQuestions}
              </span>
            </div>
            <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-300"
                style={{
                  width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
            {/* Dimension step-dots */}
            <div className="flex gap-1 pt-0.5">
              {DIMENSIONS_72.map((dim, idx) => (
                <div
                  key={dim.id}
                  title={dim.label}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    idx < currentDimensionIdx
                      ? "bg-violet-500"
                      : idx === currentDimensionIdx
                      ? "bg-violet-400 opacity-60"
                      : "bg-[var(--muted)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Section label */}
          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-1">
              Dimensi {currentDimensionIdx + 1} dari {DIMENSIONS_72.length}
            </p>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {currentDimension?.label}
            </h2>
          </div>

          {/* Question cards */}
          <div className="space-y-5">
            {currentQuestions.map((q, qIdx) => (
              <div
                key={q.id}
                className={`bg-[var(--card)] rounded-2xl p-5 border-2 transition-colors ${
                  answers[q.id] !== undefined
                    ? "border-violet-500"
                    : "border-[var(--border)]"
                }`}
              >
                <p className="text-[var(--foreground)] font-medium leading-relaxed mb-5">
                  {qIdx + 1}. {q.text}
                </p>

                <div className="hidden sm:flex justify-between text-xs text-[var(--muted-foreground)] mb-2 px-0.5">
                  <span>Sangat Tidak Sesuai</span>
                  <span>Sangat Sesuai</span>
                </div>

                <div className="flex gap-2">
                  {ANSWER_SCALE_72.map((scale) => (
                    <button
                      key={scale.value}
                      onClick={() => handleAnswer(q.id, scale.value)}
                      title={scale.label}
                      aria-label={scale.label}
                      className={`flex-1 h-10 rounded-lg border-2 font-semibold text-sm transition-all ${
                        answers[q.id] === scale.value
                          ? "bg-violet-600 border-violet-600 text-white"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-violet-500 hover:text-violet-600"
                      }`}
                    >
                      {scale.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Next / Finish button */}
          <div className="pb-12">
            <button
              disabled={!allCurrentAnswered}
              onClick={handleNextSection}
              className="w-full py-3.5 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentDimensionIdx === DIMENSIONS_72.length - 1
                ? "Lihat Hasil"
                : "Lanjutkan"}
              <ChevronRight className="w-4 h-4" />
            </button>
            {!allCurrentAnswered && (
              <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
                Jawab semua {currentQuestions.length} pertanyaan untuk melanjutkan
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 5: Results ──────────────────────────────────────────────────────────
  if (step === "results") {
    const maxScore = totalQuestions > 0 ? totalQuestions * 5 : 360;

    return (
      <>
        {showCert && (
          <Scri72Certificate
            userName={user?.displayName ?? user?.email ?? "Peserta"}
            totalScore={totalScore}
            maxScore={maxScore}
            scoringLabel={matchedScoring?.label ?? ""}
            dimensionScores={dimensionScores}
            completedAt={new Date()}
            onClose={() => setShowCert(false)}
          />
        )}
        <div className="min-h-screen px-4 py-10">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/40 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-violet-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                Hasil Assessment Anda
              </h1>
              <p className="text-[var(--muted-foreground)]">
                Self-Command Readiness Index Extended 72
              </p>
            </div>

            {/* Total score card */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 text-center text-white">
              <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-2">
                Total Skor
              </p>
              <p className="text-7xl font-bold leading-none">{totalScore}</p>
              <p className="text-sm opacity-70 mt-2">dari {maxScore} maksimal</p>
              {matchedScoring && (
                <div className="mt-5 pt-5 border-t border-white/20">
                  <p className="font-bold text-xl">{matchedScoring.label}</p>
                </div>
              )}
            </div>

            {/* Interpretation */}
            {matchedScoring && (
              <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] space-y-3">
                <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest">
                  Interpretasi
                </p>
                <p className="text-[var(--foreground)] leading-relaxed">
                  {matchedScoring.message}
                </p>
              </div>
            )}

            {/* Per-dimension breakdown */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                Skor per Dimensi
              </p>
              {DIMENSIONS_72.map((dim, idx) => {
                const score = dimensionScores[dim.id] ?? 0;
                const maxPerDim = (questionsByDimension[idx]?.length ?? 6) * 5;
                const pct = maxPerDim > 0 ? (score / maxPerDim) * 100 : 0;
                return (
                  <div
                    key={dim.id}
                    className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {dim.label}
                      </span>
                      <span className="text-sm font-bold text-violet-600">
                        {score} / {maxPerDim}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save status */}
            <div className="text-center text-sm min-h-[1.5rem]">
              {saving && (
                <span className="text-[var(--muted-foreground)] flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                  Menyimpan hasil...
                </span>
              )}
              {saved && (
                <span className="text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Hasil berhasil disimpan ke akun Anda
                </span>
              )}
              {saveError && (
                <span className="text-red-500">
                  Gagal menyimpan hasil. Silakan coba lagi.
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pb-12 space-y-3">
              {saved && (
                <button
                  onClick={() => setShowCert(true)}
                  className="w-full py-3.5 px-8 bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 rounded-xl font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Unduh Sertifikat
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
