const STORAGE_KEY = "hidup_progress_v1";

type ProgressStore = {
  completed: Record<string, string>; // id -> ISO date string
  paid: string[];                    // paid content/step IDs
};

function load(): ProgressStore {
  if (typeof window === "undefined") return { completed: {}, paid: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, paid: [] };
    const data = JSON.parse(raw) as Partial<ProgressStore>;
    return { completed: data.completed ?? {}, paid: data.paid ?? [] };
  } catch {
    return { completed: {}, paid: [] };
  }
}

function save(data: ProgressStore): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

/** Mark a content/step as completed. Returns the completion Date. */
export function markCompleted(id: string): Date {
  const data = load();
  if (!data.completed[id]) {
    data.completed[id] = new Date().toISOString();
    save(data);
  }
  return new Date(data.completed[id]);
}

/** Check if a content/step is completed. */
export function isCompleted(id: string): boolean {
  return !!load().completed[id];
}

/** Get the completion date or null. */
export function getCompletionDate(id: string): Date | null {
  const d = load().completed[id];
  return d ? new Date(d) : null;
}

/** Mark a content/step as paid (client-side demo only). */
export function markPaid(id: string): void {
  const data = load();
  if (!data.paid.includes(id)) {
    data.paid.push(id);
    save(data);
  }
}

/** Check if a content/step has been paid (client-side demo only). */
export function isPaid(id: string): boolean {
  return load().paid.includes(id);
}

/** Get all completed IDs as a Set. */
export function getCompletedSet(): Set<string> {
  return new Set(Object.keys(load().completed));
}

/** Get all paid IDs as a Set. */
export function getPaidSet(): Set<string> {
  return new Set(load().paid);
}
