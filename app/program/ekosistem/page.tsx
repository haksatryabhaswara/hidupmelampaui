import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  Globe,
  Users,
  BookOpen,
  Award,
  FlaskConical,
  ChevronRight,
  Network,
} from "lucide-react";

export default function EkosistemPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-4">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/program" className="hover:text-white transition-colors">Program</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Ekosistem & Gerakan</span>
          </div>
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 text-sm text-emerald-200">
              <Globe className="w-4 h-4" /> Ekosistem & Gerakan
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Ekosistem Hidup Melampaui
            </h1>
            <p className="text-emerald-100/80 text-lg leading-relaxed">
              Sebuah arsitektur pembentukan manusia yang terintegrasi — dari individu, organisasi, hingga generasi.
            </p>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5"
            >
              Bergabung dalam Movement <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Bukan Sekedar Program */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <p className="text-emerald-500 font-semibold text-sm uppercase tracking-wider">Bukan Sekedar Program</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            Lebih dari Training.<br />Ini Sebuah Sistem.
          </h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            Hidup Melampaui tidak berdiri sebagai program terpisah. Ia dibangun sebagai ekosistem yang saling terhubung:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-5 h-5" />, text: "Profesional muda dibentuk", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50" },
              { icon: <Award className="w-5 h-5" />, text: "Leader organisasi dimatangkan", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50" },
              { icon: <Network className="w-5 h-5" />, text: "Mentor generasi dipersiapkan", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50" },
              { icon: <Globe className="w-5 h-5" />, text: "Budaya nilai ditanamkan", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50" },
            ].map((item) => (
              <div key={item.text} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 ${item.color}`}>
                  {item.icon}
                </div>
                <p className="text-[var(--foreground)] text-xs font-medium leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-[var(--foreground)] font-bold">Semua terintegrasi dalam satu arsitektur.</p>
        </div>

        {/* Komponen Ekosistem */}
        <div>
          <div className="text-center mb-12">
            <p className="text-emerald-500 font-semibold text-sm uppercase tracking-wider mb-2">Komponen Ekosistem</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">Empat Pilar Ekosistem</h2>
          </div>

          <div className="space-y-8">
            {/* Komponen 1 */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 text-white flex flex-col justify-center">
                  <div className="text-3xl mb-3">1️⃣</div>
                  <h3 className="text-xl font-bold">Komunitas Lintas Generasi</h3>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mt-4">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="md:col-span-2 p-8">
                  <p className="text-[var(--muted-foreground)] leading-relaxed mb-5">
                    Circle bulanan, forum refleksi, dan diskusi kepemimpinan yang mempertemukan profesional muda, senior mentor, dan corporate leader.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["Circle Bulanan", "Forum Refleksi", "Diskusi Kepemimpinan"].map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-[var(--muted)] rounded-lg p-3 text-sm text-[var(--foreground)]">
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Komponen 2 */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="bg-gradient-to-br from-emerald-700 to-teal-800 p-8 text-white flex flex-col justify-center">
                  <div className="text-3xl mb-3">2️⃣</div>
                  <h3 className="text-xl font-bold">Arsitek Kehidupan Academy</h3>
                  <p className="text-emerald-200 text-sm mt-1">(Online)</p>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mt-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <div className="md:col-span-2 p-8">
                  <p className="text-[var(--muted-foreground)] leading-relaxed mb-5">
                    Platform digital untuk membangun sistem yang scalable secara nasional.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Video Learning", desc: "Konten terstruktur & berkualitas tinggi" },
                      { label: "Reflection Framework", desc: "Panduan refleksi terstruktur" },
                      { label: "Habit Tracking", desc: "Pemantauan implementasi harian" },
                      { label: "Community Forum", desc: "Diskusi dan saling mendukung" },
                    ].map((item) => (
                      <div key={item.label} className="bg-[var(--muted)] rounded-lg p-3">
                        <p className="text-[var(--foreground)] text-sm font-medium">{item.label}</p>
                        <p className="text-[var(--muted-foreground)] text-xs mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Komponen 3 */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="bg-gradient-to-br from-purple-700 to-violet-800 p-8 text-white flex flex-col justify-center">
                  <div className="text-3xl mb-3">3️⃣</div>
                  <h3 className="text-xl font-bold">Certification Program</h3>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mt-4">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
                <div className="md:col-span-2 p-8">
                  <p className="text-[var(--muted-foreground)] leading-relaxed mb-5">
                    Membentuk <strong className="text-[var(--foreground)]">multiplier</strong>, bukan hanya peserta.
                  </p>
                  <div className="space-y-3">
                    {[
                      { cert: "Certified Arsitek Kehidupan Practitioner", color: "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30" },
                      { cert: "Certified Mentor", color: "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30" },
                      { cert: "Certified Corporate Facilitator", color: "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30" },
                    ].map((item) => (
                      <div key={item.cert} className={`flex items-center gap-3 border rounded-lg p-3 ${item.color}`}>
                        <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <p className="text-[var(--foreground)] text-sm font-medium">{item.cert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Komponen 4 */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="bg-gradient-to-br from-rose-700 to-pink-800 p-8 text-white flex flex-col justify-center">
                  <div className="text-3xl mb-3">4️⃣</div>
                  <h3 className="text-xl font-bold">Human Architecture Research & Insight Lab</h3>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mt-4">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                </div>
                <div className="md:col-span-2 p-8">
                  <p className="text-[var(--muted-foreground)] leading-relaxed mb-5">
                    Membangun <strong className="text-[var(--foreground)]">legitimasi berbasis riset</strong>. Fokus pada:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Stabilitas Gen Z",
                      "Emotional Maturity Index",
                      "Leadership Readiness",
                      "Whitepaper Tahunan",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-[var(--muted)] rounded-lg p-3 text-sm text-[var(--foreground)]">
                        <FlaskConical className="w-4 h-4 text-rose-500 flex-shrink-0" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-10 text-white text-center space-y-5">
          <h2 className="text-3xl font-bold">Bergabunglah dalam Gerakan Ini.</h2>
          <p className="text-emerald-100/80 max-w-xl mx-auto">
            Kami tidak membangun program. Kami membangun sebuah ekosistem yang akan bertahan dan berdampak lintas generasi.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth/daftar"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Daftar Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-8 py-3 rounded-lg transition-colors hover:bg-white/10"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
