"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Shield, User, ChevronDown } from "lucide-react";
import type { UserRole } from "@/lib/auth-context";

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
}

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    getDocs(collection(db, "users"))
      .then((snap) => {
        const list = snap.docs.map((d) => d.data() as UserRecord);
        // Sort client-side so docs without createdAt are still included
        list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        setUsers(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setUpdatingRole(uid);
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
    } catch {
      alert("Gagal mengubah peran pengguna.");
    }
    setUpdatingRole(null);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Manajemen Pengguna</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <User className="w-12 h-12 mx-auto opacity-20 mb-3" />
          <p>Tidak ada pengguna ditemukan.</p>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Pengguna</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Bergabung</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Peran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((user) => (
                  <tr key={user.uid} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {(user.displayName?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                        </div>
                        <p className="font-medium text-[var(--foreground)]">{user.displayName || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{user.email}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={user.role}
                          disabled={updatingRole === user.uid}
                          onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                            user.role === "admin"
                              ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                              : "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]"
                          } disabled:opacity-60`}
                        >
                          <option value="general">Pengguna Umum</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--muted-foreground)]" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
