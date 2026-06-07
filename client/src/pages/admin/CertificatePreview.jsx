import React, { useRef } from "react";
import CertificateTemplate from "../../components/CertificateTemplate.jsx";

export default function CertificatePreview() {
  const ref = useRef();

  const handlePrint = () => {
    const content = ref.current.innerHTML;
    const win = window.open("", "_blank", "width=1200,height=900");
    win.document.write(`
      <html>
        <head>
          <title>Certificat TFC</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            body { margin: 0; padding: 0; background: white; }
            #cert { width: 297mm; height: 210mm; }
          </style>
        </head>
        <body>
          <div id="cert">${content}</div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <div className="flex items-center justify-between w-full max-w-5xl">
        <h2 className="text-2xl font-black text-brand-800 dark:text-brand-300">
          معاينة قالب الشهادة
        </h2>
        <button
          onClick={handlePrint}
          className="btn-primary"
        >
          طباعة / تحميل PDF
        </button>
      </div>

      {/* Certificate preview — scaled to fit screen */}
      <div
        style={{ transform: "scale(0.75)", transformOrigin: "top center", marginBottom: "-120px" }}
        className="shadow-2xl rounded"
      >
        <div ref={ref}>
          <CertificateTemplate
            studentName="محمد الأمين بوعزيز"
            courseName="Informatique & Bureautique"
            duration="6 mois"
            completionDate="Juin 2026"
            directorName="Le Directeur"
            grade="Très Bien"
          />
        </div>
      </div>
    </div>
  );
}
