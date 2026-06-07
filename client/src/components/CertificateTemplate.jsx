import React from "react";
import { schoolInfo } from "../config/branding.js";

const BLUE  = "#04436E";
const GOLD  = "#C9A84C";
const LIGHT = "#F8FBFF";

const Star = ({ size = 16, color = "#aab8c8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const Badge = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="42" r="28" fill="none" stroke={BLUE} strokeWidth="4" />
    <circle cx="50" cy="42" r="20" fill="none" stroke={GOLD} strokeWidth="2" />
    <polygon points="50,26 53.5,35.8 64,35.8 55.7,41.9 58.9,52 50,46.2 41.1,52 44.3,41.9 36,35.8 46.5,35.8"
      fill={BLUE} />
    <rect x="38" y="68" width="24" height="10" rx="3" fill={GOLD} />
    <rect x="44" y="66" width="5" height="6" fill={GOLD} />
    <rect x="51" y="66" width="5" height="6" fill={GOLD} />
  </svg>
);

export default function CertificateTemplate({
  studentName    = "Mohamed Amine Bouaziz",
  courseName     = "Informatique & Bureautique",
  duration       = "6 mois",
  completionDate = "Juin 2026",
  directorName   = "Le Directeur",
  directorTitle  = "Directeur TFC School",
  verifyCode     = null,
  qrDataUrl      = null,
  grade          = null,
}) {
  return (
    <div
      id="certificate-root"
      style={{
        width: "297mm", height: "210mm",
        background: LIGHT,
        position: "relative", overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* ── TFC Logo watermark background ── */}
      <img
        src="/tfc-logo.png"
        alt=""
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "160mm", height: "160mm",
          objectFit: "contain",
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Thick outer blue border ── */}
      <div style={{
        position: "absolute", inset: 0,
        border: `18mm solid ${BLUE}`,
        boxSizing: "border-box",
        zIndex: 1, pointerEvents: "none",
      }} />

      {/* ── Dashed inner border ── */}
      <div style={{
        position: "absolute", inset: "20mm",
        border: `2px dashed #9ab3c8`,
        boxSizing: "border-box",
        zIndex: 2, pointerEvents: "none",
      }} />

      {/* ── Thin gold inner line ── */}
      <div style={{
        position: "absolute", inset: "22mm",
        border: `1px solid ${GOLD}40`,
        boxSizing: "border-box",
        zIndex: 2, pointerEvents: "none",
      }} />

      {/* ── Corner ornaments ── */}
      {[
        { top: "14mm",  left:  "14mm" },
        { top: "14mm",  right: "14mm" },
        { bottom:"14mm",left:  "14mm" },
        { bottom:"14mm",right: "14mm" },
      ].map((pos, i) => (
        <div key={i} style={{ position:"absolute", zIndex:3, ...pos }}>
          <Star size={18} color="#9ab3c8" />
        </div>
      ))}

      {/* ── Content ── */}
      <div style={{
        position: "absolute", inset: "24mm",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        zIndex: 5, textAlign: "center",
      }}>

        {/* Top: school name inside border area */}
        <div>
          <div style={{
            fontSize: "8pt", letterSpacing: "4px", textTransform: "uppercase",
            color: GOLD, fontWeight: "700", marginBottom: "2mm",
          }}>
            Training Formation Center · عنابة
          </div>

          {/* CERTIFICATE */}
          <div style={{
            fontSize: "36pt", fontWeight: "900", letterSpacing: "8px",
            textTransform: "uppercase", color: BLUE,
            fontFamily: "'Georgia', serif", lineHeight: 1,
          }}>
            CERTIFICAT
          </div>

          {/* OF TRAINING */}
          <div style={{
            fontSize: "10pt", letterSpacing: "5px", textTransform: "uppercase",
            color: "#555", fontWeight: "400", marginTop: "1.5mm",
          }}>
            DE FORMATION PROFESSIONNELLE &nbsp;·&nbsp; شهادة تكوين مهني
          </div>
        </div>

        {/* Middle: student */}
        <div style={{ width: "100%" }}>
          {/* Presented to */}
          <div style={{
            fontSize: "8.5pt", fontStyle: "italic", fontWeight: "700",
            color: "#666", letterSpacing: "2px", marginBottom: "2mm",
          }}>
            Proudly presented to &nbsp;·&nbsp; يُسعدنا تقديم هذه الشهادة إلى
          </div>

          {/* Student name with lines */}
          <div style={{ display:"flex", alignItems:"center", gap:"4mm", justifyContent:"center" }}>
            <div style={{ flex:1, height:"1px", background:`linear-gradient(to right, transparent, ${BLUE}60)` }} />
            <div style={{
              fontSize: "28pt", color: BLUE, fontWeight: "700",
              fontFamily: "'Palatino Linotype', 'Palatino', Georgia, serif",
              fontStyle: "italic", letterSpacing: "1px", padding: "0 4mm",
              whiteSpace: "nowrap",
            }}>
              {studentName}
            </div>
            <div style={{ flex:1, height:"1px", background:`linear-gradient(to left, transparent, ${BLUE}60)` }} />
          </div>

          {/* Course info */}
          <div style={{ marginTop:"3mm", fontSize:"9pt", color:"#555", lineHeight:1.7 }}>
            a complété avec succès la formation en&nbsp;
            <span style={{ color:BLUE, fontWeight:"700", fontSize:"10pt" }}>{courseName}</span>
            <br />
            <span style={{ fontSize:"8.5pt", color:"#777" }}>
              قد أتمّ/أتمّت بنجاح برنامج التكوين في هذا التخصص
            </span>
          </div>

          {/* Duration / Date / Grade */}
          <div style={{
            display:"flex", justifyContent:"center", gap:"8mm",
            marginTop:"3mm", fontSize:"8pt", color:"#666",
          }}>
            <span>⏱ <strong style={{color:BLUE}}>{duration}</strong></span>
            <span style={{color:"#ccc"}}>|</span>
            <span>📅 <strong style={{color:BLUE}}>{completionDate}</strong></span>
            {grade && <>
              <span style={{color:"#ccc"}}>|</span>
              <span>🏆 <strong style={{color:GOLD}}>{grade}</strong></span>
            </>}
          </div>
        </div>

        {/* Bottom: badge + signature + QR */}
        <div style={{
          display:"flex", alignItems:"flex-end",
          justifyContent:"space-between", width:"100%",
        }}>
          {/* Signature */}
          <div style={{ textAlign:"center", minWidth:"50mm" }}>
            <div style={{
              width:"45mm", height:"1px",
              background: BLUE, marginBottom:"1.5mm",
            }} />
            <div style={{ fontSize:"9pt", fontWeight:"700", color:BLUE }}>{directorName}</div>
            <div style={{ fontSize:"7.5pt", color:"#888" }}>{directorTitle}</div>
          </div>

          {/* Badge center */}
          <div style={{ textAlign:"center" }}>
            <Badge size={52} />
          </div>

          {/* QR + verify code */}
          <div style={{ textAlign:"center", minWidth:"28mm" }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR" style={{ width:"22mm", height:"22mm", border:`1px solid ${GOLD}50`, borderRadius:"2mm" }} />
            ) : (
              <div style={{
                width:"22mm", height:"22mm",
                border:`2px dashed ${GOLD}80`, borderRadius:"2mm",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"6pt", color:"#aaa", background:"#fafafa",
              }}>
                QR Code
              </div>
            )}
            {verifyCode && (
              <div style={{ fontSize:"5pt", color:"#aaa", marginTop:"1mm", letterSpacing:"0.5px" }}>
                #{verifyCode.slice(0,12).toUpperCase()}
              </div>
            )}
            <div style={{ fontSize:"5.5pt", color:"#bbb", marginTop:"0.5mm" }}>Vérification</div>
          </div>
        </div>

      </div>

      {/* ── Footer strip inside blue border ── */}
      <div style={{
        position:"absolute", bottom:"5mm", left:0, right:0,
        textAlign:"center", zIndex:6,
      }}>
        <div style={{ fontSize:"6pt", color:"rgba(255,255,255,0.65)", letterSpacing:"2px" }}>
          {schoolInfo.email} &nbsp;·&nbsp; {schoolInfo.phones[0]} &nbsp;·&nbsp; {schoolInfo.address}
        </div>
      </div>

    </div>
  );
}
