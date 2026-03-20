export type ContentAccess = "free" | "login" | "paid";

export type Content = {
  id: string;
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
};

export const allContents: Content[] = [
  {
    id: "1",
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
];
