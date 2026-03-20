"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Play, Lock, ShoppingCart, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { allContents } from "@/lib/content-data";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function renderBody(body: string) {
  return body.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-[var(--foreground)] mt-6 mb-3">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">{line.slice(4)}</h3>;
    if (line.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-[var(--primary)] pl-4 italic text-[var(--muted-foreground)] my-4">{line.slice(2)}</blockquote>;
    if (line.startsWith("---")) return <hr key={i} className="border-[var(--border)] my-6" />;
    if (line.startsWith("- ")) return <li key={i} className="text-[var(--muted-foreground)] ml-4">{line.slice(2)}</li>;
    if (/^\d+\. /.test(line)) return <li key={i} className="text-[var(--muted-foreground)] ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} className="text-[var(--muted-foreground)] leading-relaxed my-2">{line}</p>;
  });
}

export default function KontenDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, openAuthModal, loading } = useAuth();

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const content = allContents.find((c) => c.id === id);

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const paymentStatus = searchParams?.get("payment");

  useEffect(() => {
    if (!loading && !user && content && content.access !== "free") {
      openAuthModal(`/konten/${id}`);
    }
  }, [loading, user, content, id, openAuthModal]);

  if (!content) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-[var(--muted-foreground)] mx-auto" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Konten tidak ditemukan</h1>
          <Link href="/konten" className="text-[var(--primary)] hover:underline">← Kembali ke daftar konten</Link>
        </div>
      </div>
    );
  }

  const canAccess =
    content.access === "free" ||
    (content.access === "login" && !!user) ||
    (content.access === "paid" && !!user && paymentStatus === "success");

  const handlePurchase = async () => {
    if (!user?.email) { openAuthModal(`/konten/${id}`); return; }
    setPurchasing(true);
    setPurchaseError(null);
    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          contentTitle: content.title,
          price: content.price ?? 0,
          userId: user.uid,
          userEmail: user.email,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Gagal membuat invoice");
      }
      const data = (await res.json()) as { invoiceUrl: string };
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setPurchaseError((err as Error).message ?? "Terjadi kesalahan.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/konten" className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Konten
        </Link>

        {paymentStatus === "success" && (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-6 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" /> Pembayaran berhasil! Selamat menikmati konten ini.
          </div>
        )}
        {paymentStatus === "failed" && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-6 text-red-700 dark:text-red-300 text-sm">
            <Lock className="w-5 h-5 flex-shrink-0" /> Pembayaran gagal atau dibatalkan.
          </div>
        )}

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {content.type === "video" && (
            <div className="aspect-video bg-slate-900">
              {canAccess && content.youtubeId ? (
                <iframe src={`https://www.youtube.com/embed/${content.youtubeId}`} title={content.title} className="w-full h-full" allowFullScreen />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">{!user ? "Masuk untuk mengakses konten ini" : "Beli konten ini untuk menonton"}</p>
                </div>
              )}
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-block bg-[var(--accent)] text-[var(--primary)] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">{content.category}</span>
              {content.access === "login" && <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950/50 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full"><Lock className="w-3 h-3" /> Login Diperlukan</span>}
              {content.access === "paid" && <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/50 text-amber-600 text-xs font-semibold px-2 py-1 rounded-full"><Lock className="w-3 h-3" /> Berbayar</span>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">{content.title}</h1>
            <p className="text-[var(--muted-foreground)] mb-6">{content.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)] pb-6 border-b border-[var(--border)]">
              <span>Instruktur: <strong className="text-[var(--foreground)]">{content.instructor}</strong></span>
              <span>Durasi: <strong className="text-[var(--foreground)]">{content.duration}</strong></span>
              <span className="flex items-center gap-1">
                {content.type === "video" ? <Play className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {content.type === "video" ? "Video" : "Artikel"}
              </span>
            </div>

            {/* Gate: paid & logged in but not purchased */}
            {content.access === "paid" && user && paymentStatus !== "success" && (
              <div className="my-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center space-y-4">
                <ShoppingCart className="w-10 h-10 text-amber-500 mx-auto" />
                <h2 className="text-xl font-bold text-[var(--foreground)]">Konten Berbayar</h2>
                <p className="text-[var(--muted-foreground)] text-sm max-w-md mx-auto">Beli sekali, akses selamanya.</p>
                {content.price && <p className="text-3xl font-bold text-amber-600">{formatRupiah(content.price)}</p>}
                {purchaseError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{purchaseError}</p>}
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {purchasing ? "Memproses..." : "Beli Sekarang"}
                </button>
              </div>
            )}

            {/* Gate: login-only, not logged in */}
            {content.access === "login" && !user && !loading && (
              <div className="my-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center space-y-4">
                <Lock className="w-10 h-10 text-blue-500 mx-auto" />
                <h2 className="text-xl font-bold text-[var(--foreground)]">Login Diperlukan</h2>
                <p className="text-[var(--muted-foreground)] text-sm">Konten ini gratis — Anda hanya perlu login atau daftar.</p>
                <button
                  onClick={() => openAuthModal(`/konten/${id}`)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Masuk / Daftar Gratis
                </button>
              </div>
            )}

            {/* Content body when accessible */}
            {canAccess && content.body && (
              <div className="prose prose-sm max-w-none pt-6">
                {renderBody(content.body)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
