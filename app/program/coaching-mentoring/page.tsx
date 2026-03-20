import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  Lightbulb,
  MessageSquare,
  Star,
  ChevronRight,
  ArrowDown,
} from "lucide-react";

export default function CoachingMentoringPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-900 via-orange-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mb-4">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/program" className="hover:text-white transition-colors">Program</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Coaching & Mentoring</span>
          </div>
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 text-sm text-amber-200">
              <Lightbulb className="w-4 h-4" /> Pendalaman Personal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Coaching & Executive Mentoring
            </h1>
            <p className="text-amber-100/80 text-lg leading-relaxed">
              Pendampingan privat untuk fase keputusan penting, transisi hidup, dan kepemimpinan yang matang.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5"
              >
                Mulai Percakapan <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Tidak semua orang butuh program */}
        <div className="text-center max-w-2xl mx-auto space-y-5">
          <p className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Tidak Semua Orang Membutuhkan Program</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            Tidak Semua Fase Hidup<br />Membutuhkan Kelas.
          </h2>
          <p className="text-xl text-[var(--muted-foreground)] font-medium">Beberapa Membutuhkan Percakapan.</p>
          <p className="text-[var(--muted-foreground)]">Ada fase ketika seseorang:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            {[
              "Mengalami krisis arah",
              "Memasuki transisi karier",
              "Menghadapi tekanan kepemimpinan",
              "Merasa berhasil tetapi kosong",
              "Memikirkan legacy dan makna",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]">
                <MessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0" /> {item}
              </div>
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
              Di fase ini, yang dibutuhkan bukan teori.<br />
              Tetapi <strong>ruang refleksi yang terstruktur.</strong>
            </p>
          </div>
        </div>

        {/* Dua Jalur */}
        <div>
          <div className="text-center mb-12">
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-wider mb-2">Dua Jalur Pendampingan</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">Pilih Jalur yang Tepat untuk Fase Anda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coaching */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="text-2xl mb-3">1️⃣</div>
                <h3 className="text-xl font-bold">Coaching</h3>
                <p className="text-blue-100/80 text-sm mt-1">Performance & Growth</p>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-[var(--muted-foreground)] text-sm">Untuk profesional yang ingin:</p>
                <ul className="space-y-2.5">
                  {[
                    "Career clarity",
                    "Leadership growth",
                    "Habit discipline",
                    "Emotional stability",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[var(--foreground)] text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    Pendekatan sistematis, terukur, dan fokus pada performa.
                  </p>
                </div>
              </div>
            </div>

            {/* Mentoring & Konseling */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-white">
                <div className="text-2xl mb-3">2️⃣</div>
                <h3 className="text-xl font-bold">Mentoring & Konseling Integratif</h3>
                <p className="text-amber-100/80 text-sm mt-1">Fase Reflektif yang Lebih Dalam</p>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-[var(--muted-foreground)] text-sm">Untuk fase yang lebih reflektif:</p>
                <ul className="space-y-2.5">
                  {[
                    "Krisis makna",
                    "Transisi karier besar",
                    "Mid-life reflection",
                    "Decision clarity untuk pemimpin senior",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[var(--foreground)] text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    Pendekatan lebih dalam, lebih personal, dan kontekstual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Format & Proses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-amber-500 font-semibold text-sm uppercase tracking-wider mb-2">Format & Proses</p>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">Proses Pendampingan</h2>
            <div className="space-y-4 relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-5 bottom-5 w-px bg-[var(--border)]" />
              {[
                { step: "01", title: "Percakapan Awal", desc: "Sesi perkenalan untuk memahami posisi dan kebutuhan Anda saat ini." },
                { step: "02", title: "Assessment & Klarifikasi Tujuan", desc: "Pemetaan mendalam tentang tujuan, tantangan, dan konteks unik Anda." },
                { step: "03", title: "Sesi Terjadwal (Online / Offline)", desc: "Sesi pendampingan rutin sesuai jadwal yang disepakati, fleksibel platform." },
                { step: "04", title: "Refleksi & Integrasi", desc: "Proses internalisasi untuk mengubah insight menjadi perubahan nyata." },
              ].map((s) => (
                <div key={s.step} className="relative flex gap-4 pl-12">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-[var(--card)] border-2 border-amber-400 flex items-center justify-center text-xs font-bold text-amber-500 z-10">
                    {s.step}
                  </div>
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex-1">
                    <p className="font-semibold text-[var(--foreground)] text-sm">{s.title}</p>
                    <p className="text-[var(--muted-foreground)] text-xs mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Mentoring */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <p className="font-semibold text-sm uppercase tracking-wider text-yellow-300">Executive Mentoring</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Dirancang untuk Pemimpin</h3>
              <div className="flex flex-wrap gap-2">
                {["CEO", "Founder", "Senior Leader"].map((tag) => (
                  <span key={tag} className="bg-white/10 border border-white/20 text-white/80 text-xs px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-5">
              <p className="text-white/60 text-sm mb-4">Fokus pendampingan:</p>
              <ul className="space-y-3">
                {[
                  { label: "Integritas", desc: "Selaraskan nilai dan tindakan kepemimpinan" },
                  { label: "Decision Clarity", desc: "Keputusan besar dengan kejernihan penuh" },
                  { label: "Emotional Maturity", desc: "Kedewasaan emosi sebagai aset pemimpin" },
                  { label: "Legacy Thinking", desc: "Membangun warisan yang bermakna" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-white/60 text-xs">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/kontak"
              className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Mulai Percakapan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-10 text-white text-center space-y-5">
          <ArrowDown className="w-8 h-8 mx-auto opacity-60" />
          <h2 className="text-3xl font-bold">Siap Memulai Percakapan?</h2>
          <p className="text-amber-100/80 max-w-xl mx-auto">
            Tidak ada komitmen di awal. Hanya percakapan yang jujur untuk memastikan kami bisa mendampingi Anda dengan tepat.
          </p>
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-8 py-3 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Hubungi Kami Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
