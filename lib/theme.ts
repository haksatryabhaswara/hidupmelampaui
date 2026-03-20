import { useSyncExternalStore, useCallback } from "react";

type Theme = "light" | "dark";

// Module-level state — shared across all hook instances, no React context needed.
let _theme: Theme = "light";
const _listeners = new Set<() => void>();

// Initialize from localStorage on the client (module executes once).
if (typeof window !== "undefined") {
  _theme = (localStorage.getItem("theme") as Theme | null) ?? "light";
  if (_theme === "dark") document.documentElement.classList.add("dark");
}

function subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

export function useTheme() {
  // getServerSnapshot always returns "light" so SSR HTML always renders the Moon icon.
  // On the client, useSyncExternalStore first reconciles with the server snapshot (no mismatch),
  // then transitions to the live _theme value in a single clean post-hydration render.
  const theme = useSyncExternalStore(subscribe, () => _theme, () => "light" as Theme);

  const setTheme = useCallback((t: Theme) => {
    _theme = t;
    try { localStorage.setItem("theme", t); } catch (_) { /* private browsing */ }
    document.documentElement.classList.toggle("dark", t === "dark");
    _listeners.forEach(l => l());
  }, []);

  return { theme, setTheme };
}

// Returns false on the server and on the first hydration pass (matching server HTML),
// then true after hydration — used to defer theme-sensitive icon rendering.
export function useIsClient() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}
