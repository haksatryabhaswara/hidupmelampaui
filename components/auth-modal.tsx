"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, User, Eye, EyeOff, Chrome } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Tab = "login" | "register" | "reset";

export function AuthModal() {
  const { authModalOpen, authModalRedirect, closeAuthModal, loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/changes tab
  useEffect(() => {
    if (authModalOpen) {
      setTab("login");
      setError(null);
      setInfo(null);
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [authModalOpen]);

  useEffect(() => {
    setError(null);
    setInfo(null);
  }, [tab]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    if (authModalOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleSuccess = () => {
    closeAuthModal();
    if (authModalRedirect) {
      router.push(authModalRedirect);
    } else {
      router.push("/");
    }
  };

  const friendlyError = (err: unknown): string => {
    const code = (err as { code?: string })?.code ?? "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found")
      return "Email atau kata sandi salah.";
    if (code === "auth/email-already-in-use") return "Email sudah terdaftar.";
    if (code === "auth/weak-password") return "Kata sandi terlalu lemah (minimal 6 karakter).";
    if (code === "auth/invalid-email") return "Format email tidak valid.";
    if (code === "auth/popup-closed-by-user") return "Login dibatalkan.";
    if (code === "auth/too-many-requests") return "Terlalu banyak percobaan. Coba lagi nanti.";
    return (err as { message?: string })?.message ?? "Terjadi kesalahan. Coba lagi.";
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (tab === "login") {
        await loginWithEmail(email, password);
        handleSuccess();
      } else if (tab === "register") {
        await registerWithEmail(email, password, name || undefined);
        handleSuccess();
      } else {
        await resetPassword(email);
        setInfo("Link reset kata sandi telah dikirim ke email Anda.");
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      handleSuccess();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === overlayRef.current) closeAuthModal(); }}
    >
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {tab === "login" ? "Masuk" : tab === "register" ? "Daftar" : "Lupa Kata Sandi"}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              {tab === "login" ? "Selamat datang kembali" : tab === "register" ? "Bergabunglah dengan Hidup Melampaui" : "Kami kirim link reset ke email Anda"}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (only login / register) */}
        {tab !== "reset" && (
          <div className="flex gap-1 px-6 mt-5">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  tab === t
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {t === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="px-6 py-5 space-y-4">
          {tab === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)]">Nama</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground)]">Email <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alamat@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {tab !== "reset" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--foreground)]">Kata Sandi <span className="text-red-500">*</span></label>
                {tab === "login" && (
                  <button
                    type="button"
                    onClick={() => setTab("reset")}
                    className="text-xs text-[var(--primary)] hover:underline"
                  >
                    Lupa kata sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>}
          {info && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Memproses..."
              : tab === "login"
              ? "Masuk"
              : tab === "register"
              ? "Buat Akun"
              : "Kirim Link Reset"}
          </button>

          {tab === "reset" && (
            <button
              type="button"
              onClick={() => setTab("login")}
              className="w-full text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              ← Kembali ke halaman masuk
            </button>
          )}
        </form>

        {/* Divider + Google — only for login/register */}
        {tab !== "reset" && (
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted-foreground)]">atau</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--muted)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <Chrome className="w-4 h-4 text-blue-500" />
              Lanjutkan dengan Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
