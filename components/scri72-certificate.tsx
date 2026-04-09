"use client";

import { X, Download, Star } from "lucide-react";
import { DIMENSIONS_72 } from "@/lib/scri72-data";

type Scri72CertificateProps = {
  userName: string;
  totalScore: number;
  maxScore: number;
  scoringLabel: string;
  dimensionScores: Record<string, number>;
  completedAt: Date;
  onClose: () => void;
};

function genScri72CertNumber(userName: string, score: number): string {
  const base = `SCRI72-${userName}-${score}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) {
    h = Math.imul(31, h) + base.charCodeAt(i) | 0;
  }
  return `SCRI72-${Math.abs(h).toString(36).toUpperCase().padStart(8, "0")}`;
}

function buildScri72PrintHTML(
  name: string,
  totalScore: number,
  maxScore: number,
  scoringLabel: string,
  dimensionScores: Record<string, number>,
  date: string,
  certNum: string,
): string {
  const activeDims = DIMENSIONS_72.filter((dim) => (dimensionScores[dim.id] ?? 0) > 0);
  const activeDimCount = activeDims.length || DIMENSIONS_72.length;
  const maxPerDim = Math.round(maxScore / activeDimCount);
  const dimRows = activeDims.map((dim) => {
    const score = dimensionScores[dim.id] ?? 0;
    const pct = Math.min(100, Math.round((score / maxPerDim) * 100));
    return `<div style="margin-bottom:6px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
        <span style="font-size:10px;color:#475569;">${dim.label}</span>
        <span style="font-size:10px;font-weight:700;color:#6d28d9;">${score}/${maxPerDim}</span>
      </div>
      <div style="height:4px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7c3aed,#a855f7);border-radius:3px;"></div>
      </div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Sertifikat SCRI-72 — ${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f1f5f9; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .cert { max-width: 860px; width: 100%; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .header { background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%); padding: 28px 48px; display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 15px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; }
  .tagline { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #c4b5fd; margin-top: 4px; }
  .seal { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .body { padding: 36px 48px 28px; }
  .top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
  .left { flex: 0 0 220px; text-align: center; border-right: 1px solid #e2e8f0; padding-right: 24px; }
  .right { flex: 1; padding-left: 8px; }
  .cert-label { font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; color: #94a3b8; }
  .accent-bar { width: 32px; height: 2px; background: linear-gradient(90deg, #7c3aed, #a855f7); margin: 8px auto 16px; border-radius: 2px; }
  .issued-label { font-size: 13px; color: #94a3b8; margin-bottom: 5px; }
  .recipient { font-size: 28px; font-weight: 800; color: #1e293b; line-height: 1.1; letter-spacing: -0.02em; }
  .score-circle { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #6d28d9, #8b5cf6); display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 14px auto; box-shadow: 0 4px 20px rgba(109,40,217,0.35); }
  .score-num { font-size: 28px; font-weight: 900; color: #fff; line-height: 1; }
  .score-of { font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 2px; }
  .tier-label { font-size: 13px; font-weight: 700; color: #6d28d9; text-align: center; margin-bottom: 12px; }
  .dim-section { margin-top: 0; }
  .dim-title { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
  .bottom { padding: 0 48px 28px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
  .sig { text-align: center; }
  .sig-line { width: 112px; height: 1px; background: #cbd5e1; margin: 0 auto 8px; }
  .sig-name { font-size: 13px; font-weight: 700; color: #334155; }
  .sig-role { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .cert-num { font-size: 9px; letter-spacing: 0.2em; color: #cbd5e1; text-transform: uppercase; text-align: right; }
  .footer-bar { height: 4px; background: linear-gradient(90deg, #6d28d9, #a855f7, #ec4899); }
  @media print { body { margin: 0; padding: 0; background: #fff; } .cert { box-shadow: none; border-radius: 0; } @page { margin: 0; } }
</style>
</head>
<body>
<div class="cert">
  <div class="header">
    <div>
      <div class="brand">Hidup Melampaui</div>
      <div class="tagline">Self-Command Readiness Index — Extended 72</div>
    </div>
    <div class="seal">✨</div>
  </div>
  <div class="body">
    <div class="top-row">
      <div class="left">
        <div class="cert-label">Sertifikat Penilaian Diri</div>
        <div class="accent-bar"></div>
        <div class="issued-label">Diberikan kepada</div>
        <div class="recipient">${name}</div>
        <div class="score-circle">
          <div class="score-num">${totalScore}</div>
          <div class="score-of">dari ${maxScore}</div>
        </div>
        <div class="tier-label">${scoringLabel}</div>
        <div style="font-size:11px;color:#94a3b8;">${date}</div>
      </div>
      <div class="right">
        <div class="dim-section">
          <div class="dim-title">Skor per Dimensi</div>
          ${dimRows}
        </div>
      </div>
    </div>
  </div>
  <div class="bottom">
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-name">Dr. Heru K. Wibawa</div>
      <div class="sig-role">Pendiri &amp; Instruktur</div>
    </div>
    <div class="cert-num">${certNum}</div>
  </div>
  <div class="footer-bar"></div>
</div>
</body>
</html>`;
}

export function Scri72Certificate({
  userName,
  totalScore,
  maxScore,
  scoringLabel,
  dimensionScores,
  completedAt,
  onClose,
}: Scri72CertificateProps) {
  const formattedDate = completedAt.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certNum = genScri72CertNumber(userName, totalScore);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=1100,height=900");
    if (!win) return;
    win.document.write(
      buildScri72PrintHTML(userName, totalScore, maxScore, scoringLabel, dimensionScores, formattedDate, certNum)
    );
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-violet-500" />
            <span className="font-semibold text-slate-800">E-Sertifikat SCRI-72</span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Unduh / Cetak PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="p-6 bg-slate-100 overflow-y-auto max-h-[75vh]">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg select-none">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-900 to-purple-800 px-8 py-5 flex items-center justify-between">
              <div>
                <p className="text-white font-extrabold tracking-widest uppercase text-sm">Hidup Melampaui</p>
                <p className="text-violet-300 text-[10px] tracking-wider mt-0.5 uppercase">Self-Command Readiness Index — Extended 72</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl">
                ✨
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-6 flex flex-col sm:flex-row gap-6">
              {/* Left: identity + score */}
              <div className="flex-1 text-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-6 sm:pb-0 sm:pr-6">
                <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400">Sertifikat Penilaian Diri</p>
                <div className="w-8 h-0.5 bg-gradient-to-r from-violet-500 to-purple-400 mx-auto mt-1.5 mb-4 rounded-full" />
                <p className="text-slate-400 text-sm mb-1">Diberikan kepada</p>
                <p className="text-2xl font-extrabold text-slate-800 leading-tight mt-1">{userName}</p>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex flex-col items-center justify-center mx-auto mt-4 mb-2 shadow-lg shadow-violet-200">
                  <span className="text-3xl font-black text-white leading-none">{totalScore}</span>
                  <span className="text-[10px] text-violet-200 mt-0.5">dari {maxScore}</span>
                </div>
                <p className="text-sm font-bold text-violet-700 mb-1">{scoringLabel}</p>
                <p className="text-[11px] text-slate-400">{formattedDate}</p>
              </div>

              {/* Right: dimension bars */}
              <div className="flex-1 sm:pl-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400 mb-3">Skor per Dimensi</p>
                <div className="space-y-2">
                  {(() => {
                    const activeDims = DIMENSIONS_72.filter((dim) => (dimensionScores[dim.id] ?? 0) > 0);
                    const activeDimCount = activeDims.length || DIMENSIONS_72.length;
                    const maxPerDim = Math.round(maxScore / activeDimCount);
                    return activeDims.map((dim) => {
                      const score = dimensionScores[dim.id] ?? 0;
                      const pct = Math.min(100, Math.round((score / maxPerDim) * 100));
                      return (
                        <div key={dim.id}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[10px] text-slate-500">{dim.label}</span>
                            <span className="text-[10px] font-bold text-violet-600">{score}/{maxPerDim}</span>
                        </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-100 flex items-end justify-between">
              <div className="text-center">
                <div className="w-28 h-px bg-slate-200 mb-1.5" />
                <p className="text-xs font-bold text-slate-600">Dr. Heru K. Wibawa</p>
                <p className="text-[10px] text-slate-400">Pendiri &amp; Instruktur</p>
              </div>
              <p className="text-[9px] tracking-widest text-slate-300 uppercase">{certNum}</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
