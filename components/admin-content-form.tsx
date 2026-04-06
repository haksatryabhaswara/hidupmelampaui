"use client";

import { useState } from "react";
import { type Content, type StepContent, type ContentAccess } from "@/lib/content-data";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Layers,
  Globe,
  LogIn,
  Lock,
  GripVertical,
} from "lucide-react";

import { RichTextEditor } from "@/components/rich-text-editor";

type ContentFormData = Omit<Content, "id">;

interface Props {
  initial?: Partial<ContentFormData>;
  onSubmit: (data: ContentFormData) => Promise<void>;
  submitting: boolean;
  submitLabel: string;
}

const emptyStep = (): Omit<StepContent, "id"> & { id: string } => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  type: "video",
  youtubeId: null,
  access: "free",
  duration: "",
  body: "",
});

const CATEGORIES = ["Pengembangan Diri", "Kepemimpinan", "Spiritual", "Gen Z", "Korporat", "Konseling"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function ContentForm({ initial = {}, onSubmit, submitting, submitLabel }: Props) {
  const [form, setForm] = useState<ContentFormData>({
    slug: initial.slug ?? "",
    title: initial.title ?? "",
    description: initial.description ?? "",
    category: initial.category ?? "Pengembangan Diri",
    type: initial.type ?? "video",
    youtubeId: initial.youtubeId ?? null,
    access: initial.access ?? "free",
    price: initial.price,
    rating: initial.rating ?? 4.5,
    students: initial.students ?? 0,
    duration: initial.duration ?? "",
    instructor: initial.instructor ?? "Dr. Heru K. Wibawa",
    body: initial.body ?? "",
    isSteppedContent: initial.isSteppedContent ?? false,
    steps: initial.steps ?? [],
  });

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const set = <K extends keyof ContentFormData>(key: K, value: ContentFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || slugify(title),
    }));
  };

  const addStep = () => {
    const newStep = emptyStep();
    setForm((prev) => ({ ...prev, steps: [...(prev.steps ?? []), newStep] }));
    setExpandedStep((form.steps?.length ?? 0));
  };

  const removeStep = (idx: number) => {
    setForm((prev) => ({ ...prev, steps: prev.steps?.filter((_, i) => i !== idx) ?? [] }));
    setExpandedStep(null);
  };

  const setStep = (idx: number, key: keyof StepContent, value: unknown) => {
    setForm((prev) => {
      const steps = [...(prev.steps ?? [])];
      steps[idx] = { ...steps[idx], [key]: value } as StepContent;
      return { ...prev, steps };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]";
  const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Informasi Dasar</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Judul *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputClass}
              placeholder="Judul konten"
            />
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className={inputClass}
              placeholder="url-konten-ini"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">/konten/{form.slug || "..."}</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Deskripsi *</label>
          <textarea
            required
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass + " resize-none"}
            placeholder="Deskripsi singkat konten"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Kategori</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Instruktur</label>
            <input
              type="text"
              value={form.instructor}
              onChange={(e) => set("instructor", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Durasi</label>
            <input
              type="text"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              className={inputClass}
              placeholder="45 menit"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Rating (0–5)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(e) => set("rating", parseFloat(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Jumlah Pelajar</label>
            <input
              type="number"
              min="0"
              value={form.students}
              onChange={(e) => set("students", parseInt(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Type & Format */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Tipe & Format</h2>

        <div className="flex gap-3">
          {(["video", "article"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("type", t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.type === t
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {t === "video" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {t === "video" ? "Video" : "Artikel"}
            </button>
          ))}
        </div>

        {form.type === "video" && (
          <div>
            <label className={labelClass}>YouTube Video ID</label>
            <input
              type="text"
              value={form.youtubeId ?? ""}
              onChange={(e) => set("youtubeId", e.target.value || null)}
              className={inputClass}
              placeholder="inpok4MKVLM"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">ID saja, bukan URL penuh.</p>
          </div>
        )}

        <div>
          <label className={labelClass}>Format Konten</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => set("isSteppedContent", false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                !form.isSteppedContent
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <FileText className="w-4 h-4" /> Konten Tunggal
            </button>
            <button
              type="button"
              onClick={() => set("isSteppedContent", true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.isSteppedContent
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <Layers className="w-4 h-4" /> Berlangkah (Multi-step)
            </button>
          </div>
        </div>
      </section>

      {/* Access & Pricing */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Akses & Harga</h2>

        <div className="flex flex-wrap gap-3">
          {([
            { v: "free", label: "Gratis", icon: Globe, color: "text-emerald-600" },
            { v: "login", label: "Wajib Login", icon: LogIn, color: "text-blue-600" },
            { v: "paid", label: "Berbayar", icon: Lock, color: "text-amber-600" },
          ] as const).map(({ v, label, icon: Icon, color }) => (
            <button
              key={v}
              type="button"
              onClick={() => set("access", v as ContentAccess)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.access === v
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <Icon className={`w-4 h-4 ${form.access === v ? "" : color}`} />
              {label}
            </button>
          ))}
        </div>

        {form.access === "paid" && (
          <div>
            <label className={labelClass}>Harga (IDR) *</label>
            <input
              type="number"
              min="0"
              step="1000"
              required
              value={form.price ?? ""}
              onChange={(e) => set("price", parseInt(e.target.value) || undefined)}
              className={inputClass}
              placeholder="99000"
            />
          </div>
        )}
      </section>

      {/* Content Body / Steps */}
      {!form.isSteppedContent ? (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-[var(--foreground)]">Isi Konten</h2>
          <RichTextEditor
            value={form.body ?? ""}
            onChange={(html) => set("body", html)}
            placeholder="Tulis isi konten di sini..."
            minRows={12}
          />
        </section>
      ) : (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">
              Langkah-langkah ({form.steps?.length ?? 0})
            </h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Langkah
            </button>
          </div>

          {(form.steps ?? []).length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
              Belum ada langkah. Klik &ldquo;Tambah Langkah&rdquo; untuk memulai.
            </p>
          )}

          <div className="space-y-3">
            {(form.steps ?? []).map((step, idx) => (
              <div key={step.id} className="border border-[var(--border)] rounded-xl overflow-hidden">
                {/* Step Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-[var(--muted)]/30 cursor-pointer select-none"
                  onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                >
                  <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                  <span className="text-xs font-bold text-[var(--muted-foreground)] w-16 flex-shrink-0">
                    Langkah {idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-[var(--foreground)] truncate">
                    {step.title || "Tanpa judul"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeStep(idx); }}
                      className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedStep === idx ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
                  </div>
                </div>

                {/* Step Fields */}
                {expandedStep === idx && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Judul Langkah *</label>
                        <input
                          type="text"
                          required
                          value={step.title}
                          onChange={(e) => setStep(idx, "title", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Durasi</label>
                        <input
                          type="text"
                          value={step.duration}
                          onChange={(e) => setStep(idx, "duration", e.target.value)}
                          className={inputClass}
                          placeholder="15 menit"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Deskripsi</label>
                      <textarea
                        rows={2}
                        value={step.description}
                        onChange={(e) => setStep(idx, "description", e.target.value)}
                        className={inputClass + " resize-none"}
                      />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <div className="flex-1 min-w-[140px]">
                        <label className={labelClass}>Tipe</label>
                        <select
                          value={step.type}
                          onChange={(e) => setStep(idx, "type", e.target.value)}
                          className={inputClass}
                        >
                          <option value="video">Video</option>
                          <option value="article">Artikel</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className={labelClass}>Akses</label>
                        <select
                          value={step.access}
                          onChange={(e) => setStep(idx, "access", e.target.value)}
                          className={inputClass}
                        >
                          <option value="free">Gratis</option>
                          <option value="login">Wajib Login</option>
                          <option value="paid">Berbayar</option>
                        </select>
                      </div>
                      {step.access === "paid" && (
                        <div className="flex-1 min-w-[140px]">
                          <label className={labelClass}>Harga (IDR)</label>
                          <input
                            type="number"
                            min="0"
                            value={step.price ?? ""}
                            onChange={(e) => setStep(idx, "price", parseInt(e.target.value) || undefined)}
                            className={inputClass}
                          />
                        </div>
                      )}
                    </div>

                    {step.type === "video" && (
                      <div>
                        <label className={labelClass}>YouTube ID</label>
                        <input
                          type="text"
                          value={step.youtubeId ?? ""}
                          onChange={(e) => setStep(idx, "youtubeId", e.target.value || null)}
                          className={inputClass}
                          placeholder="inpok4MKVLM"
                        />
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Isi Langkah</label>
                      <RichTextEditor
                        key={step.id}
                        value={step.body ?? ""}
                        onChange={(html) => setStep(idx, "body", html)}
                        placeholder="Tulis isi langkah di sini..."
                        minRows={6}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => history.back()}
          className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
