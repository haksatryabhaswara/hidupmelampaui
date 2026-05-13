/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hidup Melampaui — Bangun Hidup yang Stabil, Produktif & Berdampak",
  description:
    "Platform pengembangan diri dan edukasi untuk membangun manusia yang stabil, bertumbuh, dan berdampak lintas generasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                {/* Brand */}
                <div className="flex flex-col items-center md:items-start gap-2 max-w-xs">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/hidupmelampaui.firebasestorage.app/o/logo%2Flogo%20saja.jpg?alt=media&token=765576b5-20ee-43fd-af8e-6f4171f9e971"
                      alt="Hidup Melampaui"
                      width={32}
                      height={32}
                      className="rounded-lg object-cover w-8 h-8"
                    />
                    <span className="font-bold text-base text-[var(--foreground)]">Hidup Melampaui</span>
                  </div>
                  <p className="text-xs italic text-center md:text-left leading-relaxed">
                    &ldquo;Karena hidup tidak sekadar di jalani, tetapi dilampaui.&rdquo;
                  </p>
                  <p className="text-xs">Platform pengembangan diri untuk membangun manusia yang stabil, bertumbuh, dan berdampak.</p>
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-1 text-sm">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-[var(--foreground)] mb-1">Jelajahi</p>
                    <a href="/konten" className="hover:text-[var(--foreground)] transition-colors">Konten</a>
                    <a href="/dokumen" className="hover:text-[var(--foreground)] transition-colors">Dokumen</a>
                    <a href="/program" className="hover:text-[var(--foreground)] transition-colors">Program</a>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-[var(--foreground)] mb-1">SCRI</p>
                    <a href="/scri" className="hover:text-[var(--foreground)] transition-colors">SCRI-36</a>
                    <a href="/scri72" className="hover:text-[var(--foreground)] transition-colors">SCRI-72</a>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-[var(--foreground)] mb-1">Lainnya</p>
                    <a href="/tentang" className="hover:text-[var(--foreground)] transition-colors">Tentang</a>
                    <a href="/kontak" className="hover:text-[var(--foreground)] transition-colors">Kontak</a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-xs">
                &copy; 2026 Hidup Melampaui. All rights reserved.
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
