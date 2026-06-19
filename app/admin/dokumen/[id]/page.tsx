"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Dokumen } from "@/lib/dokumen-data";
import { DokumenForm } from "@/components/admin-dokumen-form";
import { AdminCopilot, CopilotStep } from "@/components/admin-copilot";
import { ADMIN_TUTORIALS } from "@/lib/links";

type DokumenFormData = Omit<Dokumen, "id" | "createdAt" | "updatedAt">;

const DOKUMEN_FORM_STEPS: CopilotStep[] = [
  { id: "info", title: "Informasi Dokumen", desc: "Ubah judul, kategori, atau deskripsi dokumen. Perubahan belum tersimpan hingga kamu klik tombol simpan." },
  { id: "akses", title: "Hak Akses", desc: "Ubah level akses dokumen. Jika pilih Berbayar, isi harga baru dalam rupiah." },
  { id: "file", title: "Ganti File", desc: "Klik ✕ untuk menghapus file saat ini lalu upload pengganti. Biarkan jika tidak perlu mengganti file." },
  { id: "submit", title: "Simpan Perubahan", desc: "Klik 'Simpan Perubahan' untuk memperbarui data dokumen di database." },
];

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
      <AdminCopilot
        pageTitle="Edit Dokumen"
        steps={DOKUMEN_FORM_STEPS}
        youtubeUrl={ADMIN_TUTORIALS["dokumen-form"]}
        storageKey="dokumen-edit"
      />
      <DokumenForm
        initial={initial}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
