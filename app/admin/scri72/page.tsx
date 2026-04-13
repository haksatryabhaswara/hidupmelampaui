"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DIMENSIONS_72 } from "@/lib/scri72-data";
import Link from "next/link";
import { ClipboardList, Star, ArrowRight, Users } from "lucide-react";

export default function AdminScri72Page() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [scoringCount, setScoringCount] = useState<number | string>("—");
  const [loading, setLoading] = useState(true);
  const [refreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchCounts() {
      setLoading(true);
      try {
        const [questionsSnap, scoringSnap] = await Promise.all([
          getDocs(collection(db, "scri72_questions")),
          getCountFromServer(collection(db, "scri72_scoring")),
        ]);
        const map: Record<string, number> = {};
        questionsSnap.docs.forEach((d) => {
          const dim = d.data().dimension as string;
          map[dim] = (map[dim] ?? 0) + 1;
        });
        if (!cancelled) {
          setCounts(map);
          setScoringCount(scoringSnap.data().count);
        }
      } catch {
        // Firestore unavailable
      }
      if (!cancelled) setLoading(false);
    }
    fetchCounts();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const totalQuestions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">SCRI-72 Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Self-Command Readiness Index Extended — kelola pertanyaan dan penilaian.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/scri72/pertanyaan"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Total Pertanyaan</p>
              <p className="text-3xl font-bold text-[var(--foreground)] mt-1">
                {loading ? "—" : totalQuestions}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">dari 72 pertanyaan standar</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 dark:bg-violet-950/40">
              <ClipboardList className="w-5 h-5 text-violet-500" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/scri72/penilaian"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Rentang Penilaian</p>
              <p className="text-3xl font-bold text-[var(--foreground)] mt-1">
                {loading ? "—" : scoringCount}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">kategori hasil skor</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/40">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/scri72/hasil"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Hasil Pengisian</p>
              <p className="text-3xl font-bold text-[var(--foreground)] mt-1">→</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">lihat &amp; export data</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Per-dimension breakdown */}
      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Pertanyaan per Dimensi</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)]">
          {DIMENSIONS_72.map((dim) => {
            const count = counts[dim.id] ?? 0;
            return (
              <Link
                key={dim.id}
                href={`/admin/scri72/pertanyaan?dimensi=${dim.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--muted)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-sm font-medium text-[var(--foreground)]">{dim.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--muted-foreground)]">{loading ? "..." : `${count} pertanyaan`}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/admin/scri72/pertanyaan/baru"
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-violet-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <ClipboardList className="w-5 h-5 text-violet-500" />
            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-violet-500 transition-colors" />
          </div>
          <p className="font-semibold text-sm text-[var(--foreground)]">Tambah Pertanyaan Baru</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Tambahkan pertanyaan ke salah satu dari 6 dimensi</p>
        </Link>

        <Link
          href="/admin/scri72/penilaian"
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-violet-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-violet-500" />
            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-violet-500 transition-colors" />
          </div>
          <p className="font-semibold text-sm text-[var(--foreground)]">Edit Pesan Penilaian</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Ubah label dan pesan untuk setiap rentang skor</p>
        </Link>
      </div>
    </div>
  );
}
