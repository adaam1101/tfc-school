import React from "react";
import { schoolInfo } from "../config/branding.js";

const C = {
  blue:      "#04436E",
  blueDark:  "#032D4A",
  blueLight: "#0A6AAD",
  gold:      "#C9A84C",
  goldLight: "#E8C97A",
  bg:        "#FDFCF7",
};

export default function CertificateTemplate({
  studentName  = "Nom du Candidat",
  courseName   = "Informatique & Bureautique",
  duration     = "6 mois",
  completionDate = "Juin 2026",
  directorName = "Le Directeur",
  verifyCode   = null,
  verifyUrl    = null,
  qrDataUrl    = null,
  grade        = null,
}) {
  return (
    <div
      id="certificate-root"
      style={{
        width: "297mm",
        height: "210mm",
        background: C.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        boxSizing: "border-box",
      }}
    >
      {/* ── Outer border ── */}
      <div style={{
        position: "absolute", inset: "8mm",
        border: `3px solid ${C.gold}`,
        borderRadius: "4px",
        pointerEvents: "none",
        zIndex: 10,
      }} />
      <div style={{
        position: "absolute", inset: "11mm",
        border: `1px solid ${C.blue}`,
        borderRadius: "3px",
        pointerEvents: "none",
        zIndex: 10,
      }} />

      {/* ── Corner ornaments ── */}
      {[
        { top: "8mm",  left:  "8mm",  borderTop: `6px solid ${C.gold}`, borderLeft:  `6px solid ${C.gold}` },
        { top: "8mm",  right: "8mm",  borderTop: `6px solid ${C.gold}`, borderRight: `6px solid ${C.gold}` },
        { bottom:"8mm",left:  "8mm",  borderBottom:`6px solid ${C.gold}`,borderLeft: `6px solid ${C.gold}` },
        { bottom:"8mm",right: "8mm",  borderBottom:`6px solid ${C.gold}`,borderRight:`6px solid ${C.gold}` },
      ].map((s, i) => (
        <div key={i} style={{ position:"absolute", width:"12mm", height:"12mm", zIndex:11, ...s }} />
      ))}

      {/* ── Top blue header band ── */}
      <div style={{
        position: "absolute", top: "13mm", left: "13mm", right: "13mm",
        height: "30mm",
        background: `linear-gradient(135deg, ${C.blueDark} 0%, ${C.blue} 60%, ${C.blueLight} 100%)`,
        borderRadius: "2px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 8mm",
        zIndex: 5,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"4mm" }}>
          <img
            src="/tfc-logo.png"
            alt="TFC"
            style={{ height:"22mm", width:"22mm", objectFit:"contain", borderRadius:"3mm",
                     background:"rgba(255,255,255,0.12)", padding:"2mm" }}
          />
          <div>
            <div style={{ color: C.gold, fontWeight:"900", fontSize:"16pt", letterSpacing:"3px", lineHeight:1 }}>
              TFC
            </div>
            <div style={{ color:"#fff", fontSize:"7pt", letterSpacing:"1px", opacity:0.9, marginTop:"1mm" }}>
              Training Formation Center
            </div>
            <div style={{ color: C.goldLight, fontSize:"6pt", letterSpacing:"1px", opacity:0.85, marginTop:"0.5mm" }}>
              مركز التدريب والتكوين
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{
            color: C.gold, fontWeight:"900", fontSize:"18pt",
            letterSpacing:"6px", textTransform:"uppercase",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}>
            CERTIFICAT
          </div>
          <div style={{ color:"#fff", fontSize:"8pt", letterSpacing:"3px", opacity:0.9, marginTop:"1mm" }}>
            DE FORMATION PROFESSIONNELLE
          </div>
          <div style={{ color: C.goldLight, fontSize:"7pt", letterSpacing:"2px", opacity:0.85, marginTop:"0.5mm" }}>
            شهادة تكوين مهني
          </div>
        </div>

        {/* City */}
        <div style={{ textAlign:"right" }}>
          <div style={{ color:"#fff", fontSize:"7pt", opacity:0.8 }}>Annaba, Algérie</div>
          <div style={{ color: C.goldLight, fontSize:"7pt", opacity:0.8 }}>عنابة، الجزائر</div>
        </div>
      </div>

      {/* ── Gold divider ── */}
      <div style={{
        position:"absolute", top:"45mm", left:"18mm", right:"18mm",
        height:"2px",
        background:`linear-gradient(to right, transparent, ${C.gold}, ${C.gold}, transparent)`,
        zIndex:5,
      }} />

      {/* ── Body ── */}
      <div style={{
        position:"absolute", top:"50mm", left:"18mm", right:"18mm", bottom:"22mm",
        display:"flex", flexDirection:"column", alignItems:"center",
        zIndex:5,
      }}>
        {/* Intro text */}
        <div style={{ fontSize:"9pt", color:"#555", letterSpacing:"1px", marginBottom:"3mm", textAlign:"center" }}>
          Nous, soussignés, certifions que &nbsp;|&nbsp; نشهد نحن الموقعون أدناه بأن
        </div>

        {/* Student name */}
        <div style={{
          fontSize:"24pt", fontWeight:"900", color: C.blueDark,
          letterSpacing:"2px", textAlign:"center",
          borderBottom:`2px solid ${C.gold}`, paddingBottom:"2mm", marginBottom:"3mm",
          minWidth:"120mm", textAlign:"center",
        }}>
          {studentName}
        </div>

        {/* Completion text */}
        <div style={{ fontSize:"9pt", color:"#555", textAlign:"center", marginBottom:"2mm" }}>
          a complété avec succès et satisfaction la formation en&nbsp;
          <span style={{ color: C.blue, fontWeight:"700" }}>:</span>
        </div>
        <div style={{ fontSize:"8.5pt", color:"#666", textAlign:"center", marginBottom:"3mm" }}>
          قد أتمّ/أتمّت بنجاح ومهارة برنامج التكوين في:
        </div>

        {/* Course name */}
        <div style={{
          background:`linear-gradient(135deg, ${C.blue}15, ${C.gold}20)`,
          border:`1.5px solid ${C.gold}`,
          borderRadius:"3mm", padding:"2mm 10mm",
          fontSize:"16pt", fontWeight:"900", color: C.blue,
          letterSpacing:"1px", textAlign:"center", marginBottom:"4mm",
        }}>
          {courseName}
        </div>

        {/* Meta row */}
        <div style={{
          display:"flex", gap:"8mm", alignItems:"center",
          fontSize:"8.5pt", color:"#555", marginBottom:"5mm",
        }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ color: C.gold, fontWeight:"700", fontSize:"7pt", letterSpacing:"1px", textTransform:"uppercase" }}>
              Durée / المدة
            </div>
            <div style={{ color: C.blueDark, fontWeight:"700", fontSize:"10pt" }}>{duration}</div>
          </div>
          <div style={{ width:"1px", height:"8mm", background: C.gold, opacity:0.5 }} />
          <div style={{ textAlign:"center" }}>
            <div style={{ color: C.gold, fontWeight:"700", fontSize:"7pt", letterSpacing:"1px", textTransform:"uppercase" }}>
              Date / التاريخ
            </div>
            <div style={{ color: C.blueDark, fontWeight:"700", fontSize:"10pt" }}>{completionDate}</div>
          </div>
          {grade && <>
            <div style={{ width:"1px", height:"8mm", background: C.gold, opacity:0.5 }} />
            <div style={{ textAlign:"center" }}>
              <div style={{ color: C.gold, fontWeight:"700", fontSize:"7pt", letterSpacing:"1px", textTransform:"uppercase" }}>
                Mention / التقدير
              </div>
              <div style={{ color: C.blueDark, fontWeight:"700", fontSize:"10pt" }}>{grade}</div>
            </div>
          </>}
        </div>

        {/* Bottom row: signature + verify */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"flex-end",
          width:"100%", marginTop:"auto",
        }}>
          {/* Signature */}
          <div style={{ textAlign:"center", minWidth:"50mm" }}>
            <div style={{
              width:"50mm", borderTop:`1.5px solid ${C.blue}`,
              marginBottom:"1mm",
            }} />
            <div style={{ fontSize:"8pt", color: C.blueDark, fontWeight:"700" }}>{directorName}</div>
            <div style={{ fontSize:"7pt", color:"#888" }}>Directeur / المدير</div>
          </div>

          {/* School stamp area */}
          <div style={{ textAlign:"center" }}>
            <div style={{
              width:"22mm", height:"22mm", borderRadius:"50%",
              border:`2px dashed ${C.gold}`, opacity:0.4,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"6pt", color: C.blue, textAlign:"center", lineHeight:1.3,
            }}>
              CACHET<br/>OFFICIEL<br/>الختم
            </div>
          </div>

          {/* QR code + verify */}
          <div style={{ textAlign:"center", minWidth:"28mm" }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR" style={{ width:"22mm", height:"22mm" }} />
            ) : (
              <div style={{
                width:"22mm", height:"22mm", background:"#f0f0f0",
                border:`1px dashed ${C.gold}`, borderRadius:"2mm",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"6pt", color:"#aaa", textAlign:"center",
              }}>
                QR<br/>Code
              </div>
            )}
            {verifyCode && (
              <div style={{ fontSize:"5.5pt", color:"#888", marginTop:"1mm", letterSpacing:"0.5px" }}>
                #{verifyCode.slice(0, 10).toUpperCase()}
              </div>
            )}
            <div style={{ fontSize:"5pt", color:"#aaa", marginTop:"0.5mm" }}>
              Vérification / التحقق
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom blue footer band ── */}
      <div style={{
        position:"absolute", bottom:"13mm", left:"13mm", right:"13mm",
        height:"7mm",
        background:`linear-gradient(135deg, ${C.blueDark}, ${C.blue})`,
        borderRadius:"2px",
        display:"flex", alignItems:"center", justifyContent:"center",
        gap:"6mm", zIndex:5,
      }}>
        <span style={{ color: C.goldLight, fontSize:"6pt", letterSpacing:"1px" }}>
          📞 {schoolInfo.phones[0]}
        </span>
        <span style={{ color:"rgba(255,255,255,0.4)" }}>|</span>
        <span style={{ color: C.goldLight, fontSize:"6pt", letterSpacing:"1px" }}>
          ✉ {schoolInfo.email}
        </span>
        <span style={{ color:"rgba(255,255,255,0.4)" }}>|</span>
        <span style={{ color: C.goldLight, fontSize:"6pt", letterSpacing:"1px" }}>
          📍 {schoolInfo.address}
        </span>
      </div>

      {/* ── Watermark ── */}
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%, -50%) rotate(-35deg)",
        fontSize:"72pt", fontWeight:"900",
        color: C.blue, opacity:0.025,
        letterSpacing:"8px", userSelect:"none", pointerEvents:"none",
        zIndex:1, whiteSpace:"nowrap",
      }}>
        TFC SCHOOL
      </div>
    </div>
  );
}
