"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Users, Heart, Target, Globe2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  founderTags: string[];
  founderBio: string[];
  founderStats: { number: string; label: string }[];
  values: { title: string; desc: string }[];
  impactHeading: string;
  impactStats: { number: string; label: string }[];
}

const defaultData: TentangData = {
  heroLabel: "Tentang Hidup Melampaui",
  heroHeading:
    "Membangun Manusia yang Stabil, Bertumbuh, dan Berdampak Lintas Generasi",
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
    { value: "✓", label: "Terpercaya" },
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
  founderTags: ["Leadership Coach", "Corporate Consultant", "Executive Mentor"],
  founderBio: [
    "Dr. Ir. Heru Kustriyadi Wibawa, MSc adalah seorang praktisi pengembangan manusia dengan pengalaman lebih dari dua dekade. Beliau memadukan pendekatan ilmiah, spiritual, dan praktis dalam mendampingi individu dan organisasi.",
    "Dengan latar belakang teknik dan manajemen strategis, Dr. Heru mengembangkan framework unik yang dikenal sebagai \u201cCorporate Human Architecture\u201d \u2014 sebuah pendekatan integratif untuk membangun stabilitas manusia di dalam organisasi.",
    "Visi beliau sederhana namun mendalam: membantu setiap individu menemukan versi terbaik dirinya dan hidup dengan penuh makna, sehingga dampaknya terasa lintas generasi.",
  ],
  founderStats: [
    { number: "150+", label: "Alumni Program" },
    { number: "20+", label: "Tahun Pengalaman" },
    { number: "50+", label: "Organisasi Klien" },
  ],
  values: [
    {
      title: "Integritas",
      desc: "Kami berkomitmen pada kejujuran dan kesesuaian antara nilai dan tindakan.",
    },
    {
      title: "Kasih",
      desc: "Setiap pendampingan dilakukan dengan kasih yang tulus dan perhatian yang mendalam.",
    },
    {
      title: "Komunitas",
      desc: "Kami percaya bahwa pertumbuhan terbaik terjadi dalam komunitas yang suportif.",
    },
    {
      title: "Dampak",
      desc: "Setiap program dirancang untuk menciptakan dampak nyata, bukan sekadar pengetahuan.",
    },
  ],
  impactHeading: "Dampak yang Telah Kami Ciptakan",
  impactStats: [
    { number: "150+", label: "Alumni Program Jangka Panjang" },
    { number: "100+", label: "Peserta Aktif Saat Ini" },
    { number: "50+", label: "Organisasi yang Dilayani" },
    { number: "2000+", label: "Jam Pendampingan" },
  ],
};

const VALUE_ICONS = [
  <Target key="target" className="w-6 h-6" />,
  <Heart key="heart" className="w-6 h-6" />,
  <Users key="users" className="w-6 h-6" />,
  <Globe2 key="globe" className="w-6 h-6" />,
];
const VALUE_COLORS = [
  "text-blue-500 bg-blue-50 dark:bg-blue-950/50",
  "text-rose-500 bg-rose-50 dark:bg-rose-950/50",
  "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
  "text-purple-500 bg-purple-50 dark:bg-purple-950/50",
];

export default function TentangPage() {
  const [data, setData] = useState<TentangData>(defaultData);

  useEffect(() => {
    getDoc(doc(db, "settings", "tentang"))
      .then((snap) => {
        if (snap.exists())
          setData({ ...defaultData, ...(snap.data() as TentangData) });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
              {data.heroLabel}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-0 leading-tight">
              {data.heroHeading}
            </h1>
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 text-[var(--foreground)]">
              {data.narrativeParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-[var(--muted-foreground)]"
                >
                  {p}
                </p>
              ))}
              {data.narrativeListItems.length > 0 && (
                <ul className="space-y-1 pl-4 text-[var(--muted-foreground)]">
                  {data.narrativeListItems.map((item, i) => (
                    <li key={i} className="list-disc text-base">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-8">
              {data.narrativeImageUrl ? (
                <img
                  src={data.narrativeImageUrl}
                  alt="Narasi Tentang"
                  className="w-full rounded-3xl aspect-[4/3] object-cover"
                />
              ) : (
                <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950/40 dark:to-indigo-950/30 flex items-end p-6">
                  <p className="text-blue-600/50 dark:text-blue-300/30 text-xs italic leading-relaxed">
                    A warm, inviting workspace with diverse professionals
                    collaborating and reflecting together.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                {data.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 text-center"
                  >
                    <p className="text-3xl font-bold text-[var(--primary)]">
                      {stat.value}
                    </p>
                    <p className="text-[var(--muted-foreground)] text-xs mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
              Visi
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {data.visi}
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mb-5">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
              Misi
            </h2>
            <ul className="space-y-3">
              {data.misi.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{" "}
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Founder */}
        <div>
          <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-2">
            Founder
          </p>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-10">
            Profil Pendiri
          </h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-10 flex flex-col items-center justify-center text-white text-center">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl font-bold mb-4">
                  {data.founderInitials}
                </div>
                <h3 className="font-bold text-xl">{data.founderName}</h3>
                <p className="text-blue-200 text-sm mt-2">{data.founderRole}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {data.founderTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 p-8 space-y-4">
                {data.founderBio.map((bio, i) => (
                  <p
                    key={i}
                    className="text-[var(--muted-foreground)] leading-relaxed"
                  >
                    {bio}
                  </p>
                ))}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {data.founderStats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-2xl font-bold text-[var(--primary)]">
                        {stat.number}
                      </p>
                      <p className="text-[var(--muted-foreground)] text-xs mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-2 text-center">
            Nilai Kami
          </p>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-10 text-center">
            Landasan yang Kami Pegang
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.values.map((val, i) => (
              <div
                key={i}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${VALUE_COLORS[i % VALUE_COLORS.length]}`}
                >
                  {VALUE_ICONS[i % VALUE_ICONS.length]}
                </div>
                <h3 className="font-bold text-[var(--foreground)] mb-2">
                  {val.title}
                </h3>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-8">{data.impactHeading}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.impactStats.map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold text-white mb-2">
                  {stat.number}
                </p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
