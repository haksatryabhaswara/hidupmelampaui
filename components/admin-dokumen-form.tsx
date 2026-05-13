"use client";

import { useState, useRef } from "react";
import {
  type Dokumen,
  type DokumenAccess,
  DOKUMEN_CATEGORIES,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  formatFileSize,
} from "@/lib/dokumen-data";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Globe,
  LogIn,
  Lock,
  UploadCloud,
  FileText,
  FileType,
  Presentation,
  X,
  Loader2,
} from "lucide-react";

type DokumenFormData = Omit<Dokumen, "id" | "createdAt" | "updatedAt">;

interface Props {
  initial?: Partial<DokumenFormData>;
  onSubmit: (data: DokumenFormData) => Promise<void>;
  submitting: boolean;
  submitLabel: string;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]";
const labelClass = "block text-sm font-medium text-[var(--foreground)] mb-1";

function FileTypeIcon({ type }: { type: string }) {
  if (type === "ppt" || type === "pptx")
    return <Presentation className="w-5 h-5 text-orange-500" />;
  if (type === "doc" || type === "docx")
    return <FileType className="w-5 h-5 text-blue-500" />;
  return <FileText className="w-5 h-5 text-red-500" />;
}

export function DokumenForm({ initial = {}, onSubmit, submitting, submitLabel }: Props) {
  const [form, setForm] = useState<DokumenFormData>({
    title: initial.title ?? "",
    description: initial.description ?? "",
    category: initial.category ?? DOKUMEN_CATEGORIES[0],
    access: initial.access ?? "free",
    price: initial.price,
    fileUrl: initial.fileUrl ?? "",
    fileName: initial.fileName ?? "",
    fileType: initial.fileType ?? "pdf",
    fileSize: initial.fileSize ?? 0,
  });

  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof DokumenFormData>(key: K, value: DokumenFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileSelect = (file: File) => {
    const mimeType = file.type;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const resolvedType =
      ALLOWED_MIME_TYPES[mimeType] ??
      (["pdf", "doc", "docx", "ppt", "pptx"].includes(ext) ? (ext as DokumenFormData["fileType"]) : null);

    if (!resolvedType) {
      alert(`Format file tidak didukung. Hanya PDF, Word (.doc/.docx), dan PowerPoint (.ppt/.pptx) yang diizinkan.`);
      return;
    }

    setFileUploading(true);
    setFileUploadProgress(0);

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storageRef = ref(storage, `documents/${safeName}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => setFileUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => {
        setFileUploading(false);
        alert("Gagal mengunggah file. Coba lagi.");
      },
      () => {
        getDownloadURL(task.snapshot.ref).then((url) => {
          setForm((prev) => ({
            ...prev,
            fileUrl: url,
            fileName: safeName,
            fileType: resolvedType,
            fileSize: file.size,
          }));
        }).finally(() => setFileUploading(false));
      }
    );
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fileUrl) {
      alert("Harap unggah file dokumen terlebih dahulu.");
      return;
    }
    await onSubmit(form);
  };

  const accessOptions: { value: DokumenAccess; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: "free", label: "Gratis", icon: <Globe className="w-4 h-4 text-emerald-500" />, desc: "Siapa saja bisa mengunduh" },
    { value: "login", label: "Login", icon: <LogIn className="w-4 h-4 text-blue-500" />, desc: "Harus masuk terlebih dahulu" },
    { value: "paid", label: "Berbayar", icon: <Lock className="w-4 h-4 text-amber-500" />, desc: "Harus membayar untuk mengunduh" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Informasi Dokumen</h2>

        <div>
          <label className={labelClass}>Judul *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Judul dokumen..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Kategori *</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputClass}
          >
            {DOKUMEN_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Deskripsi</label>
          <RichTextEditor
            value={form.description}
            onChange={(html) => set("description", html)}
            placeholder="Tulis deskripsi dokumen..."
            minRows={6}
          />
        </div>
      </section>

      {/* Access */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Hak Akses</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {accessOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("access", opt.value)}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-colors ${
                form.access === opt.value
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:border-[var(--primary)]/40"
              }`}
            >
              <div className="mt-0.5">{opt.icon}</div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{opt.label}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {form.access === "paid" && (
          <div>
            <label className={labelClass}>Harga (IDR) *</label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={form.price ?? ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="Contoh: 50000"
              className={inputClass}
            />
          </div>
        )}
      </section>

      {/* File Upload */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">File Dokumen</h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Format yang didukung: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx). Maksimal 50 MB.
        </p>

        {form.fileUrl ? (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30">
            <FileTypeIcon type={form.fileType} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">{form.fileName}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {form.fileType.toUpperCase()} · {formatFileSize(form.fileSize)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, fileUrl: "", fileName: "", fileSize: 0 }));
              }}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Hapus file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => !fileUploading && fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-colors"
          >
            {fileUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                <p className="text-sm text-[var(--muted-foreground)]">Mengunggah... {fileUploadProgress}%</p>
                <div className="w-full max-w-xs h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${fileUploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-[var(--muted-foreground)]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">Klik atau seret file ke sini</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    PDF, DOC, DOCX, PPT, PPTX · Maks. 50 MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = "";
          }}
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting || fileUploading}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
