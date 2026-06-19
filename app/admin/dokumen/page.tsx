"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { type Dokumen, DOKUMEN_CATEGORIES, formatFileSize, getFileTypeLabel } from "@/lib/dokumen-data";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Globe,
  LogIn,
  Lock,
  Filter,
  FileText,
  FileType,
  Presentation,
} from "lucide-react";
import { AdminCopilot, CopilotStep } from "@/components/admin-copilot";
import { ADMIN_TUTORIALS } from "@/lib/links";

const DOKUMEN_STEPS: CopilotStep[] = [
  {
    id: "header",
    title: "Manajemen Dokumen",
    desc: "Di sini kamu bisa mengelola semua dokumen yang bisa diunduh pengguna. Klik tombol 'Tambah Dokumen' di kanan atas untuk mengunggah dokumen baru.",
  },
  {
    id: "filters",
    title: "Pencarian & Filter",
    desc: "Cari dokumen berdasarkan judul atau kategori. Gunakan tombol pill untuk memfilter berdasarkan kategori konten, atau pilih jenis akses: Gratis, Login, atau Berbayar.",
  },
  {
    id: "table",
    title: "Daftar Dokumen",
    desc: "Setiap baris menampilkan judul, kategori, tipe file, ukuran, dan level akses dokumen. Gunakan ikon pensil untuk mengedit, atau ikon tempat sampah untuk menghapus dokumen secara permanen.",
  },
];

const accessOptions = ["Semua Akses", "Gratis", "Login", "Berbayar"];
const categoryOptions = ["Semua", ...DOKUMEN_CATEGORIES];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function FileTypeIcon({ type }: { type: string }) {
  if (type === "ppt" || type === "pptx")
    return <Presentation className="w-4 h-4 text-orange-500" />;
  if (type === "doc" || type === "docx")
    return <FileType className="w-4 h-4 text-blue-500" />;
  return <FileText className="w-4 h-4 text-red-500" />;
}

export default function AdminDokumenPage() {
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");
  const [accessFilter, setAccessFilter] = useState("Semua Akses");
  const [deleting, setDeleting] = useState<string | null>(null);

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

  async function handleDelete(item: Dokumen) {
    if (!confirm(`Hapus dokumen "${item.title}"? Tindakan tidak dapat dibatalkan.`)) return;
    setDeleting(item.id);
    try {
      // Delete file from Storage
      try {
        const fileRef = ref(storage, `documents/${item.fileName}`);
        await deleteObject(fileRef);
      } catch {
        // File may already be deleted; continue
      }
      await deleteDoc(doc(db, "documents", item.id));
      setDokumen((prev) => prev.filter((d) => d.id !== item.id));
    } catch {
      alert("Gagal menghapus dokumen.");
    }
    setDeleting(null);
  }

  const filtered = dokumen.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchCat = catFilter === "Semua" || d.category === catFilter;
    const matchAccess =
      accessFilter === "Semua Akses" ||
      (accessFilter === "Gratis" && d.access === "free") ||
      (accessFilter === "Login" && d.access === "login") ||
      (accessFilter === "Berbayar" && d.access === "paid");
    return matchSearch && matchCat && matchAccess;
  });

  const accessIcon = (a: string) => {
    if (a === "free") return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
    if (a === "login") return <LogIn className="w-3.5 h-3.5 text-blue-500" />;
    return <Lock className="w-3.5 h-3.5 text-amber-500" />;
  };

  const accessLabel = (d: Dokumen) => {
    if (d.access === "free") return "Gratis";
    if (d.access === "login") return "Login";
    return `Berbayar${d.price ? ` · ${formatRupiah(d.price)}` : ""}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div data-copilot="header" className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dokumen</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Kelola dokumen yang dapat diunduh pengguna.
          </p>
        </div>
        <Link
          href="/admin/dokumen/baru"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumen
        </Link>
      </div>

      <AdminCopilot
        pageTitle="Dokumen"
        steps={DOKUMEN_STEPS}
        youtubeUrl={ADMIN_TUTORIALS.dokumen}
        storageKey="dokumen"
      />

      {/* Filters */}
      <div data-copilot="filters" className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Cari judul atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs text-[var(--muted-foreground)]">Filter:</span>
          </div>
          {categoryOptions.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                catFilter === c
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {c}
            </button>
          ))}
          <div className="w-px h-5 bg-[var(--border)] self-center mx-1" />
          {accessOptions.map((a) => (
            <button
              key={a}
              onClick={() => setAccessFilter(a)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
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

      {/* Table */}
      <div data-copilot="table" className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada dokumen.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40">
                  <th className="text-left px-4 py-3 font-medium text-[var(--muted-foreground)]">Judul</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--muted-foreground)]">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--muted-foreground)]">Tipe</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--muted-foreground)]">Ukuran</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--muted-foreground)]">Akses</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--muted-foreground)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileTypeIcon type={item.fileType} />
                        <span className="font-medium text-[var(--foreground)] line-clamp-1">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--muted-foreground)]">
                        {getFileTypeLabel(item.fileType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                      {formatFileSize(item.fileSize)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        {accessIcon(item.access)}
                        {accessLabel(item)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/dokumen/${item.id}`}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deleting === item.id}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
