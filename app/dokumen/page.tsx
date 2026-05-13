"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  type Dokumen,
  DOKUMEN_CATEGORIES,
  formatFileSize,
  getFileTypeLabel,
} from "@/lib/dokumen-data";
import Link from "next/link";
import {
  Search,
  Filter,
  FileText,
  FileType,
  Presentation,
  Globe,
  LogIn,
  Lock,
  FolderOpen,
} from "lucide-react";

const categoryOptions = ["Semua", ...DOKUMEN_CATEGORIES];
const accessOptions = ["Semua", "Gratis", "Login", "Berbayar"];

function SkeletonCard() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--muted)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--muted)] rounded-full w-3/4" />
          <div className="h-3 bg-[var(--muted)] rounded-full w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-[var(--muted)] rounded-full" />
      <div className="h-3 bg-[var(--muted)] rounded-full w-5/6" />
      <div className="h-8 bg-[var(--muted)] rounded-lg mt-1" />
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  if (type === "ppt" || type === "pptx")
    return (
      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
        <Presentation className="w-5 h-5 text-orange-500" />
      </div>
    );
  if (type === "doc" || type === "docx")
    return (
      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
        <FileType className="w-5 h-5 text-blue-500" />
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
      <FileText className="w-5 h-5 text-red-500" />
    </div>
  );
}

function AccessBadge({ access }: { access: string }) {
  if (access === "free")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
        <Globe className="w-3 h-3" /> Gratis
      </span>
    );
  if (access === "login")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-medium">
        <LogIn className="w-3 h-3" /> Login
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-medium">
      <Lock className="w-3 h-3" /> Berbayar
    </span>
  );
}

export default function DokumenPage() {
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");
  const [accessFilter, setAccessFilter] = useState("Semua");

  const loadDokumen = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "documents"), orderBy("createdAt", "desc"))
      );
      setDokumen(snap.docs.map((d) => ({ ...(d.data() as Dokumen), id: d.id })));
    } catch (err) {
      console.error("Gagal memuat dokumen:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDokumen();
  }, [loadDokumen]);

  const filtered = dokumen.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchCat = catFilter === "Semua" || d.category === catFilter;
    const matchAccess =
      accessFilter === "Semua" ||
      (accessFilter === "Gratis" && d.access === "free") ||
      (accessFilter === "Login" && d.access === "login") ||
      (accessFilter === "Berbayar" && d.access === "paid");
    return matchSearch && matchCat && matchAccess;
  });

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--muted)]/50 to-[var(--background)] px-4 py-14">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold uppercase tracking-wider">
            <FolderOpen className="w-3.5 h-3.5" /> Perpustakaan Dokumen
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
            Dokumen &amp; Materi
          </h1>
          <p className="text-[var(--muted-foreground)] text-base max-w-xl mx-auto">
            Unduh PDF, presentasi, dan materi bacaan untuk mendukung perjalanan pengembangan diri Anda.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Filter className="w-3.5 h-3.5" /> Kategori:
            </div>
            {categoryOptions.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  catFilter === c
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {c}
              </button>
            ))}

            <div className="w-px h-5 bg-[var(--border)] self-center mx-1" />
            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              Akses:
            </div>
            {accessOptions.map((a) => (
              <button
                key={a}
                onClick={() => setAccessFilter(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  accessFilter === a
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Tidak ada dokumen ditemukan.</p>
            <p className="text-sm mt-1 opacity-70">Coba ubah kata kunci atau filter.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--muted-foreground)]">
              Menampilkan <span className="font-medium text-[var(--foreground)]">{filtered.length}</span> dokumen
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/dokumen/${item.id}`}
                  className="group bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-[var(--primary)]/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FileIcon type={item.fileType} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{item.category}</p>
                    </div>
                  </div>

                  {item.description && (
                    <div
                      className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed rte-view"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <AccessBadge access={item.access} />
                      <span className="text-xs text-[var(--muted-foreground)] font-mono">
                        {getFileTypeLabel(item.fileType)}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {formatFileSize(item.fileSize)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
