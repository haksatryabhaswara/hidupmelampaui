"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Info,
  Users,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
  Shield,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/konten", label: "Konten", icon: BookOpen },
  { href: "/admin/program", label: "Program", icon: Layers },
  { href: "/admin/tentang", label: "Tentang", icon: Info },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/pesan", label: "Pesan Masuk", icon: MessageSquare },
];

interface SidebarProps {
  email: string | null;
  pathname: string;
  onClose: () => void;
}

function SidebarContent({ email, pathname, onClose }: SidebarProps) {
  const isActive = (link: (typeof sidebarLinks)[0]) => {
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Panel Admin</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate max-w-[140px]">{email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          ← Kembali ke Situs
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/masuk");
      else if (role && role !== "admin") router.replace("/");
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 bg-[var(--card)] border-r border-[var(--border)] flex-shrink-0">
        <SidebarContent email={user.email} pathname={pathname} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-56 bg-[var(--card)] border-r border-[var(--border)] z-50 flex flex-col">
            <SidebarContent email={user.email} pathname={pathname} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm text-[var(--foreground)]">Panel Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
