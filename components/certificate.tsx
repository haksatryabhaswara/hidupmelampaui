"use client";

import { X, Download, Award } from "lucide-react";

type CertificateProps = {
  userName: string;
  contentTitle: string;
  completedAt: Date;
  onClose: () => void;
};

function buildPrintHTML(name: string, title: string, date: string, certNum: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Sertifikat — ${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f1f5f9; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .cert { max-width: 780px; width: 100%; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .header { background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; }
  .brand { font-size: 15px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; }
  .tagline { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #93c5fd; margin-top: 4px; }
  .seal { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .body { padding: 48px 48px 36px; text-align: center; }
  .cert-label { font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; color: #94a3b8; }
  .accent-bar { width: 32px; height: 2px; background: linear-gradient(90deg, #6366f1, #3b82f6); margin: 8px auto 28px; border-radius: 2px; }
  .issued-label { font-size: 13px; color: #94a3b8; margin-bottom: 6px; }
  .recipient { font-size: 42px; font-weight: 800; color: #1e293b; line-height: 1.1; letter-spacing: -0.02em; }
  .divider { border: none; border-top: 1px solid #e2e8f0; width: 80px; margin: 20px auto; }
  .completed-label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
  .content-title { font-size: 17px; font-weight: 600; color: #4338ca; line-height: 1.4; max-width: 480px; margin: 0 auto; }
  .date-line { font-size: 12px; color: #94a3b8; margin-top: 6px; margin-bottom: 40px; }
  .sig-wrap { display: flex; justify-content: center; margin-bottom: 28px; }
  .sig { text-align: center; }
  .sig-line { width: 112px; height: 1px; background: #cbd5e1; margin: 0 auto 8px; }
  .sig-name { font-size: 13px; font-weight: 700; color: #334155; }
  .sig-role { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .cert-num { font-size: 9px; letter-spacing: 0.2em; color: #cbd5e1; text-transform: uppercase; }
  .footer-bar { height: 4px; background: linear-gradient(90deg, #2563eb, #6366f1, #8b5cf6); }
  @media print { body { margin: 0; padding: 0; background: #fff; } .cert { box-shadow: none; border-radius: 0; } @page { margin: 0; } }
</style>
</head>
<body>
<div class="cert">
  <div class="header">
    <div>
      <div class="brand">Hidup Melampaui</div>
      <div class="tagline">Platform Pengembangan Diri</div>
    </div>
    <div class="seal">🏆</div>
  </div>
  <div class="body">
    <div class="cert-label">Sertifikat Penyelesaian</div>
    <div class="accent-bar"></div>
    <div class="issued-label">Diberikan kepada</div>
    <div class="recipient">${name}</div>
    <hr class="divider" />
    <div class="completed-label">Telah Berhasil Menyelesaikan</div>
    <div class="content-title">${title}</div>
    <div class="date-line">${date}</div>
    <div class="sig-wrap">
      <div class="sig">
        <div class="sig-line"></div>
        <div class="sig-name">Dr. Heru K. Wibawa</div>
        <div class="sig-role">Pendiri &amp; Instruktur</div>
      </div>
    </div>
    <div class="cert-num">${certNum}</div>
  </div>
  <div class="footer-bar"></div>
</div>
</body>
</html>`;
}

export function genCertNumber(userId: string, contentId: string): string {
  const base = `${userId}-${contentId}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) {
    h = Math.imul(31, h) + base.charCodeAt(i) | 0;
  }
  return `HM-${Math.abs(h).toString(36).toUpperCase().padStart(8, "0")}`;
}

export function Certificate({ userName, contentTitle, completedAt, onClose }: CertificateProps) {
  const formattedDate = completedAt.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use a simple deterministic number based on name + title for preview
  const certNum = genCertNumber(userName, contentTitle);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=1050,height=780");
    if (!win) return;
    win.document.write(buildPrintHTML(userName, contentTitle, formattedDate, certNum));
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-slate-800">E-Sertifikat Penyelesaian</span>
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
            <div className="bg-gradient-to-br from-blue-900 to-indigo-800 px-8 py-6 flex items-center justify-between">
              <div>
                <p className="text-white font-extrabold tracking-widest uppercase text-sm">Hidup Melampaui</p>
                <p className="text-blue-300 text-[10px] tracking-wider mt-0.5 uppercase">Platform Pengembangan Diri</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-8 text-center">
              <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400">Sertifikat Penyelesaian</p>
              <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 mx-auto mt-1.5 mb-6 rounded-full" />

              <p className="text-slate-400 text-sm mb-1">Diberikan kepada</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">{userName}</h2>

              <div className="w-16 h-px bg-slate-200 mx-auto my-5" />

              <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400 mb-2">Telah Berhasil Menyelesaikan</p>
              <h3 className="text-base font-semibold text-indigo-700 leading-snug max-w-xs mx-auto">{contentTitle}</h3>

              <p className="text-slate-400 text-xs mt-4 mb-7">{formattedDate}</p>

              <div className="flex justify-center mb-5">
                <div className="text-center">
                  <div className="w-24 h-px bg-slate-300 mb-2 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">Dr. Heru K. Wibawa</p>
                  <p className="text-slate-400 text-xs mt-0.5">Pendiri &amp; Instruktur</p>
                </div>
              </div>

              <p className="text-slate-300 text-[9px] tracking-widest uppercase">{certNum}</p>
            </div>

            {/* Footer accent */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
