"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Dokumen } from "@/lib/dokumen-data";
import { DokumenForm } from "@/components/admin-dokumen-form";
import { AdminCopilot, CopilotStep } from "@/components/admin-copilot";
import { ADMIN_TUTORIALS } from "@/lib/links";

type DokumenFormData = Omit<Dokumen, "id" | "createdAt" | "updatedAt">;

const DOKUMEN_FORM_STEPS: CopilotStep[] = [
  { id: "info", title: "Informasi Dokumen", desc: "Isi judul, pilih kategori, dan tulis deskripsi. Judul dan kategori wajib diisi." },
  { id: "akses", title: "Hak Akses", desc: "Pilih siapa yang boleh mengunduh: Gratis (semua orang), Login (harus masuk akun), atau Berbayar (isi juga harga dalam rupiah)." },
  { id: "file", title: "Upload File", desc: "Seret atau klik area upload untuk mengunggah file. Format: PDF, Word, PowerPoint. Maks. 50 MB." },
  { id: "submit", title: "Simpan Dokumen", desc: "Pastikan semua field terisi dan file sudah terupload, lalu klik 'Simpan Dokumen'." },
];

export default function DokumenBaruPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: DokumenFormData) => {
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const now = Date.now();
      const payload = JSON.parse(JSON.stringify({ ...data, id, createdAt: now, updatedAt: now }));
      await setDoc(doc(db, "documents", id), payload);
      router.push("/admin/dokumen");
    } catch (err) {
      console.error("Gagal menyimpan dokumen:", err);
      alert("Gagal menyimpan dokumen. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Tambah Dokumen Baru</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Isi semua field yang diperlukan, unggah file, lalu simpan.
        </p>
      </div>
      <AdminCopilot
        pageTitle="Tambah Dokumen"
        steps={DOKUMEN_FORM_STEPS}
        youtubeUrl={ADMIN_TUTORIALS["dokumen-form"]}
        storageKey="dokumen-baru"
      />
      <DokumenForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Simpan Dokumen" />
    </div>
  );
}
