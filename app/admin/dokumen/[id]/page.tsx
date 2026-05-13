"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Dokumen } from "@/lib/dokumen-data";
import { DokumenForm } from "@/components/admin-dokumen-form";

type DokumenFormData = Omit<Dokumen, "id" | "createdAt" | "updatedAt">;

interface Props {
  params: Promise<{ id: string }>;
}

export default function DokumenEditPage({ params }: Props) {
  const router = useRouter();
  const [dokumen, setDokumen] = useState<Dokumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      getDoc(doc(db, "documents", resolvedId))
        .then((snap) => {
          if (snap.exists()) {
            setDokumen({ ...(snap.data() as Dokumen), id: snap.id });
          } else {
            alert("Dokumen tidak ditemukan.");
            router.replace("/admin/dokumen");
          }
        })
        .catch(() => {
          alert("Gagal memuat dokumen.");
          router.replace("/admin/dokumen");
        })
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  const handleSubmit = async (data: DokumenFormData) => {
    setSubmitting(true);
    try {
      const payload = JSON.parse(JSON.stringify({ ...data, updatedAt: Date.now() }));
      await updateDoc(doc(db, "documents", id), payload);
      router.push("/admin/dokumen");
    } catch (err) {
      console.error("Gagal memperbarui dokumen:", err);
      alert("Gagal memperbarui dokumen. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dokumen) return null;

  const initial: Partial<DokumenFormData> = {
    title: dokumen.title,
    description: dokumen.description,
    category: dokumen.category,
    access: dokumen.access,
    price: dokumen.price,
    fileUrl: dokumen.fileUrl,
    fileName: dokumen.fileName,
    fileType: dokumen.fileType,
    fileSize: dokumen.fileSize,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Dokumen</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">{dokumen.title}</p>
      </div>
      <DokumenForm
        initial={initial}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
