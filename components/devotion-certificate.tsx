"use client";

import { X, Download, Sun } from "lucide-react";

type DevotionCertificateProps = {
  userName: string;
  contentTitle: string;
  totalDays: number;
  completedAt: string; // ISO date string
  onClose: () => void;
};

function genCertNumber(contentId: string, uid: string): string {
  const base = `DEVOT-${contentId}-${uid}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) {
    h = Math.imul(31, h) + base.charCodeAt(i) | 0;
  }
  return `RH-${Math.abs(h).toString(36).toUpperCase().padStart(8, "0")}`;
}

function buildPrintHTML(
  name: string,
  contentTitle: string,
  totalDays: number,
  dateStr: string,
  certNum: string,
): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Sertifikat Renungan Harian — ${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fef3c7; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .cert { max-width: 780px; width: 100%; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
  .header { background: linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%); padding: 36px 48px; text-align: center; }
  .header-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
  .brand { font-size: 13px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; }
  .tagline { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #fde68a; margin-top: 3px; }
  .body { padding: 44px 48px; text-align: center; }
  .cert-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #92400e; margin-bottom: 8px; }
  .cert-title { font-size: 28px; font-weight: 800; color: #1c1917; margin-bottom: 6px; }
  .divider { width: 60px; height: 3px; background: linear-gradient(90deg, #b45309, #f59e0b); border-radius: 2px; margin: 16px auto; }
  .presented { font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px; }
  .recipient { font-size: 36px; font-weight: 800; color: #b45309; font-style: italic; margin-bottom: 6px; }
  .desc { font-size: 13px; color: #57534e; line-height: 1.7; max-width: 480px; margin: 0 auto 20px; }
  .content-title { font-size: 15px; font-weight: 700; color: #1c1917; margin-bottom: 4px; }
  .stats { display: flex; justify-content: center; gap: 32px; margin: 24px 0; }
  .stat { text-align: center; }
  .stat-num { font-size: 28px; font-weight: 900; color: #b45309; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #78716c; margin-top: 2px; }
  .footer { border-top: 1px solid #fde68a; background: #fffbeb; padding: 16px 48px; display: flex; justify-content: space-between; align-items: center; }
  .cert-num { font-size: 10px; color: #a8a29e; font-family: monospace; }
  .date { font-size: 11px; color: #78716c; }
  @media print {
    body { background: #fff; padding: 0; }
    .cert { box-shadow: none; border-radius: 0; }
    @page { margin: 0; size: A4 landscape; }
  }
</style>
</head>
<body>
<div class="cert">
  <div class="header">
    <div class="header-icon">🌅</div>
    <div class="brand">Hidup Melampaui</div>
    <div class="tagline">Sertifikat Penyelesaian</div>
  </div>
  <div class="body">
    <div class="cert-label">Sertifikat Penyelesaian</div>
    <div class="cert-title">Renungan Harian</div>
    <div class="divider"></div>
    <div class="presented">Dengan bangga diberikan kepada</div>
    <div class="recipient">${name}</div>
    <div class="desc">
      Telah berhasil menyelesaikan seluruh rangkaian renungan harian
    </div>
    <div class="content-title">"${contentTitle}"</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-num">${totalDays}</div>
        <div class="stat-label">Total Hari</div>
      </div>
      <div class="stat">
        <div class="stat-num">100%</div>
        <div class="stat-label">Diselesaikan</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="cert-num">No. Sertifikat: ${certNum}</div>
    <div class="date">Diselesaikan: ${dateStr}</div>
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;
}

export function DevotionCertificate({
  userName,
  contentTitle,
  totalDays,
  completedAt,
  onClose,
}: DevotionCertificateProps) {
  const dateStr = new Date(completedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Use contentTitle as a stable ID for cert number
  const certNum = genCertNumber(contentTitle, userName);

  const handlePrint = () => {
    const html = buildPrintHTML(userName, contentTitle, totalDays, dateStr, certNum);
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-amber-600 to-orange-500 px-8 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mx-auto mb-3">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <p className="text-amber-100 text-xs font-semibold uppercase tracking-widest mb-1">Sertifikat Penyelesaian</p>
          <h2 className="text-white text-xl font-bold">Renungan Harian</h2>
        </div>

        {/* Body */}
        <div className="px-8 py-7 text-center space-y-3">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Dengan bangga diberikan kepada</p>
          <p className="text-3xl font-extrabold text-amber-600 italic">{userName}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Telah berhasil menyelesaikan seluruh rangkaian renungan harian
          </p>
          <p className="text-slate-800 dark:text-slate-100 font-bold text-base">"{contentTitle}"</p>

          <div className="flex justify-center gap-8 py-4">
            <div className="text-center">
              <p className="text-3xl font-black text-amber-600">{totalDays}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Total Hari</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-600">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Diselesaikan</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="font-mono">No. {certNum}</span>
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Action */}
        <div className="px-8 pb-7">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Unduh / Cetak Sertifikat
          </button>
        </div>
      </div>
    </div>
  );
}
