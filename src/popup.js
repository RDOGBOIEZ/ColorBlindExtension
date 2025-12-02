document.getElementById("apply").addEventListener("click", async () => {
  const preset = document.getElementById("preset").value;
  const outline = document.getElementById("outlineToggle").checked;

  chrome.storage.sync.set({ preset, outline });

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tabs[0].id, {
      action: "applySettings",
      preset,
      outline
  });
});
