import React from "react";
import { schoolInfo } from "../config/branding.js";

const BLUE  = "#04436E";
const BLUE2 = "#032D4A";
const GOLD  = "#B8960C";
const CREAM = "#FAF8F0";

const Corner = ({ rotate = 0 }) => (
  <svg width="58" height="58" viewBox="0 0 72 72"
    style={{ transform:`rotate(${rotate}deg)`, display:"block" }}>
    <path d="M5,5 L5,34 Q5,38 9,38 L9,9 L38,9 Q38,5 34,5 Z"
      fill="none" stroke={BLUE} strokeWidth="2.5" />
    <path d="M5,5 L24,5 Q28,5 28,9 L9,9 Q9,28 5,28 Z"
      fill={BLUE} opacity="0.1" />
    <circle cx="5" cy="5" r="3" fill={BLUE} />
    <path d="M17,5 Q21,14 30,5"  fill="none" stroke={BLUE} strokeWidth="1.6" opacity="0.7" />
    <path d="M5,17 Q14,21 5,30"  fill="none" stroke={BLUE} strokeWidth="1.6" opacity="0.7" />
    <circle cx="30" cy="5" r="2" fill={BLUE} opacity="0.5" />
    <circle cx="5" cy="30" r="2" fill={BLUE} opacity="0.5" />
  </svg>
);

const Floral = () => (
  <svg width="240" height="22" viewBox="0 0 320 22">
    <path d="M160,11 L153,4 Q160,0 167,4 Z"  fill={GOLD} />
    <path d="M160,11 L153,18 Q160,22 167,18 Z" fill={GOLD} />
    <circle cx="160" cy="11" r="3" fill={GOLD} />
    <path d="M10,11 Q80,2 138,11 Q80,20 10,11 Z"   fill="none" stroke={GOLD} strokeWidth="1.3" />
    <path d="M310,11 Q240,2 182,11 Q240,20 310,11 Z" fill="none" stroke={GOLD} strokeWidth="1.3" />
    <circle cx="10"  cy="11" r="2.5" fill={GOLD} />
    <circle cx="310" cy="11" r="2.5" fill={GOLD} />
    <path d="M30,11 Q39,5 48,11 Q39,17 30,11 Z"   fill={GOLD} opacity="0.5" />
    <path d="M290,11 Q281,5 272,11 Q281,17 290,11 Z" fill={GOLD} opacity="0.5" />
  </svg>
);

export default function CertificateTemplate({
  studentName    = "Mohamed Amine Bouaziz",
  courseName     = "Informatique & Bureautique",
  duration       = "6 mois",
  completionDate = "Juin 2026",
  directorName   = "Le Directeur",
  verifyCode     = null,
  qrDataUrl      = null,
  grade          = null,
}) {
  return (
    <div
      id="certificate-root"
      style={{
        width:"297mm", height:"210mm",
        background: CREAM,
        position:"relative", overflow:"hidden",
        boxSizing:"border-box",
        fontFamily:"'Cinzel', Georgia, serif",
      }}
    >
      {/* Watermark */}
      <img src="/tfc-logo.png" alt="" style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:"130mm", height:"130mm",
        objectFit:"contain", opacity:0.05,
        pointerEvents:"none", zIndex:1,
      }} />

      {/* Outer border — BLUE */}
      <div style={{
        position:"absolute", inset:"5mm",
        border:`2.5px solid ${BLUE}`,
        zIndex:2, pointerEvents:"none",
      }} />

      {/* Inner border — BLUE light */}
      <div style={{
        position:"absolute", inset:"9mm",
        border:`1px solid ${BLUE}40`,
        zIndex:2, pointerEvents:"none",
      }} />

      {/* Corners */}
      <div style={{position:"absolute", top:"3mm",   left:"3mm",   zIndex:3}}><Corner rotate={0}   /></div>
      <div style={{position:"absolute", top:"3mm",   right:"3mm",  zIndex:3}}><Corner rotate={90}  /></div>
      <div style={{position:"absolute", bottom:"3mm",left:"3mm",   zIndex:3}}><Corner rotate={270} /></div>
      <div style={{position:"absolute", bottom:"3mm",right:"3mm",  zIndex:3}}><Corner rotate={180} /></div>

      {/* ── All content in one tight column ── */}
      <div style={{
        position:"absolute",
        top:"13mm", left:"16mm", right:"16mm", bottom:"11mm",
        zIndex:4,
        display:"flex", flexDirection:"column",
        alignItems:"center",
        gap:"3.5mm",
        textAlign:"center",
      }}>

        {/* Floral ornament */}
        <Floral />

        {/* CERTIFICAT */}
        <div style={{ lineHeight:1 }}>
          <div style={{
            fontFamily:"'Cinzel', Georgia, serif",
            fontSize:"42pt", fontWeight:"900",
            color: BLUE, letterSpacing:"10px",
            textTransform:"uppercase",
          }}>
            CERTIFICAT
          </div>
          <div style={{
            fontFamily:"'Cinzel', Georgia, serif",
            fontSize:"10.5pt", fontWeight:"700",
            color: GOLD, letterSpacing:"6px",
            textTransform:"uppercase", marginTop:"1mm",
          }}>
            DE FORMATION PROFESSIONNELLE
          </div>
          <div style={{
            fontFamily:"Georgia, serif",
            fontSize:"9pt", fontStyle:"italic",
            color:`${BLUE}80`, letterSpacing:"2px", marginTop:"0.5mm",
          }}>
            شهادة تكوين مهني
          </div>
        </div>

        {/* Gold divider */}
        <div style={{
          width:"140mm", height:"1px",
          background:`linear-gradient(to right, transparent, ${GOLD}BB, ${GOLD}BB, transparent)`,
        }} />

        {/* Presented to */}
        <div style={{
          fontFamily:"Georgia, serif",
          fontSize:"10pt", fontStyle:"italic",
          color:`${BLUE2}88`, letterSpacing:"0.5px",
        }}>
          Proudly presented to &nbsp;·&nbsp; يُسعدنا تقديم هذه الشهادة إلى
        </div>

        {/* Student name */}
        <div style={{
          fontFamily:"'Dancing Script', cursive",
          fontSize:"44pt", fontWeight:"700",
          color: BLUE, lineHeight:1,
          letterSpacing:"1px",
        }}>
          {studentName}
        </div>

        {/* Line under name */}
        <div style={{
          width:"160mm", height:"1px",
          background:`linear-gradient(to right, transparent, ${GOLD}AA, ${GOLD}AA, transparent)`,
        }} />

        {/* Description */}
        <div style={{
          fontFamily:"Georgia, serif",
          fontSize:"10pt", color:`${BLUE2}BB`,
          lineHeight:1.7,
        }}>
          Pour avoir complété avec succès la formation en&nbsp;
          <strong style={{
            color:BLUE,
            fontFamily:"'Cinzel', Georgia, serif",
            fontSize:"10.5pt",
          }}>
            {courseName}
          </strong>
          <br/>
          <span style={{fontSize:"9pt", color:`${BLUE}70`, fontStyle:"italic"}}>
            إتماماً بنجاح برنامج التكوين في هذا التخصص
          </span>
        </div>

        {/* Duration · Date · Grade */}
        <div style={{
          fontFamily:"Georgia, serif",
          fontSize:"9.5pt", fontStyle:"italic",
          color:`${GOLD}CC`,
          display:"flex", justifyContent:"center",
          gap:"7mm", alignItems:"center",
        }}>
          <span>Durée :&nbsp;<strong style={{color:BLUE, fontStyle:"normal"}}>{duration}</strong></span>
          <span style={{color:`${GOLD}50`}}>—</span>
          <span>Date :&nbsp;<strong style={{color:BLUE, fontStyle:"normal"}}>{completionDate}</strong></span>
          {grade && <>
            <span style={{color:`${GOLD}50`}}>—</span>
            <span>Mention :&nbsp;<strong style={{color:BLUE, fontStyle:"normal"}}>{grade}</strong></span>
          </>}
        </div>

        {/* Bottom row — fills remaining space */}
        <div style={{
          width:"100%", marginTop:"auto",
          display:"flex", alignItems:"flex-end",
          justifyContent:"space-between",
        }}>
          {/* Signature */}
          <div style={{textAlign:"center", minWidth:"52mm"}}>
            <div style={{width:"48mm", height:"1px", background:`${BLUE}60`, margin:"0 auto 2mm"}} />
            <div style={{
              fontFamily:"'Cinzel', Georgia, serif",
              fontSize:"9pt", fontWeight:"700", color:BLUE,
            }}>
              {directorName}
            </div>
            <div style={{
              fontFamily:"Georgia, serif",
              fontSize:"8pt", fontStyle:"italic", color:`${GOLD}BB`,
            }}>
              Directeur &nbsp;·&nbsp; المدير
            </div>
          </div>

          {/* Center logo */}
          <div style={{textAlign:"center"}}>
            <img src="/tfc-logo.png" alt="TFC" style={{
              width:"15mm", height:"15mm",
              objectFit:"contain", opacity:0.7,
              marginBottom:"1.5mm",
            }} />
            <div style={{
              fontFamily:"'Cinzel', Georgia, serif",
              fontSize:"7pt", fontWeight:"700",
              color:`${BLUE}80`, letterSpacing:"3px",
            }}>
              TFC &nbsp;·&nbsp; ANNABA
            </div>
          </div>

          {/* QR */}
          <div style={{textAlign:"center", minWidth:"28mm"}}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR"
                style={{width:"20mm", height:"20mm",
                  border:`1px solid ${BLUE}40`, borderRadius:"1mm"}} />
            ) : (
              <div style={{
                width:"20mm", height:"20mm",
                border:`1.5px dashed ${BLUE}60`, borderRadius:"1mm",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"6.5pt", color:`${BLUE}70`,
                fontFamily:"Georgia, serif", fontStyle:"italic",
                background:`${BLUE}06`,
              }}>
                QR Code
              </div>
            )}
            {verifyCode && (
              <div style={{
                fontSize:"5pt", color:`${BLUE}70`,
                marginTop:"1mm", letterSpacing:"0.5px",
                fontFamily:"Georgia, serif",
              }}>
                {verifyCode.slice(0,16).toUpperCase()}
              </div>
            )}
            <div style={{
              fontSize:"5.5pt", color:`${BLUE}55`,
              marginTop:"0.3mm", fontStyle:"italic",
              fontFamily:"Georgia, serif",
            }}>
              Vérification d'authenticité
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
