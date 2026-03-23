"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressStore = {
  completed: Record<string, string>; // contentId / stepId → ISO date
  paid: string[];
};

// ─── localStorage (guest fallback) ───────────────────────────────────────────

const LOCAL_KEY = "hidup_progress_v1";

function localLoad(): ProgressStore {
  if (typeof window === "undefined") return { completed: {}, paid: [] };
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { completed: {}, paid: [] };
    const d = JSON.parse(raw) as Partial<ProgressStore>;
    return { completed: d.completed ?? {}, paid: d.paid ?? [] };
  } catch {
    return { completed: {}, paid: [] };
  }
}

function localSave(data: ProgressStore): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
}

function localMarkCompleted(id: string): void {
  const d = localLoad();
  if (!d.completed[id]) { d.completed[id] = new Date().toISOString(); localSave(d); }
}

function localMarkPaid(id: string): void {
  const d = localLoad();
  if (!d.paid.includes(id)) { d.paid.push(id); localSave(d); }
}

// ─── Firestore (authenticated users) ─────────────────────────────────────────

function progressRef(uid: string) {
  return doc(db, "progress", uid);
}

async function fsLoad(uid: string): Promise<ProgressStore> {
  try {
    const snap = await getDoc(progressRef(uid));
    if (snap.exists()) {
      const d = snap.data() as Partial<ProgressStore>;
      return { completed: d.completed ?? {}, paid: d.paid ?? [] };
    }
    // First sign-in: migrate any existing localStorage data into Firestore.
    const local = localLoad();
    await setDoc(progressRef(uid), local);
    return local;
  } catch {
    return { completed: {}, paid: [] };
  }
}

async function fsMarkCompleted(uid: string, id: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    await updateDoc(progressRef(uid), { [`completed.${id}`]: now });
  } catch {
    // Document didn't exist yet — create it.
    await setDoc(progressRef(uid), { completed: { [id]: now }, paid: [] });
  }
}

async function fsMarkPaid(uid: string, id: string): Promise<void> {
  try {
    await updateDoc(progressRef(uid), { paid: arrayUnion(id) });
  } catch {
    await setDoc(progressRef(uid), { completed: {}, paid: [id] });
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type ProgressState = {
  completed: Set<string>;
  paid: Set<string>;
  loading: boolean;
};

/**
 * Manages progress state backed by Firestore for authenticated users,
 * falling back to localStorage for guests. Migrates localStorage data to
 * Firestore automatically on first sign-in.
 */
export function useProgress(user: User | null) {
  const [state, setState] = useState<ProgressState>(
    () => ({ completed: new Set(), paid: new Set(), loading: true }),
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = user ? await fsLoad(user.uid) : localLoad();
      if (!cancelled) {
        setState({
          completed: new Set(Object.keys(data.completed)),
          paid: new Set(data.paid),
          loading: false,
        });
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const markCompleted = useCallback(async (id: string) => {
    // Optimistic update so UI reflects immediately.
    setState(prev => ({ ...prev, completed: new Set([...prev.completed, id]) }));
    if (user) {
      await fsMarkCompleted(user.uid, id);
    } else {
      localMarkCompleted(id);
    }
  }, [user]);

  const markPaid = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, paid: new Set([...prev.paid, id]) }));
    if (user) {
      await fsMarkPaid(user.uid, id);
    } else {
      localMarkPaid(id);
    }
  }, [user]);

  return {
    completed: state.completed,
    paid: state.paid,
    progressLoading: state.loading,
    markCompleted,
    markPaid,
  };
}
