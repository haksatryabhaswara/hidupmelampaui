export type DokumenAccess = "free" | "login" | "paid";

export type DokumenFileType = "pdf" | "docx" | "pptx" | "doc" | "ppt";

export type Dokumen = {
  id: string;
  title: string;
  /** HTML content from rich text editor */
  description: string;
  category: string;
  access: DokumenAccess;
  /** price in IDR — required when access === "paid" */
  price?: number;
  /** Firebase Storage download URL */
  fileUrl: string;
  fileName: string;
  fileType: DokumenFileType;
  /** File size in bytes */
  fileSize: number;
  createdAt: number;
  updatedAt: number;
};

export const DOKUMEN_CATEGORIES = [
  "Pengembangan Diri",
  "Kepemimpinan",
  "Spiritual",
  "Gen Z",
  "Korporat",
  "Konseling",
  "Lainnya",
];

export const ALLOWED_MIME_TYPES: Record<string, DokumenFileType> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

export const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileTypeLabel(type: DokumenFileType): string {
  return type.toUpperCase();
}
