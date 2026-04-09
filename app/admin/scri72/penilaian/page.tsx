"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { INITIAL_SCORING_72, type ScriScoring72 } from "@/lib/scri72-data";
import Link from "next/link";
import { ChevronLeft, Upload, Pencil, X, Check } from "lucide-react";

export default function AdminScri72PenilaianPage() {
  const [scorings, setScorings] = useState<ScriScoring72[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; message: string; minScore: number; maxScore: number }>({
    label: "",
    message: "",
    minScore: 0,
    maxScore: 0,
  });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchScoring() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "scri72_scoring"), orderBy("order")));
        if (!snap.empty && !cancelled) {
          setScorings(snap.docs.map((d) => d.data() as ScriScoring72));
        }
      } catch {
        // Firestore unavailable
      }
      if (!cancelled) setLoading(false);
    }
    fetchScoring();
    return () => { cancelled = true; };
  }, [refreshKey]);

  function startEdit(s: ScriScoring72) {
    setEditing(s.id);
    setEditForm({
      label: s.label,
      message: s.message,
      minScore: s.minScore,
      maxScore: s.maxScore,
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      await updateDoc(doc(db, "scri72_scoring", id), {
        label: editForm.label,
        message: editForm.message,
        minScore: editForm.minScore,
        maxScore: editForm.maxScore,
      });
      setScorings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...editForm } : s))
      );
      setEditing(null);
    } catch {
      alert("Gagal menyimpan perubahan.");
    }
    setSaving(false);
  }

  async function handleSeed() {
    if (!confirm("Ini akan menambahkan atau menimpa data penilaian awal (6 rentang skor) untuk SCRI-72. Lanjutkan?")) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const s of INITIAL_SCORING_72) {
        const id = `scoring72_${s.order}`;
        batch.set(doc(db, "scri72_scoring", id), { ...s, id });
      }
      await batch.commit();
      setRefreshKey((k) => k + 1);
      alert("Data penilaian awal SCRI-72 berhasil dimuat!");
    } catch {
      alert("Gagal memuat data penilaian.");
    }
    setSeeding(false);
  }

  const getStageBadgeColor = (order: number) => {
    const colors = [
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    ];
    return colors[(order - 1) % colors.length];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/scri72"
            className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Penilaian SCRI-72</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              Edit label dan pesan untuk setiap rentang skor.
            </p>
          </div>
        </div>
        {scorings.length === 0 && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            {seeding ? "Memuat..." : "Muat Data Awal"}
          </button>
        )}
      </div>

      {/* Scoring scale reference */}
      <div className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-4">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 uppercase tracking-wide">Info Penilaian</p>
        <p className="text-sm text-[var(--foreground)]">
          Total skor maksimal: <strong>360</strong> &nbsp;·&nbsp; Jumlah pertanyaan: <strong>72</strong> &nbsp;·&nbsp;
          Dimensi: <strong>12</strong> &nbsp;·&nbsp; Skala jawaban: <strong>1–5</strong>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : scorings.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-sm">Belum ada data penilaian. Klik &quot;Muat Data Awal&quot; untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scorings.map((s) => (
            <div
              key={s.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-bold text-[var(--foreground)]">
                    {s.minScore} – {s.maxScore}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStageBadgeColor(s.order)}`}>
                    {editing === s.id ? editForm.label : s.label}
                  </span>
                </div>
                {editing === s.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(s.id)}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-lg text-xs font-medium transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-lg text-xs font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                {editing === s.id ? (
                  <>
                    {/* Edit score range */}
                    <div className="flex gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Skor Minimum</label>
                        <input
                          type="number"
                          min={0}
                          max={360}
                          value={editForm.minScore}
                          onChange={(e) => setEditForm((f) => ({ ...f, minScore: Number(e.target.value) }))}
                          className="w-24 px-3 py-1.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--muted-foreground)]">Skor Maksimum</label>
                        <input
                          type="number"
                          min={0}
                          max={360}
                          value={editForm.maxScore}
                          onChange={(e) => setEditForm((f) => ({ ...f, maxScore: Number(e.target.value) }))}
                          className="w-24 px-3 py-1.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                    {/* Edit label */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--muted-foreground)]">Label / Nama Tahap</label>
                      <input
                        type="text"
                        value={editForm.label}
                        onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    {/* Edit message */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--muted-foreground)]">Pesan untuk Pengguna</label>
                      <textarea
                        value={editForm.message}
                        onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      />
                      <p className="text-xs text-[var(--muted-foreground)]">Pesan ini akan ditampilkan kepada pengguna setelah menyelesaikan asesmen.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Pesan</p>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed">{s.message}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
