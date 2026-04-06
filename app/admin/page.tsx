"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { BookOpen, Users, MessageSquare, Layers, Info, ArrowRight } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  href: string;
  icon: React.ElementType;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ konten: string | number; pengguna: string | number; pesan: string | number }>({
    konten: "—",
    pengguna: "—",
    pesan: "—",
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [kontenSnap, penggunaSnap, pesanSnap] = await Promise.all([
          getCountFromServer(collection(db, "contents")),
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "contacts")),
        ]);
        setStats({
          konten: kontenSnap.data().count,
          pengguna: penggunaSnap.data().count,
          pesan: pesanSnap.data().count,
        });
      } catch {
        // Firestore unavailable
      }
    }
    loadStats();
  }, []);

  const cards: StatCard[] = [
    {
      label: "Total Konten",
      value: stats.konten,
      href: "/admin/konten",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Pengguna Terdaftar",
      value: stats.pengguna,
      href: "/admin/pengguna",
      icon: Users,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Pesan Masuk",
      value: stats.pesan,
      href: "/admin/pesan",
      icon: MessageSquare,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  const quickActions = [
    { label: "Kelola Konten", href: "/admin/konten", icon: BookOpen, desc: "Tambah, edit, hapus artikel & video" },
    { label: "Edit Program", href: "/admin/program", icon: Layers, desc: "Perbarui halaman layanan & program" },
    { label: "Edit Tentang", href: "/admin/tentang", icon: Info, desc: "Perbarui halaman tentang kami" },
    { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users, desc: "Atur peran dan akses pengguna" },
    { label: "Pesan Kontak", href: "/admin/pesan", icon: MessageSquare, desc: "Lihat pesan dari form kontak" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Selamat datang di panel administrasi Hidup Melampaui.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
                  <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-[var(--primary)]" />
                  <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{action.label}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
