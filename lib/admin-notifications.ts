"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// localStorage keys for "last acknowledged total count"
const LS_KEYS = {
  scri36: "admin_notif_scri36",
  scri72: "admin_notif_scri72",
  tests: "admin_notif_tests",
  users: "admin_notif_users",
} as const;

export interface AdminNotifCounts {
  pesan: number;
  scri36: number;
  scri72: number;
  tests: number;
  users: number;
  total: number;
}

function getStoredCount(key: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(key) ?? "0", 10);
}

function setStoredCount(key: string, value: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, String(value));
}

export function markAsSeen(key: keyof typeof LS_KEYS, count: number) {
  setStoredCount(LS_KEYS[key], count);
}

export function markAllSeen(counts: AdminNotifCounts) {
  setStoredCount(LS_KEYS.scri36, counts.scri36 + getStoredCount(LS_KEYS.scri36));
  setStoredCount(LS_KEYS.scri72, counts.scri72 + getStoredCount(LS_KEYS.scri72));
  setStoredCount(LS_KEYS.tests, counts.tests + getStoredCount(LS_KEYS.tests));
  setStoredCount(LS_KEYS.users, counts.users + getStoredCount(LS_KEYS.users));
}

export function useAdminNotifications(pathname: string): AdminNotifCounts {
  const [counts, setCounts] = useState<AdminNotifCounts>({
    pesan: 0,
    scri36: 0,
    scri72: 0,
    tests: 0,
    users: 0,
    total: 0,
  });

  const latestTotals = useRef<{
    scri36: number;
    scri72: number;
    tests: number;
    users: number;
  }>({ scri36: 0, scri72: 0, tests: 0, users: 0 });

  // Fetch fresh counts from Firestore on mount and every 60s
  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      try {
        const [
          pesanSnap,
          scri36Snap,
          scri72Snap,
          testsSnap,
          usersSnap,
        ] = await Promise.all([
          getCountFromServer(
            query(collection(db, "contacts"), where("read", "==", false))
          ),
          getCountFromServer(collection(db, "scri_results")),
          getCountFromServer(collection(db, "scri72_results")),
          getCountFromServer(collection(db, "content_test_answers")),
          getCountFromServer(collection(db, "users")),
        ]);

        if (cancelled) return;

        const scri36Total = scri36Snap.data().count;
        const scri72Total = scri72Snap.data().count;
        const testsTotal = testsSnap.data().count;
        const usersTotal = usersSnap.data().count;

        latestTotals.current = { scri36: scri36Total, scri72: scri72Total, tests: testsTotal, users: usersTotal };

        const newCounts: AdminNotifCounts = {
          pesan: pesanSnap.data().count,
          scri36: Math.max(0, scri36Total - getStoredCount(LS_KEYS.scri36)),
          scri72: Math.max(0, scri72Total - getStoredCount(LS_KEYS.scri72)),
          tests: Math.max(0, testsTotal - getStoredCount(LS_KEYS.tests)),
          users: Math.max(0, usersTotal - getStoredCount(LS_KEYS.users)),
          total: 0,
        };
        newCounts.total =
          newCounts.pesan +
          newCounts.scri36 +
          newCounts.scri72 +
          newCounts.tests +
          newCounts.users;

        setCounts(newCounts);
      } catch {
        // Silently ignore — notifications are best-effort
      }
    }

    void fetchCounts();
    const interval = setInterval(() => void fetchCounts(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Clear badges when admin navigates to the relevant section
  useEffect(() => {
    const t = latestTotals.current;

    if (pathname === "/admin/pesan") {
      // "pesan" is cleared via Firestore `read` field — no localStorage needed
    }
    if (
      pathname === "/admin/scri" ||
      pathname.startsWith("/admin/scri/")
    ) {
      if (t.scri36 > 0) {
        setStoredCount(LS_KEYS.scri36, t.scri36);
        setCounts((prev) => {
          const newTotal = prev.total - prev.scri36;
          return { ...prev, scri36: 0, total: newTotal };
        });
      }
    }
    if (pathname.startsWith("/admin/scri72")) {
      if (t.scri72 > 0) {
        setStoredCount(LS_KEYS.scri72, t.scri72);
        setCounts((prev) => {
          const newTotal = prev.total - prev.scri72;
          return { ...prev, scri72: 0, total: newTotal };
        });
      }
    }
    if (pathname.startsWith("/admin/konten")) {
      if (t.tests > 0) {
        setStoredCount(LS_KEYS.tests, t.tests);
        setCounts((prev) => {
          const newTotal = prev.total - prev.tests;
          return { ...prev, tests: 0, total: newTotal };
        });
      }
    }
    if (pathname === "/admin/pengguna") {
      if (t.users > 0) {
        setStoredCount(LS_KEYS.users, t.users);
        setCounts((prev) => {
          const newTotal = prev.total - prev.users;
          return { ...prev, users: 0, total: newTotal };
        });
      }
    }
  }, [pathname]);

  return counts;
}
