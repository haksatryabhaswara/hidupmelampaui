"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Mail, MessageSquare, CheckCircle, Clock, ChevronDown } from "lucide-react";

interface ContactMessage {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  createdAt: string;
  read?: boolean;
  source?: string;
}

export default function AdminPesanPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("Semua");
  const [readFilter, setReadFilter] = useState("Semua");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, "contacts"), orderBy("createdAt", "desc")))
      .then((snap) => {
        setMessages(snap.docs.map((d) => ({ ...(d.data() as Omit<ContactMessage, "id">), id: d.id })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleRead = async (msg: ContactMessage) => {
    try {
      await updateDoc(doc(db, "contacts", msg.id), { read: !msg.read });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
      );
    } catch {
      // silent fail
    }
  };

  const topics = ["Semua", ...Array.from(new Set(messages.map((m) => m.topic ?? "Lainnya").filter(Boolean)))];

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.firstName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q);
    const matchTopic = topicFilter === "Semua" || (m.topic ?? "Lainnya") === topicFilter;
    const matchRead =
      readFilter === "Semua" ||
      (readFilter === "Belum Dibaca" && !m.read) ||
      (readFilter === "Sudah Dibaca" && m.read);
    return matchSearch && matchTopic && matchRead;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Pesan Masuk</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                {unreadCount} baru
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{messages.length} pesan total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Cari nama, email, atau pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          />
        </div>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none"
        >
          {topics.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none"
        >
          <option>Semua</option>
          <option>Belum Dibaca</option>
          <option>Sudah Dibaca</option>
        </select>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <MessageSquare className="w-12 h-12 mx-auto opacity-20 mb-3" />
          <p>Tidak ada pesan ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`bg-[var(--card)] border rounded-xl overflow-hidden transition-all ${
                !msg.read ? "border-[var(--primary)]/50 shadow-sm" : "border-[var(--border)]"
              }`}
            >
              {/* Row Header */}
              <div
                className="flex items-start gap-3 p-4 cursor-pointer select-none hover:bg-[var(--muted)]/20 transition-colors"
                onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
              >
                {/* Unread dot */}
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!msg.read ? "bg-[var(--primary)]" : "bg-transparent border border-[var(--border)]"}`} />

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {(msg.firstName?.[0] ?? "?").toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[var(--foreground)] text-sm">
                      {msg.firstName} {msg.lastName ?? ""}
                    </p>
                    {msg.topic && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-xs">{msg.topic}</span>
                    )}
                    {msg.source === "home" && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs">Beranda</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {msg.email}
                    {msg.phone && <span className="ml-2">· {msg.phone}</span>}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1.5 line-clamp-1">{msg.message}</p>
                </div>

                <div className="flex-shrink-0 text-right space-y-1">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </p>
                  <ChevronDown className={`w-4 h-4 text-[var(--muted-foreground)] ml-auto transition-transform ${expanded === msg.id ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expanded Body */}
              {expanded === msg.id && (
                <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[var(--border)]">
                  <div className="pt-4">
                    <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">Pesan</p>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap bg-[var(--muted)]/30 rounded-lg p-4">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString("id-ID") : "Waktu tidak diketahui"}
                    </p>
                    <div className="flex gap-2">
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          <Mail className="w-3.5 h-3.5" /> Balas Email
                        </a>
                      )}
                      <button
                        onClick={() => toggleRead(msg)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          msg.read
                            ? "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                            : "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {msg.read ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
