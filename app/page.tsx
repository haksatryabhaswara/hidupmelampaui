"use client";

import Link from "next/link";
import {
  Star,
  Users,
  Award,
  BookOpen,
  Video,
  Lock,
  Play,
  ArrowRight,
  CheckCircle,
  Building2,
  Heart,
  Lightbulb,
  Target,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Globe,
} from "lucide-react";

// ─── Dummy Content Data ─────────────────────────────────────────────────────────
const dummyContents = [
  {
    id: "1",
    title: "Fondasi Stabilitas Emosi: Membangun Ketenangan di Tengah Tekanan",
    description: "Pelajari teknik-teknik praktis untuk mengelola emosi dan membangun ketahanan mental dalam kehidupan sehari-hari.",
    type: "video",
    youtubeId: "inpok4MKVLM",
    duration: "45 menit",
    category: "Pengembangan Diri",
    isPremium: false,
    instructor: "Dr. Heru K. Wibawa",
    rating: 4.9,
    students: 1240,
  },
  {
    id: "2",
    title: "Kepemimpinan Mikro: Memimpin Diri Sebelum Memimpin Tim",
    description: "Framework kepemimpinan berbasis nilai yang membantu Anda menjadi pemimpin yang matang secara emosional dan spiritual.",
    type: "video",
    youtubeId: "TQMbvJNRpLE",
    duration: "1 jam 20 menit",
    category: "Kepemimpinan",
    isPremium: true,
    instructor: "Dr. Heru K. Wibawa",
    rating: 4.8,
    students: 890,
  },
  {
    id: "3",
    title: "Integrasi Spiritual dalam Kehidupan Profesional",
    description: "Bagaimana nilai-nilai spiritual menjadi kompas dalam pengambilan keputusan dan membangun karier yang bermakna.",
    type: "article",
    youtubeId: null,
    duration: "15 menit baca",
    category: "Spiritual",
    isPremium: false,
    instructor: "Dr. Heru K. Wibawa",
    rating: 4.7,
    students: 2100,
  },
  {
    id: "4",
    title: "Gen Z & Stabilitas di Era VUCA: Panduan Bertahan dan Bertumbuh",
    description: "Strategi spesifik bagi generasi Z untuk membangun fondasi hidup yang kokoh di tengah ketidakpastian global.",
    type: "video",
    youtubeId: "V42t0qVbCGI",
    duration: "55 menit",
    category: "Gen Z",
    isPremium: true,
    instructor: "Dr. Heru K. Wibawa",
    rating: 4.9,
    students: 1560,
  },
  {
    id: "5",
    title: "Arsitektur Kehidupan: Merancang Hidup yang Bermakna",
    description: "Panduan komprehensif untuk merancang blue print kehidupan yang stabil, produktif, dan berdampak bagi orang sekitar.",
    type: "article",
    youtubeId: null,
    duration: "20 menit baca",
    category: "Pengembangan Diri",
    isPremium: false,
    instructor: "Dr. Heru K. Wibawa",
    rating: 4.6,
    students: 3200,
  },
  {
    id: "6",
    title: "Corporate Human Architecture: Membangun Tim yang Stabil",
    description: "Pendekatan strategis untuk membangun stabilitas manusia di dalam organisasi — dari onboarding hingga leadership pipeline.",
    type: "video",
    youtubeId: "qYNweeDHiyU",
    duration: "1 jam 40 menit",
    category: "Korporat",
    isPremium: true,
    instructor: "Dr. Heru K. Wibawa",
    rating: 4.9,
    students: 640,
  },
];

// ─── Subcomponents ──────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Platform Pengembangan Diri #1 Indonesia
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Bangun Hidup yang{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Stabil, Produktif,
              </span>{" "}
              &amp; Berdampak
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed max-w-lg">
              Dengan Langkah Terstruktur — Membangun Manusia yang Stabil, Bertumbuh,
              dan Berdampak Lintas Generasi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/program"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
              >
                Mulai Perjalanan <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/konten"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium px-6 py-3 rounded-lg transition-all hover:bg-white/10"
              >
                Jelajahi Konten Gratis
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["R", "A", "D", "S"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-xs font-bold border-2 border-blue-900">
                      {l}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-blue-200">100+ Peserta Aktif</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-blue-200 ml-1">4.9/5 Rating</span>
              </div>
            </div>
          </div>
          <div className="lg:flex justify-end hidden">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-sm space-y-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 italic leading-relaxed">
                &ldquo;Program ini mengubah cara saya menjalani hidup. Saya menemukan kejelasan arah dan stabilitas yang selama ini saya cari.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center font-bold">
                  R
                </div>
                <div>
                  <p className="font-semibold text-sm">Rina S.</p>
                  <p className="text-blue-200 text-xs">Profesional Muda, Jakarta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: <Users className="w-6 h-6" />,
      label: "Untuk Individu",
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50",
      items: ["Arsitek Kehidupan", "Kehidupan Manunggal", "Coaching & Konseling"],
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      label: "Untuk Organisasi",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
      items: ["Corporate Training", "Consulting", "Executive Mentoring"],
    },
    {
      icon: <Globe className="w-6 h-6" />,
      label: "Ekosistem",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50",
      items: ["Komunitas", "Academy", "Sertifikasi"],
    },
  ];

  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-2">Layanan Kami</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            Mendampingi Perjalanan Stabil dan Berdampak
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Kami merancang intervensi sesuai kebutuhan — dari individu, organisasi, hingga komunitas lintas generasi.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div key={svc.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${svc.color}`}>
                {svc.icon}
              </div>
              <h3 className="font-bold text-lg text-[var(--foreground)] mb-3">{svc.label}</h3>
              <ul className="space-y-2">
                {svc.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm">
                    <CheckCircle className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PembentukanSection() {
  const pillars = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Pembentukan Individu",
      subtitle: "Untuk profesional muda hingga fase kedewasaan",
      color: "from-rose-500 to-pink-500",
      items: ["Stabilitas emosi", "Kejelasan arah hidup", "Kepemimpinan mikro", "Integrasi spiritual"],
      cta: "Pelajari Program Individu",
      href: "/program/arsitek-kehidupan",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Pengembangan Organisasi",
      subtitle: "Membangun stabilitas manusia di dalam organisasi",
      color: "from-blue-500 to-indigo-500",
      items: ["Leadership pipeline", "Retensi Gen Z", "Culture & integrity building"],
      cta: "Program Corporate",
      href: "/",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Pendalaman Personal",
      subtitle: "Coaching, konseling, dan mentoring privat",
      color: "from-amber-500 to-orange-500",
      items: ["Coaching", "Konseling reflektif", "Executive mentoring"],
      cta: "Konsultasi Privat",
      href: "/program/coaching-mentoring",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Ekosistem & Gerakan",
      subtitle: "Membangun komunitas dan dampak lintas generasi",
      color: "from-emerald-500 to-teal-500",
      items: ["Komunitas lintas generasi", "Academy digital", "Sertifikasi", "Research Lab"],
      cta: "Bergabung dalam Movement",
      href: "/program/ekosistem",
    },
  ];

  return (
    <section className="py-20 bg-[var(--muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-2">Pilar Utama</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            Membangun Manusia yang Kokoh
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col">
              <div className={`bg-gradient-to-r ${p.color} p-5`}>
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white mb-3">
                  {p.icon}
                </div>
                <h3 className="font-bold text-white text-sm">{p.title}</h3>
                <p className="text-white/80 text-xs mt-1">{p.subtitle}</p>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <ul className="space-y-1.5 flex-1 mb-4">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className="text-[var(--primary)] text-sm font-medium hover:underline inline-flex items-center gap-1"
                >
                  {p.cta} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContentCard({ content }: { content: typeof dummyContents[0] }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
      <div className="relative aspect-video bg-slate-800">
        {content.type === "video" && content.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${content.youtubeId}`}
            title={content.title}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-800">
            <BookOpen className="w-12 h-12 text-blue-300/50" />
          </div>
        )}
        {content.isPremium && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" /> Premium
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {content.type === "video" ? <Video className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
          {content.type === "video" ? "Video" : "Artikel"}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-[var(--primary)] text-xs font-semibold uppercase tracking-wider mb-2">
          {content.category}
        </span>
        <h3 className="font-bold text-[var(--foreground)] text-sm leading-snug mb-2 line-clamp-2">
          {content.title}
        </h3>
        <p className="text-[var(--muted-foreground)] text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
          {content.description}
        </p>
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-4">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {content.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {content.students.toLocaleString("id-ID")}
          </span>
          <span>{content.duration}</span>
        </div>
        <Link
          href={content.isPremium ? "/auth/daftar" : `/konten/${content.id}`}
          className={`w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
            content.isPremium
              ? "bg-amber-500 hover:bg-amber-400 text-white"
              : "bg-[var(--primary)] hover:opacity-90 text-white"
          }`}
        >
          {content.isPremium ? (
            <span className="flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> Akses Premium
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Play className="w-3 h-3" /> Mulai Belajar
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

function ContentSection() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-1">Konten Pilihan</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">Mulai Belajar Sekarang</h2>
          </div>
          <Link
            href="/konten"
            className="inline-flex items-center gap-2 text-[var(--primary)] font-medium hover:underline"
          >
            Lihat Semua Konten <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyContents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramUnggulan() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-200">
              <Award className="w-4 h-4" /> Program Unggulan
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Program 1 Tahun<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Hidup Melampaui Batas
              </span>
            </h2>
            <p className="text-blue-100/80 leading-relaxed">
              Program 1 tahun yang membimbing Anda melewati tantangan dan membuka potensi sejati
              dalam hidup. Dilaksanakan secara <strong className="text-white">Hybrid</strong>.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { phase: "90 Hari", label: "Fondasi", color: "from-blue-600 to-blue-700" },
                { phase: "6 Bulan", label: "Growth", color: "from-indigo-600 to-purple-700" },
                { phase: "3 Bulan", label: "Dampak & Legacy", color: "from-purple-600 to-pink-700" },
              ].map((p) => (
                <div key={p.phase} className={`bg-gradient-to-b ${p.color} rounded-xl p-4 text-center`}>
                  <p className="font-bold text-lg">{p.phase}</p>
                  <p className="text-white/70 text-xs mt-1">{p.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-white">150+</p>
                <p className="text-blue-200 text-sm">Alumni Program</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">15+</p>
                <p className="text-blue-200 text-sm">Testimoni Nyata</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">100+</p>
                <p className="text-blue-200 text-sm">Peserta Aktif</p>
              </div>
            </div>
            <Link
              href="/program"
              className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Gabung Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                HK
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Founder & Lead Mentor</p>
                <h3 className="font-bold text-white text-lg leading-tight">Dr. Ir. Heru Kustriyadi Wibawa, MSc</h3>
                <p className="text-blue-200 text-sm mt-1">Praktisi Pengembangan Manusia</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-5 space-y-3">
              <p className="text-white/80 text-sm leading-relaxed">
                Dengan pengalaman lebih dari dua dekade dalam pengembangan manusia, Dr. Heru memadukan
                pendekatan ilmiah, spiritual, dan praktis untuk membangun individu yang stabil dan berdampak.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Leadership Coach", "Corporate Consultant", "Executive Mentor"].map((tag) => (
                  <span key={tag} className="bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="py-20 bg-[var(--muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Jika Anda Siap{" "}
              <span className="text-[var(--primary)]">Melampaui</span>
            </h2>
            <div className="space-y-3">
              {[
                "Jika Anda lelah hidup reaktif…",
                "Jika Anda ingin membangun diri dengan benar…",
                "Jika Anda ingin hidup tidak hanya untuk hari ini…",
              ].map((text) => (
                <div key={text} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <p className="text-[var(--muted-foreground)]">{text}</p>
                </div>
              ))}
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <p className="text-[var(--foreground)] leading-relaxed italic">
                Maka perjalanan ini untuk Anda.<br /><br />
                Karena pada akhirnya,<br />
                yang bertahan bukan yang paling cepat.<br /><br />
                <strong>Yang bertahan adalah yang paling kokoh.</strong>
              </p>
            </div>
            <Link
              href="/auth/daftar"
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Gabung Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Target className="w-5 h-5" />, title: "Fokus Pembentukan", desc: "Bukan sekadar event training, tapi pembentukan berkelanjutan." },
              { icon: <GraduationCap className="w-5 h-5" />, title: "Kurikulum Terstruktur", desc: "Dirancang ilmiah dan telah terbukti pada 150+ alumni." },
              { icon: <Heart className="w-5 h-5" />, title: "Pendampingan Personal", desc: "Didampingi langsung oleh mentor berpengalaman." },
              { icon: <Users className="w-5 h-5" />, title: "Komunitas Suportif", desc: "Bergabung dengan komunitas yang saling mendukung." },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[var(--foreground)] text-sm mb-1">{item.title}</h3>
                <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CorporateSection() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center">
          <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-2">Corporate Human Architecture</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            Realitas Organisasi Hari Ini
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Pendekatan strategis untuk membangun stabilitas manusia di dalam organisasi — dari Gen Z hingga leadership pipeline.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-500 flex items-center justify-center text-xs font-bold">!</span>
              Tantangan Organisasi
            </h3>
            <ul className="space-y-2">
              {[
                "Tingginya turnover Gen Z",
                "Konflik lintas generasi",
                "Leader tanpa kedewasaan emosional",
                "Budaya kerja tanpa nilai",
                "Produktivitas fluktuatif",
              ].map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                  <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-950 text-red-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">×</span>
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-[var(--foreground)] font-medium">
              Masalahnya bukan pada sistem.{" "}
              <span className="text-[var(--primary)]">Masalahnya pada stabilitas manusianya.</span>
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Apa Itu CHA?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed">
              <strong className="text-[var(--foreground)]">Corporate Human Architecture</strong> menggabungkan:
            </p>
            <ul className="space-y-2">
              {[
                "Gen Z Stability Training",
                "Leadership Pipeline Formation",
                "Emotional Regulation Workshop",
                "Culture & Integrity Building",
                "Strategic Human Capital Architecture",
              ].map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <CheckCircle className="w-4 h-4 text-[var(--primary)] flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Dampak yang Diharapkan
            </h3>
            <ul className="space-y-2">
              {[
                "Peningkatan retensi talenta muda",
                "Penurunan konflik tim",
                "Kepemimpinan matang secara emosi",
                "Budaya organisasi berbasis nilai",
                "Stabilitas kinerja jangka panjang",
              ].map((o) => (
                <li key={o} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {o}
                </li>
              ))}
            </ul>
            <Link
              href="/kontak"
              className="mt-5 w-full inline-block text-center bg-[var(--primary)] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Konsultasikan Kebutuhan Organisasi
            </Link>
          </div>
        </div>
        <div className="bg-[var(--muted)] rounded-2xl p-8">
          <h3 className="font-bold text-[var(--foreground)] text-xl text-center mb-8">Model Kerja Sama</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <BookOpen className="w-5 h-5" />, label: "In-house Training" },
              { icon: <GraduationCap className="w-5 h-5" />, label: "Leadership Dev Series" },
              { icon: <Target className="w-5 h-5" />, label: "Strategic Consulting" },
              { icon: <Briefcase className="w-5 h-5" />, label: "Retainer Advisory" },
            ].map((m) => (
              <div key={m.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center mx-auto mb-3">
                  {m.icon}
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KonselingSection() {
  return (
    <section id="kontak" className="py-20 bg-[var(--muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider">Konseling</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Pendampingan Personal yang Bermakna
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {["Pra Pernikahan", "Pernikahan", "Keluarga", "Karier", "Tantangan Hidup", "Dan lainnya"].map((topic) => (
                <div key={topic} className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]">
                  <Heart className="w-4 h-4 text-rose-400 flex-shrink-0" /> {topic}
                </div>
              ))}
            </div>
            
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <h3 className="font-bold text-[var(--foreground)] text-xl mb-6">Hubungi Kami</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Nama</label>
                  <input type="text" placeholder="Nama depan" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Nama Akhir</label>
                  <input type="text" placeholder="Nama belakang" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" placeholder="alamat@email.com" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Pesan <span className="text-red-500">*</span></label>
                <textarea rows={4} placeholder="Tuliskan pesan Anda..." className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] resize-none" />
              </div>
              <button type="submit" className="w-full bg-[var(--primary)] text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-16 bg-[var(--background)]">
      <div className="max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center mx-auto">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Berlangganan Sekarang</h2>
        <p className="text-[var(--muted-foreground)]">
          Dapatkan pembaruan dan tips membangun hidup melampaui langsung di inbox Anda.
        </p>
        <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Masukkan nama Anda"
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
          />
          <button type="submit" className="bg-[var(--primary)] text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
            Kirim
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BerandaPage() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <PembentukanSection />
      <ContentSection />
      <ProgramUnggulan />
      <WhySection />
      <CorporateSection />
      <KonselingSection />
    </div>
  );
}
