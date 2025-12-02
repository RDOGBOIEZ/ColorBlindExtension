console.log("%c[Popup] Loaded", "color:#66d9ff;font-weight:700;");

const colorAInput = document.getElementById("colorA");
const colorBInput = document.getElementById("colorB");
const strengthSlider = document.getElementById("strength");
const strengthLabel = document.getElementById("strengthLabel");
const presetSelect = document.getElementById("presetSelect");
const applyBtn = document.getElementById("applyBtn");
const resetBtn = document.getElementById("resetBtn");
const reloadToggle = document.getElementById("reloadToggle");

let contentReady = false;

// Wait for content script to signal it's loaded
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "contentReady") {
        contentReady = true;
        console.log("%c[Popup] Content script ready", "color:#66ff99");
    }
});

function updateStrengthLabel() {
    strengthLabel.textContent = strengthSlider.value + "%";
}

strengthSlider.addEventListener("input", () => {
    updateStrengthLabel();
    save();
});

updateStrengthLabel();

// Load persisted settings
chrome.storage.sync.get(
    ["colorA", "colorB", "strength", "preset", "reloadPage"],
    data => {
        if (data.colorA) colorAInput.value = data.colorA;
        if (data.colorB) colorBInput.value = data.colorB;

        if (data.strength) {
            strengthSlider.value = data.strength;
            updateStrengthLabel();
        }

        if (data.preset) presetSelect.value = data.preset;
        if (data.reloadPage !== undefined) reloadToggle.checked = data.reloadPage;
    }
);

function save() {
    chrome.storage.sync.set({
        colorA: colorAInput.value,
        colorB: colorBInput.value,
        strength: strengthSlider.value,
        preset: presetSelect.value,
        reloadPage: reloadToggle.checked
    });
}

colorAInput.onchange = save;
colorBInput.onchange = save;
presetSelect.onchange = save;
reloadToggle.onchange = save;

// Ensure tab has scripting access before messaging
function sendToActive(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, message, response => {
          if (callback) callback(response);
      });
  });
}


applyBtn.onclick = () => {
    const preset = presetSelect.value;

    const payload =
        preset === "adaptive"
            ? {
                  type: "applyAdaptive",
                  colorA: colorAInput.value,
                  colorB: colorBInput.value,
                  strength: Number(strengthSlider.value) / 100
              }
            : {
                  type: "applyPreset",
                  preset,
                  strength: Number(strengthSlider.value) / 100
              };

    sendToActive(payload, () => {
        if (reloadToggle.checked) chrome.tabs.reload();
    });
};

resetBtn.onclick = () => {
    sendToActive({ type: "resetAll" }, () => {
        if (reloadToggle.checked) chrome.tabs.reload();
    });
};

