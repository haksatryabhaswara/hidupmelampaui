import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  Users,
  Target,
  Layers,
  Brain,
  Compass,
  Shield,
  ChevronRight,
} from "lucide-react";

export default function ArsitekKehidupanPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-900 via-pink-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-medium mb-4">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/program" className="hover:text-white transition-colors">Program</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Arsitek Kehidupan</span>
          </div>
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 rounded-full px-4 py-1.5 text-sm text-rose-200">
              <Users className="w-4 h-4" /> Pembentukan Individu
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Program Arsitek Kehidupan
            </h1>
            <p className="text-rose-100/80 text-lg leading-relaxed">
              Program pembentukan profesional muda yang membangun stabilitas, arah hidup, dan
              kepemimpinan melalui sistem terstruktur dan pendampingan nyata.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5"
              >
                Daftar Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium px-6 py-3 rounded-lg transition-all hover:bg-white/10"
              >
                Percakapan Awal
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Masalah Nyata */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="text-rose-500 font-semibold text-sm uppercase tracking-wider">Masalah Nyata</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Banyak Profesional Hari Ini
            </h2>
            <div className="space-y-3">
              {[
                "Cepat naik jabatan tapi rapuh secara emosi",
                "Aktif tapi tidak terarah",
                "Ambisius tapi tanpa sistem",
                "Punya potensi tapi tidak punya arsitektur diri",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">×</span>
                  <p className="text-[var(--muted-foreground)]">{item}</p>
                </div>
              ))}
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-[var(--foreground)] leading-relaxed text-sm">
                Tanpa fondasi, tekanan karier akan menghancurkan stabilitas.<br /><br />
                <strong>Program ini membangun fondasi sebelum membangun ambisi.</strong>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-8">
            <p className="text-rose-600 dark:text-rose-400 font-semibold text-sm uppercase tracking-wider mb-4">
              Dirancang untuk Pembentukan Nyata
            </p>
            <p className="text-[var(--foreground)] font-bold text-lg mb-4">Bukan Motivasi Sesaat</p>
            <p className="text-[var(--muted-foreground)] text-sm mb-5">Program ini menggabungkan:</p>
            <ul className="space-y-3">
              {[
                "Kerangka refleksi yang teruji",
                "Simulasi sistem melalui Board Game GPA",
                "Pendampingan mentor",
                "Implementasi 90 hari",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                  <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-[var(--muted-foreground)] italic">
              Fokus kami bukan inspirasi sesaat, tetapi <strong className="text-[var(--foreground)]">perubahan yang terukur.</strong>
            </p>
          </div>
        </div>

        {/* Apa itu Arsitek Kehidupan */}
        <div>
          <div className="text-center mb-12">
            <p className="text-rose-500 font-semibold text-sm uppercase tracking-wider mb-2">Apa Itu Arsitek Kehidupan?</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">Sebuah Sistem 6 Level Integratif</h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              Ini bukan seminar motivasi. Ini <strong className="text-[var(--foreground)]">pembentukan sistem manusia.</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain className="w-5 h-5" />, title: "Intensive Training 2–3 Hari", desc: "Immersive training untuk membangun landasan kognitif, emosional, dan sistem berpikir." },
              { icon: <Target className="w-5 h-5" />, title: "Implementasi Terarah 90 Hari", desc: "Eksekusi terstruktur selama 90 hari dengan milestone yang terukur dan jelas." },
              { icon: <Layers className="w-5 h-5" />, title: "Board Game GPA Simulation", desc: "Simulasi keputusan kehidupan nyata melalui board game eksklusif yang didesain khusus." },
              { icon: <Users className="w-5 h-5" />, title: "Mentor System", desc: "Pendampingan 1-on-1 dengan mentor berpengalaman di setiap fase perjalanan." },
              { icon: <Compass className="w-5 h-5" />, title: "Reflection Framework", desc: "Kerangka refleksi terstruktur untuk memproses pengalaman menjadi kebijaksanaan." },
              { icon: <Shield className="w-5 h-5" />, title: "Micro Leadership Practice", desc: "Latihan kepemimpinan skala kecil yang membangun kebiasaan dan karakter pemimpin." },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-sm">{item.title}</h3>
                <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-[var(--muted)] rounded-xl p-5 text-center">
            <p className="text-[var(--muted-foreground)] text-sm">
              Program ini dirancang sebagai <strong className="text-[var(--foreground)]">fondasi kepemimpinan jangka panjang</strong>, bukan percepatan instan.
            </p>
          </div>
        </div>

        {/* Hasil yang Dibangun */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-2xl p-8">
            <p className="text-blue-300 font-semibold text-sm uppercase tracking-wider mb-2">Hasil yang Dibangun</p>
            <h2 className="text-2xl font-bold mb-6">Output yang Terlihat</h2>
            <ul className="space-y-4">
              {[
                "Stabilitas emosi dalam tekanan",
                "Disiplin & fokus jangka panjang",
                "Kejelasan arah hidup & karier",
                "Kepemimpinan mikro dalam tim",
                "Kemampuan membangun sistem kecil",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Siapa yang Cocok */}
          <div className="space-y-6">
            <div>
              <p className="text-rose-500 font-semibold text-sm uppercase tracking-wider mb-2">Siapa yang Cocok?</p>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Program Ini Dirancang Untuk</h2>
              <div className="space-y-3">
                {[
                  { label: "Profesional muda", detail: "22–35 tahun" },
                  { label: "Supervisor & calon leader", detail: "yang ingin naik level" },
                  { label: "Individu memasuki fase karier serius", detail: "dan butuh sistem" },
                  { label: "Mereka yang ingin fondasi kokoh", detail: "sebelum melompat lebih tinggi" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                    <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[var(--foreground)] text-sm font-medium">{item.label}</p>
                      <p className="text-[var(--muted-foreground)] text-xs">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Penutup */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-10 text-white text-center space-y-5">
          <h2 className="text-3xl font-bold">Fondasi yang Kuat Menentukan Masa Depan.</h2>
          <p className="text-rose-100/80 max-w-xl mx-auto">
            Percakapan awal dilakukan untuk memastikan program ini tepat untuk Anda. Tidak ada komitmen di tahap awal.
          </p>
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 bg-white text-rose-700 font-bold px-8 py-3 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Mulai Percakapan Awal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
