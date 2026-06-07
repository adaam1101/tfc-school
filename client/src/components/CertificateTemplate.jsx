import React from "react";
import { schoolInfo } from "../config/branding.js";

const BLUE  = "#04436E";
const BLUE2 = "#032D4A";
const GOLD  = "#8B6914";
const CREAM = "#FAF8F0";

const Corner = ({ rotate = 0 }) => (
  <svg width="64" height="64" viewBox="0 0 80 80"
    style={{ transform:`rotate(${rotate}deg)`, display:"block" }}>
    <path d="M6,6 L6,36 Q6,40 10,40 L10,10 L40,10 Q40,6 36,6 Z"
      fill="none" stroke={GOLD} strokeWidth="2.5" />
    <path d="M6,6 L26,6 Q30,6 30,10 L10,10 Q10,30 6,30 Z"
      fill={GOLD} opacity="0.12" />
    <circle cx="6" cy="6" r="3.5" fill={GOLD} />
    <path d="M18,6 Q22,16 32,6" fill="none" stroke={GOLD} strokeWidth="1.8" />
    <path d="M6,18 Q16,22 6,32"  fill="none" stroke={GOLD} strokeWidth="1.8" />
    <circle cx="32" cy="6"  r="2.5" fill={GOLD} opacity="0.7" />
    <circle cx="6"  cy="32" r="2.5" fill={GOLD} opacity="0.7" />
  </svg>
);

const Floral = () => (
  <svg width="260" height="30" viewBox="0 0 340 30">
    <path d="M170,15 L160,6 Q170,1 180,6 Z"  fill={GOLD} />
    <path d="M170,15 L160,24 Q170,29 180,24 Z" fill={GOLD} />
    <circle cx="170" cy="15" r="3.5" fill={GOLD} />
    <path d="M12,15 Q85,3 148,15 Q85,27 12,15 Z"  fill="none" stroke={GOLD} strokeWidth="1.4" />
    <path d="M328,15 Q255,3 192,15 Q255,27 328,15 Z" fill="none" stroke={GOLD} strokeWidth="1.4" />
    <circle cx="12"  cy="15" r="3" fill={GOLD} />
    <circle cx="328" cy="15" r="3" fill={GOLD} />
    <path d="M34,15 Q44,8 54,15 Q44,22 34,15 Z"   fill={GOLD} opacity="0.55" />
    <path d="M306,15 Q296,8 286,15 Q296,22 306,15 Z" fill={GOLD} opacity="0.55" />
    <path d="M60,15 Q70,11 80,15 Q70,19 60,15 Z"  fill={GOLD} opacity="0.35" />
    <path d="M280,15 Q270,11 260,15 Q270,19 280,15 Z" fill={GOLD} opacity="0.35" />
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
        width:"140mm", height:"140mm",
        objectFit:"contain", opacity:0.05,
        pointerEvents:"none", zIndex:1,
      }} />

      {/* Outer border */}
      <div style={{
        position:"absolute", inset:"6mm",
        border:`2px solid ${GOLD}`,
        zIndex:2, pointerEvents:"none",
      }} />

      {/* Inner border */}
      <div style={{
        position:"absolute", inset:"10mm",
        border:`0.75px solid ${GOLD}70`,
        zIndex:2, pointerEvents:"none",
      }} />

      {/* Corners */}
      <div style={{position:"absolute", top:"3.5mm",  left:"3.5mm",  zIndex:3}}><Corner rotate={0}   /></div>
      <div style={{position:"absolute", top:"3.5mm",  right:"3.5mm", zIndex:3}}><Corner rotate={90}  /></div>
      <div style={{position:"absolute", bottom:"3.5mm",left:"3.5mm", zIndex:3}}><Corner rotate={270} /></div>
      <div style={{position:"absolute", bottom:"3.5mm",right:"3.5mm",zIndex:3}}><Corner rotate={180} /></div>

      {/* Content */}
      <div style={{
        position:"absolute",
        top:"14mm", left:"18mm", right:"18mm", bottom:"12mm",
        zIndex:4,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"space-between",
        textAlign:"center",
      }}>

        {/* Top ornament */}
        <Floral />

        {/* Title block */}
        <div>
          <div style={{
            fontFamily:"'Cinzel', Georgia, serif",
            fontSize:"46pt", fontWeight:"900",
            color: BLUE, letterSpacing:"12px",
            textTransform:"uppercase", lineHeight:1,
          }}>
            CERTIFICAT
          </div>
          <div style={{
            fontFamily:"'Cinzel', Georgia, serif",
            fontSize:"12pt", fontWeight:"700",
            color: GOLD, letterSpacing:"7px",
            textTransform:"uppercase", marginTop:"2mm",
          }}>
            DE FORMATION PROFESSIONNELLE
          </div>
          <div style={{
            fontFamily:"Georgia, serif",
            fontSize:"10pt", fontStyle:"italic",
            color:`${BLUE}88`, letterSpacing:"2px", marginTop:"1mm",
          }}>
            شهادة تكوين مهني
          </div>
        </div>

        {/* Student section */}
        <div style={{width:"100%"}}>
          <div style={{
            fontFamily:"Georgia, serif",
            fontSize:"10.5pt", fontStyle:"italic",
            color:`${BLUE2}99`, letterSpacing:"1px", marginBottom:"3mm",
          }}>
            Proudly presented to &nbsp;&nbsp;·&nbsp;&nbsp; يُسعدنا تقديم هذه الشهادة إلى
          </div>

          {/* Student name */}
          <div style={{
            fontFamily:"'Dancing Script', cursive",
            fontSize:"46pt", fontWeight:"700",
            color: BLUE, lineHeight:1.15,
            letterSpacing:"1px",
          }}>
            {studentName}
          </div>

          {/* Divider line */}
          <div style={{
            margin:"2.5mm auto 4mm",
            width:"170mm", height:"1px",
            background:`linear-gradient(to right, transparent, ${GOLD}CC, ${GOLD}CC, transparent)`,
          }} />

          {/* Description */}
          <div style={{
            fontFamily:"Georgia, serif",
            fontSize:"10.5pt", color:`${BLUE2}CC`,
            lineHeight:1.9, letterSpacing:"0.2px",
          }}>
            Pour avoir complété avec succès et distinction la formation en&nbsp;
            <strong style={{color:BLUE, fontFamily:"'Cinzel',Georgia,serif", fontSize:"11pt"}}>
              {courseName}
            </strong>
            <br/>
            <span style={{
              fontSize:"9.5pt", color:`${BLUE}77`,
              fontStyle:"italic",
            }}>
              إتماماً بنجاح وتفوق برنامج التكوين في هذا التخصص
            </span>
          </div>

          {/* Duration / Date / Grade */}
          <div style={{
            marginTop:"3mm",
            fontFamily:"Georgia, serif",
            fontSize:"9.5pt", fontStyle:"italic",
            color:`${GOLD}DD`,
            display:"flex", justifyContent:"center",
            gap:"8mm", alignItems:"center",
          }}>
            <span>Durée :&nbsp;<strong style={{color:BLUE, fontStyle:"normal"}}>{duration}</strong></span>
            <span style={{color:`${GOLD}50`, fontSize:"8pt"}}>—</span>
            <span>Date :&nbsp;<strong style={{color:BLUE, fontStyle:"normal"}}>{completionDate}</strong></span>
            {grade && <>
              <span style={{color:`${GOLD}50`, fontSize:"8pt"}}>—</span>
              <span>Mention :&nbsp;<strong style={{color:BLUE, fontStyle:"normal"}}>{grade}</strong></span>
            </>}
          </div>
        </div>

        {/* Footer: signature · logo · QR */}
        <div style={{
          display:"flex", alignItems:"flex-end",
          justifyContent:"space-between", width:"100%",
        }}>
          {/* Signature */}
          <div style={{textAlign:"center", minWidth:"55mm"}}>
            <div style={{
              width:"50mm", height:"1px",
              background:`${GOLD}90`, margin:"0 auto 2.5mm",
            }} />
            <div style={{
              fontFamily:"'Cinzel', Georgia, serif",
              fontSize:"9.5pt", fontWeight:"700", color:BLUE,
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
              width:"16mm", height:"16mm",
              objectFit:"contain", opacity:0.75,
              marginBottom:"1.5mm",
            }} />
            <div style={{
              fontFamily:"'Cinzel', Georgia, serif",
              fontSize:"7.5pt", fontWeight:"700",
              color:`${BLUE}88`, letterSpacing:"3px",
            }}>
              TFC &nbsp;·&nbsp; ANNABA
            </div>
          </div>

          {/* QR */}
          <div style={{textAlign:"center", minWidth:"28mm"}}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Verification"
                style={{width:"22mm", height:"22mm",
                  border:`1px solid ${GOLD}60`, borderRadius:"1mm"}} />
            ) : (
              <div style={{
                width:"22mm", height:"22mm",
                border:`1.5px dashed ${GOLD}80`, borderRadius:"1mm",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"6.5pt", color:`${GOLD}AA`,
                fontFamily:"Georgia, serif", fontStyle:"italic",
                background:`${GOLD}08`,
              }}>
                QR Code
              </div>
            )}
            {verifyCode && (
              <div style={{
                fontSize:"5pt", color:`${GOLD}99`,
                marginTop:"1mm", letterSpacing:"0.5px",
                fontFamily:"Georgia, serif",
              }}>
                {verifyCode.slice(0,14).toUpperCase()}
              </div>
            )}
            <div style={{
              fontSize:"6pt", color:`${BLUE}60`,
              marginTop:"0.5mm", fontStyle:"italic",
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
