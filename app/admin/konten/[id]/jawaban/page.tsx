"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Content } from "@/lib/content-data";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  User,
  AlignLeft,
  List,
  ChevronDown,
  ChevronUp,
  Calendar,
  Download,
} from "lucide-react";

function exportToCsv(content: Content, answers: AnswerRecord[]) {
  const questions = content.test?.questions ?? [];

  // Build header row
  const headers = [
    "Nama",
    "Email",
    "Tanggal",
    ...questions.map((q, i) => `P${i + 1}: ${q.question.replace(/"/g, "'")}`),
  ];

  const rows = answers.map((r) => {
    const date = r.submittedAt ? r.submittedAt.toDate().toLocaleString("id-ID") : "";
    const answerCols = questions.map((q) => {
      const a = r.answers.find((x) => x.questionId === q.id);
      return a?.answer ?? "";
    });
    return [r.userName || r.userEmail, r.userEmail, date, ...answerCols];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jawaban-tes-${content.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface TestAnswer {
  questionId: string;
  question: string;
  type: "essay" | "option";
  answer: string;
}

interface AnswerRecord {
  id: string;
  contentId: string;
  contentSlug: string;
  userId: string;
  userEmail: string;
  userName: string;
  answers: TestAnswer[];
  submittedAt: { toDate: () => Date } | null;
}

function formatDate(ts: { toDate: () => Date } | null) {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function JawabanKontenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [content, setContent] = useState<Content | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const contentSnap = await getDoc(doc(db, "contents", id));
        if (!contentSnap.exists()) {
          alert("Konten tidak ditemukan.");
          router.replace("/admin/konten");
          return;
        }
        const c = { ...(contentSnap.data() as Content), id: contentSnap.id };
        setContent(c);

        const answersSnap = await getDocs(
          query(
            collection(db, "content_test_answers"),
            where("contentId", "==", id),
          ),
        );
        const records = answersSnap.docs.map((d) => ({
          ...(d.data() as Omit<AnswerRecord, "id">),
          id: d.id,
        }));
        records.sort((a, b) => {
          const aTime = a.submittedAt ? a.submittedAt.toDate().getTime() : 0;
          const bTime = b.submittedAt ? b.submittedAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
        setAnswers(records);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) return null;

  const questions = content.test?.questions ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/admin/konten"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Konten
        </Link>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[var(--foreground)]">Jawaban Tes</h1>
            <p className="text-sm text-[var(--muted-foreground)] truncate max-w-lg">{content.title}</p>
          </div>
          {answers.length > 0 && (
            <button
              type="button"
              onClick={() => exportToCsv(content, answers)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex-shrink-0"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Pengisi</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{answers.length}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Jumlah Pertanyaan</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{questions.length}</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Tes Aktif</p>
          <p className={`text-sm font-semibold mt-1 ${content.test?.enabled ? "text-emerald-600" : "text-[var(--muted-foreground)]"}`}>
            {content.test?.enabled ? "Ya" : "Tidak"}
          </p>
        </div>
      </div>

      {/* Answers list */}
      {answers.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--muted-foreground)]">
          <ClipboardList className="w-12 h-12 mx-auto opacity-20 mb-3" />
          <p className="font-medium">Belum ada jawaban</p>
          <p className="text-sm mt-1">Jawaban akan muncul di sini setelah pengguna mengisi tes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {answers.map((record) => (
            <div
              key={record.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden"
            >
              {/* Record header */}
              <button
                type="button"
                onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--muted)]/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)] text-sm truncate">
                    {record.userName || record.userEmail || record.userId}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{record.userEmail}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(record.submittedAt)}
                  </div>
                  <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full font-medium">
                    {record.answers.length} jawaban
                  </span>
                  {expanded === record.id
                    ? <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" />
                    : <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />}
                </div>
              </button>

              {/* Expanded answers */}
              {expanded === record.id && (
                <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                  <div className="flex items-center gap-1.5 px-5 py-2 text-xs text-[var(--muted-foreground)] sm:hidden">
                    <Calendar className="w-3 h-3" />
                    {formatDate(record.submittedAt)}
                  </div>
                  {record.answers.map((a, idx) => (
                    <div key={a.questionId} className="px-5 py-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              a.type === "essay"
                                ? "bg-blue-100 dark:bg-blue-950/40 text-blue-600"
                                : "bg-purple-100 dark:bg-purple-950/40 text-purple-600"
                            }`}>
                              {a.type === "essay"
                                ? <AlignLeft className="w-2.5 h-2.5" />
                                : <List className="w-2.5 h-2.5" />}
                              {a.type === "essay" ? "Esai" : "Pilihan Ganda"}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{a.question}</p>
                          {a.answer ? (
                            a.type === "option" ? (
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {a.answer}
                                </span>
                                <span className="text-sm text-[var(--foreground)]">
                                  {questions
                                    .find((q) => q.id === a.questionId)
                                    ?.options?.find((o) => o.label === a.answer)?.text ?? ""}
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-[var(--foreground)] bg-[var(--muted)]/40 rounded-lg px-3 py-2 whitespace-pre-wrap">
                                {a.answer}
                              </p>
                            )
                          ) : (
                            <p className="text-sm text-[var(--muted-foreground)] italic">Tidak dijawab</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
