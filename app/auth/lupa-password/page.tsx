"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LupaPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError("Email tidak ditemukan. Pastikan email sudah terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Reset Password</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Masukkan email untuk menerima tautan reset</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Email Terkirim!</h2>
              <p className="text-[var(--muted-foreground)] text-sm">
                Tautan reset password telah dikirim ke <strong className="text-[var(--foreground)]">{email}</strong>. Silakan cek inbox Anda.
              </p>
              <Link href="/auth/masuk" className="inline-block text-[var(--primary)] font-medium hover:underline text-sm">
                ← Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 mb-5 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email Terdaftar</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@anda.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Mengirim..." : "Kirim Tautan Reset"}
                </button>
              </form>
              <p className="text-center text-sm text-[var(--muted-foreground)] mt-4">
                <Link href="/auth/masuk" className="text-[var(--primary)] hover:underline">← Kembali ke halaman masuk</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
