"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, arrayUnion, collection, getDocs, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressStore = {
  completed: Record<string, string>; // contentId / stepId → ISO date
  started: Record<string, string>;   // contentId → ISO date of first visit
  paid: string[];
};

/** Stored per-user per-devotion-content document in Firestore: progress/{uid}/devotion/{contentId} */
export type DevotionProgress = {
  contentId: string;
  contentSlug: string;
  contentTitle: string;
  /** ISO date string of when the user first started this devotion series */
  startedAt: string;
  /** The last day number the user opened/read */
  lastReadDay: number;
  /** Set of day numbers the user has marked as read */
  completedDays: number[];
  /** YYYY-MM-DD of the last calendar day a day was marked read — enforces one-day-per-calendar-day limit */
  lastReadDate?: string;
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

// ─── Devotion progress (Firestore only — requires login) ─────────────────────

function devotionRef(uid: string, contentId: string) {
  return doc(db, "progress", uid, "devotion", contentId);
}

// ─── Last-read step (Firestore only — requires login) ─────────────────────────

function lastReadRef(uid: string, contentId: string) {
  return doc(db, "progress", uid, "lastRead", contentId);
}

export async function getLastReadStep(uid: string, contentId: string): Promise<string | null> {
  try {
    const snap = await getDoc(lastReadRef(uid, contentId));
    if (snap.exists()) {
      const data = snap.data() as { stepId?: string };
      return data.stepId ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveLastReadStep(uid: string, contentId: string, stepId: string): Promise<void> {
  try {
    await setDoc(lastReadRef(uid, contentId), { stepId, savedAt: new Date().toISOString() }, { merge: true });
  } catch {
    // Best-effort; ignore network/permission errors silently
  }
}

export async function getLastReadHeading(uid: string, contentId: string): Promise<string | null> {
  try {
    const snap = await getDoc(lastReadRef(uid, contentId));
    if (snap.exists()) {
      const data = snap.data() as { headingId?: string };
      return data.headingId ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveLastReadHeading(uid: string, contentId: string, headingId: string): Promise<void> {
  try {
    await setDoc(lastReadRef(uid, contentId), { headingId, savedAt: new Date().toISOString() }, { merge: true });
  } catch {
    // Best-effort
  }
}

export async function clearLastReadHeading(uid: string, contentId: string): Promise<void> {
  try {
    await updateDoc(lastReadRef(uid, contentId), { headingId: deleteField() });
  } catch {
    // Best-effort; ignore if doc doesn't exist
  }
}

export async function getDevotionProgress(uid: string, contentId: string): Promise<DevotionProgress | null> {
  try {
    const snap = await getDoc(devotionRef(uid, contentId));
    if (snap.exists()) return snap.data() as DevotionProgress;
    return null;
  } catch {
    return null;
  }
}

export async function getAllDevotionProgress(uid: string): Promise<DevotionProgress[]> {
  try {
    const snap = await getDocs(collection(db, "progress", uid, "devotion"));
    return snap.docs.map((d) => d.data() as DevotionProgress);
  } catch {
    return [];
  }
}

export async function startDevotionProgress(
  uid: string,
  contentId: string,
  contentSlug: string,
  contentTitle: string,
): Promise<DevotionProgress> {
  const existing = await getDevotionProgress(uid, contentId);
  if (existing) return existing;
  const prog: DevotionProgress = {
    contentId,
    contentSlug,
    contentTitle,
    startedAt: new Date().toISOString(),
    lastReadDay: 1,
    completedDays: [],
  };
  await setDoc(devotionRef(uid, contentId), prog);
  return prog;
}

export async function markDevotionDayRead(
  uid: string,
  contentId: string,
  day: number,
): Promise<void> {
  const todayDate = new Date().toISOString().split("T")[0];
  try {
    await updateDoc(devotionRef(uid, contentId), {
      lastReadDay: day,
      completedDays: arrayUnion(day),
      lastReadDate: todayDate,
    });
  } catch {
    // doc may not exist yet — ignore silently; caller should startDevotionProgress first
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
