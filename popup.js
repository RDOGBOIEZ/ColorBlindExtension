console.log("%c[Popup] Loaded", "color:#66d9ff;font-weight:700;");

const colorA = document.getElementById("colorA");
const colorB = document.getElementById("colorB");
const strength = document.getElementById("strength");
const strengthLabel = document.getElementById("strengthLabel");
const preset = document.getElementById("presetSelect");
const applyBtn = document.getElementById("applyBtn");
const resetBtn = document.getElementById("resetBtn");

// Update label
strength.addEventListener("input", () => {
    strengthLabel.textContent = strength.value + "%";
});

// Messaging helper
function sendToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs.length) return;
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

// Apply
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

// Reset
resetBtn.onclick = () => {
    sendToActiveTab({ type: "resetAll" });
};
