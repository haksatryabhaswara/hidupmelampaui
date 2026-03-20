import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ProgramPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">Layanan Kami</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-2xl">
            Bangun Manusianya.<br />Wariskan Nilainya.
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-28">

        {/* ── PEMBENTUKAN INDIVIDU ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-8">
            <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-rose-500">
              Pembentukan Individu
            </p>
            <div className="space-y-4">
              {[
                "Konseling & Coaching Individu",
                "Konseling (Reflektif & Integratif)",
                "Executive Mentoring",
                "Training Arsitek Kehidupan",
                "Perjalanan Kehidupan Manunggal",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 group cursor-default">
                  <div className="w-2 h-2 rounded-full bg-rose-400 group-hover:scale-125 transition-transform flex-shrink-0" />
                  <span className="text-[var(--foreground)] text-xl font-medium group-hover:text-rose-500 transition-colors">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/program/arsitek-kehidupan"
              className="inline-flex items-center gap-2 text-rose-500 font-semibold text-sm hover:gap-3 transition-all group"
            >
              Pelajari Program Individu
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-950/40 dark:to-pink-950/30 flex items-end p-6">
            <p className="text-rose-600/50 dark:text-rose-300/30 text-xs italic leading-relaxed">
              Young professional thoughtfully planning with notebook and coffee in a cozy workspace.
            </p>
          </div>
        </div>

        {/* ── PENGEMBANGAN ORGANISASI ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950/40 dark:to-indigo-950/30 hidden lg:flex items-end p-6">
            <p className="text-blue-600/50 dark:text-blue-300/30 text-xs italic leading-relaxed">
              Corporate leaders collaborating in a modern open workspace.
            </p>
          </div>

          <div className="space-y-8">
            <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-blue-500">
              Pengembangan Organisasi
            </p>
            <div className="space-y-4">
              {[
                "Corporate Human Architecture Program",
                "Organisational Consulting",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 group cursor-default">
                  <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-125 transition-transform flex-shrink-0" />
                  <span className="text-[var(--foreground)] text-xl font-medium group-hover:text-blue-500 transition-colors">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border)] pt-6 grid grid-cols-2 gap-3">
              {[
                "Komunitas Hidup Melampaui",
                "Arsitek Kehidupan Academy (Online)",
                "Certification Program",
                "Research & Insight Lab (Saran Strategis)",
              ].map((item) => (
                <div key={item} className="bg-[var(--muted)] rounded-xl p-4 text-sm text-[var(--muted-foreground)] leading-snug">
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/program/coaching-mentoring"
              className="inline-flex items-center gap-2 text-blue-500 font-semibold text-sm hover:gap-3 transition-all group"
            >
              Pelajari Program Organisasi
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ── EKOSISTEM & GERAKAN ──────────────────── */}
        <div className="space-y-6">
          <p className="text-xs font-extrabold tracking-[0.2em] uppercase text-emerald-500">
            Ekosistem & Gerakan
          </p>
          <div className="rounded-3xl overflow-hidden aspect-[21/8] bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-950/30 flex items-end p-8">
            <p className="text-emerald-700/50 dark:text-emerald-300/30 text-xs italic max-w-md leading-relaxed">
              Group of diverse mentors and mentees engaging in a lively discussion outdoors.
            </p>
          </div>
          <div className="flex justify-end">
            <Link
              href="/program/ekosistem"
              className="inline-flex items-center gap-2 text-emerald-500 font-semibold text-sm hover:gap-3 transition-all group"
            >
              Bergabung dalam Movement
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
          <div className="space-y-5">
            <div className="rounded-2xl aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/30 flex items-end p-5">
              <p className="text-amber-700/50 dark:text-amber-300/30 text-xs italic leading-relaxed">
                A young professional focusing deeply while working with books and notes around.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Membangun Stabilitas</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">Menguatkan fondasi hidup yang tahan uji.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl aspect-[4/3] bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/30 flex items-end p-5">
              <p className="text-violet-700/50 dark:text-violet-300/30 text-xs italic leading-relaxed">
                An inspiring scene of a multi-generational family sharing stories and smiling together outdoors.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Menjadi Utuh</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Menyatu dengan tujuan, pengalaman, dan panggilan hidup demi warisan yang berarti lintas generasi.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl aspect-[4/3] bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/30 flex items-end p-5">
              <p className="text-emerald-700/50 dark:text-emerald-300/30 text-xs italic leading-relaxed">
                People walking together on a meaningful life journey.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Perjalanan Hidup</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Dari fase membangun hingga menyatu, kita berjalan bersama untuk hidup yang tidak hanya sukses, tapi juga berdampak dan bermakna.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

