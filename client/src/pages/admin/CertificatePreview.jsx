import React, { useRef } from "react";
import CertificateTemplate from "../../components/CertificateTemplate.jsx";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Cinzel:wght@400;700;900&display=swap";

export default function CertificatePreview() {
  const ref = useRef();

  const handlePrint = () => {
    const content = ref.current.innerHTML;
    const win = window.open("", "_blank", "width=1400,height=1000");
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Certificat TFC</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="${FONTS_URL}" rel="stylesheet" />
          <style>
            @page { size: A4 landscape; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: white; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            document.fonts.ready.then(() => { window.print(); });
          <\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-10 px-4 flex flex-col items-center gap-8">

      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-brand-800 dark:text-brand-300">
            معاينة الشهادة
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            مثال حقيقي — Ameyoud Adam — إعلام آلي
          </p>
        </div>
        <button onClick={handlePrint} className="btn-primary">
          طباعة / تحميل PDF
        </button>
      </div>

      {/* Certificate scaled to fit screen */}
      <div
        className="shadow-2xl rounded overflow-hidden"
        style={{
          transform: "scale(0.72)",
          transformOrigin: "top center",
          marginBottom: "-160px",
        }}
      >
        <div ref={ref}>
          <CertificateTemplate
            studentName="Ameyoud Adam"
            courseName="Informatique & Bureautique"
            duration="6 mois"
            completionDate="Juin 2026"
            directorName="M. Directeur TFC"
            grade="Très Bien"
            verifyCode="TFC-2026-ADM-0042"
          />
        </div>
      </div>

    </div>
  );
}
