"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb, ChevronDown, ChevronUp, X,
  ChevronLeft, ChevronRight, Play,
} from "lucide-react";

// lucide-react dropped brand icons — inline the YouTube SVG directly
function YtIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export interface CopilotStep {
  id: string;    // matches data-copilot="id" on the target element in the page
  title: string;
  desc: string;
}

interface AdminCopilotProps {
  pageTitle: string;
  steps: CopilotStep[];
  youtubeUrl?: string | null;
  storageKey: string;
}

interface Rect { x: number; y: number; w: number; h: number }

const PAD = 12; // px breathing room around the highlighted element

function tooltipStyle(s: Rect): React.CSSProperties {
  const VW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const VH = typeof window !== "undefined" ? window.innerHeight : 800;
  const W = Math.min(360, VW - 24);
  const H_EST = 210;
  const GAP = 14;

  const left = Math.max(12, Math.min(s.x + s.w / 2 - W / 2, VW - W - 12));
  const belowTop = s.y + s.h + GAP;
  const aboveTop = s.y - GAP - H_EST;
  const top = belowTop + H_EST < VH - 12 ? belowTop : Math.max(8, aboveTop);

  return { position: "fixed", top, left, width: W, zIndex: 201 };
}

export function AdminCopilot({ pageTitle, steps, youtubeUrl, storageKey }: AdminCopilotProps) {
  const lsKey = `copilot-dismissed-${storageKey}`;

  const [dismissed, setDismissed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [spotlight, setSpotlight] = useState<Rect | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(lsKey) === "true");
  }, [lsKey]);

  const syncSpotlight = useCallback((idx: number) => {
    const el = document.querySelector<HTMLElement>(`[data-copilot="${steps[idx]?.id}"]`);
    if (!el) return;
    const snap = () => {
      const r = el.getBoundingClientRect();
      setSpotlight({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 });
    };
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    snap();
    // re-snap after smooth scroll settles
    const t1 = setTimeout(snap, 380);
    const t2 = setTimeout(snap, 680);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [steps]);

  const startTour = useCallback(() => {
    setTourStep(0);
    syncSpotlight(0);
  }, [syncSpotlight]);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= steps.length) return;
    setTourStep(idx);
    syncSpotlight(idx);
  }, [steps.length, syncSpotlight]);

  const stopTour = useCallback(() => {
    setTourStep(null);
    setSpotlight(null);
  }, []);

  // Re-sync spotlight on any scroll (capture phase catches scrolls inside overflow containers)
  useEffect(() => {
    if (tourStep === null) return;
    const id = steps[tourStep]?.id;
    const handler = () => {
      const el = document.querySelector<HTMLElement>(`[data-copilot="${id}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSpotlight({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 });
    };
    window.addEventListener("scroll", handler, { passive: true, capture: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [tourStep, steps]);

  // Keyboard shortcuts
  useEffect(() => {
    if (tourStep === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopTour();
      if (e.key === "ArrowRight") goTo(tourStep + 1);
      if (e.key === "ArrowLeft") goTo(tourStep - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tourStep, stopTour, goTo]);

  const dismiss = () => {
    localStorage.setItem(lsKey, "true");
    setDismissed(true);
    stopTour();
  };

  const restore = () => {
    localStorage.removeItem(lsKey);
    setDismissed(false);
    setPanelOpen(true);
  };

  const isLastStep = tourStep === steps.length - 1;

  return (
    <>
      {/* ── Tour overlay ─────────────────────────────────────────── */}
      {tourStep !== null && spotlight && (
        <>
          {/* SVG spotlight cutout */}
          <svg
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 200 }}
            aria-hidden
          >
            <defs>
              <mask id={`copilot-mask-${storageKey}`}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={spotlight.x} y={spotlight.y}
                  width={spotlight.w} height={spotlight.h}
                  rx="14" fill="black"
                />
              </mask>
            </defs>
            {/* dimmed overlay with hole */}
            <rect
              x="0" y="0" width="100%" height="100%"
              fill="rgba(0,0,0,0.55)"
              mask={`url(#copilot-mask-${storageKey})`}
            />
            {/* golden ring */}
            <rect
              x={spotlight.x} y={spotlight.y}
              width={spotlight.w} height={spotlight.h}
              rx="14" fill="none"
              stroke="rgb(251,191,36)" strokeWidth="2.5"
            />
          </svg>

          {/* Tooltip card */}
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-4 space-y-3"
            style={tooltipStyle(spotlight)}
          >
            {/* Row: step counter + close */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Langkah {tourStep + 1} / {steps.length}
              </span>
              <button
                onClick={stopTour}
                title="Tutup tur"
                className="p-1 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  title={steps[i].title}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === tourStep
                      ? "w-5 bg-[var(--primary)]"
                      : i < tourStep
                      ? "w-1.5 bg-[var(--primary)]/40"
                      : "w-1.5 bg-[var(--border)] hover:bg-[var(--muted-foreground)]"
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {steps[tourStep].title}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  {steps[tourStep].desc}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={() => goTo(tourStep - 1)}
                disabled={tourStep === 0}
                className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 px-2 py-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
              </button>

              {isLastStep ? (
                <button
                  onClick={stopTour}
                  className="flex items-center gap-1.5 text-xs bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 font-semibold transition-opacity"
                >
                  Selesai
                </button>
              ) : (
                <button
                  onClick={() => goTo(tourStep + 1)}
                  className="flex items-center gap-1.5 text-xs bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 font-semibold transition-opacity"
                >
                  Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* YouTube CTA on last step */}
            {youtubeUrl && isLastStep && (
              <div className="pt-1 border-t border-[var(--border)]">
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                >
                  <YtIcon className="w-4 h-4" />
                  Tonton Tutorial di YouTube
                </a>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Panel (in page flow) ─────────────────────────────────── */}
      {dismissed ? (
        <button
          onClick={restore}
          className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--card)] transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Tampilkan panduan
        </button>
      ) : (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Panduan: {pageTitle}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPanelOpen((o) => !o)}
                title={panelOpen ? "Ciutkan" : "Perluas"}
                className="p-1.5 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                {panelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={dismiss}
                title="Tutup panduan"
                className="p-1.5 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {panelOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-amber-200 dark:border-amber-800/40 pt-3">
              {/* Step list */}
              <div className="space-y-2.5">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{step.title}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={startTour}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Play className="w-3.5 h-3.5" /> Mulai Tur Halaman
                </button>
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <YtIcon className="w-3.5 h-3.5 text-red-500" />
                    Tutorial YouTube
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
