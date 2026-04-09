"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { collection, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DIMENSIONS_72, type ScriQuestion72 } from "@/lib/scri72-data";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Edit, Trash2, Filter, ClipboardList, GripVertical } from "lucide-react";

function QuestionList() {
  const searchParams = useSearchParams();
  const initialDim = searchParams.get("dimensi") ?? "all";

  const [questions, setQuestions] = useState<ScriQuestion72[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dimFilter, setDimFilter] = useState(initialDim);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuestions() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "scri72_questions"));
        if (!cancelled) setQuestions(snap.docs.map((d) => d.data() as ScriQuestion72));
      } catch (err) {
        console.error("Gagal memuat pertanyaan:", err);
      }
      if (!cancelled) setLoading(false);
    }
    fetchQuestions();
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Hapus pertanyaan ini?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "scri72_questions", id));
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert("Gagal menghapus pertanyaan.");
    }
    setDeleting(null);
  }

  function getDimQuestions(dimId: string) {
    return questions
      .filter((q) => q.dimension === dimId)
      .sort((a, b) => a.order - b.order);
  }

  async function handleDrop(targetId: string, dimId: string) {
    if (!dragId.current || dragId.current === targetId) {
      setDragOverId(null);
      return;
    }
    const dimQs = getDimQuestions(dimId);
    const fromIdx = dimQs.findIndex((q) => q.id === dragId.current);
    const toIdx = dimQs.findIndex((q) => q.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...dimQs];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const withOrder = reordered.map((q, i) => ({ ...q, order: i + 1 }));

    setQuestions((prev) => {
      const others = prev.filter((q) => q.dimension !== dimId);
      return [...others, ...withOrder];
    });
    setDragOverId(null);
    dragId.current = null;

    setSavingOrder(true);
    try {
      const batch = writeBatch(db);
      withOrder.forEach((q) => batch.update(doc(db, "scri72_questions", q.id), { order: q.order }));
      await batch.commit();
    } catch {
      alert("Gagal menyimpan urutan.");
    }
    setSavingOrder(false);
  }

  const filtered = questions.filter((q) => {
    const matchDim = dimFilter === "all" || q.dimension === dimFilter;
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase());
    return matchDim && matchSearch;
  });

  const isDimMode = dimFilter !== "all";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Pertanyaan SCRI-72</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Kelola pertanyaan berdasarkan 6 dimensi penilaian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savingOrder && (
            <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin inline-block" />
              Menyimpan urutan...
            </span>
          )}
          <Link
            href="/admin/scri72/pertanyaan/baru"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Pertanyaan
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Cari pertanyaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
          <select
            value={dimFilter}
            onChange={(e) => setDimFilter(e.target.value)}
            className="text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Semua Dimensi</option>
            {DIMENSIONS_72.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hint & count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-[var(--muted-foreground)]">
          Menampilkan <span className="font-semibold text-[var(--foreground)]">{filtered.length}</span> dari {questions.length} pertanyaan
        </p>
        {isDimMode && !loading && filtered.length > 1 && (
          <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
            <GripVertical className="w-3.5 h-3.5" />
            Seret untuk mengubah urutan
          </p>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada pertanyaan. Tambahkan atau muat data awal dari halaman SCRI-72.</p>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {DIMENSIONS_72.filter(
            (dim) => dimFilter === "all" || dim.id === dimFilter
          ).map((dim) => {
            const dimQs = filtered
              .filter((q) => q.dimension === dim.id)
              .sort((a, b) => a.order - b.order);
            if (dimQs.length === 0) return null;
            return (
              <div key={dim.id}>
                <div className="px-5 py-3 bg-[var(--muted)] border-b border-[var(--border)]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {dim.label}{" "}
                    <span className="font-normal normal-case">({dimQs.length} pertanyaan)</span>
                  </h3>
                </div>
                {dimQs.map((q, idx) => (
                  <div
                    key={q.id}
                    draggable={isDimMode}
                    onDragStart={() => { dragId.current = q.id; }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverId(q.id); }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={() => handleDrop(q.id, dim.id)}
                    onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-[var(--border)] last:border-b-0 transition-colors ${
                      isDimMode ? "cursor-grab active:cursor-grabbing" : ""
                    } ${
                      dragOverId === q.id ? "bg-violet-500/5 border-l-2 border-l-violet-500" : "hover:bg-[var(--muted)]/40"
                    }`}
                  >
                    {isDimMode && (
                      <GripVertical className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--muted-foreground)] opacity-40" />
                    )}
                    <span className="text-xs text-[var(--muted-foreground)] mt-0.5 w-5 flex-shrink-0 text-right">
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-sm text-[var(--foreground)] leading-relaxed">{q.text}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        href={`/admin/scri72/pertanyaan/${q.id}`}
                        className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={deleting === q.id}
                        className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminScri72PertanyaanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QuestionList />
    </Suspense>
  );
}
