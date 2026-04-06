"use client";

import { useState, useEffect } from "react";
import { BookOpen, Filter, Search, Video, Lock, Star, Users, Play, ShoppingCart, Layers } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { allContents, type Content } from "@/lib/content-data";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

const categories = ["Semua", "Pengembangan Diri", "Kepemimpinan", "Spiritual", "Gen Z", "Korporat", "Konseling"];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
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

  const filtered = contents.filter((c) => {
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
