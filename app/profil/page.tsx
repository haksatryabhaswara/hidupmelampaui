"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  User,
  Shield,
  Save,
  Check,
  Settings,
  BookOpen,
  Calendar,
  ClipboardList,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";

interface ScriResult {
  totalScore: number;
  scoringLabel: string;
  completedAt: { toDate?: () => Date } | null;
}

export default function ProfilPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [joinedDate, setJoinedDate] = useState<string | null>(null);
  const [scri36Result, setScri36Result] = useState<
    ScriResult | null | "loading"
  >("loading");
  const [scri72Result, setScri72Result] = useState<
    ScriResult | null | "loading"
  >("loading");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/masuk");
      return;
    }
    if (!user) return;
    // Load profile data from Firestore
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      const nameFromAuth = user.displayName ?? "";
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName ?? nameFromAuth);
        if (data.createdAt) {
          setJoinedDate(
            new Date(data.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          );
        }
      } else {
        setDisplayName(nameFromAuth);
      }
    });

    // Fetch latest SCRI-36 result
    getDocs(
      query(
        collection(db, "scri_results"),
        where("userId", "==", user.uid),
        orderBy("completedAt", "desc"),
        limit(1),
      ),
    )
      .then((snap) => {
        if (!snap.empty) {
          setScri36Result(snap.docs[0].data() as ScriResult);
        } else {
          setScri36Result(null);
        }
      })
      .catch(() => setScri36Result(null));

    // Fetch latest SCRI-72 result
    getDocs(
      query(
        collection(db, "scri72_results"),
        where("userId", "==", user.uid),
        orderBy("completedAt", "desc"),
        limit(1),
      ),
    )
      .then((snap) => {
        if (!snap.empty) {
          setScri72Result(snap.docs[0].data() as ScriResult);
        } else {
          setScri72Result(null);
        }
      })
      .catch(() => setScri72Result(null));
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silently handle
    }
    setSaving(false);
  };

  const initials = (user.displayName ?? user.email ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">
              Profil Pengguna
            </p>
            <h1 className="text-3xl font-bold">
              {user.displayName ?? "Pengguna"}
            </h1>
            <p className="text-blue-200/80 text-sm mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Role & Status Badges */}
        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              role === "admin"
                ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {role === "admin" ? "Administrator" : "Pengguna Umum"}
          </span>
          {joinedDate && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
              <Calendar className="w-3.5 h-3.5" />
              Bergabung {joinedDate}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Profile Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Informasi Profil
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email ?? ""}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] text-sm cursor-not-allowed"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Email tidak dapat diubah.
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Tersimpan!
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Simpan Perubahan
                </>
              )}
            </button>
          </div>

          {/* Account Info & Admin Panel Card */}
          <div className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  Akses Konten
                </h2>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {role === "admin"
                  ? "Anda memiliki akses penuh sebagai administrator."
                  : "Konten gratis tersedia. Masuk untuk konten eksklusif dan beli untuk konten premium."}
              </p>
              <Link
                href="/konten"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Jelajahi Konten →
              </Link>
            </div>

            {role === "admin" && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300">
                    Panel Admin
                  </h2>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Anda memiliki hak akses administrator. Kelola konten,
                  pengguna, dan pengaturan situs.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
                >
                  <Settings className="w-4 h-4" /> Buka Panel Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
