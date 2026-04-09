"use client";

import { X, Download, Star } from "lucide-react";
import { DIMENSIONS } from "@/lib/scri-data";

type ScriCertificateProps = {
  userName: string;
  totalScore: number;
  maxScore: number;
  scoringLabel: string;
  dimensionScores: Record<string, number>;
  completedAt: Date;
  onClose: () => void;
};

function genScriCertNumber(userId: string, score: number): string {
  const base = `SCRI-${userId}-${score}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) {
    h = Math.imul(31, h) + base.charCodeAt(i) | 0;
  }
  return `SCRI-${Math.abs(h).toString(36).toUpperCase().padStart(8, "0")}`;
}

function buildScriPrintHTML(
  name: string,
  totalScore: number,
  maxScore: number,
  scoringLabel: string,
  dimensionScores: Record<string, number>,
  date: string,
  certNum: string,
): string {
  const dimRows = DIMENSIONS.map((dim) => {
    const score = dimensionScores[dim.id] ?? 0;
    const pct = Math.round((score / 30) * 100);
    return `<div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span style="font-size:11px;color:#475569;">${dim.label}</span>
        <span style="font-size:11px;font-weight:700;color:#1d4ed8;">${score}/30</span>
      </div>
      <div style="height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#2563eb,#6366f1);border-radius:3px;"></div>
      </div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Sertifikat SCRI — ${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f1f5f9; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .cert { max-width: 820px; width: 100%; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .header { background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 15px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; }
  .tagline { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #93c5fd; margin-top: 4px; }
  .seal { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .body { padding: 44px 48px 36px; }
  .top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; }
  .left { flex: 1; text-align: center; border-right: 1px solid #e2e8f0; padding-right: 32px; }
  .right { flex: 1; padding-left: 8px; }
  .cert-label { font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; color: #94a3b8; }
  .accent-bar { width: 32px; height: 2px; background: linear-gradient(90deg, #6366f1, #3b82f6); margin: 8px auto 20px; border-radius: 2px; }
  .issued-label { font-size: 13px; color: #94a3b8; margin-bottom: 5px; }
  .recipient { font-size: 36px; font-weight: 800; color: #1e293b; line-height: 1.1; letter-spacing: -0.02em; }
  .score-circle { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg, #1d4ed8, #4f46e5); display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 16px auto; box-shadow: 0 4px 20px rgba(79,70,229,0.35); }
  .score-num { font-size: 32px; font-weight: 900; color: #fff; line-height: 1; }
  .score-of { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 2px; }
  .tier-label { font-size: 14px; font-weight: 700; color: #4338ca; text-align: center; margin-bottom: 16px; }
  .dim-section { margin-top: 0; }
  .dim-title { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
  .bottom { padding: 0 48px 36px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 24px; }
  .sig { text-align: center; }
  .sig-line { width: 112px; height: 1px; background: #cbd5e1; margin: 0 auto 8px; }
  .sig-name { font-size: 13px; font-weight: 700; color: #334155; }
  .sig-role { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .cert-num { font-size: 9px; letter-spacing: 0.2em; color: #cbd5e1; text-transform: uppercase; text-align: right; }
  .footer-bar { height: 4px; background: linear-gradient(90deg, #2563eb, #6366f1, #8b5cf6); }
  @media print { body { margin: 0; padding: 0; background: #fff; } .cert { box-shadow: none; border-radius: 0; } @page { margin: 0; } }
</style>
</head>
<body>
<div class="cert">
  <div class="header">
    <div>
      <div class="brand">Hidup Melampaui</div>
      <div class="tagline">Self-Command Readiness Index</div>
    </div>
    <div class="seal">⭐</div>
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

export function ScriCertificate({
  userName,
  totalScore,
  maxScore,
  scoringLabel,
  dimensionScores,
  completedAt,
  onClose,
}: ScriCertificateProps) {
  const formattedDate = completedAt.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certNum = genScriCertNumber(userName, totalScore);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=1100,height=820");
    if (!win) return;
    win.document.write(
      buildScriPrintHTML(userName, totalScore, maxScore, scoringLabel, dimensionScores, formattedDate, certNum)
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
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-slate-800">E-Sertifikat SCRI</span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Unduh / Cetak PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="p-6 bg-slate-100">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg select-none">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 px-8 py-6 flex items-center justify-between">
              <div>
                <p className="text-white font-extrabold tracking-widest uppercase text-sm">Hidup Melampaui</p>
                <p className="text-blue-300 text-[10px] tracking-wider mt-0.5 uppercase">Self-Command Readiness Index</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-7 flex flex-col sm:flex-row gap-6">
              {/* Left: identity + score */}
              <div className="flex-1 text-center border-b sm:border-b-0 sm:border-r border-slate-100 pb-6 sm:pb-0 sm:pr-6">
                <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400">Sertifikat Penilaian Diri</p>
                <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 mx-auto mt-1.5 mb-4 rounded-full" />
                <p className="text-slate-400 text-sm mb-1">Diberikan kepada</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight mb-4">
                  {userName}
                </h2>
                {/* Score circle */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 flex flex-col items-center justify-center mx-auto shadow-lg mb-3">
                  <span className="text-3xl font-black text-white leading-none">{totalScore}</span>
                  <span className="text-[10px] text-white/70 mt-0.5">dari {maxScore}</span>
                </div>
                <p className="text-indigo-700 font-bold text-sm">{scoringLabel}</p>
                <p className="text-slate-400 text-xs mt-2">{formattedDate}</p>
              </div>

              {/* Right: dimension bars */}
              <div className="flex-1 space-y-2.5">
                <p className="text-[10px] tracking-[0.25em] uppercase text-slate-400 mb-3">
                  Skor per Dimensi
                </p>
                {DIMENSIONS.map((dim) => {
                  const score = dimensionScores[dim.id] ?? 0;
                  const pct = Math.round((score / 30) * 100);
                  return (
                    <div key={dim.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-slate-500">{dim.label}</span>
                        <span className="text-[11px] font-bold text-blue-700">{score}/30</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 flex items-end justify-between border-t border-slate-100">
              <div className="text-center">
                <div className="w-24 h-px bg-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-sm">Dr. Heru K. Wibawa</p>
                <p className="text-slate-400 text-[10px]">Pendiri &amp; Instruktur</p>
              </div>
              <p className="text-[9px] tracking-widest text-slate-300 uppercase">{certNum}</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
