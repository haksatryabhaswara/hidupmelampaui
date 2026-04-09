"use client";

import Link from "next/link";
import { ChevronRight, Lock, CreditCard, Star } from "lucide-react";

export default function ScriHubPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-semibold tracking-widest uppercase">
            Assessment
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
            Self-Command Readiness Index
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Pilih versi assessment yang ingin Anda ikuti.
          </p>
        </div>

        {/* Selection cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* SCRI-36 Card */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col">
            <div className="bg-[var(--primary)] px-6 py-5">
              <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">Standard</p>
              <h2 className="text-white text-2xl font-black">SCRI-36</h2>
              <p className="text-white/80 text-sm mt-1">6 Dimensi · 36 Pertanyaan · ±5–7 menit</p>
            </div>
            <div className="px-6 py-5 flex-1 space-y-4">
              <p className="text-[var(--foreground)] text-sm leading-relaxed">
                Ukur tingkat kesiapan diri Anda berdasarkan 6 dimensi Self-Command inti.
              </p>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Lock className="w-4 h-4 shrink-0 text-blue-500" />
                <span>Memerlukan <strong>login</strong> — gratis</span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <Link
                href="/scri/36"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Mulai SCRI-36
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* SCRI-72 Card */}
          <div className="bg-[var(--card)] rounded-2xl border border-violet-200 dark:border-violet-800 overflow-hidden flex flex-col">
            <div className="bg-violet-600 px-6 py-5">
              <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">Extended</p>
              <h2 className="text-white text-2xl font-black">SCRI-72</h2>
              <p className="text-white/80 text-sm mt-1">6 Dimensi · 72 Pertanyaan · ±15 menit</p>
            </div>
            <div className="px-6 py-5 flex-1 space-y-4">
              <p className="text-[var(--foreground)] text-sm leading-relaxed">
                Eksplorasi mendalam dengan 6 dimensi dari kesadaran diri hingga kepemimpinan ekonomi.
              </p>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <CreditCard className="w-4 h-4 shrink-0 text-violet-500" />
                <span>Memerlukan <strong>pembayaran</strong> untuk akses</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 rounded-lg px-3 py-2">
                <Star className="w-3.5 h-3.5 shrink-0" />
                Sertifikat eksklusif 6 dimensi
              </div>
            </div>
            <div className="px-6 pb-6">
              <Link
                href="/scri72"
                className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Mulai SCRI-72
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
