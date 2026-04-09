"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressStore = {
  completed: Record<string, string>; // contentId / stepId → ISO date
  started: Record<string, string>;   // contentId → ISO date of first visit
  paid: string[];
};

// ─── localStorage (guest fallback) ───────────────────────────────────────────

const LOCAL_KEY = "hidup_progress_v1";

function localLoad(): ProgressStore {
  if (typeof window === "undefined") return { completed: {}, started: {}, paid: [] };
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { completed: {}, started: {}, paid: [] };
    const d = JSON.parse(raw) as Partial<ProgressStore>;
    return { completed: d.completed ?? {}, started: d.started ?? {}, paid: d.paid ?? [] };
  } catch {
    return { completed: {}, started: {}, paid: [] };
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

function localMarkStarted(id: string): void {
  const d = localLoad();
  if (!d.started[id]) { d.started[id] = new Date().toISOString(); localSave(d); }
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
      return { completed: d.completed ?? {}, started: d.started ?? {}, paid: d.paid ?? [] };
    }
    // First sign-in: migrate any existing localStorage data into Firestore.
    const local = localLoad();
    await setDoc(progressRef(uid), local);
    return local;
  } catch {
    return { completed: {}, started: {}, paid: [] };
  }
}

async function fsMarkCompleted(uid: string, id: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    await updateDoc(progressRef(uid), { [`completed.${id}`]: now });
  } catch {
    // Document didn't exist yet — create it.
    await setDoc(progressRef(uid), { completed: { [id]: now }, started: {}, paid: [] });
  }
}

async function fsMarkStarted(uid: string, id: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    await updateDoc(progressRef(uid), { [`started.${id}`]: now });
  } catch {
    await setDoc(progressRef(uid), { completed: {}, started: { [id]: now }, paid: [] });
  }
}

async function fsMarkPaid(uid: string, id: string): Promise<void> {
  try {
    await updateDoc(progressRef(uid), { paid: arrayUnion(id) });
  } catch {
    await setDoc(progressRef(uid), { completed: {}, started: {}, paid: [id] });
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type ProgressState = {
  completed: Set<string>;
  started: Set<string>;
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
    () => ({ completed: new Set(), started: new Set(), paid: new Set(), loading: true }),
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = user ? await fsLoad(user.uid) : localLoad();
      if (!cancelled) {
        setState({
          completed: new Set(Object.keys(data.completed)),
          started: new Set(Object.keys(data.started)),
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

  const markStarted = useCallback(async (id: string) => {
    setState(prev => {
      if (prev.started.has(id)) return prev;
      return { ...prev, started: new Set([...prev.started, id]) };
    });
    if (user) {
      await fsMarkStarted(user.uid, id);
    } else {
      localMarkStarted(id);
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
    started: state.started,
    paid: state.paid,
    progressLoading: state.loading,
    markCompleted,
    markStarted,
    markPaid,
  };
}
