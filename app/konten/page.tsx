"use client";

import { useState, useEffect } from "react";
import { BookOpen, Filter, Search, Video, Lock, Star, Users, Play, ShoppingCart, Layers, CalendarDays, CheckCircle, Sun } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { allContents, type Content } from "@/lib/content-data";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAllDevotionProgress, type DevotionProgress } from "@/lib/progress";

const categories = ["Semua", "Pengembangan Diri", "Kepemimpinan", "Spiritual", "Gen Z", "Korporat", "Konseling"];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function daysElapsed(startedAt: string): number {
  const start = new Date(startedAt);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function DevotionSection({ devotionContents, user, openAuthModal }: {
  devotionContents: Content[];
  user: { uid?: string } | null;
  openAuthModal: (redirect?: string) => void;
}) {
  const [allProgress, setAllProgress] = useState<DevotionProgress[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    getAllDevotionProgress(user.uid).then(setAllProgress).catch(() => {});
  }, [user?.uid]);

  if (devotionContents.length === 0) return null;

  const getProgress = (contentId: string) => allProgress.find((p) => p.contentId === contentId) ?? null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
          <Sun className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">Renungan Harian</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Bacaan spiritual harian — mulai kapanpun, lanjutkan kapanpun</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devotionContents.map((content) => {
          const prog = getProgress(content.id);
          const entries = content.devotionEntries ?? [];
          const totalDays = entries.length > 0 ? Math.max(...entries.map((e) => e.day)) : 0;
          const completedCount = prog?.completedDays.length ?? 0;
          const progressPct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
          const todayRelativeDay = prog ? daysElapsed(prog.startedAt) + 1 : null;
          const lastEntry = prog ? entries.find((e) => e.day === prog.lastReadDay) : null;

          return (
            <div key={content.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-4 h-4 text-amber-100" />
                      <span className="text-amber-100 text-xs font-semibold uppercase tracking-wider">Renungan Harian</span>
                    </div>
                    <h3 className="text-white font-bold text-base leading-snug">{content.title}</h3>
                    <p className="text-amber-100/80 text-xs mt-1">{totalDays} hari</p>
                  </div>
                  {prog && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-amber-100 text-[10px]">Progress</p>
                      <p className="text-white text-2xl font-black leading-none">{progressPct}%</p>
                      <p className="text-amber-200 text-[10px] mt-0.5">{completedCount}/{totalDays} hari</p>
                    </div>
                  )}
                </div>
                {/* Progress bar */}
                {prog && (
                  <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-4 flex-1">
                {prog ? (
                  <div className="space-y-2">
                    {/* Last read / today */}
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>Terakhir dibaca: <strong className="text-[var(--foreground)]">Hari {prog.lastReadDay}</strong></span>
                    </div>
                    {todayRelativeDay !== null && todayRelativeDay <= totalDays && (
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                        <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>Renungan hari ini: <strong className="text-[var(--foreground)]">Hari {Math.min(todayRelativeDay, totalDays)}</strong></span>
                      </div>
                    )}
                    {lastEntry && (
                      <p className="text-[var(--foreground)] text-sm font-medium line-clamp-2 mt-2">{lastEntry.title}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[var(--foreground)] text-sm font-medium">Mulai perjalanan renungan harian Anda</p>
                    <p className="text-[var(--muted-foreground)] text-xs leading-relaxed line-clamp-3 break-words">{content.description}</p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-6 pb-5">
                {prog ? (
                  <Link
                    href={`/konten/${content.slug}?day=${prog.lastReadDay}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                  >
                    <Sun className="w-4 h-4" /> Lanjutkan — Hari {prog.lastReadDay}
                  </Link>
                ) : !user ? (
                  <button
                    onClick={() => openAuthModal(`/konten/${content.slug}`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    <Lock className="w-4 h-4" /> Login untuk Memulai
                  </button>
                ) : (
                  <Link
                    href={`/konten/${content.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                  >
                    <Sun className="w-4 h-4" /> Mulai Renungan Harian
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function KontenPage() {
  const { user, openAuthModal } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua Tipe");
  const [accessFilter, setAccessFilter] = useState("Semua Akses");
  const [contents, setContents] = useState<Content[]>(allContents);

  useEffect(() => {
    getDocs(query(collection(db, "contents"), orderBy("title")))
      .then((snap) => {
        if (!snap.empty) {
          setContents(snap.docs.map((d) => ({ ...(d.data() as Content), id: d.id })));
        }
      })
      .catch(() => {
        // keep static fallback
      });
  }, []);

  // Separate devotion content from regular content
  const devotionContents = contents.filter((c) => c.isDevotionContent);
  const regularContents = contents.filter((c) => !c.isDevotionContent);

  const filtered = regularContents.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Semua" || c.category === activeCategory;
    const matchType = typeFilter === "Semua Tipe" || (typeFilter === "Video" ? c.type === "video" : c.type === "article");
    const matchAccess =
      accessFilter === "Semua Akses" ||
      (accessFilter === "Gratis" ? c.access === "free" : c.access !== "free");
    return matchSearch && matchCat && matchType && matchAccess;
  });

  const accessBadge = (access: string) => {
    if (access === "free") return null;
    if (access === "login") return (
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
        <Lock className="w-3 h-3" /> Login
      </div>
    );
    return (
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        <Lock className="w-3 h-3" /> Berbayar
      </div>
    );
  };

  const ctaButton = (content: Content) => {
    if (content.access === "free") {
      return (
        <Link
          href={`/konten/${content.slug}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] hover:opacity-90 text-white transition-opacity"
        >
          <Play className="w-3 h-3" /> Mulai Belajar
        </Link>
      );
    }
    if (content.access === "login") {
      if (!user) {
        return (
          <button
            onClick={() => openAuthModal(`/konten/${content.slug}`)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Lock className="w-3 h-3" /> Login untuk Akses
          </button>
        );
      }
      return (
        <Link
          href={`/konten/${content.slug}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] hover:opacity-90 text-white transition-opacity"
        >
          <Play className="w-3 h-3" /> Mulai Belajar
        </Link>
      );
    }
    // paid
    if (!user) {
      return (
        <button
          onClick={() => openAuthModal(`/konten/${content.slug}`)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-white transition-colors"
        >
          <Lock className="w-3 h-3" /> {content.price ? formatRupiah(content.price) : "Premium"}
        </button>
      );
    }
    return (
      <Link
        href={`/konten/${content.slug}`}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-white transition-colors"
      >
        <ShoppingCart className="w-3 h-3" /> {content.price ? formatRupiah(content.price) : "Beli Sekarang"}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-sm font-medium uppercase tracking-wider mb-2">Semua Konten</p>
          <h1 className="text-4xl font-bold mb-3">Eksplorasi Semua Konten</h1>
          <p className="text-blue-200/80 max-w-xl">
            Video, artikel, dan panduan untuk membantu Anda membangun kehidupan yang stabil, produktif, dan berdampak.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Renungan Harian Section */}
        <DevotionSection devotionContents={devotionContents} user={user} openAuthModal={openAuthModal} />

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Cari konten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              <option>Semua Tipe</option>
              <option>Video</option>
              <option>Artikel</option>
            </select>
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              <option>Semua Akses</option>
              <option>Gratis</option>
              <option>Premium</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                cat === activeCategory
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Tidak ada konten yang sesuai filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((content) => (
              <div key={content.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
                <div className="relative aspect-video bg-slate-800">
                  {content.isSteppedContent ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-950 gap-3">
                      <Layers className="w-12 h-12 text-indigo-300/70" />
                      <p className="text-indigo-200/70 text-xs font-medium">{content.steps?.length ?? 0} Langkah</p>
                    </div>
                  ) : content.access === "free" && content.type === "video" && content.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${content.youtubeId}`}
                      title={content.title}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : content.type === "video" && content.youtubeId && user && content.access === "login" ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${content.youtubeId}`}
                      title={content.title}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : content.type === "video" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 gap-3">
                      <Lock className="w-10 h-10 text-slate-500" />
                      <p className="text-slate-400 text-xs">Konten terkunci</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-800">
                      <BookOpen className="w-12 h-12 text-blue-300/50" />
                    </div>
                  )}
                  {accessBadge(content.access)}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {content.isSteppedContent
                      ? <><Layers className="w-3 h-3" /> Seri Bertahap</>
                      : content.type === "video"
                        ? <><Video className="w-3 h-3" /> Video</>
                        : <><BookOpen className="w-3 h-3" /> Artikel</>
                    }
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[var(--primary)] text-xs font-semibold uppercase tracking-wider mb-2">{content.category}</span>
                  <h3 className="font-bold text-[var(--foreground)] text-sm leading-snug mb-3 line-clamp-2 flex-1">{content.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-4">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {content.rating}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {content.students.toLocaleString("id-ID")}</span>
                    <span>{content.duration}</span>
                  </div>
                  {ctaButton(content)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
