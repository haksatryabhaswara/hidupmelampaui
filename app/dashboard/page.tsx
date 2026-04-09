"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { allContents, type Content } from "@/lib/content-data";
import { DIMENSIONS } from "@/lib/scri-data";
import { ScriCertificate } from "@/components/scri-certificate";
import { DIMENSIONS_72 } from "@/lib/scri72-data";
import { Scri72Certificate } from "@/components/scri72-certificate";
import Link from "next/link";
import {
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Lock,
  RefreshCw,
  Star,
  TrendingUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScriResult {
  userId: string;
  userName: string;
  totalScore: number;
  dimensionScores: Record<string, number>;
  scoringLabel: string;
  scoringMessage: string;
  completedAt: { toDate: () => Date } | null;
}

interface ProgressRaw {
  completed: Record<string, string>; // id → ISO date
  started: Record<string, string>;   // id → ISO date
  paid: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

function retakeBlockedUntil(completedAt: Date): Date {
  const d = new Date(completedAt);
  d.setMonth(d.getMonth() + 3);
  return d;
}

// ─── Weekly activity chart (last 8 weeks, CSS-based) ─────────────────────────

function WeeklyActivityChart({ completedDates }: { completedDates: Date[] }) {
  const weeks = useMemo(() => {
    const now = new Date();
    const result: { label: string; count: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - w * 7 - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      weekEnd.setHours(23, 59, 59, 999);
      const count = completedDates.filter(
        (d) => d >= weekStart && d <= weekEnd
      ).length;
      const label = weekStart.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
      result.push({ label, count });
    }
    return result;
  }, [completedDates]);

  const max = Math.max(...weeks.map((w) => w.count), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1.5 h-28">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: "88px" }}>
              <div
                className="w-full bg-[var(--primary)] rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max((w.count / max) * 88, w.count > 0 ? 6 : 0)}px`,
                  opacity: w.count === 0 ? 0.15 : 1,
                }}
                title={`${w.count} selesai`}
              />
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] leading-none">{w.count}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] text-[var(--muted-foreground)]">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [scriResult, setScriResult] = useState<ScriResult | null>(null);
  const [scriLoading, setScriLoading] = useState(true);
  const [progressRaw, setProgressRaw] = useState<ProgressRaw | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);

  const [scri72Result, setScri72Result] = useState<ScriResult | null>(null);
  const [scri72Loading, setScri72Loading] = useState(true);
  const [showCert72, setShowCert72] = useState(false);

  // Translate old progress keys (static ID "1","2"… or Firestore doc IDs) → canonical slug.
  // Initialised synchronously with the static allContents map so the UI is never blocked.
  const [keyTranslation, setKeyTranslation] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    allContents.forEach((c) => m.set(c.id, c.slug));
    return m;
  });

  // Contents loaded from Firestore that may not be in the static allContents array
  const [firestoreContents, setFirestoreContents] = useState<Content[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/masuk");
    }
  }, [authLoading, user, router]);

  // Load Firestore contents: augments both the key-translation map and the
  // firestoreContents list so content added via admin (not in static allContents)
  // still appears in the dashboard.
  useEffect(() => {
    getDocs(collection(db, "contents"))
      .then((snap) => {
        if (snap.empty) return;
        const loaded: Content[] = [];
        const extra = new Map<string, string>();
        snap.docs.forEach((d) => {
          const data = d.data() as Partial<Content>;
          const s = data.slug;
          if (s) {
            extra.set(d.id, s);
            loaded.push({ ...(data as Content), id: d.id });
          }
        });
        setFirestoreContents(loaded);
        setKeyTranslation((prev) => {
          const m = new Map(prev);
          extra.forEach((slug, id) => m.set(id, slug));
          return m;
        });
      })
      .catch(() => {}); // fall back to static-only on error
  }, []);

  // Fetch latest SCRI result
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getDocs(
      query(
        collection(db, "scri_results"),
        where("userId", "==", user.uid)
      )
    )
      .then((snap) => {
        if (!cancelled && !snap.empty) {
          // Sort client-side to avoid requiring a composite Firestore index
          const sorted = snap.docs
            .map((d) => d.data() as ScriResult)
            .sort((a, b) => {
              const aTime = a.completedAt?.toDate().getTime() ?? 0;
              const bTime = b.completedAt?.toDate().getTime() ?? 0;
              return bTime - aTime;
            });
          setScriResult(sorted[0]);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setScriLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  // Fetch latest SCRI-72 result
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getDocs(
      query(
        collection(db, "scri72_results"),
        where("userId", "==", user.uid)
      )
    )
      .then((snap) => {
        if (!cancelled && !snap.empty) {
          const sorted = snap.docs
            .map((d) => d.data() as ScriResult)
            .sort((a, b) => {
              const aTime = a.completedAt?.toDate().getTime() ?? 0;
              const bTime = b.completedAt?.toDate().getTime() ?? 0;
              return bTime - aTime;
            });
          setScri72Result(sorted[0]);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setScri72Loading(false); });
    return () => { cancelled = true; };
  }, [user]);

  // Fetch raw progress (with timestamps)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getDoc(doc(db, "progress", user.uid))
      .then((snap) => {
        if (!cancelled && snap.exists()) {
          const d = snap.data() as Partial<ProgressRaw>;
          setProgressRaw({
            completed: d.completed ?? {},
            started: d.started ?? {},
            paid: d.paid ?? [],
          });
        } else if (!cancelled) {
          setProgressRaw({ completed: {}, started: {}, paid: [] });
        }
      })
      .catch(() => { if (!cancelled) setProgressRaw({ completed: {}, started: {}, paid: [] }); })
      .finally(() => { if (!cancelled) setProgressLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  // Merged content list: static allContents + anything loaded from Firestore,
  // deduplicated by slug (Firestore data takes precedence for shared slugs).
  const mergedContents = useMemo(() => {
    const map = new Map<string, Content>(allContents.map((c) => [c.slug, c]));
    firestoreContents.forEach((c) => { if (c.slug) map.set(c.slug, c); });
    return Array.from(map.values());
  }, [firestoreContents]);

  // Derived content lists — normalise all progress keys to canonical slugs first
  const { completedContents, inProgressContents, completedSlugToDate } = useMemo(() => {
    if (!progressRaw)
      return { completedContents: [], inProgressContents: [], completedSlugToDate: {} as Record<string, string> };

    // Translate any old key to its canonical slug (identity if already a slug or unknown)
    const toSlug = (key: string): string => keyTranslation.get(key) ?? key;

    // Build slug-keyed completed map (preserves the ISO-date value).
    // Skip step IDs (keys that contain a Firestore-path separator "/" or reference
    // a step of a series — they won’t resolve to a top-level content slug anyway).
    const completedBySlug: Record<string, string> = {};
    Object.entries(progressRaw.completed).forEach(([k, date]) => {
      completedBySlug[toSlug(k)] = date;
    });

    const completedSlugs = new Set(Object.keys(completedBySlug));
    const startedSlugs = new Set(Object.keys(progressRaw.started).map(toSlug));

    return {
      completedContents: mergedContents.filter((c) => completedSlugs.has(c.slug)),
      inProgressContents: mergedContents.filter(
        (c) => startedSlugs.has(c.slug) && !completedSlugs.has(c.slug)
      ),
      completedSlugToDate: completedBySlug,
    };
  }, [progressRaw, keyTranslation, mergedContents]);

  // Completion dates for chart
  const completedDates = useMemo(() => {
    if (!progressRaw) return [];
    return Object.values(progressRaw.completed).map((iso) => new Date(iso));
  }, [progressRaw]);

  // Category stats
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    completedContents.forEach((c) => {
      map[c.category] = (map[c.category] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [completedContents]);

  // SCRI retake eligibility
  const scriCompletedAt = useMemo(() => {
    if (!scriResult?.completedAt) return null;
    return scriResult.completedAt.toDate();
  }, [scriResult]);

  const retakeAllowed = !scriCompletedAt || new Date() > retakeBlockedUntil(scriCompletedAt);
  const blockedUntilDate = scriCompletedAt ? retakeBlockedUntil(scriCompletedAt) : null;

  const scri72CompletedAt = useMemo(() => {
    if (!scri72Result?.completedAt) return null;
    return scri72Result.completedAt.toDate();
  }, [scri72Result]);

  const retakeAllowed72 = !scri72CompletedAt || new Date() > retakeBlockedUntil(scri72CompletedAt);
  const blockedUntilDate72 = scri72CompletedAt ? retakeBlockedUntil(scri72CompletedAt) : null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const maxScriScore =
    scriResult
      ? Object.values(scriResult.dimensionScores ?? {}).length * 30 || 180
      : 180;

  return (
    <>
      {showCert && scriResult && scriCompletedAt && (
        <ScriCertificate
          userName={user.displayName ?? user.email ?? "Peserta"}
          totalScore={scriResult.totalScore}
          maxScore={maxScriScore}
          scoringLabel={scriResult.scoringLabel}
          dimensionScores={scriResult.dimensionScores ?? {}}
          completedAt={scriCompletedAt}
          onClose={() => setShowCert(false)}
        />
      )}

      {showCert72 && scri72Result && scri72CompletedAt && (
        <Scri72Certificate
          userName={user.displayName ?? user.email ?? "Peserta"}
          totalScore={scri72Result.totalScore}
          maxScore={360}
          scoringLabel={scri72Result.scoringLabel}
          dimensionScores={scri72Result.dimensionScores ?? {}}
          completedAt={scri72CompletedAt}
          onClose={() => setShowCert72(false)}
        />
      )}

      <div className="min-h-screen px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Page header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-1">
              Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Selamat datang, {user.displayName?.split(" ")[0] ?? "Kamu"} 👋
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Pantau progres belajar dan hasil assessment Anda di sini.
            </p>
          </div>

          {/* ── SCRI-36 Section ──────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--primary)]" />
                SCRI-36 — Self-Command Readiness Index
              </h2>
            </div>

            {scriLoading ? (
              <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
              </div>
            ) : scriResult ? (
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                {/* Score header */}
                <div className="bg-[var(--primary)] px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/15 border border-white/25 flex flex-col items-center justify-center shrink-0">
                    <span className="text-3xl font-black text-white leading-none">{scriResult.totalScore}</span>
                    <span className="text-[10px] text-white/70 mt-0.5">/ {maxScriScore}</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-white/70 text-sm">Hasil Terakhir</p>
                    <p className="text-white font-bold text-xl leading-snug">{scriResult.scoringLabel}</p>
                    {scriCompletedAt && (
                      <p className="text-white/60 text-xs mt-0.5">{formatDate(scriCompletedAt)}</p>
                    )}
                  </div>
                </div>

                {/* Interpretation */}
                <div className="px-6 pt-5 pb-2">
                  <p className="text-[var(--foreground)] leading-relaxed text-sm">
                    {scriResult.scoringMessage}
                  </p>
                </div>

                {/* Dimension bars */}
                <div className="px-6 pt-4 pb-5 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">
                    Skor per Dimensi
                  </p>
                  {DIMENSIONS.map((dim) => {
                    const score = scriResult.dimensionScores?.[dim.id] ?? 0;
                    const pct = Math.round((score / 30) * 100);
                    return (
                      <div key={dim.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-[var(--foreground)]">{dim.label}</span>
                          <span className="text-xs font-bold text-[var(--primary)]">{score}/30</span>
                        </div>
                        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)] rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="px-6 pb-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCert(true)}
                    className="flex items-center gap-1.5 text-sm font-medium bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Lihat Sertifikat
                  </button>

                  {retakeAllowed ? (
                    <Link
                      href="/scri/36"
                      className="flex items-center gap-1.5 text-sm font-medium border border-[var(--border)] text-[var(--foreground)] px-4 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Ambil Ulang Assessment
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] px-4 py-2 rounded-lg border border-[var(--border)] cursor-not-allowed opacity-60">
                      <Lock className="w-3.5 h-3.5" />
                      Bisa diulang {blockedUntilDate ? formatDate(blockedUntilDate) : ""}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)] text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)]">Belum ada hasil SCRI</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Ikuti assessment untuk mengetahui tingkat kesiapan diri Anda.
                  </p>
                </div>
                <Link
                  href="/scri/36"
                  className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Mulai Assessment
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>

          {/* ── SCRI-72 Section ──────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <Star className="w-5 h-5 text-violet-500" />
                SCRI-72 — Extended Self-Command Index
              </h2>
            </div>

            {scri72Loading ? (
              <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              </div>
            ) : scri72Result ? (
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                {/* Score header */}
                <div className="bg-violet-600 px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/15 border border-white/25 flex flex-col items-center justify-center shrink-0">
                    <span className="text-3xl font-black text-white leading-none">{scri72Result.totalScore}</span>
                    <span className="text-[10px] text-white/70 mt-0.5">/ 360</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-white/70 text-sm">Hasil Terakhir</p>
                    <p className="text-white font-bold text-xl leading-snug">{scri72Result.scoringLabel}</p>
                    {scri72CompletedAt && (
                      <p className="text-white/60 text-xs mt-0.5">{formatDate(scri72CompletedAt)}</p>
                    )}
                  </div>
                </div>

                {/* Interpretation */}
                <div className="px-6 pt-5 pb-2">
                  <p className="text-[var(--foreground)] leading-relaxed text-sm">
                    {scri72Result.scoringMessage}
                  </p>
                </div>

                {/* Dimension bars */}
                <div className="px-6 pt-4 pb-5 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">
                    Skor per Dimensi
                  </p>
                  {(() => {
                    const activeDims = DIMENSIONS_72.filter((dim) => (scri72Result.dimensionScores?.[dim.id] ?? 0) > 0);
                    const activeDimCount = activeDims.length || DIMENSIONS_72.length;
                    const maxPerDim = Math.round(360 / activeDimCount);
                    return activeDims.map((dim) => {
                      const score = scri72Result.dimensionScores?.[dim.id] ?? 0;
                      const pct = Math.min(100, Math.round((score / maxPerDim) * 100));
                      return (
                        <div key={dim.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-[var(--foreground)]">{dim.label}</span>
                            <span className="text-xs font-bold text-violet-500">{score}/{maxPerDim}</span>
                          </div>
                          <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Actions */}
                <div className="px-6 pb-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCert72(true)}
                    className="flex items-center gap-1.5 text-sm font-medium bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Lihat Sertifikat
                  </button>

                  {retakeAllowed72 ? (
                    <Link
                      href="/scri72"
                      className="flex items-center gap-1.5 text-sm font-medium border border-[var(--border)] text-[var(--foreground)] px-4 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Ambil Ulang Assessment
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] px-4 py-2 rounded-lg border border-[var(--border)] cursor-not-allowed opacity-60">
                      <Lock className="w-3.5 h-3.5" />
                      Bisa diulang {blockedUntilDate72 ? formatDate(blockedUntilDate72) : ""}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)] text-center space-y-4">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/30 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-violet-500" />
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)]">Belum ada hasil SCRI-72</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Ikuti Extended Assessment untuk eksplorasi 6 dimensi kesiapan diri.
                  </p>
                </div>
                <Link
                  href="/scri72"
                  className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Mulai SCRI-72
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>

          {/* ── Content Progress Section ───────────────────────────────── */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--primary)]" />
              Progres Konten
            </h2>

            {progressLoading ? (
              <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                {/* In Progress */}
                {inProgressContents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                      Sedang Berlangsung
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {inProgressContents.map((c) => (
                        <Link
                          key={c.id}
                          href={`/konten/${c.slug}`}
                          className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--primary)] transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--primary)]">
                                {c.category}
                              </span>
                              <p className="text-sm font-semibold text-[var(--foreground)] leading-snug mt-0.5 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                {c.title}
                              </p>
                            </div>
                            <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          </div>
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                            <ChevronRight className="w-3 h-3" />
                            Lanjutkan
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {completedContents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                      Selesai ({completedContents.length})
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {completedContents.map((c) => (
                        <Link
                          key={c.id}
                          href={`/konten/${c.slug}`}
                          className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--primary)] transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
                                {c.category}
                              </span>
                              <p className="text-sm font-semibold text-[var(--foreground)] leading-snug mt-0.5 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                {c.title}
                              </p>
                            </div>
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          </div>
                          {completedSlugToDate[c.slug] && (
                            <p className="text-[10px] text-[var(--muted-foreground)] mt-2">
                              Selesai {formatDate(new Date(completedSlugToDate[c.slug]))}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {inProgressContents.length === 0 && completedContents.length === 0 && (
                  <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)] text-center space-y-3">
                    <BookOpen className="w-12 h-12 text-[var(--muted-foreground)] mx-auto" />
                    <p className="font-semibold text-[var(--foreground)]">Belum ada konten yang diakses</p>
                    <Link
                      href="/konten"
                      className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                    >
                      Jelajahi Konten <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── Statistics Section ─────────────────────────────────────── */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              Statistik Belajar
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] text-center">
                  <p className="text-3xl font-black text-[var(--primary)]">
                    {completedContents.length}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Konten Selesai</p>
                </div>
                <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] text-center">
                  <p className="text-3xl font-black text-amber-500">
                    {inProgressContents.length}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Sedang Berlangsung</p>
                </div>
                <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] text-center col-span-2">
                  <p className="text-3xl font-black text-emerald-500">
                    {completedContents.length + inProgressContents.length}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Total Konten Diakses</p>
                </div>
              </div>

              {/* Weekly activity chart */}
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[var(--primary)]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                    Penyelesaian per Minggu
                  </p>
                </div>
                {completedDates.length > 0 ? (
                  <WeeklyActivityChart completedDates={completedDates} />
                ) : (
                  <div className="flex items-center justify-center h-28 text-[var(--muted-foreground)] text-sm">
                    Belum ada data
                  </div>
                )}
              </div>
            </div>

            {/* Category breakdown */}
            {categoryStats.length > 0 && (
              <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                  Kategori yang Diselesaikan
                </p>
                {categoryStats.map(([cat, count]) => {
                  const pct = Math.round((count / completedContents.length) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-[var(--foreground)]">{cat}</span>
                        <span className="text-sm font-bold text-[var(--primary)]">{count}</span>
                      </div>
                      <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
