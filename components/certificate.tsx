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
  body { background: #fff; font-family: Georgia, 'Times New Roman', serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
  .cert { max-width: 840px; width: 100%; padding: 60px 72px; border: 10px double #1e3a8a; text-align: center; background: #fff; }
  .brand { font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase; color: #1e3a8a; margin-bottom: 4px; }
  .tagline { font-family: Arial, Helvetica, sans-serif; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #64748b; margin-bottom: 40px; }
  .cert-label { font-family: Arial, Helvetica, sans-serif; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #64748b; margin-bottom: 20px; }
  .issued-label { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748b; letter-spacing: 0.1em; margin-bottom: 10px; }
  .recipient { font-size: 52px; font-style: italic; color: #1e3a8a; margin-bottom: 16px; line-height: 1.1; }
  .divider { border: none; border-top: 1px solid #bfdbfe; width: 100px; margin: 16px auto; }
  .completed-label { font-family: Arial, Helvetica, sans-serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }
  .content-title { font-size: 22px; font-weight: bold; color: #1e40af; margin-bottom: 36px; line-height: 1.3; }
  .date-line { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748b; margin-bottom: 48px; }
  .sig-wrap { display: flex; justify-content: center; }
  .sig { display: inline-block; border-top: 1px solid #475569; padding-top: 8px; text-align: center; min-width: 180px; }
  .sig-name { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1e293b; font-weight: bold; }
  .sig-role { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #94a3b8; margin-top: 3px; }
  .cert-num { font-family: Arial, Helvetica, sans-serif; font-size: 9px; letter-spacing: 0.2em; color: #cbd5e1; margin-top: 32px; }
  @media print { body { margin: 0; padding: 0; } @page { margin: 0.5cm; } }
</style>
</head>
<body>
<div class="cert">
  <div class="brand">Hidup Melampaui</div>
  <div class="tagline">Platform Pengembangan Diri</div>
  <div class="cert-label">Sertifikat Penyelesaian</div>
  <div class="issued-label">Diberikan kepada</div>
  <div class="recipient">${name}</div>
  <div class="divider"></div>
  <div class="completed-label">Telah Berhasil Menyelesaikan</div>
  <div class="content-title">${title}</div>
  <div class="date-line">${date}</div>
  <div class="sig-wrap">
    <div class="sig">
      <div class="sig-name">Dr. Heru K. Wibawa</div>
      <div class="sig-role">Pendiri &amp; Instruktur</div>
    </div>
  </div>
  <div class="cert-num">${certNum}</div>
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
              className="flex items-center gap-1.5 text-sm bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Unduh / Cetak PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="p-6 bg-slate-50">
          <div className="border-[7px] border-double border-blue-800 bg-white rounded-lg p-10 text-center shadow-inner select-none">
            <p className="text-blue-800 font-bold tracking-[0.25em] uppercase text-xs mb-1">Hidup Melampaui</p>
            <p className="text-slate-400 tracking-[0.2em] uppercase text-[10px] mb-8">Platform Pengembangan Diri</p>

            <p className="text-slate-400 tracking-[0.25em] uppercase text-[11px] mb-5">Sertifikat Penyelesaian</p>

            <p className="text-slate-500 text-sm mb-2 tracking-wide">Diberikan kepada</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 italic mb-4 leading-snug">{userName}</h2>

            <div className="w-16 h-px bg-blue-200 mx-auto mb-4" />

            <p className="text-slate-400 text-[10px] tracking-[0.25em] uppercase mb-2">Telah Berhasil Menyelesaikan</p>
            <h3 className="text-lg font-bold text-blue-800 mb-6 leading-snug">{contentTitle}</h3>

            <p className="text-slate-400 text-xs mb-8">{formattedDate}</p>

            <div className="flex justify-center">
              <div className="border-t border-slate-400 pt-2 px-8 text-center">
                <p className="font-semibold text-slate-700 text-sm">Dr. Heru K. Wibawa</p>
                <p className="text-slate-400 text-xs mt-0.5">Pendiri &amp; Instruktur</p>
              </div>
            </div>

            <p className="text-slate-300 text-[9px] tracking-widest mt-6 uppercase">{certNum}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
