"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function KontakPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await addDoc(collection(db, "contacts"), {
        ...form,
        source: "kontak",
        read: false,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setForm({ firstName: "", lastName: "", email: "", phone: "", topic: "", message: "" });
    } catch {
      setError("Gagal mengirim pesan. Silakan coba lagi atau hubungi kami via WhatsApp.");
    }
    setSubmitting(false);
  };

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

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                  <CheckCircle className="w-14 h-14 text-emerald-500" />
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Pesan Terkirim!</h3>
                  <p className="text-[var(--muted-foreground)] max-w-sm">
                    Terima kasih telah menghubungi kami. Tim kami akan membalas pesan Anda sesegera mungkin.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-5 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nama <span className="text-red-500">*</span></label>
                      <input name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Nama Anda" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nama Akhir</label>
                      <input name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Nama belakang" className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@anda.com" required className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Nomor WhatsApp</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+62 8xx xxxx xxxx" className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Topik</label>
                    <select name="topic" value={form.topic} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]">
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
                    <textarea name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Ceritakan kebutuhan atau pertanyaan Anda..." required className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] resize-none" />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button type="submit" disabled={submitting} className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengirim...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Kirim Pesan</>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
