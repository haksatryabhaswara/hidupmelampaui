"use client";

import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-sm font-medium uppercase tracking-wider mb-2">Hubungi Kami</p>
          <h1 className="text-4xl font-bold mb-3">Kami Siap Mendampingi Anda</h1>
          <p className="text-blue-200/80 max-w-xl">
            Miliki pertanyaan tentang program, layanan, atau sekadar ingin berdiskusi? Tim kami siap membantu.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Informasi Kontak</h2>
              <div className="space-y-4">
                {[
                  { icon: <Mail className="w-5 h-5" />, label: "Email", value: "info@hidupmelampaui.com", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50" },
                  { icon: <Phone className="w-5 h-5" />, label: "WhatsApp (URGENT)", value: "+62818144528", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50" },
                  { icon: <MapPin className="w-5 h-5" />, label: "Lokasi", value: "Indonesia", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50" },
                  { icon: <Clock className="w-5 h-5" />, label: "Jam Operasional", value: "Senin–Jumat, 08.00–17.00 WIB", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] font-medium">{item.label}</p>
                      <p className="text-[var(--foreground)] text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Butuh Bantuan Segera?</p>
                  <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                    Untuk keperluan darurat / urgent, hubungi kami langsung melalui WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/62818144528"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Buka WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Konseling Topics */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-bold text-[var(--foreground)] mb-3 text-sm">Layanan Konseling</h3>
              <div className="flex flex-wrap gap-2">
                {["Pra Pernikahan", "Pernikahan", "Keluarga", "Karier", "Tantangan Hidup"].map((topic) => (
                  <span key={topic} className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs px-3 py-1.5 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">Kirim Pesan</h2>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nama <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Nama Anda" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nama Akhir</label>
                    <input type="text" placeholder="Nama belakang" className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" suppressHydrationWarning />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="email@anda.com" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nomor WhatsApp</label>
                  <input type="tel" placeholder="+62 8xx xxxx xxxx" className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Topik</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" suppressHydrationWarning>
                    <option value="">Pilih topik</option>
                    <option>Program Individu</option>
                    <option>Program Corporate</option>
                    <option>Konseling</option>
                    <option>Informasi Umum</option>
                    <option>Kemitraan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Pesan <span className="text-red-500">*</span></label>
                  <textarea rows={5} placeholder="Ceritakan kebutuhan atau pertanyaan Anda..." required className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] resize-none" suppressHydrationWarning />
                </div>
                <button type="submit" className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2" suppressHydrationWarning>
                  <Mail className="w-4 h-4" /> Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
