"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Content } from "@/lib/content-data";
import { ContentForm } from "@/components/admin-content-form";

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
      <ContentForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Simpan Konten" />
    </div>
  );
}
