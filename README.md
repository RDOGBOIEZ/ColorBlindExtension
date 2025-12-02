# ColorBlindExtension

This project is a Chrome extension that performs color correction on webpages using matrix transformations. It supports adaptive color correction between two selected colors and includes preset matrices for major types of color-vision deficiencies. The extension modifies text and background colors on the page by applying computed-style extraction, RGB parsing, and matrix-based color adjustment.

The extension continuously updates dynamically added elements by observing the DOM through a MutationObserver.

# Features

Adaptive correction between two user-selected colors
Preset matrices for protanopia, deuteranopia, and tritanopia
Matrix blending with adjustable strength
Full-page element traversal and recoloring
Automatic recoloring for dynamically added elements
Popup interface with color pickers, preset dropdown, strength slider, and reload toggle

# File Structure

manifest.json
content.js
popup.html
popup.js
popup.css

# How It Works

The content script waits for the DOM to load, then sends a "contentReady" message to the popup. When the user selects settings in the popup, a message is sent back to the content script.

The content script builds either:
1. an adaptive matrix based on the difference between two colors
or
2. a preset matrix based on a selected type of color-vision deficiency

The matrix is blended using the selected strength, then applied to each element's text and background color using direct inline style overrides.

A MutationObserver is used to detect newly inserted nodes so they are recolored automatically.

# Adaptive Matrix

The adaptive matrix is created by converting two hex colors to RGB, computing the per-channel differences, scaling them, and producing a 3x3 matrix.

The matrix is blended toward identity based on the selected strength percentage.

# Preset Matrices

The extension includes matrices for:
protanopia
deuteranopia
tritanopia

# Installation Instructions (Chrome)

1. Download or clone this folder to your computer.
2. Open Chrome and go to chrome://extensions
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked".
5. Select the folder that contains manifest.json.
6. The extension will load and appear in your toolbar.

# Editing or Expanding the Extension

Add new preset matrices to the "presetMatrices" object in content.js.
Add new controls to popup.html and handle their values in popup.js.
Modify the matrix generation or blending logic in content.js if additional correction types are needed.

# Notes

GitHub.com blocks inline style modifications through strict Content Security Policy. To test the extension’s color correction functionality, use other websites that allow inline styling such as:
reddit.com
wikipedia.org
duckduckgo.com
cnn.com
espn.com
amazon.com
stackoverflow.com
medium.com

For development and testing, avoid sites that block inline styles or injected scripts.
