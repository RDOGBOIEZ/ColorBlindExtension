// Color transformation matrices (simple tested values)
const matrices = {
  none: null,

  protanopia: [
      0.567, 0.433, 0.0,
      0.558, 0.442, 0.0,
      0.0,   0.242, 0.758
  ],

  deuteranopia: [
      0.625, 0.375, 0.0,
      0.7,   0.3,   0.0,
      0.0,   0.3,   0.7
  ],

  tritanopia: [
      0.95,  0.05,  0.0,
      0.0,   0.43,  0.57,
      0.0,   0.475, 0.525
  ]
};

function applyMatrix(element, matrix) {
  if (!matrix) {
      element.style.filter = "";
      return;
  }
  element.style.filter = `url('data:image/svg+xml;utf8,
    <svg xmlns="http://www.w3.org/2000/svg">
      <filter id="cb">
        <feColorMatrix type="matrix" values="${matrix.join(" ")}"/>
      </filter>
    </svg>#cb')`;
}

function applyOutline(enabled) {
  if (enabled) {
      document.querySelectorAll("button, a, input, div").forEach(el => {
          el.style.outline = "2px solid #000";
      });
  } else {
      document.querySelectorAll("*").forEach(el => {
          el.style.outline = "";
      });
  }
}

// Listen for popup changes
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "applySettings") {
      const matrix = matrices[msg.preset];
      applyMatrix(document.documentElement, matrix);
      applyOutline(msg.outline);
  }
});

// Load settings on page load
chrome.storage.sync.get(["preset", "outline"], (res) => {
  const matrix = matrices[res.preset || "none"];
  applyMatrix(document.documentElement, matrix);
  applyOutline(res.outline || false);
});
