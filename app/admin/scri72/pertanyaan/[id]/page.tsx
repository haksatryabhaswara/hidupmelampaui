"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DIMENSIONS_72, type DimensionId72, type ScriQuestion72 } from "@/lib/scri72-data";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EditPertanyaan72Page() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    dimension: DimensionId72;
    text: string;
  }>({
    dimension: "self_awareness",
    text: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "scri72_questions", id));
        if (snap.exists()) {
          const data = snap.data() as ScriQuestion72;
          setForm({
            dimension: data.dimension,
            text: data.text,
          });
        }
      } catch {
        alert("Gagal memuat pertanyaan.");
        router.push("/admin/scri72/pertanyaan");
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text.trim()) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "scri72_questions", id), {
        dimension: form.dimension,
        text: form.text,
      });
      router.push("/admin/scri72/pertanyaan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/scri72/pertanyaan"
          className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Pertanyaan</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Ubah teks atau dimensi pertanyaan SCRI-72.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
          {/* Dimension */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Dimensi</label>
            <select
              value={form.dimension}
              onChange={(e) => setForm((f) => ({ ...f, dimension: e.target.value as DimensionId72 }))}
              className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {DIMENSIONS_72.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Teks Pertanyaan</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              rows={3}
              required
              className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !form.text.trim()}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link
            href="/admin/scri72/pertanyaan"
            className="px-5 py-2 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
