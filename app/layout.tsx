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
          <footer className="border-t border-[var(--border)] bg-[var(--card)] py-8 text-center text-sm text-[var(--muted-foreground)]">
            <p>© 2026 Hidup Melampaui. All rights reserved.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
