"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Save, Check, RotateCcw, Plus, X, Upload } from "lucide-react";

interface TentangData {
  heroLabel: string;
  heroHeading: string;
  narrativeImageUrl: string;
  narrativeParagraphs: string[];
  narrativeListItems: string[];
  stats: { value: string; label: string }[];
  visi: string;
  misi: string[];
  founderName: string;
  founderRole: string;
  founderInitials: string;
  founderImageUrl: string;
  founderTags: string[];
  founderBio: string[];
  founderStats: { number: string; label: string }[];
  values: { title: string; desc: string }[];
  impactHeading: string;
  impactStats: { number: string; label: string }[];
}

const defaultData: TentangData = {
  heroLabel: "Tentang Hidup Melampaui",
  heroHeading: "Membangun Manusia yang Stabil, Bertumbuh, dan Berdampak Lintas Generasi",
  narrativeImageUrl: "",
  narrativeParagraphs: [
    "Di tengah dunia yang semakin cepat, manusia semakin mudah terpecah.",
    "Banyak yang cerdas. Banyak yang terampil. Tetapi sedikit yang stabil.",
    "Hidup Melampaui lahir dari kesadaran bahwa krisis terbesar zaman ini bukan krisis teknologi, bukan krisis ekonomi, melainkan krisis arsitektur manusia.",
    "Kita tidak kekurangan informasi. Kita kekurangan pembentukan.",
  ],
  narrativeListItems: [
    "Terpecah oleh distraksi.",
    "Terpecah oleh ambisi.",
    "Terpecah oleh tekanan.",
    "Terpecah oleh ekspektasi sosial.",
  ],
  stats: [
    { value: "150+", label: "Alumni Program" },
    { value: "15+", label: "Tahun Pengalaman" },
    { value: "âœ“", label: "Terpercaya" },
  ],
  visi: "Menjadi ekosistem pengembangan manusia terdepan di Indonesia yang menghasilkan individu dan organisasi yang stabil, bertumbuh, dan berdampak lintas generasi.",
  misi: [
    "Mendampingi individu membangun fondasi emosi, spiritual, dan kepemimpinan",
    "Memberdayakan organisasi melalui pendekatan human architecture yang integratif",
    "Membangun komunitas yang saling mendukung dan tumbuh bersama",
    "Menciptakan konten edukatif yang dapat diakses seluas-luasnya",
  ],
  founderName: "Dr. Ir. Heru Kustriyadi Wibawa, MSc",
  founderRole: "Founder & Lead Mentor",
  founderInitials: "HK",
  founderImageUrl: "",
  founderTags: ["Leadership Coach", "Corporate Consultant", "Executive Mentor"],
  founderBio: [
    "Dr. Ir. Heru Kustriyadi Wibawa, MSc adalah seorang praktisi pengembangan manusia dengan pengalaman lebih dari dua dekade. Beliau memadukan pendekatan ilmiah, spiritual, dan praktis dalam mendampingi individu dan organisasi.",
    "Dengan latar belakang teknik dan manajemen strategis, Dr. Heru mengembangkan framework unik yang dikenal sebagai \"Corporate Human Architecture\" â€” sebuah pendekatan integratif untuk membangun stabilitas manusia di dalam organisasi.",
    "Visi beliau sederhana namun mendalam: membantu setiap individu menemukan versi terbaik dirinya dan hidup dengan penuh makna, sehingga dampaknya terasa lintas generasi.",
  ],
  founderStats: [
    { number: "150+", label: "Alumni Program" },
    { number: "20+", label: "Tahun Pengalaman" },
    { number: "50+", label: "Organisasi Klien" },
  ],
  values: [
    { title: "Integritas", desc: "Kami berkomitmen pada kejujuran dan kesesuaian antara nilai dan tindakan." },
    { title: "Kasih", desc: "Setiap pendampingan dilakukan dengan kasih yang tulus dan perhatian yang mendalam." },
    { title: "Komunitas", desc: "Kami percaya bahwa pertumbuhan terbaik terjadi dalam komunitas yang suportif." },
    { title: "Dampak", desc: "Setiap program dirancang untuk menciptakan dampak nyata, bukan sekadar pengetahuan." },
  ],
  impactHeading: "Dampak yang Telah Kami Ciptakan",
  impactStats: [
    { number: "150+", label: "Alumni Program Jangka Panjang" },
    { number: "100+", label: "Peserta Aktif Saat Ini" },
    { number: "50+", label: "Organisasi yang Dilayani" },
    { number: "2000+", label: "Jam Pendampingan" },
  ],
};

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

export default function AdminTentangPage() {
  const [data, setData] = useState<TentangData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "tentang"))
      .then((snap) => {
        if (snap.exists()) {
          setData({ ...defaultData, ...(snap.data() as TentangData) });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "tentang"), data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Gagal menyimpan. Silakan coba lagi.");
    }
    setSaving(false);
  };

  const set = <K extends keyof TentangData>(key: K, value: TentangData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Halaman Tentang</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Perubahan langsung tampil di halaman /tentang</p>
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

      {/* 1. Hero */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Bagian Hero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Label Kecil</label>
            <input type="text" value={data.heroLabel} onChange={(e) => set("heroLabel", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Heading Hero</label>
            <textarea rows={2} value={data.heroHeading} onChange={(e) => set("heroHeading", e.target.value)} className={inputClass + " resize-none"} />
          </div>
        </div>
      </section>

      {/* 2. Narasi */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Narasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Paragraf Utama</label>
              <div className="space-y-2">
                {data.narrativeParagraphs.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea rows={2} value={p} onChange={(e) => { const arr = [...data.narrativeParagraphs]; arr[i] = e.target.value; set("narrativeParagraphs", arr); }} className={inputClass + " resize-none"} />
                    <button type="button" onClick={() => set("narrativeParagraphs", data.narrativeParagraphs.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 rounded-lg shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => set("narrativeParagraphs", [...data.narrativeParagraphs, ""])} className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah paragraf</button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Item Daftar (Bullet)</label>
              <div className="space-y-2">
                {data.narrativeListItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={item} onChange={(e) => { const arr = [...data.narrativeListItems]; arr[i] = e.target.value; set("narrativeListItems", arr); }} className={inputClass} />
                    <button type="button" onClick={() => set("narrativeListItems", data.narrativeListItems.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 rounded-lg shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => set("narrativeListItems", [...data.narrativeListItems, ""])} className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah item</button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <ImageFieldWithUpload label="Gambar Narasi" value={data.narrativeImageUrl} onChange={(v) => set("narrativeImageUrl", v)} storagePath="uploads/tentang/narrative" />
            <div>
              <label className={labelClass}>Statistik Kecil (3 Kartu)</label>
              <div className="space-y-2">
                {data.stats.map((stat, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={stat.value} onChange={(e) => { const arr = [...data.stats]; arr[i] = { ...arr[i], value: e.target.value }; set("stats", arr); }} className={inputClass} placeholder="150+" />
                    <input type="text" value={stat.label} onChange={(e) => { const arr = [...data.stats]; arr[i] = { ...arr[i], label: e.target.value }; set("stats", arr); }} className={inputClass} placeholder="Alumni Program" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Visi & Misi */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Visi & Misi</h2>
        <div>
          <label className={labelClass}>Visi</label>
          <textarea rows={3} value={data.visi} onChange={(e) => set("visi", e.target.value)} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className={labelClass}>Misi (tiap item)</label>
          <div className="space-y-2">
            {data.misi.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={item} onChange={(e) => { const arr = [...data.misi]; arr[i] = e.target.value; set("misi", arr); }} className={inputClass} />
                <button type="button" onClick={() => set("misi", data.misi.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 rounded-lg shrink-0"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => set("misi", [...data.misi, ""])} className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah item misi</button>
          </div>
        </div>
      </section>

      {/* 4. Profil Pendiri */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Profil Pendiri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Nama Lengkap</label>
            <input type="text" value={data.founderName} onChange={(e) => set("founderName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Jabatan / Peran</label>
            <input type="text" value={data.founderRole} onChange={(e) => set("founderRole", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Inisial (Avatar)</label>
            <input type="text" value={data.founderInitials} onChange={(e) => set("founderInitials", e.target.value)} className={inputClass} maxLength={3} />
          </div>
          <div className="md:col-span-3">
            <ImageFieldWithUpload label="Foto Avatar (opsional, menggantikan inisial)" value={data.founderImageUrl} onChange={(v) => set("founderImageUrl", v)} storagePath="uploads/tentang/founder-avatar" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Tag / Badge</label>
          <div className="flex flex-wrap gap-2">
            {data.founderTags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1 bg-[var(--muted)] rounded-lg px-2 py-1">
                <input type="text" value={tag} onChange={(e) => { const arr = [...data.founderTags]; arr[i] = e.target.value; set("founderTags", arr); }} className="bg-transparent text-xs text-[var(--foreground)] w-32 focus:outline-none" />
                <button type="button" onClick={() => set("founderTags", data.founderTags.filter((_, j) => j !== i))} className="text-[var(--muted-foreground)] hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <button type="button" onClick={() => set("founderTags", [...data.founderTags, ""])} className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 px-2 py-1"><Plus className="w-3 h-3" /> Tambah</button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Bio (Tiap Paragraf)</label>
          <div className="space-y-2">
            {data.founderBio.map((bio, i) => (
              <div key={i} className="flex gap-2">
                <textarea rows={2} value={bio} onChange={(e) => { const arr = [...data.founderBio]; arr[i] = e.target.value; set("founderBio", arr); }} className={inputClass + " resize-none"} />
                <button type="button" onClick={() => set("founderBio", data.founderBio.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 rounded-lg shrink-0"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => set("founderBio", [...data.founderBio, ""])} className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah paragraf</button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Statistik Pendiri</label>
          <div className="grid grid-cols-3 gap-3">
            {data.founderStats.map((stat, i) => (
              <div key={i} className="space-y-1 p-3 border border-[var(--border)] rounded-lg">
                <p className="text-xs text-[var(--muted-foreground)] font-bold">Stat {i + 1}</p>
                <input type="text" value={stat.number} onChange={(e) => { const arr = [...data.founderStats]; arr[i] = { ...arr[i], number: e.target.value }; set("founderStats", arr); }} className={inputClass} placeholder="150+" />
                <input type="text" value={stat.label} onChange={(e) => { const arr = [...data.founderStats]; arr[i] = { ...arr[i], label: e.target.value }; set("founderStats", arr); }} className={inputClass} placeholder="Alumni Program" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Nilai-Nilai */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Nilai-Nilai ({data.values.length} Nilai)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.values.map((val, i) => (
            <div key={i} className="p-3 border border-[var(--border)] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--muted-foreground)]">Nilai {i + 1}</p>
                <button type="button" onClick={() => set("values", data.values.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1 rounded"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div>
                <label className={labelClass}>Judul</label>
                <input type="text" value={val.title} onChange={(e) => { const arr = [...data.values]; arr[i] = { ...arr[i], title: e.target.value }; set("values", arr); }} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Deskripsi</label>
                <textarea rows={2} value={val.desc} onChange={(e) => { const arr = [...data.values]; arr[i] = { ...arr[i], desc: e.target.value }; set("values", arr); }} className={inputClass + " resize-none"} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("values", [...data.values, { title: "", desc: "" }])} className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah nilai</button>
      </section>

      {/* 6. Statistik Dampak */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-[var(--foreground)]">Statistik Dampak</h2>
        <div>
          <label className={labelClass}>Heading Seksi</label>
          <input type="text" value={data.impactHeading} onChange={(e) => set("impactHeading", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.impactStats.map((stat, i) => (
            <div key={i} className="p-3 border border-[var(--border)] rounded-lg space-y-2">
              <p className="text-xs font-bold text-[var(--muted-foreground)]">Stat {i + 1}</p>
              <input type="text" value={stat.number} onChange={(e) => { const arr = [...data.impactStats]; arr[i] = { ...arr[i], number: e.target.value }; set("impactStats", arr); }} className={inputClass} placeholder="150+" />
              <input type="text" value={stat.label} onChange={(e) => { const arr = [...data.impactStats]; arr[i] = { ...arr[i], label: e.target.value }; set("impactStats", arr); }} className={inputClass} placeholder="Alumni Program" />
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Save */}
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
