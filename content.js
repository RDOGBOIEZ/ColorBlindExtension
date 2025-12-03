console.log("%c[Content] Loaded.", "color:#4ecbff;font-weight:700;");

let filterCSS = "";

// Apply current filter to page
function applyFilter(css) {
    filterCSS = css;
    document.documentElement.style.filter = filterCSS;
}

// Reset filter
function clearFilter() {
    filterCSS = "";
    document.documentElement.style.filter = "";
}

// Listen for popup commands
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "applyAdaptive") {
        const { colorA, colorB, strength } = msg;

        // Convert A → B direction into a hue shift
        const hueShift = calculateHueShift(colorA, colorB) * strength;

        const css = `hue-rotate(${hueShift}deg) saturate(${1 + strength})`;

        applyFilter(css);
        sendResponse({ ok: true });
        return true;
    }

    if (msg.type === "applyPreset") {
        const { preset, strength } = msg;

        let css = "";

        if (preset === "protanopia") css = `contrast(${1 + strength}) saturate(${1.2})`;
        if (preset === "deuteranopia") css = `hue-rotate(${20 * strength}deg)`;
        if (preset === "tritanopia") css = `hue-rotate(${-45 * strength}deg)`;

        applyFilter(css);
        sendResponse({ ok: true });
        return true;
    }

    if (msg.type === "resetAll") {
        clearFilter();
        sendResponse({ ok: true });
        return true;
    }
});

// Send ready signal
chrome.runtime.sendMessage({ type: "contentReady" });


// --------------------
// UTILITIES
// --------------------

// Calculate hue difference between two hex colors
function calculateHueShift(hex1, hex2) {
    const hsl1 = rgbToHsl(hexToRgb(hex1));
    const hsl2 = rgbToHsl(hexToRgb(hex2));

    let diff = hsl2.h - hsl1.h;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    return diff;
}

function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;

    if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;

        h *= 60;
        if (h < 0) h += 360;
    }

    return { h, s: 0, l: (max + min) / 2 };
}
