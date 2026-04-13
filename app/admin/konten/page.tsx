"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { allContents, type Content } from "@/lib/content-data";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Video,
  FileText,
  Lock,
  Globe,
  LogIn,
  Layers,
  Upload,
  Filter,
  BookOpen,
  ClipboardList,
} from "lucide-react";

const categories = ["Semua", "Pengembangan Diri", "Kepemimpinan", "Spiritual", "Gen Z", "Korporat", "Konseling"];
const types = ["Semua Tipe", "Video", "Artikel"];
const access = ["Semua Akses", "Gratis", "Login", "Berbayar"];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminKontenPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua Tipe");
  const [accessFilter, setAccessFilter] = useState("Semua Akses");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const loadContents = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, "contents"), orderBy("title")));
      if (!snap.empty) {
        setContents(snap.docs.map((d) => ({ ...(d.data() as Content), id: d.id })));
      } else {
        // Fall back to static data
        setContents(allContents);
      }
    } catch {
      setContents(allContents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus konten ini? Tindakan tidak dapat dibatalkan.")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "contents", id));
      setContents((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Gagal menghapus konten.");
    }
    setDeleting(null);
  }

  async function handleSeedStaticData() {
    if (!confirm("Impor semua data konten statis ke Firestore? Data yang ada tidak akan dihapus.")) return;
    setSeeding(true);
    try {
      for (const content of allContents) {
        await setDoc(doc(db, "contents", content.id), content);
      }
      setLoading(true);
      await loadContents();
    } catch {
      alert("Gagal mengimpor data.");
    }
    setSeeding(false);
  }

  const filtered = contents.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const matchCat = catFilter === "Semua" || c.category === catFilter;
    const matchType = typeFilter === "Semua Tipe" || (typeFilter === "Video" ? c.type === "video" : c.type === "article");
    const matchAccess =
      accessFilter === "Semua Akses" ||
      (accessFilter === "Gratis" && c.access === "free") ||
      (accessFilter === "Login" && c.access === "login") ||
      (accessFilter === "Berbayar" && c.access === "paid");
    return matchSearch && matchCat && matchType && matchAccess;
  });

  const accessIcon = (a: string) => {
    if (a === "free") return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
    if (a === "login") return <LogIn className="w-3.5 h-3.5 text-blue-500" />;
    return <Lock className="w-3.5 h-3.5 text-amber-500" />;
  };

  const accessLabel = (c: Content) => {
    if (c.access === "free") return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Gratis</span>;
    if (c.access === "login") return <span className="text-blue-600 dark:text-blue-400 font-medium">Login</span>;
    return <span className="text-amber-600 dark:text-amber-400 font-medium">{c.price ? formatRupiah(c.price) : "Berbayar"}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Manajemen Konten</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{contents.length} konten total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSeedStaticData}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {seeding ? "Mengimpor..." : "Impor Data Statis"}
          </button>
          <Link
            href="/admin/konten/baru"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Tambah Konten
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
          <Filter className="w-4 h-4" /> Filter
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Cari judul atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>
          {/* Category */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none"
          >
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
          {/* Access */}
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none"
          >
            {access.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <BookOpen className="w-12 h-12 mx-auto opacity-20 mb-3" />
          <p>Tidak ada konten ditemukan.</p>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Judul</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Tipe</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Akses</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Format</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((content) => (
                  <tr key={content.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[var(--foreground)] line-clamp-1 max-w-xs">{content.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">/konten/{content.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-xs">
                        {content.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                        {content.type === "video" ? <Video className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                        <span className="capitalize">{content.type === "video" ? "Video" : "Artikel"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {accessIcon(content.access)}
                        {accessLabel(content)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {content.isSteppedContent ? (
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Layers className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{content.steps?.length ?? 0} Langkah</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--muted-foreground)]">Tunggal</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {content.test?.enabled && (
                          <Link
                            href={`/admin/konten/${content.id}/jawaban`}
                            className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                            title="Lihat Jawaban Tes"
                          >
                            <ClipboardList className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/konten/${content.id}`}
                          className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(content.id)}
                          disabled={deleting === content.id}
                          className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

