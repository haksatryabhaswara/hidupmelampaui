"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DIMENSIONS_72 } from "@/lib/scri72-data";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
} from "lucide-react";

interface ScriResult72 {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalScore: number;
  dimensionScores: Record<string, number>;
  scoringLabel: string;
  scoringMessage: string;
  completedAt: { toDate: () => Date } | null;
}

function formatDate(ts: { toDate: () => Date } | null) {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function exportToCsv(results: ScriResult72[]) {
  const dimLabels = DIMENSIONS_72.map((d) => d.label);
  const headers = [
    "Nama",
    "Email",
    "Tanggal",
    "Total Skor",
    "Label",
    ...dimLabels,
    "Pesan",
  ];

  const rows = results.map((r) => [
    r.userName || r.userEmail,
    r.userEmail,
    r.completedAt ? r.completedAt.toDate().toLocaleString("id-ID") : "",
    r.totalScore,
    r.scoringLabel,
    ...DIMENSIONS_72.map((d) => r.dimensionScores?.[d.id] ?? 0),
    r.scoringMessage.replace(/"/g, "'"),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hasil-scri72-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const STAGE_COLORS: Record<string, string> = {
  "Automatic Living Dominant": "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400",
  "Awakening Stage": "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400",
  "Growth Stage": "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400",
  "Presence Stage": "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  "Actualisation Stage": "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  "Integration Stage": "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400",
};

export default function AdminScri72HasilPage() {
  const [results, setResults] = useState<ScriResult72[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, "scri72_results"), orderBy("completedAt", "desc")),
        );
        if (!cancelled) {
          setResults(
            snap.docs.map((d) => ({ ...(d.data() as Omit<ScriResult72, "id">), id: d.id })),
          );
        }
      } catch {
        // Firestore unavailable
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length)
      : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <Link
            href="/admin/scri72"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke SCRI-72
          </Link>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Hasil SCRI-72</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Semua pengisian Self-Command Readiness Index — 72 pertanyaan
          </p>
        </div>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => exportToCsv(results)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Pengisi</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{loading ? "—" : results.length}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Rata-rata Skor</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{loading ? "—" : avgScore}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Skor Maksimal</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">360</p>
        </div>
      </div>

      {/* Results list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--muted-foreground)]">
          <Users className="w-12 h-12 mx-auto opacity-20 mb-3" />
          <p className="font-medium">Belum ada hasil</p>
          <p className="text-sm mt-1">Hasil akan muncul setelah pengguna menyelesaikan SCRI-72.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden"
            >
              {/* Row header */}
              <button
                type="button"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--muted)]/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] text-sm truncate">
                    {r.userName || r.userEmail}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{r.userEmail}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-lg font-bold text-[var(--foreground)]">{r.totalScore}</span>
                  <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ${
                    STAGE_COLORS[r.scoringLabel] ?? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}>
                    {r.scoringLabel || "—"}
                  </span>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(r.completedAt)}
                  </div>
                  {expanded === r.id
                    ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" />
                    : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === r.id && (
                <div className="border-t border-[var(--border)] p-5 space-y-4">
                  <div className="flex flex-wrap gap-2 sm:hidden">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STAGE_COLORS[r.scoringLabel] ?? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}>
                      {r.scoringLabel || "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Calendar className="w-3 h-3" /> {formatDate(r.completedAt)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                      Skor per Dimensi
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {DIMENSIONS_72.map((dim) => {
                        const score = r.dimensionScores?.[dim.id] ?? 0;
                        const max = 60; // 12 questions × 5
                        const pct = Math.round((score / max) * 100);
                        return (
                          <div key={dim.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--foreground)] font-medium">{dim.label}</span>
                              <span className="text-[var(--muted-foreground)]">{score}/{max}</span>
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
                  </div>

                  {r.scoringMessage && (
                    <div className="bg-[var(--muted)]/40 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1">Pesan Hasil</p>
                      <p className="text-sm text-[var(--foreground)]">{r.scoringMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
