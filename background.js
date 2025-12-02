/* =====================================================================
      BACKGROUND.JS — Adaptive Colorblind Engine Controller
   ===================================================================== */

   console.log("%c[Background] Service worker started.", "color:#4ecbff;font-weight:700;");

   let currentSettings = {
       type: "none",
       strength: 1.0,
       colorA: "#ff0000",
       colorB: "#00ff00"
   };
   
   /* =====================================================================
      STORAGE HELPERS
      ===================================================================== */
   
   function saveSettings() {
       chrome.storage.sync.set({ adaptiveSettings: currentSettings });
   }
   
   function loadSettings() {
       chrome.storage.sync.get("adaptiveSettings", (data) => {
           if (data.adaptiveSettings) {
               currentSettings = data.adaptiveSettings;
               console.log("%c[Background] Loaded settings:", "color:#7affd9", currentSettings);
           }
       });
   }
   
   // Load saved user settings on service worker init
   loadSettings();
   
   /* =====================================================================
      MESSAGE ROUTER — FROM POPUP.JS → CONTENT.JS
      ===================================================================== */
   
   chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
       console.log("%c[Background] Message received:", "color:#a0ff9f", msg);
   
       // Popup wants to apply adaptive correction
       if (msg.type === "applyAdaptive") {
           currentSettings = {
               type: "adaptive",
               colorA: msg.colorA,
               colorB: msg.colorB,
               strength: msg.strength
           };
   
           saveSettings();
   
           sendToActiveTab({
               type: "applyPreset",
               preset: "adaptive",
               colorA: msg.colorA,
               colorB: msg.colorB,
               strength: msg.strength
           });
   
           sendResponse({ ok: true });
       }
   
       // Popup wants to apply a preset instead of adaptive
       if (msg.type === "applyPreset") {
           currentSettings = {
               type: msg.preset,
               colorA: currentSettings.colorA,
               colorB: currentSettings.colorB,
               strength: msg.strength
           };
   
           saveSettings();
   
           sendToActiveTab({
               type: "applyPreset",
               preset: msg.preset,
               strength: msg.strength
           });
   
           sendResponse({ ok: true });
       }
   });
   
   /* =====================================================================
      SEND MESSAGE TO ACTIVE TAB
      ===================================================================== */
   
   function sendToActiveTab(message) {
       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
           if (!tabs || !tabs[0]) return;
           chrome.tabs.sendMessage(tabs[0].id, message);
       });
   }
   
   /* =====================================================================
      KEEP SERVICE WORKER ALIVE LONGER (MV3 SAFE TRICK)
      ===================================================================== */
   
   chrome.runtime.onInstalled.addListener(() => {
       console.log("%c[Background] Installed / Updated.", "color:#ffd86b");
   });
   
   