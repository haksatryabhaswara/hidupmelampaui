"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
      items: ["Corporate Human Architecture Program", "Organisational Consulting"],
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
    {
      heading: "Menjadi Utuh",
      text: "Menyatu dengan tujuan, pengalaman, dan panggilan hidup demi warisan yang berarti lintas generasi.",
      imageUrl: "",
    },
    {
      heading: "Perjalanan Hidup",
      text: "Dari fase membangun hingga menyatu, kita berjalan bersama untuk hidup yang tidak hanya sukses, tapi juga berdampak dan bermakna.",
      imageUrl: "",
    },
  ],
  ecosystemHeading: "Ekosistem & Gerakan",
  ecosystemLinkText: "Bergabung dalam Movement",
  ecosystemImageUrl: "",
};

const sectionColors: Record<string, { dot: string; text: string; card: string }> = {
  rose: { dot: "bg-rose-400", text: "text-rose-500 uppercase text-xs font-extrabold tracking-[0.2em]", card: "text-rose-500" },
  blue: { dot: "bg-blue-400", text: "text-blue-500 uppercase text-xs font-extrabold tracking-[0.2em]", card: "text-blue-500" },
  emerald: { dot: "bg-emerald-400", text: "text-emerald-500 uppercase text-xs font-extrabold tracking-[0.2em]", card: "text-emerald-500" },
  amber: { dot: "bg-amber-400", text: "text-amber-500 uppercase text-xs font-extrabold tracking-[0.2em]", card: "text-amber-500" },
};

const journeyCardBg = [
  "from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/30",
  "from-violet-50 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/30",
  "from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/30",
];

export default function ProgramPage() {
  const [data, setData] = useState<ProgramData>(defaultData);

  useEffect(() => {
    getDoc(doc(db, "settings", "program"))
      .then((snap) => {
        if (snap.exists()) {
          setData({ ...defaultData, ...(snap.data() as ProgramData) });
        }
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">{data.heroSubheading}</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-2xl" style={{ whiteSpace: "pre-line" }}>
            {data.heroHeading}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-28">

        {/* ── Program Sections ─────────────────── */}
        {data.sections.map((section, idx) => {
          const colors = sectionColors[section.color] ?? sectionColors.blue;
          const isEven = idx % 2 === 0;
          return (
            <div key={section.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center`}>
              {!isEven && (
                section.imageUrl ? (
                  <div className="rounded-3xl overflow-hidden aspect-[4/3] hidden lg:block">
                    <img src={section.imageUrl} alt={section.heading} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950/40 dark:to-indigo-950/30 hidden lg:flex items-end p-6">
                    <p className="text-blue-600/50 dark:text-blue-300/30 text-xs italic leading-relaxed">
                      Corporate leaders collaborating in a modern open workspace.
                    </p>
                  </div>
                )
              )}
              <div className="space-y-8">
                <p className={colors.text}>{section.heading}</p>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item} className="flex items-center gap-4 group cursor-default">
                      <div className={`w-2 h-2 rounded-full ${colors.dot} group-hover:scale-125 transition-transform flex-shrink-0`} />
                      <span className={`text-[var(--foreground)] text-xl font-medium group-hover:${colors.card} transition-colors`}>{item}</span>
                    </div>
                  ))}
                </div>
                {section.extras && (
                  <div className="border-t border-[var(--border)] pt-6 grid grid-cols-2 gap-3">
                    {section.extras.map((extra) => (
                      <div key={extra} className="bg-[var(--muted)] rounded-xl p-4 text-sm text-[var(--muted-foreground)] leading-snug">{extra}</div>
                    ))}
                  </div>
                )}
                <Link
                  href={section.linkHref}
                  className={`inline-flex items-center gap-2 ${colors.card} font-semibold text-sm hover:gap-3 transition-all group`}
                >
                  {section.linkText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              {isEven && (
                section.imageUrl ? (
                  <div className="rounded-3xl overflow-hidden aspect-[4/3]">
                    <img src={section.imageUrl} alt={section.heading} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-950/40 dark:to-pink-950/30 flex items-end p-6">
                    <p className="text-rose-600/50 dark:text-rose-300/30 text-xs italic leading-relaxed">
                      Young professional thoughtfully planning with notebook and coffee in a cozy workspace.
                    </p>
                  </div>
                )
              )}
            </div>
          );
        })}

        {/* ── EKOSISTEM & GERAKAN ──────────────────── */}
        <div className="space-y-6">
          <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-emerald-500">
            {data.ecosystemHeading}
          </p>
          {data.ecosystemImageUrl ? (
            <div className="rounded-3xl overflow-hidden aspect-[21/8]">
              <img src={data.ecosystemImageUrl} alt={data.ecosystemHeading} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="rounded-3xl overflow-hidden aspect-[21/8] bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-950/30 flex items-end p-8">
              <p className="text-emerald-700/50 dark:text-emerald-300/30 text-xs italic max-w-md leading-relaxed">
                Group of diverse mentors and mentees engaging in a lively discussion outdoors.
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <Link
              href="/program/ekosistem"
              className="inline-flex items-center gap-2 text-emerald-500 font-semibold text-sm hover:gap-3 transition-all group"
            >
              {data.ecosystemLinkText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ── 4 Program Quick Links ────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Arsitek Kehidupan", href: "/program/arsitek-kehidupan", color: "from-rose-500 to-pink-600" },
            { label: "Corporate Human Architecture", href: "/program", color: "from-blue-600 to-indigo-700" },
            { label: "Coaching Mentoring", href: "/program/coaching-mentoring", color: "from-amber-500 to-orange-600" },
            { label: "Ecosystem", href: "/program/ekosistem", color: "from-emerald-600 to-teal-700" },
          ].map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className={`bg-gradient-to-br ${p.color} text-white rounded-2xl p-6 flex flex-col justify-between min-h-[130px] hover:-translate-y-1 hover:shadow-lg transition-all`}
            >
              <span className="font-bold text-sm leading-snug">{p.label}</span>
              <ArrowRight className="w-5 h-5 self-end opacity-60 mt-4" />
            </Link>
          ))}
        </div>

        {/* ── Journey Cards ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {data.journeyCards.map((card, idx) => (
            <div key={idx} className="space-y-5">
              {card.imageUrl ? (
                <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                  <img src={card.imageUrl} alt={card.heading} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`rounded-2xl aspect-[4/3] bg-gradient-to-br ${journeyCardBg[idx] ?? journeyCardBg[0]} flex items-end p-5`}>
                  <p className="text-amber-700/50 dark:text-amber-300/30 text-xs italic leading-relaxed opacity-50">Visual placeholder</p>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{card.heading}</h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

