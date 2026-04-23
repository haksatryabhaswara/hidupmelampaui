export type ContentAccess = "free" | "login" | "paid";

export type ContentQuestionOption = {
  label: string; // "a" | "b" | "c" | "d" | "e"
  text: string;
};

export type ContentQuestion = {
  id: string;
  type: "essay" | "option";
  question: string;
  /** Only used when type === "option" — exactly 5 items (a–e) */
  options?: ContentQuestionOption[];
};

export type ContentTest = {
  /** Whether this test is enabled/shown to users */
  enabled: boolean;
  questions: ContentQuestion[];
};

export type StepContent = {
  id: string;
  title: string;
  description: string;
  type: "video" | "article";
  youtubeId: string | null;
  /** free = anyone, login = must be signed in, paid = must purchase */
  access: ContentAccess;
  /** price in IDR — required when access === "paid" */
  price?: number;
  duration: string;
  body?: string;
};

export type DevotionEntry = {
  id: string;
  /** Sequential day number starting from 1. Day 1 is whatever day the user first starts. */
  day: number;
  title: string;
  body?: string;
  type: "video" | "article";
  youtubeId: string | null;
  access: ContentAccess;
  price?: number;
  /** Optional ordered sub-steps within this daily entry (not mandatory) */
  steps?: StepContent[];
};

export type Content = {
  id: string;
  /** URL-friendly slug used for routing: /konten/[slug] */
  slug: string;
  title: string;
  description: string;
  category: string;
  type: "video" | "article";
  youtubeId: string | null;
  /** free = anyone, login = must be signed in, paid = must purchase */
  access: ContentAccess;
  /** price in IDR — required when access === "paid" */
  price?: number;
  rating: number;
  students: number;
  duration: string;
  instructor: string;
  body?: string;
  /** If true, this content contains sequential steps instead of a single body */
  isSteppedContent?: boolean;
  /** Ordered list of steps — each must be completed before the next unlocks */
  steps?: StepContent[];
  /** If true, this is a Renungan Harian (Daily Devotion) series with per-day entries */
  isDevotionContent?: boolean;
  /** Daily entries (day 1–366) — used when isDevotionContent is true */
  devotionEntries?: DevotionEntry[];
  /** Optional test attached to this content */
  test?: ContentTest;
};

export const allContents: Content[] = [
  {
    id: "1",
    slug: "fondasi-stabilitas-emosi",
    title: "Fondasi Stabilitas Emosi: Membangun Ketenangan di Tengah Tekanan",
    description: "Pelajari teknik-teknik praktis untuk mengelola emosi dan membangun ketahanan mental.",
    category: "Pengembangan Diri",
    type: "video",
    youtubeId: "inpok4MKVLM",
    access: "free",
    rating: 4.9,
    students: 1240,
    duration: "45 menit",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Pendahuluan

Stabilitas emosi adalah fondasi dari kehidupan yang produktif dan bermakna. Tanpa fondasi ini, kita mudah terguncang oleh tekanan sehari-hari.

## Apa yang akan Anda pelajari

- Memahami siklus emosi dan bagaimana mengenalinya
- Teknik regulasi emosi berbasis neurosains
- Praktik mindfulness sederhana untuk keseharian
- Cara membangun ketahanan mental jangka panjang

## Mengapa ini penting?

Dalam dunia yang penuh tekanan dan ketidakpastian, kemampuan untuk tetap stabil secara emosional adalah keunggulan kompetitif yang sesungguhnya.

> "Stabilitas emosi bukan berarti tidak merasakan. Stabilitas emosi berarti Anda yang mengendalikan perasaan, bukan sebaliknya."
> — Dr. Heru K. Wibawa`,
  },
  {
    id: "2",
    slug: "kepemimpinan-mikro",
    title: "Kepemimpinan Mikro: Memimpin Diri Sebelum Memimpin Tim",
    description: "Prinsip-prinsip kepemimpinan yang dimulai dari dalam diri — fondasi pemimpin sejati.",
    category: "Kepemimpinan",
    type: "video",
    youtubeId: "TQMbvJNRpLE",
    access: "paid",
    price: 99000,
    rating: 4.8,
    students: 890,
    duration: "1 jam 20 menit",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Kepemimpinan Dimulai dari Dalam

Sebelum Anda bisa memimpin orang lain, Anda harus bisa memimpin diri sendiri. Ini bukan sekadar klise — ini adalah realita yang diabaikan oleh banyak pemimpin.

## Modul yang Tercakup

- Self-leadership: mengelola prioritas dan energi
- Membangun kepercayaan sebagai pemimpin
- Komunikasi yang membangun, bukan melemahkan
- Delegasi yang efektif tanpa kehilangan kontrol`,
  },
  {
    id: "3",
    slug: "integrasi-spiritual-kehidupan-profesional",
    title: "Integrasi Spiritual dalam Kehidupan Profesional",
    description: "Bagaimana nilai-nilai spiritual menjadi kompas dalam pengambilan keputusan.",
    category: "Spiritual",
    type: "article",
    youtubeId: null,
    access: "login",
    rating: 4.7,
    students: 2100,
    duration: "15 menit baca",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Spiritualitas & Profesionalisme: Sebuah Perpaduan

Banyak orang memisahkan kehidupan spiritual mereka dari kehidupan profesional. Ini adalah kesalahan fundamental yang menyebabkan kekosongan makna dalam pekerjaan.

## Kompas Spiritual dalam Keputusan Bisnis

Nilai-nilai spiritual — kejujuran, integritas, kasih sayang, dan kebijaksanaan — bukan hanya relevan, tetapi **esensial** dalam konteks profesional modern.

### 1. Integritas sebagai Brand

Saat Anda bertindak dengan integritas konsisten, Anda membangun reputasi yang tidak bisa dibeli dengan uang.

### 2. Kebijaksanaan dalam Pengambilan Keputusan

Spiritualitas mengajarkan kita untuk berhenti sejenak, merefleksikan, dan memilih respons yang bijak.

### 3. Melayani sebagai Motivasi

Ketika pekerjaan Anda adalah bentuk pelayanan, bukan sekadar transaksi, Anda akan menemukan energi yang tak habis-habis.`,
  },
  {
    id: "4",
    slug: "gen-z-stabilitas-era-vuca",
    title: "Gen Z & Stabilitas di Era VUCA: Panduan Bertahan dan Bertumbuh",
    description: "Strategi khusus bagi Generasi Z untuk membangun fondasi yang kuat di tengah dunia yang cepat berubah.",
    category: "Gen Z",
    type: "video",
    youtubeId: "V42t0qVbCGI",
    access: "paid",
    price: 149000,
    rating: 4.9,
    students: 1560,
    duration: "55 menit",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Tantangan Gen Z yang Sebenarnya

Gen Z menghadapi tekanan unik: dunia digital yang penuh distraksi, ekspektasi sosial yang tinggi, dan ketidakpastian karier yang belum pernah ada sebelumnya.

## Yang Akan Anda Pelajari

- Memahami pola pikir dan tantangan khas Gen Z
- Membangun identitas yang stabil di era media sosial
- Strategi fokus dan produktivitas untuk digital natives
- Merancang karier yang bermakna, bukan sekadar bergengsi`,
  },
  {
    id: "5",
    slug: "arsitektur-kehidupan",
    title: "Arsitektur Kehidupan: Merancang Hidup yang Bermakna",
    description: "Framework sistematis untuk merancang seluruh dimensi kehidupan Anda dari visi hingga aksi.",
    category: "Pengembangan Diri",
    type: "article",
    youtubeId: null,
    access: "free",
    rating: 4.6,
    students: 3200,
    duration: "20 menit baca",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Apa itu Arsitektur Kehidupan?

Seperti seorang arsitek yang merancang bangunan sebelum membangunnya, Anda pun perlu merancang kehidupan sebelum menjalaninya.

## Lima Dimensi Kehidupan

1. **Spiritual** — Hubungan dengan Yang Maha Kuasa dan nilai-nilai inti
2. **Mental/Emosional** — Kesehatan psikologis dan kedewasaan emosi
3. **Relasional** — Keluarga, pertemanan, komunitas
4. **Profesional** — Karier, kontribusi, legacy
5. **Fisik** — Kesehatan, energi, kebugaran

## Langkah Merancang Hidup Anda

Mulai dengan pertanyaan: "Bagaimana saya ingin dikenang 50 tahun dari sekarang?"`,
  },
  {
    id: "6",
    slug: "corporate-human-architecture",
    title: "Corporate Human Architecture: Membangun Tim yang Stabil",
    description: "Pendekatan integratif untuk membangun stabilitas dan kedewasaan manusia di dalam organisasi.",
    category: "Korporat",
    type: "video",
    youtubeId: "qYNweeDHiyU",
    access: "paid",
    price: 199000,
    rating: 4.9,
    students: 640,
    duration: "1 jam 40 menit",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Krisis Manusia dalam Organisasi

Turnover tinggi, burnout, konflik antar generasi, dan kehilangan makna kerja — semua ini adalah gejala dari satu masalah: arsitektur manusia organisasi yang rapuh.

## Framework Corporate Human Architecture

- **Fondasi**: Membangun nilai dan budaya yang otentik
- **Struktur**: Sistem kepemimpinan yang memberdayakan
- **Interior**: Iklim psikologis yang aman dan produktif
- **Eksterior**: Reputasi dan dampak organisasi`,
  },
  {
    id: "7",
    slug: "manajemen-konflik-keluarga-kerja",
    title: "Manajemen Konflik dalam Keluarga dan Tempat Kerja",
    description: "Teknik praktis untuk mengelola dan menyelesaikan konflik secara konstruktif.",
    category: "Konseling",
    type: "article",
    youtubeId: null,
    access: "login",
    rating: 4.5,
    students: 1800,
    duration: "18 menit baca",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Konflik adalah Normal

Konflik bukan tanda kegagalan hubungan — ia adalah tanda bahwa ada dua manusia berbeda yang berinteraksi. Masalahnya bukan konfliknya, melainkan cara kita mengelolanya.

## Empat Respons terhadap Konflik

1. **Menghindari** — Sementara terasa aman, jangka panjang berbahaya
2. **Mengalah** — Bisa memperparah ketidakseimbangan
3. **Berkonfrontasi** — Efektif jika dilakukan dengan tepat
4. **Berkolaborasi** — Solusi terbaik, butuh kematangan tertinggi

## Teknik De-eskalasi

Ketika emosi memuncak, gunakan formula: **Pause → Breathe → Reflect → Respond**`,
  },
  {
    id: "8",
    slug: "rutinitas-produktif-berkelanjutan",
    title: "Membangun Rutinitas Produktif yang Berkelanjutan",
    description: "Panduan membangun sistem kebiasaan yang realistis dan bertahan lama.",
    category: "Pengembangan Diri",
    type: "video",
    youtubeId: "inpok4MKVLM",
    access: "free",
    rating: 4.7,
    students: 2400,
    duration: "35 menit",
    instructor: "Dr. Heru K. Wibawa",
    body: `## Mengapa Rutinitas Gagal?

Kebanyakan orang gagal membangun rutinitas karena merancangnya terlalu ambisius atau terlalu kaku. Rutinitas yang baik adalah yang fleksibel dan berakar pada identitas.

## Tiga Pilar Rutinitas Berkelanjutan

1. **Motivasi Internal** — Lakukan karena siapa Anda, bukan karena apa yang Anda inginkan
2. **Isyarat & Pemicu** — Kaitkan kebiasaan baru dengan yang sudah ada
3. **Perayaan Kecil** — Rayakan setiap langkah maju, bukan hanya tujuan akhir`,
  },
  {
    id: "9",
    slug: "emotional-intelligence-pemimpin",
    title: "Emotional Intelligence untuk Pemimpin Masa Depan",
    description: "Mengembangkan kecerdasan emosional sebagai kompetensi kepemimpinan utama abad 21.",
    category: "Kepemimpinan",
    type: "video",
    youtubeId: "TQMbvJNRpLE",
    access: "paid",
    price: 99000,
    rating: 4.8,
    students: 720,
    duration: "1 jam 10 menit",
    instructor: "Dr. Heru K. Wibawa",
    body: `## EQ vs IQ: Mana yang Lebih Penting?

Penelitian menunjukkan bahwa Emotional Intelligence (EQ) berkontribusi 80% terhadap kesuksesan kepemimpinan. IQ hanya membuka pintu — EQ yang menentukan seberapa jauh Anda bisa melangkah.

## Lima Komponen EQ (Daniel Goleman)

1. **Self-Awareness** — Mengenali emosi diri
2. **Self-Regulation** — Mengelola respons emosional
3. **Motivation** — Dorongan internal yang kuat
4. **Empathy** — Memahami emosi orang lain
5. **Social Skills** — Mengelola hubungan dengan efektif`,
  },

  // ── Stepped / Series content ─────────────────────────────────────────────
  {
    id: "10",
    slug: "transformasi-diri-4-langkah",
    title: "Transformasi Diri: Perjalanan 4 Langkah Menuju Hidup Bermakna",
    description:
      "Seri pembelajaran bertahap yang membawa Anda dari kesadaran diri menuju aksi nyata. Setiap langkah membuka langkah berikutnya — selesaikan satu untuk melanjutkan.",
    category: "Pengembangan Diri",
    type: "article",
    youtubeId: null,
    access: "free",
    rating: 5.0,
    students: 128,
    duration: "4 langkah",
    instructor: "Dr. Heru K. Wibawa",
    isSteppedContent: true,
    steps: [
      {
        id: "10-1",
        title: "Langkah 1: Mengenal Diri — Peta Identitas Anda",
        description:
          "Sebelum berubah, Anda harus tahu siapa Anda. Langkah pertama adalah membuat peta identitas yang jujur.",
        type: "article",
        youtubeId: null,
        access: "free",
        duration: "10 menit baca",
        body: `## Mengenal Diri adalah Fondasi Semua Perubahan

Banyak orang memulai perjalanan transformasi dengan langsung mencari solusi baru — diet baru, kebiasaan baru, program baru. Tapi mereka melewati satu langkah krusial: mengenal diri sendiri.

## Peta Identitas

Peta identitas adalah gambaran jujur tentang siapa Anda saat ini — bukan siapa yang Anda inginkan, tapi siapa yang sesungguhnya ada sekarang.

### Empat Dimensi Identitas

1. **Nilai-nilai Inti** — Apa yang paling penting bagi Anda?
2. **Pola Pikir** — Bagaimana Anda memandang masalah secara otomatis?
3. **Emosi Dominan** — Perasaan apa yang paling sering muncul setiap hari?
4. **Perilaku Default** — Apa yang Anda lakukan tanpa berpikir?

## Latihan Hari Ini

Ambil selembar kertas. Tulis nama Anda di tengah. Lalu tuliskan 5 kata yang paling menggambarkan diri Anda **sekarang** — bukan yang ideal, tapi yang nyata dan jujur.

Tidak ada jawaban salah. Kejujuran ini adalah modal utama Anda.

> "Kesadaran diri adalah langkah pertama menuju kebebasan sejati."
> — Dr. Heru K. Wibawa`,
      },
      {
        id: "10-2",
        title: "Langkah 2: Memahami Pola Emosi Anda",
        description:
          "Pelajari bagaimana emosi Anda membentuk keputusan dan perilaku sehari-hari. Konten ini memerlukan akun gratis.",
        type: "video",
        youtubeId: "inpok4MKVLM",
        access: "login",
        duration: "25 menit",
        body: `## Emosi Bukan Musuh

Banyak dari kita diajarkan untuk menekan emosi — terutama yang negatif. Tapi emosi adalah data berharga, bukan gangguan.

## Yang Akan Anda Pelajari

- Mengenali trigger emosional pribadi Anda
- Siklus stimulus → respons → kebiasaan
- Teknik reframing emosi negatif menjadi energi konstruktif

## Catatan Setelah Menonton

Setelah selesai, identifikasi satu emosi yang paling sering "berkuasa" atas keputusan Anda tanpa izin Anda.`,
      },
      {
        id: "10-3",
        title: "Langkah 3: Merancang Strategi Perubahan",
        description:
          "Dari kesadaran menuju aksi. Rancang strategi transformasi yang realistis, terstruktur, dan terukur.",
        type: "video",
        youtubeId: "V42t0qVbCGI",
        access: "paid",
        price: 79000,
        duration: "35 menit",
        body: `## Strategi, Bukan Sekadar Semangat

Semangat itu penting, tapi tidak cukup. Yang membedakan orang yang benar-benar berubah dengan yang tidak adalah sistem — bukan motivasi sesaat.

## Yang Akan Anda Bangun dalam Langkah Ini

- Goal framework yang realistis dan berbasis nilai
- Sistem pengambilan keputusan yang konsisten
- Rencana aksi 90 hari yang terukur

## Mengapa Kebanyakan Strategi Gagal?

Karena dirancang dari ekspektasi, bukan dari realita diri. Langkah ini akan membalikkan itu.`,
      },
      {
        id: "10-4",
        title: "Langkah 4: Membangun Momentum Jangka Panjang",
        description:
          "Perubahan sejati bukan sprint, melainkan maraton. Pelajari cara menjaga api transformasi tetap menyala.",
        type: "article",
        youtubeId: null,
        access: "free",
        duration: "12 menit baca",
        body: `## Momentum adalah Segalanya

Setelah Anda memiliki kesadaran diri, memahami emosi, dan merancang strategi — tantangan sesungguhnya baru dimulai: mempertahankan momentum di tengah kehidupan nyata.

## Tiga Musuh Momentum

1. **Perfeksionisme** — "Kalau tidak sempurna, lebih baik tidak usah."
2. **Perbandingan** — "Orang lain sudah jauh lebih maju dari saya."
3. **Ketidaksabaran** — "Sudah seminggu tapi belum ada perubahan."

Ketiga musuh ini ada di dalam kepala Anda — bukan di luar.

## Sistem Perayaan Kecil

Otak Anda butuh sinyal positif untuk terus bergerak. Setiap kali Anda menyelesaikan satu langkah kecil, rayakan — sekecil apapun itu.

## Komitmen Terakhir

Anda telah menyelesaikan seluruh seri ini. Ini bukan akhir — ini adalah *awal yang sesungguhnya*.

Perjalanan transformasi diri bukan tentang mencapai kesempurnaan. Ini tentang terus bergerak, satu langkah setiap harinya.

---

Selamat. Sertifikat Anda sudah menunggu.

> "Konsistensi kecil yang dilakukan terus-menerus akan selalu mengalahkan intensitas besar yang sporadis."
> — Dr. Heru K. Wibawa`,
      },
    ],
  },
];
