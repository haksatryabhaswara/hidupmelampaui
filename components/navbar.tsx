"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, useIsClient } from "@/lib/theme";
import { Sun, Moon, Menu, X, BookOpen, User, LogOut, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/konten", label: "Konten" },
  { href: "/program", label: "Program" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout, role } = useAuth();
  const isClient = useIsClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[var(--background)]/95 backdrop-blur-md shadow-sm border-b border-[var(--border)]"
          : "bg-[var(--background)]/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              Hidup Melampaui
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[var(--primary)] bg-[var(--accent)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {isClient && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.[0] ?? user.email?.[0] ?? "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user.displayName ?? user.email}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50">
                    {role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-[var(--muted)] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" /> Panel Admin
                      </Link>
                    )}
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profil Saya
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-[var(--muted)] transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/masuk"
                  className="px-3 py-2 rounded-md text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/daftar"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)] px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[var(--primary)] bg-[var(--accent)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] mt-2 pt-2 flex flex-col gap-1">
              {user ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-[var(--muted)] transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/masuk"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/daftar"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity text-center"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
