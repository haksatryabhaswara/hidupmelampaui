import { CheckCircle, Users, Award, Heart, Target, Globe2 } from "lucide-react";

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">Tentang Hidup Melampaui</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-0 leading-tight">
              Membangun Manusia yang Stabil, Bertumbuh, dan Berdampak Lintas Generasi
            </h1>
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 text-[var(--foreground)]">
              <p className="text-lg leading-relaxed">
                Di tengah dunia yang semakin cepat, manusia semakin mudah terpecah.
              </p>
              <ul className="space-y-1 pl-4 text-[var(--muted-foreground)]">
                {["Terpecah oleh distraksi.", "Terpecah oleh ambisi.", "Terpecah oleh tekanan.", "Terpecah oleh ekspektasi sosial."].map((t) => (
                  <li key={t} className="list-disc text-base">{t}</li>
                ))}
              </ul>
              <div className="space-y-1">
                <p className="text-base text-[var(--muted-foreground)]">Banyak yang cerdas.</p>
                <p className="text-base text-[var(--muted-foreground)]">Banyak yang terampil.</p>
                <p className="text-base font-semibold text-[var(--foreground)]">Tetapi sedikit yang stabil.</p>
              </div>
              <p className="text-base leading-relaxed text-[var(--muted-foreground)]">
                Hidup Melampaui lahir dari kesadaran bahwa krisis terbesar zaman ini bukan krisis teknologi, bukan krisis ekonomi, melainkan{" "}
                <span className="font-semibold text-[var(--foreground)]">krisis arsitektur manusia</span>.
              </p>
              <div className="space-y-1">
                <p className="text-base text-[var(--muted-foreground)]">Kita tidak kekurangan informasi.</p>
                <p className="text-base font-semibold text-[var(--foreground)]">Kita kekurangan pembentukan.</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Image placeholder */}
              <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950/40 dark:to-indigo-950/30 flex items-end p-6">
                <p className="text-blue-600/50 dark:text-blue-300/30 text-xs italic leading-relaxed">
                  A warm, inviting workspace with diverse professionals collaborating and reflecting together.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 text-center">
                  <p className="text-3xl font-bold text-[var(--primary)]">150+</p>
                  <p className="text-[var(--muted-foreground)] text-xs mt-1">Alumni Program</p>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 text-center">
                  <p className="text-3xl font-bold text-[var(--primary)]">15+</p>
                  <p className="text-[var(--muted-foreground)] text-xs mt-1">Tahun Pengalaman</p>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold text-emerald-500">✓</p>
                  <p className="text-[var(--muted-foreground)] text-xs mt-1">Terpercaya</p>
                </div>
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
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Visi</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Menjadi ekosistem pengembangan manusia terdepan di Indonesia yang menghasilkan individu dan organisasi yang stabil, bertumbuh, dan berdampak lintas generasi.
            </p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mb-5">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Misi</h2>
            <ul className="space-y-3">
              {[
                "Mendampingi individu membangun fondasi emosi, spiritual, dan kepemimpinan",
                "Memberdayakan organisasi melalui pendekatan human architecture yang integratif",
                "Membangun komunitas yang saling mendukung dan tumbuh bersama",
                "Menciptakan konten edukatif yang dapat diakses seluas-luasnya",
              ].map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {m}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Founder */}
        <div>
          <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-2">Founder</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-10">Profil Pendiri</h2>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-10 flex flex-col items-center justify-center text-white text-center">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl font-bold mb-4">
                  HK
                </div>
                <h3 className="font-bold text-xl">Dr. Ir. Heru Kustriyadi Wibawa, MSc</h3>
                <p className="text-blue-200 text-sm mt-2">Founder & Lead Mentor</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {["Leadership Coach", "Corporate Consultant", "Executive Mentor"].map((tag) => (
                    <span key={tag} className="bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 p-8 space-y-4">
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Dr. Ir. Heru Kustriyadi Wibawa, MSc adalah seorang praktisi pengembangan manusia dengan pengalaman lebih dari dua dekade. Beliau memadukan pendekatan ilmiah, spiritual, dan praktis dalam mendampingi individu dan organisasi.
                </p>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Dengan latar belakang teknik dan manajemen strategis, Dr. Heru mengembangkan framework unik yang dikenal sebagai &ldquo;Corporate Human Architecture&rdquo; — sebuah pendekatan integratif untuk membangun stabilitas manusia di dalam organisasi.
                </p>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Visi beliau sederhana namun mendalam: membantu setiap individu menemukan versi terbaik dirinya dan hidup dengan penuh makna, sehingga dampaknya terasa lintas generasi.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { number: "150+", label: "Alumni Program" },
                    { number: "20+", label: "Tahun Pengalaman" },
                    { number: "50+", label: "Organisasi Klien" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-bold text-[var(--primary)]">{stat.number}</p>
                      <p className="text-[var(--muted-foreground)] text-xs mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <p className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider mb-2 text-center">Nilai Kami</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-10 text-center">Landasan yang Kami Pegang</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Target className="w-6 h-6" />, title: "Integritas", desc: "Kami berkomitmen pada kejujuran dan kesesuaian antara nilai dan tindakan.", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50" },
              { icon: <Heart className="w-6 h-6" />, title: "Kasih", desc: "Setiap pendampingan dilakukan dengan kasih yang tulus dan perhatian yang mendalam.", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50" },
              { icon: <Users className="w-6 h-6" />, title: "Komunitas", desc: "Kami percaya bahwa pertumbuhan terbaik terjadi dalam komunitas yang suportif.", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50" },
              { icon: <Globe2 className="w-6 h-6" />, title: "Dampak", desc: "Setiap program dirancang untuk menciptakan dampak nyata, bukan sekadar pengetahuan.", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50" },
            ].map((val) => (
              <div key={val.title} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${val.color}`}>
                  {val.icon}
                </div>
                <h3 className="font-bold text-[var(--foreground)] mb-2">{val.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-8">Dampak yang Telah Kami Ciptakan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "150+", label: "Alumni Program Jangka Panjang" },
              { number: "100+", label: "Peserta Aktif Saat Ini" },
              { number: "50+", label: "Organisasi yang Dilayani" },
              { number: "2000+", label: "Jam Pendampingan" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-white mb-2">{stat.number}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
