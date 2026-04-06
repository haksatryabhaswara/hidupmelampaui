"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Save, Check, RotateCcw, Upload } from "lucide-react";

interface ProgramSection {
  id: string;
  label: string;
  color: string;
  heading: string;
  items: string[];
  linkHref: string;
  linkText: string;
  extras?: string[];
  imageUrl?: string;
}

interface ProgramData {
  heroHeading: string;
  heroSubheading: string;
  sections: ProgramSection[];
  journeyCards: { heading: string; text: string; imageUrl?: string }[];
  ecosystemHeading: string;
  ecosystemLinkText: string;
  ecosystemImageUrl?: string;
}

const defaultData: ProgramData = {
  heroHeading: "Bangun Manusianya.\nWariskan Nilainya.",
  heroSubheading: "Layanan Kami",
  sections: [
    {
      id: "pembentukan-individu",
      label: "Pembentukan Individu",
      color: "rose",
      heading: "Pembentukan Individu",
      items: [
        "Konseling & Coaching Individu",
        "Konseling (Reflektif & Integratif)",
        "Executive Mentoring",
        "Training Arsitek Kehidupan",
        "Perjalanan Kehidupan Manunggal",
      ],
      linkHref: "/program/arsitek-kehidupan",
      linkText: "Pelajari Program Individu",
      imageUrl: "",
    },
    {
      id: "pengembangan-organisasi",
      label: "Pengembangan Organisasi",
      color: "blue",
      heading: "Pengembangan Organisasi",
      items: [
        "Corporate Human Architecture Program",
        "Organisational Consulting",
      ],
      extras: [
        "Komunitas Hidup Melampaui",
        "Arsitek Kehidupan Academy (Online)",
        "Certification Program",
        "Research & Insight Lab (Saran Strategis)",
      ],
      linkHref: "/program/coaching-mentoring",
      linkText: "Pelajari Program Organisasi",
      imageUrl: "",
    },
  ],
  journeyCards: [
    { heading: "Membangun Stabilitas", text: "Menguatkan fondasi hidup yang tahan uji.", imageUrl: "" },
    { heading: "Menjadi Utuh", text: "Menyatu dengan tujuan, pengalaman, dan panggilan hidup demi warisan yang berarti lintas generasi.", imageUrl: "" },
    { heading: "Perjalanan Hidup", text: "Dari fase membangun hingga menyatu, kita berjalan bersama untuk hidup yang tidak hanya sukses, tapi juga berdampak dan bermakna.", imageUrl: "" },
  ],
  ecosystemHeading: "Ekosistem & Gerakan",
  ecosystemLinkText: "Bergabung dalam Movement",
  ecosystemImageUrl: "",
};

const FIRESTORE_DOC = "settings";
const FIRESTORE_ID = "program";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]";
const labelClass = "block text-xs font-semibold text-[var(--muted-foreground)] mb-1 uppercase tracking-wide";

function ImageFieldWithUpload({ label, value, onChange, storagePath }: {
  label: string; value: string; onChange: (v: string) => void; storagePath: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch {
      alert("Gagal mengupload gambar. Silakan coba lagi.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder="https://... (URL gambar)"
          disabled={uploading}
        />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
        >
          {uploading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Mengupload..." : "Upload"}
        </button>
      </div>
      {uploading && (
        <div className="flex items-center gap-2 text-xs text-[var(--primary)] animate-pulse">
          <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Sedang mengupload gambar ke server, mohon tunggu...
        </div>
      )}
      {value && !uploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="preview"
          className="w-full max-h-36 object-cover rounded-lg border border-[var(--border)]"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
    </div>
  );
}

export default function AdminProgramPage() {
  const [data, setData] = useState<ProgramData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, FIRESTORE_DOC, FIRESTORE_ID))
      .then((snap) => {
        if (snap.exists()) {
          setData({ ...defaultData, ...(snap.data() as ProgramData) });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, FIRESTORE_DOC, FIRESTORE_ID), data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Gagal menyimpan. Silakan coba lagi.");
    }
    setSaving(false);
  };

  const setSection = (idx: number, key: keyof ProgramSection, value: unknown) => {
    setData((prev) => {
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], [key]: value } as ProgramSection;
      return { ...prev, sections };
    });
  };

  const setSectionItem = (secIdx: number, itemIdx: number, value: string) => {
    setData((prev) => {
      const sections = [...prev.sections];
      const items = [...sections[secIdx].items];
      items[itemIdx] = value;
      sections[secIdx] = { ...sections[secIdx], items };
      return { ...prev, sections };
    });
  };

  const setSectionExtra = (secIdx: number, extraIdx: number, value: string) => {
    setData((prev) => {
      const sections = [...prev.sections];
      const extras = [...(sections[secIdx].extras ?? [])];
      extras[extraIdx] = value;
      sections[secIdx] = { ...sections[secIdx], extras };
      return { ...prev, sections };
    });
  };

  const setJourney = (idx: number, key: "heading" | "text" | "imageUrl", value: string) => {
    setData((prev) => {
      const journeyCards = [...prev.journeyCards];
      journeyCards[idx] = { ...journeyCards[idx], [key]: value };
      return { ...prev, journeyCards };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Halaman Program</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Perubahan langsung tampil di halaman /program</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { if (confirm("Reset ke data default?")) setData(defaultData); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}</>}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Bagian Hero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Label Kecil (atas heading)</label>
            <input type="text" value={data.heroSubheading} onChange={(e) => setData((p) => ({ ...p, heroSubheading: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Heading Utama</label>
            <textarea rows={2} value={data.heroHeading} onChange={(e) => setData((p) => ({ ...p, heroHeading: e.target.value }))} className={inputClass + " resize-none"} />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Gunakan baris baru untuk line break.</p>
          </div>
        </div>
      </section>

      {/* Program Sections */}
      {data.sections.map((section, secIdx) => (
        <section key={section.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-[var(--foreground)]">Seksi: {section.label}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Heading Seksi</label>
              <input type="text" value={section.heading} onChange={(e) => setSection(secIdx, "heading", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teks Link</label>
              <input type="text" value={section.linkText} onChange={(e) => setSection(secIdx, "linkText", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL Link</label>
              <input type="text" value={section.linkHref} onChange={(e) => setSection(secIdx, "linkHref", e.target.value)} className={inputClass} />
            </div>
          </div>

          <ImageFieldWithUpload
            label="Gambar Seksi"
            value={section.imageUrl ?? ""}
            onChange={(v) => setSection(secIdx, "imageUrl", v)}
            storagePath={`uploads/program/sections/${section.id}`}
          />

          <div>
            <label className={labelClass}>Daftar Layanan</label>
            <div className="space-y-2">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => setSectionItem(secIdx, itemIdx, e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setSection(secIdx, "items", section.items.filter((_, i) => i !== itemIdx))}
                    className="px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSection(secIdx, "items", [...section.items, ""])}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                + Tambah item
              </button>
            </div>
          </div>

          {section.extras && (
            <div>
              <label className={labelClass}>Ekstra / Grid Card</label>
              <div className="space-y-2">
                {section.extras.map((extra, extraIdx) => (
                  <div key={extraIdx} className="flex gap-2">
                    <input
                      type="text"
                      value={extra}
                      onChange={(e) => setSectionExtra(secIdx, extraIdx, e.target.value)}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setSection(secIdx, "extras", (section.extras ?? []).filter((_, i) => i !== extraIdx))}
                      className="px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSection(secIdx, "extras", [...(section.extras ?? []), ""])}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  + Tambah ekstra
                </button>
              </div>
            </div>
          )}
        </section>
      ))}

      {/* Ecosystem */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Seksi Ekosistem & Gerakan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Label Seksi</label>
            <input type="text" value={data.ecosystemHeading} onChange={(e) => setData((p) => ({ ...p, ecosystemHeading: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teks Link</label>
            <input type="text" value={data.ecosystemLinkText} onChange={(e) => setData((p) => ({ ...p, ecosystemLinkText: e.target.value }))} className={inputClass} />
          </div>
        </div>
        <ImageFieldWithUpload
          label="Gambar Ekosistem"
          value={data.ecosystemImageUrl ?? ""}
          onChange={(v) => setData((p) => ({ ...p, ecosystemImageUrl: v }))}
          storagePath="uploads/program/ecosystem"
        />
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Kartu Perjalanan (3 Kartu)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.journeyCards.map((card, idx) => (
            <div key={idx} className="space-y-2 p-3 border border-[var(--border)] rounded-lg">
              <p className="text-xs font-bold text-[var(--muted-foreground)]">Kartu {idx + 1}</p>
              <div>
                <label className={labelClass}>Heading</label>
                <input type="text" value={card.heading} onChange={(e) => setJourney(idx, "heading", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teks</label>
                <textarea rows={3} value={card.text} onChange={(e) => setJourney(idx, "text", e.target.value)} className={inputClass + " resize-none"} />
              </div>
              <ImageFieldWithUpload
                label="Gambar Kartu"
                value={card.imageUrl ?? ""}
                onChange={(v) => setJourney(idx, "imageUrl", v)}
                storagePath={`uploads/program/journey-${idx}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Semua Perubahan"}</>}
        </button>
      </div>
    </div>
  );
}
