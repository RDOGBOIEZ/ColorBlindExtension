console.log("%c[Content] Loaded.", "color:#4ecbff;font-weight:700;");

/* ============================================================
   GLOBAL STATE
============================================================ */

let correctionMatrix = null;
let userA = "#ff0000";
let userB = "#00ff00";
let strength = 1.0;

const presetMatrices = {
  none: null,
  protanopia: [
    0.567, 0.433, 0,
    0.558, 0.442, 0,
    0, 0.242, 0.758
  ],
  deuteranopia: [
    0.625, 0.375, 0,
    0.7, 0.3, 0,
    0, 0.3, 0.7
  ],
  tritanopia: [
    0.95, 0.05, 0,
    0, 0.433, 0.567,
    0, 0.475, 0.525
  ]
};

/* ============================================================
   UTILITIES
============================================================ */

function clamp(v) { return Math.min(255, Math.max(0, v)); }

function hexToRgb(h) {
  h = h.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g,"$1$1") : h, 16);
  return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return "#" +
    clamp(r).toString(16).padStart(2,"0") +
    clamp(g).toString(16).padStart(2,"0") +
    clamp(b).toString(16).padStart(2,"0");
}

function extractRGB(str) {
  let m = str.match(/rgba?\((\d+), *(\d+), *(\d+)/);
  return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
}

/* ============================================================
   MATRIX CALCULATION
============================================================ */

function generateAdaptiveMatrix(aHex, bHex) {
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);

  const dr = (b.r - a.r) / 255;
  const dg = (b.g - a.g) / 255;
  const db = (b.b - a.b) / 255;

  const f = 0.6;

  return [
    1 - dr * f, dr * f, 0,
    0, 1 - dg * f, dg * f,
    0, db * f, 1 - db * f
  ];
}

function blendMatrix(m, f) {
  if (!m) return null;
  return m.map((v, i) => v * f + (1 - f) * (i % 4 === 0 ? 1 : 0));
}

function applyMatrixToRGB(m, rgb) {
  if (!m) return rgb;

  const [r, g, b] = rgb;

  return [
    clamp(r * m[0] + g * m[1] + b * m[2]),
    clamp(r * m[3] + g * m[4] + b * m[5]),
    clamp(r * m[6] + g * m[7] + b * m[8])
  ];
}

/* ============================================================
   ELEMENT COLOR ADAPTATION
============================================================ */
/* ============================================================
   ELEMENT COLOR ADAPTATION
============================================================ */
function adaptElement(el) {
   if (!correctionMatrix) return;
 
   const s = getComputedStyle(el);
   if (!s) return;
 
   // REAL color only (ignore "transparent" or inherited defaults)
   const txt = extractRGB(s.color);
   if (txt && s.color !== "rgba(0, 0, 0, 0)" && s.color !== "transparent") {
     const [r, g, b] = applyMatrixToRGB(correctionMatrix, txt);
     el.style.color = rgbToHex(r, g, b);
   }
 
   const bg = extractRGB(s.backgroundColor);
   if (bg && s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") {
     const [r, g, b] = applyMatrixToRGB(correctionMatrix, bg);
     el.style.backgroundColor = rgbToHex(r, g, b);
   }
 }
 
 /* Recolor entire page */
 function adaptPage() {
   if (!correctionMatrix) return;
   document.querySelectorAll("*").forEach(adaptElement);
 }
 
 /* ============================================================
    WAIT FOR DOM
 ============================================================ */
 function waitForDOM(callback) {
   if (document.body) return callback();
 
   const int = setInterval(() => {
     if (document.body) {
       clearInterval(int);
       callback();
     }
   }, 10);
 }
 
 waitForDOM(() => {
   console.log("%c[Content] DOM Ready", "color:#9effc6;font-weight:700;");
 
   // NOW tell popup content is ready
   chrome.runtime.sendMessage({ type: "contentReady" });
 
   const obs = new MutationObserver(m => {
     for (let mu of m) {
       mu.addedNodes.forEach(n => {
         if (n.nodeType === 1) adaptElement(n);
       });
     }
   });
 
   obs.observe(document.body, { childList: true, subtree: true });
 });
 
 /* ============================================================
    MESSAGE HANDLER
 ============================================================ */
 chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
 
   if (msg.type === "applyAdaptive") {
     correctionMatrix = blendMatrix(
       generateAdaptiveMatrix(msg.colorA, msg.colorB),
       msg.strength
     );
     adaptPage();
     setTimeout(() => sendResponse({ok:true}), 0);
     return true;
     
   }
 
   if (msg.type === "applyPreset") {
     correctionMatrix = blendMatrix(
       presetMatrices[msg.preset],
       msg.strength
     );
     adaptPage();
     setTimeout(() => sendResponse({ok:true}), 0);
     return true;
     
   }
 
   if (msg.type === "resetAll") {
     correctionMatrix = null;
     adaptPage(); // clears inline overrides
     setTimeout(() => sendResponse({ok:true}), 0);
     return true;
     
   }
 });
 