console.log("%c[Popup] Loaded", "color:#66d9ff;font-weight:700;");

// DOM elements
const colorA = document.getElementById("colorA");
const colorB = document.getElementById("colorB");
const colorASelect = document.getElementById("colorASelect");
const colorBSelect = document.getElementById("colorBSelect");
const strength = document.getElementById("strength");
const strengthLabel = document.getElementById("strengthLabel");
const preset = document.getElementById("presetSelect");
const applyBtn = document.getElementById("applyBtn");
const resetBtn = document.getElementById("resetBtn");


// ===============================
//  DROPDOWN → COLOR PICKER
// ===============================
colorASelect.addEventListener("change", () => {
    if (colorASelect.value) {
        colorA.value = colorASelect.value;
    }
});

colorBSelect.addEventListener("change", () => {
    if (colorBSelect.value) {
        colorB.value = colorBSelect.value;
    }
});


// ===============================
//  COLOR PICKER → DROPDOWN (sync)
// ===============================
colorA.addEventListener("input", () => {
    colorASelect.value = colorA.value;
});

colorB.addEventListener("input", () => {
    colorBSelect.value = colorB.value;
});


// ===============================
//  STRENGTH BAR LABEL UPDATE
// ===============================
strength.addEventListener("input", () => {
    strengthLabel.textContent = strength.value + "%";
});


// ===============================
//  SEND MESSAGE TO ACTIVE TAB
// ===============================
function sendToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs.length) return;
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}


// ===============================
//  APPLY BUTTON
// ===============================
applyBtn.onclick = () => {
    if (preset.value === "adaptive") {
        sendToActiveTab({
            type: "applyAdaptive",
            colorA: colorA.value,
            colorB: colorB.value,
            strength: Number(strength.value) / 100
        });
    } else {
        sendToActiveTab({
            type: "applyPreset",
            preset: preset.value,
            strength: Number(strength.value) / 100
        });
    }
};


// ===============================
//  RESET BUTTON
// ===============================
resetBtn.onclick = () => {
    sendToActiveTab({ type: "resetAll" });
};
