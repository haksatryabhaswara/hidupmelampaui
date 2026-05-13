"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Dokumen } from "@/lib/dokumen-data";
import { DokumenForm } from "@/components/admin-dokumen-form";

type DokumenFormData = Omit<Dokumen, "id" | "createdAt" | "updatedAt">;

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
      <DokumenForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Simpan Dokumen" />
    </div>
  );
}
