"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DIMENSIONS } from "@/lib/scri-data";
import Link from "next/link";
import { ClipboardList, Star, ArrowRight } from "lucide-react";

export default function AdminScriPage() {
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
          getDocs(collection(db, "scri_questions")),
          getCountFromServer(collection(db, "scri_scoring")),
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">SCRI-36 Management</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Self-Command Readiness Index — kelola pertanyaan dan penilaian.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/scri/pertanyaan"
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Total Pertanyaan</p>
              <p className="text-3xl font-bold text-[var(--foreground)] mt-1">
                {loading ? "—" : totalQuestions}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">dari 36 pertanyaan standar</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/scri/penilaian"
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
      </div>

      {/* Per-dimension breakdown */}
      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Pertanyaan per Dimensi</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)]">
          {DIMENSIONS.map((dim) => {
            const count = counts[dim.id] ?? 0;
            return (
              <Link
                key={dim.id}
                href={`/admin/scri/pertanyaan?dimensi=${dim.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--muted)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
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
          href="/admin/scri/pertanyaan/baru"
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <ClipboardList className="w-5 h-5 text-[var(--primary)]" />
            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
          </div>
          <p className="font-semibold text-sm text-[var(--foreground)]">Tambah Pertanyaan Baru</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Tambahkan pertanyaan ke salah satu dimensi</p>
        </Link>

        <Link
          href="/admin/scri/penilaian"
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-[var(--primary)]" />
            <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
          </div>
          <p className="font-semibold text-sm text-[var(--foreground)]">Edit Pesan Penilaian</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Ubah label dan pesan untuk setiap rentang skor</p>
        </Link>
      </div>
    </div>
  );
}
