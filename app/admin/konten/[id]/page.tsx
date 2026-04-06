"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Content } from "@/lib/content-data";
import { ContentForm } from "@/components/admin-content-form";

export default function KontenEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "contents", id)).then((snap) => {
      if (snap.exists()) {
        setContent(snap.data() as Content);
      } else {
        alert("Konten tidak ditemukan.");
        router.replace("/admin/konten");
      }
      setLoading(false);
    });
  }, [id, router]);

  const handleSubmit = async (data: Omit<Content, "id">) => {
    setSubmitting(true);
    try {
      const payload = JSON.parse(JSON.stringify({ ...data, id }));
      await setDoc(doc(db, "contents", id), payload);
      router.push("/admin/konten");
    } catch (err) {
      console.error("Gagal menyimpan konten:", err);
      alert("Gagal menyimpan konten. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Konten</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1 truncate max-w-lg">{content.title}</p>
      </div>
      <ContentForm
        initial={content}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
