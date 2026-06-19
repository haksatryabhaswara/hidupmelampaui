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
  { id: "info", title: "Informasi Dasar", desc: "Isi judul (slug otomatis terisi), deskripsi, gambar cover, kategori, instruktur, dan durasi konten." },
  { id: "format", title: "Tipe & Format", desc: "Pilih tipe: Video atau Artikel. Pilih format: Tunggal (satu halaman), Berlangkah (beberapa modul), atau Renungan Harian (dibagi per hari dengan heading H1)." },
  { id: "akses", title: "Akses & Harga", desc: "Tentukan siapa yang bisa mengakses: Gratis, Wajib Login, atau Berbayar (isi harga jika berbayar)." },
  { id: "body", title: "Isi Konten", desc: "Tulis atau susun isi konten. Jika berlangkah: tambah langkah-langkah dan atur akses per langkah. Jika renungan: gunakan H1 untuk setiap hari." },
  { id: "tes", title: "Tes Konten", desc: "Opsional: aktifkan tes dan tambah pertanyaan esai atau pilihan ganda. Jawaban pengguna bisa diexport dari halaman Jawaban Tes." },
  { id: "submit", title: "Simpan Konten", desc: "Pastikan semua field wajib terisi sebelum klik simpan. Slug harus unik antar konten." },
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
