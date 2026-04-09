"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DIMENSIONS_72, type DimensionId72 } from "@/lib/scri72-data";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TambahPertanyaan72Page() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    dimension: DimensionId72;
    text: string;
  }>({
    dimension: "self_awareness",
    text: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text.trim()) return;
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      await setDoc(doc(db, "scri72_questions", id), {
        ...form,
        id,
        order: Date.now(),
        createdAt: new Date().toISOString(),
      });
      router.push("/admin/scri72/pertanyaan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pertanyaan.");
    }
    setSubmitting(false);
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tambah Pertanyaan</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Tambahkan pertanyaan baru ke dimensi SCRI-72.</p>
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
              placeholder="Saya mampu mengenali emosi saya ketika sedang muncul."
              rows={3}
              required
              className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <p className="text-xs text-[var(--muted-foreground)]">Gunakan kalimat pernyataan orang pertama (Saya...).</p>
          </div>
        </div>

        {/* Answer scale reference */}
        <div className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wide">Skala Jawaban</p>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 1, label: "Sangat Tidak Sesuai" },
              { val: 2, label: "Kurang Sesuai" },
              { val: 3, label: "Cukup Sesuai" },
              { val: 4, label: "Sesuai" },
              { val: 5, label: "Sangat Sesuai" },
            ].map((s) => (
              <span key={s.val} className="text-xs px-2.5 py-1 bg-[var(--card)] border border-[var(--border)] rounded-full text-[var(--foreground)]">
                {s.val} = {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !form.text.trim()}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan Pertanyaan"}
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
