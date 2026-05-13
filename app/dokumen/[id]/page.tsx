"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Dokumen, formatFileSize, getFileTypeLabel } from "@/lib/dokumen-data";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  FileType,
  Presentation,
  Globe,
  LogIn,
  Lock,
  ExternalLink,
} from "lucide-react";

function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function FileTypeIcon({ type }: { type: string }) {
  if (type === "ppt" || type === "pptx")
    return (
      <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
        <Presentation className="w-7 h-7 text-orange-500" />
      </div>
    );
  if (type === "doc" || type === "docx")
    return (
      <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
        <FileType className="w-7 h-7 text-blue-500" />
      </div>
    );
  return (
    <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
      <FileText className="w-7 h-7 text-red-500" />
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function DokumenDetailPage({ params }: Props) {
  const { user, openAuthModal, loading: authLoading } = useAuth();
  const [dokumen, setDokumen] = useState<Dokumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      getDoc(doc(db, "documents", id))
        .then((snap) => {
          if (snap.exists()) {
            setDokumen({ ...(snap.data() as Dokumen), id: snap.id });
          } else {
            setNotFound(true);
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !dokumen) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <FileText className="w-12 h-12 text-[var(--muted-foreground)] opacity-30" />
        <p className="text-lg font-semibold text-[var(--foreground)]">Dokumen tidak ditemukan.</p>
        <Link
          href="/dokumen"
          className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke daftar dokumen
        </Link>
      </main>
    );
  }

  const canDownload =
    dokumen.access === "free" ||
    (dokumen.access === "login" && !!user) ||
    (dokumen.access === "paid" && !!user); // paid enforcement handled server-side or via payment flow

  const handleDownload = () => {
    if (dokumen.access === "login" && !user) {
      openAuthModal(`/dokumen/${dokumen.id}`);
      return;
    }
    if (dokumen.access === "paid" && !user) {
      openAuthModal(`/dokumen/${dokumen.id}`);
      return;
    }
    window.open(dokumen.fileUrl, "_blank", "noopener,noreferrer");
  };

  const accessInfo = () => {
    if (dokumen.access === "free")
      return {
        icon: <Globe className="w-4 h-4 text-emerald-500" />,
        label: "Gratis",
        desc: "Siapa saja bisa mengunduh dokumen ini.",
        color: "emerald",
      };
    if (dokumen.access === "login")
      return user
        ? null
        : {
            icon: <LogIn className="w-4 h-4 text-blue-500" />,
            label: "Login Diperlukan",
            desc: "Masuk ke akun Anda untuk mengunduh dokumen ini.",
            color: "blue",
          };
    return {
      icon: <Lock className="w-4 h-4 text-amber-500" />,
      label: "Berbayar",
      desc: dokumen.price
        ? `Harga: ${formatRupiah(dokumen.price)}`
        : "Pembelian diperlukan untuk mengunduh dokumen ini.",
      color: "amber",
    };
  };

  const info = accessInfo();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Back */}
        <Link
          href="/dokumen"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dokumen
        </Link>

        {/* Header Card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <FileTypeIcon type={dokumen.fileType} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--muted)] text-xs text-[var(--muted-foreground)] font-medium">
                  {dokumen.category}
                </span>
                <span className="font-mono text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">
                  {getFileTypeLabel(dokumen.fileType)}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatFileSize(dokumen.fileSize)}
                </span>
              </div>
              <h1 className="text-xl font-bold text-[var(--foreground)] leading-snug">
                {dokumen.title}
              </h1>
            </div>
          </div>

          {/* Access Banner */}
          {info && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              info.color === "emerald"
                ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20"
                : info.color === "blue"
                ? "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20"
                : "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20"
            }`}
          >
            <div className="mt-0.5">{info.icon}</div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{info.label}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{info.desc}</p>
            </div>
          </div>
          )}

          {/* Download / Action Button */}
          {canDownload ? (
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Unduh Dokumen
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </button>
          ) : dokumen.access === "login" ? (
            <button
              onClick={() => openAuthModal(`/dokumen/${dokumen.id}`)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              Masuk untuk Mengunduh
            </button>
          ) : (
            <div className="space-y-2">
              {!user ? (
                <button
                  onClick={() => openAuthModal(`/dokumen/${dokumen.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk untuk Melanjutkan
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-sm text-amber-700 dark:text-amber-400">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  Dokumen ini berbayar. Hubungi admin untuk akses.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {dokumen.description && dokumen.description.trim() !== "" && dokumen.description !== "<p></p>" && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-4">Deskripsi</h2>
            <div
              className="rte-view text-[var(--muted-foreground)] leading-relaxed text-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(dokumen.description) }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
