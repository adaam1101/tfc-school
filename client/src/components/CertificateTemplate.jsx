import React from "react";
import { schoolInfo } from "../config/branding.js";

const BLUE  = "#04436E";
const BLUE2 = "#032D4A";
const GOLD  = "#8B6914";
const CREAM = "#FAF8F0";

/* ── SVG ornamental corner ── */
const Corner = ({ rotate = 0, size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80"
    style={{ transform: `rotate(${rotate}deg)`, display:"block" }}>
    <path d="M4,4 L4,32 Q4,36 8,36 L8,8 L36,8 Q36,4 32,4 Z"
      fill="none" stroke={GOLD} strokeWidth="2" />
    <path d="M4,4 L24,4 Q28,4 28,8 L8,8 Q8,28 4,28 Z"
      fill={GOLD} opacity="0.15" />
    <circle cx="4" cy="4" r="3" fill={GOLD} />
    <path d="M14,4 Q18,14 28,4" fill="none" stroke={GOLD} strokeWidth="1.5" />
    <path d="M4,14 Q14,18 4,28" fill="none" stroke={GOLD} strokeWidth="1.5" />
    <circle cx="28" cy="4" r="2" fill={GOLD} opacity="0.6" />
    <circle cx="4" cy="28" r="2" fill={GOLD} opacity="0.6" />
  </svg>
);

/* ── Top floral divider ── */
const Floral = ({ width = 180 }) => (
  <svg width={width} height="28" viewBox="0 0 300 28">
    <path d="M150,14 L140,6 Q150,2 160,6 Z" fill={GOLD} />
    <path d="M150,14 L140,22 Q150,26 160,22 Z" fill={GOLD} />
    <circle cx="150" cy="14" r="3" fill={GOLD} />
    <path d="M10,14 Q75,4 130,14 Q75,24 10,14 Z" fill="none" stroke={GOLD} strokeWidth="1.2" />
    <path d="M290,14 Q225,4 170,14 Q225,24 290,14 Z" fill="none" stroke={GOLD} strokeWidth="1.2" />
    <circle cx="10"  cy="14" r="2.5" fill={GOLD} />
    <circle cx="290" cy="14" r="2.5" fill={GOLD} />
    <path d="M30,14 Q40,8 50,14 Q40,20 30,14 Z"   fill={GOLD} opacity="0.5" />
    <path d="M270,14 Q260,8 250,14 Q260,20 270,14 Z" fill={GOLD} opacity="0.5" />
    <path d="M55,14 Q65,10 75,14 Q65,18 55,14 Z"  fill={GOLD} opacity="0.35" />
    <path d="M245,14 Q235,10 225,14 Q235,18 245,14 Z" fill={GOLD} opacity="0.35" />
  </svg>
);

export default function CertificateTemplate({
  studentName    = "Mohamed Amine Bouaziz",
  courseName     = "Informatique & Bureautique",
  duration       = "6 mois",
  completionDate = "Juin 2026",
  directorName   = "Directeur",
  verifyCode     = null,
  qrDataUrl      = null,
  grade          = null,
}) {
  return (
    <div
      id="certificate-root"
      style={{
        width: "297mm", height: "210mm",
        background: CREAM,
        position: "relative", overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Cinzel', 'Georgia', serif",
      }}
    >
      {/* ── Subtle noise texture overlay ── */}
      <div style={{
        position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat", opacity:0.6,
      }} />

      {/* ── TFC Logo watermark ── */}
      <img src="/tfc-logo.png" alt="" style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:"130mm", height:"130mm",
        objectFit:"contain", opacity:0.05,
        pointerEvents:"none", zIndex:2,
      }} />

      {/* ── Outer thin border ── */}
      <div style={{
        position:"absolute", inset:"6mm",
        border:`1.5px solid ${GOLD}`,
        zIndex:3, pointerEvents:"none",
      }} />

      {/* ── Inner thin border ── */}
      <div style={{
        position:"absolute", inset:"9mm",
        border:`0.5px solid ${GOLD}90`,
        zIndex:3, pointerEvents:"none",
      }} />

      {/* ── Corner ornaments ── */}
      <div style={{position:"absolute", top:"4.5mm",  left:"4.5mm",  zIndex:4}}><Corner rotate={0}   /></div>
      <div style={{position:"absolute", top:"4.5mm",  right:"4.5mm", zIndex:4}}><Corner rotate={90}  /></div>
      <div style={{position:"absolute", bottom:"4.5mm",left:"4.5mm", zIndex:4}}><Corner rotate={270} /></div>
      <div style={{position:"absolute", bottom:"4.5mm",right:"4.5mm",zIndex:4}}><Corner rotate={180} /></div>

      {/* ── Content ── */}
      <div style={{
        position:"absolute", top:"14mm", left:"16mm", right:"16mm", bottom:"14mm",
        zIndex:5,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"space-between",
        textAlign:"center",
      }}>

        {/* Top ornament */}
        <Floral width={220} />

        {/* CERTIFICAT */}
        <div>
          <div style={{
            fontFamily:"'Cinzel', Georgia, serif",
            fontSize:"38pt", fontWeight:"900",
            color: BLUE, letterSpacing:"10px",
            textTransform:"uppercase", lineHeight:1,
            textShadow:`1px 1px 0 ${BLUE2}30`,
          }}>
            CERTIFICAT
          </div>
          <div style={{
            fontFamily:"'Cinzel', Georgia, serif",
            fontSize:"10pt", fontWeight:"700",
            color: GOLD, letterSpacing:"6px",
            textTransform:"uppercase", marginTop:"1.5mm",
          }}>
            DE FORMATION PROFESSIONNELLE
          </div>
          <div style={{
            fontSize:"8pt", color:`${BLUE}99`,
            letterSpacing:"3px", marginTop:"1mm",
            fontFamily:"Georgia, serif", fontStyle:"italic",
          }}>
            شهادة تكوين مهني
          </div>
        </div>

        {/* Presented to + name */}
        <div style={{width:"100%"}}>
          <div style={{
            fontSize:"9pt", fontStyle:"italic",
            color:`${BLUE}99`, marginBottom:"2mm",
            fontFamily:"Georgia, serif", letterSpacing:"1px",
          }}>
            Proudly presented to &nbsp;·&nbsp; يُسعدنا تقديم هذه الشهادة إلى
          </div>

          <div style={{
            fontFamily:"'Dancing Script', cursive",
            fontSize:"40pt", fontWeight:"700",
            color: BLUE, lineHeight:1.1,
            letterSpacing:"1px",
          }}>
            {studentName}
          </div>

          {/* Line under name */}
          <div style={{
            margin:"2mm auto 3mm",
            width:"160mm", height:"1px",
            background:`linear-gradient(to right, transparent, ${GOLD}, ${GOLD}, transparent)`,
          }} />

          {/* Description */}
          <div style={{
            fontFamily:"Georgia, serif",
            fontSize:"9pt", color:`${BLUE2}cc`,
            lineHeight:1.8, letterSpacing:"0.3px",
          }}>
            Pour avoir complété avec succès et distinction la formation en&nbsp;
            <span style={{fontWeight:"700", color:BLUE}}>{courseName}</span>
            <br/>
            <span style={{fontSize:"8pt", color:`${BLUE}88`, fontStyle:"italic"}}>
              إتماماً بنجاح وتفوق برنامج التكوين في هذا التخصص
            </span>
          </div>

          {/* Duration · Date · Grade */}
          <div style={{
            marginTop:"2.5mm",
            display:"flex", justifyContent:"center", gap:"6mm",
            fontSize:"8pt", color:`${GOLD}dd`,
            fontFamily:"Georgia, serif", fontStyle:"italic",
          }}>
            <span>Durée: <strong style={{color:BLUE}}>{duration}</strong></span>
            <span style={{color:`${GOLD}50`}}>✦</span>
            <span>Date: <strong style={{color:BLUE}}>{completionDate}</strong></span>
            {grade && <>
              <span style={{color:`${GOLD}50`}}>✦</span>
              <span>Mention: <strong style={{color:BLUE}}>{grade}</strong></span>
            </>}
          </div>
        </div>

        {/* Bottom: signatures + QR */}
        <div style={{
          display:"flex", alignItems:"flex-end",
          justifyContent:"space-between", width:"100%",
          paddingBottom:"1mm",
        }}>
          {/* Signature 1 */}
          <div style={{textAlign:"center", minWidth:"50mm"}}>
            <div style={{width:"44mm", height:"1px", background:`${GOLD}80`, margin:"0 auto 2mm"}} />
            <div style={{
              fontFamily:"'Cinzel', Georgia, serif",
              fontSize:"8pt", fontWeight:"700", color:BLUE,
            }}>
              {directorName}
            </div>
            <div style={{fontSize:"7pt", color:`${GOLD}cc`, fontStyle:"italic", fontFamily:"Georgia,serif"}}>
              Directeur · المدير
            </div>
          </div>

          {/* Center: school name + bottom ornament */}
          <div style={{textAlign:"center"}}>
            <img src="/tfc-logo.png" alt="TFC" style={{
              width:"14mm", height:"14mm", objectFit:"contain",
              opacity:0.7, marginBottom:"1mm",
            }} />
            <div style={{
              fontFamily:"'Cinzel',Georgia,serif",
              fontSize:"7pt", fontWeight:"700",
              color:`${BLUE}99`, letterSpacing:"2px",
            }}>
              TFC · ANNABA
            </div>
          </div>

          {/* QR code */}
          <div style={{textAlign:"center", minWidth:"28mm"}}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR"
                style={{width:"20mm", height:"20mm", border:`1px solid ${GOLD}50`, borderRadius:"1mm"}} />
            ) : (
              <div style={{
                width:"20mm", height:"20mm",
                border:`1.5px dashed ${GOLD}70`, borderRadius:"1mm",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"5.5pt", color:`${GOLD}99`, background:`${GOLD}08`,
              }}>
                QR Code
              </div>
            )}
            {verifyCode && (
              <div style={{fontSize:"4.5pt", color:`${GOLD}88`, marginTop:"0.5mm", letterSpacing:"0.5px"}}>
                {verifyCode.slice(0,12).toUpperCase()}
              </div>
            )}
            <div style={{fontSize:"5pt", color:`${BLUE}60`, marginTop:"0.3mm", fontStyle:"italic", fontFamily:"Georgia,serif"}}>
              Vérification
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
