"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Content } from "@/lib/content-data";
import { ContentForm } from "@/components/admin-content-form";
import { AdminCopilot, CopilotStep } from "@/components/admin-copilot";
import { ADMIN_TUTORIALS } from "@/lib/links";

const KONTEN_FORM_STEPS: CopilotStep[] = [
  { id: "info", title: "Informasi Dasar", desc: "Isi judul (slug otomatis terisi dari judul), deskripsi singkat, gambar cover (drag & drop atau klik area), kategori, instruktur, dan estimasi durasi konten." },
  { id: "format", title: "Tipe & Format", desc: "Tipe — Video: butuh YouTube Video ID (bukan URL penuh, ambil dari akhir URL setelah ?v= atau youtu.be/). Artikel: editor rich text. Format — Tunggal: 1 halaman. Berlangkah: beberapa modul berurutan, akses bisa beda tiap modul. Renungan Harian: pisahkan hari dengan heading H1." },
  { id: "akses", title: "Akses & Harga", desc: "Gratis: siapa saja bisa akses tanpa login. Wajib Login: gratis tapi perlu akun (data pengguna tercatat). Berbayar: isi nominal IDR — pengguna harus membeli sebelum bisa melihat konten." },
  { id: "body", title: "Isi Konten", desc: "Tunggal/Artikel: tulis langsung di editor. Berlangkah: tambah tiap modul, atur tipe & akses per modul. Renungan Harian: gunakan heading H1 sebagai pemisah hari — sistem otomatis menghitung dan memisahkan per hari." },
  { id: "tes", title: "Tes Konten", desc: "Opsional — aktifkan toggle lalu tambah pertanyaan. Esai: jawaban teks bebas dari pengguna. Pilihan Ganda: opsi a–e, admin bisa lihat jawaban dari halaman Jawaban Tes dan mengekspornya." },
  { id: "submit", title: "Simpan Konten", desc: "Pastikan judul, slug (harus unik antar konten), deskripsi, dan semua field wajib (*) sudah terisi. Klik 'Simpan Konten' — konten langsung aktif dan bisa diakses pengguna sesuai pengaturan akses." },
];

export default function KontenBaruPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Content, "id">) => {
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const payload = JSON.parse(JSON.stringify({ ...data, id }));
      await setDoc(doc(db, "contents", id), payload);
      router.push("/admin/konten");
    } catch (err) {
      console.error("Gagal menyimpan konten:", err);
      alert("Gagal menyimpan konten. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Tambah Konten Baru</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Isi semua field yang diperlukan lalu simpan.</p>
      </div>
      <AdminCopilot
        pageTitle="Tambah Konten"
        steps={KONTEN_FORM_STEPS}
        youtubeUrl={ADMIN_TUTORIALS["konten-form"]}
        storageKey="konten-baru"
      />
      <ContentForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Simpan Konten" />
    </div>
  );
}
