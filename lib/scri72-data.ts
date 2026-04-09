export const DIMENSIONS_72 = [
  { id: "self_awareness", label: "Self Awareness" },
  { id: "emotional_regulation", label: "Emotional Regulation" },
  { id: "discipline_growth", label: "Discipline & Growth" },
  { id: "relational_presence", label: "Relational Presence" },
  { id: "value_alignment", label: "Value Alignment" },
  { id: "generational_orientation", label: "Generational Orientation" },
] as const;

export type DimensionId72 = (typeof DIMENSIONS_72)[number]["id"];

export interface ScriQuestion72 {
  id: string;
  dimension: DimensionId72;
  text: string;
  order: number;
  createdAt?: string;
}

export interface ScriScoring72 {
  id: string;
  minScore: number;
  maxScore: number;
  label: string;
  message: string;
  order: number;
}

export const ANSWER_SCALE_72 = [
  { value: 1, label: "Sangat Tidak Sesuai" },
  { value: 2, label: "Kurang Sesuai" },
  { value: 3, label: "Cukup Sesuai" },
  { value: 4, label: "Sesuai" },
  { value: 5, label: "Sangat Sesuai" },
] as const;

// Max score = 72 questions × 5 = 360
export const INITIAL_SCORING_72: Omit<ScriScoring72, "id">[] = [
  {
    minScore: 0,
    maxScore: 144,
    label: "Automatic Living Dominant",
    message:
      "Anda masih beroperasi secara otomatis, dikendalikan oleh kebiasaan dan pola lama yang belum disadari sepenuhnya. Ini adalah titik awal yang penting — kesadaran bahwa ada ruang untuk tumbuh adalah langkah pertama yang berani.",
    order: 1,
  },
  {
    minScore: 145,
    maxScore: 180,
    label: "Awakening Stage",
    message:
      "Anda mulai sadar akan pola-pola dalam diri Anda dan sedang dalam proses kebangkitan kesadaran diri. Sesuatu dalam diri Anda telah terbangun — teruslah bergerak ke arah cahaya itu.",
    order: 2,
  },
  {
    minScore: 181,
    maxScore: 240,
    label: "Growth Stage",
    message:
      "Anda sedang dalam tahap pertumbuhan aktif, mengembangkan kapasitas diri dan membangun kebiasaan baru yang lebih sehat. Pertumbuhan membutuhkan konsistensi — dan Anda sudah berada di jalur yang tepat.",
    order: 3,
  },
  {
    minScore: 241,
    maxScore: 300,
    label: "Presence Stage",
    message:
      "Anda hadir dengan penuh dalam kehidupan, memimpin diri sendiri dengan kesadaran dan ketenangan yang semakin kuat. Kehadiran Anda mulai dirasakan oleh orang-orang di sekitar Anda sebagai kekuatan.",
    order: 4,
  },
  {
    minScore: 301,
    maxScore: 340,
    label: "Actualisation Stage",
    message:
      "Anda sudah mengaktualisasikan potensi diri dengan baik dan memberi dampak nyata bagi orang-orang di sekitar Anda. Anda bukan hanya berkembang untuk diri sendiri — Anda menjadi inspirasi.",
    order: 5,
  },
  {
    minScore: 341,
    maxScore: 360,
    label: "Self-Transcendence Orientation",
    message:
      "Anda telah melampaui ego dan beroperasi dari tempat yang lebih dalam — melayani, menciptakan, dan memberi makna bagi generasi. Ini bukan puncak perjalanan, melainkan undangan untuk terus memperluas dampak Anda.",
    order: 6,
  },
];

export const INITIAL_QUESTIONS_72: Omit<ScriQuestion72, "id">[] = [
  // Self Awareness
  {
    dimension: "self_awareness",
    text: "Saya mampu mengenali emosi saya ketika sedang muncul.",
    order: 1,
  },
  {
    dimension: "self_awareness",
    text: "Saya memahami kekuatan dan kelemahan utama saya dengan jelas.",
    order: 2,
  },
  {
    dimension: "self_awareness",
    text: "Saya tahu nilai-nilai terdalam yang mendasari keputusan hidup saya.",
    order: 3,
  },
  {
    dimension: "self_awareness",
    text: "Saya mampu membedakan antara reaksi emosional dan respons yang disadari.",
    order: 4,
  },
  {
    dimension: "self_awareness",
    text: "Saya menyadari pola pikir yang sering muncul dalam situasi tertekan.",
    order: 5,
  },
  {
    dimension: "self_awareness",
    text: "Saya dapat mendeskripsikan kondisi emosional saya kepada orang lain dengan akurat.",
    order: 6,
  },

  // Emotional Regulation
  {
    dimension: "emotional_regulation",
    text: "Saya mampu menenangkan diri ketika merasa cemas atau tertekan.",
    order: 1,
  },
  {
    dimension: "emotional_regulation",
    text: "Saya tidak mudah terbawa suasana emosional orang lain.",
    order: 2,
  },
  {
    dimension: "emotional_regulation",
    text: "Saya mampu tetap fokus meskipun sedang mengalami tekanan emosional.",
    order: 3,
  },
  {
    dimension: "emotional_regulation",
    text: "Saya dapat mengelola frustrasi tanpa bereaksi berlebihan.",
    order: 4,
  },
  {
    dimension: "emotional_regulation",
    text: "Saya memiliki strategi yang efektif untuk mengelola stres sehari-hari.",
    order: 5,
  },
  {
    dimension: "emotional_regulation",
    text: "Saya mampu bangkit kembali setelah mengalami kegagalan atau kekecewaan.",
    order: 6,
  },

  // Discipline & Growth
  {
    dimension: "discipline_growth",
    text: "Saya konsisten menjalankan rutinitas yang mendukung pertumbuhan saya.",
    order: 1,
  },
  {
    dimension: "discipline_growth",
    text: "Saya menetapkan tujuan yang jelas dan bekerja secara sistematis untuk mencapainya.",
    order: 2,
  },
  {
    dimension: "discipline_growth",
    text: "Saya bersedia keluar dari zona nyaman demi pertumbuhan jangka panjang.",
    order: 3,
  },
  {
    dimension: "discipline_growth",
    text: "Saya secara aktif mencari umpan balik untuk meningkatkan diri.",
    order: 4,
  },
  {
    dimension: "discipline_growth",
    text: "Saya memiliki komitmen kuat untuk terus belajar dan berkembang.",
    order: 5,
  },
  {
    dimension: "discipline_growth",
    text: "Saya menyelesaikan apa yang saya mulai meskipun menghadapi kesulitan.",
    order: 6,
  },

  // Relational Presence
  {
    dimension: "relational_presence",
    text: "Saya hadir sepenuhnya ketika berinteraksi dengan orang lain.",
    order: 1,
  },
  {
    dimension: "relational_presence",
    text: "Saya mampu mendengarkan orang lain tanpa terburu-buru memberikan solusi.",
    order: 2,
  },
  {
    dimension: "relational_presence",
    text: "Saya membangun kepercayaan dalam hubungan melalui kejujuran dan konsistensi.",
    order: 3,
  },
  {
    dimension: "relational_presence",
    text: "Saya mampu merasakan apa yang dibutuhkan orang lain tanpa mereka mengatakannya.",
    order: 4,
  },
  {
    dimension: "relational_presence",
    text: "Saya memberikan perhatian penuh saat seseorang berbicara kepada saya.",
    order: 5,
  },
  {
    dimension: "relational_presence",
    text: "Saya mengelola konflik dalam hubungan dengan cara yang konstruktif.",
    order: 6,
  },

  // Value Alignment
  {
    dimension: "value_alignment",
    text: "Keputusan besar dalam hidup saya mencerminkan nilai-nilai yang saya pegang.",
    order: 1,
  },
  {
    dimension: "value_alignment",
    text: "Saya merasa damai ketika hidup selaras dengan prinsip-prinsip saya.",
    order: 2,
  },
  {
    dimension: "value_alignment",
    text: "Saya tidak mudah berkompromi dengan nilai inti saya meski ada tekanan sosial.",
    order: 3,
  },
  {
    dimension: "value_alignment",
    text: "Pekerjaan atau peran saya saat ini selaras dengan tujuan hidup saya.",
    order: 4,
  },
  {
    dimension: "value_alignment",
    text: "Saya dapat mengartikulasikan dengan jelas apa yang paling penting dalam hidup saya.",
    order: 5,
  },
  {
    dimension: "value_alignment",
    text: "Saya hidup dengan integritas — konsisten antara apa yang saya katakan dan lakukan.",
    order: 6,
  },

  // Generational Orientation
  {
    dimension: "generational_orientation",
    text: "Saya memikirkan dampak jangka panjang dari tindakan saya bagi generasi berikutnya.",
    order: 1,
  },
  {
    dimension: "generational_orientation",
    text: "Saya aktif membagikan kebijaksanaan dan pengalaman kepada generasi yang lebih muda.",
    order: 2,
  },
  {
    dimension: "generational_orientation",
    text: "Saya termotivasi untuk meninggalkan warisan yang bermakna bagi orang banyak.",
    order: 3,
  },
  {
    dimension: "generational_orientation",
    text: "Saya melihat diri saya sebagai bagian dari sesuatu yang lebih besar dari kepentingan pribadi.",
    order: 4,
  },
  {
    dimension: "generational_orientation",
    text: "Saya berkomitmen untuk berkontribusi pada kebaikan masyarakat dan lingkungan.",
    order: 5,
  },
  {
    dimension: "generational_orientation",
    text: "Saya merasa tanggung jawab untuk menjadi teladan bagi orang-orang di sekitar saya.",
    order: 6,
  },
];
