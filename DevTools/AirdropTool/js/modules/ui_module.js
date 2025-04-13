// js/ui_module.js

window.uiModule = (function () {
  function setWalletInfo(address, balanceFormatted, symbol) {
    document.getElementById("walletAddress").textContent = `Wallet: ${address}`;
    document.getElementById("lqxBalance").textContent = `LQX Balance: ${balanceFormatted} ${symbol}`;
  }

  function setAccessDenied(denied) {
    document.getElementById("accessDenied").style.display = denied ? "block" : "none";
    document.getElementById("airdropTool").style.display = denied ? "none" : "block";
  }

  function showSectionByMode(mode) {
    const sections = ["pasteSection", "createSection", "randomSection"];
    sections.forEach(id => {
      document.getElementById(id).style.display = id.startsWith(mode) ? "block" : "none";
    });

    // ✅ Clear paste textarea only if mode is not 'paste'
    if (mode !== "paste") {
      const pasteInput = document.getElementById("pasteInput");
      if (pasteInput) pasteInput.value = "";
    }
  }

  function setProceedButtonEnabled(enabled) {
    const btn = document.getElementById("proceedButton");
    if (btn) btn.disabled = !enabled;
  }

  function displayResults(addresses) {
    const resultsEl = document.getElementById("results");
    resultsEl.textContent = addresses.join("\n");
    document.getElementById("downloadButton").style.display = "block";
    document.getElementById("sendButton").style.display = "inline-block";
  }

  function downloadAddressesAsTxt(addresses) {
    const blob = new Blob([addresses.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "airdrop_addresses.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function setEligibilityMessage(message, isEligible) {
    const messageEl = document.getElementById("eligibilityMessage");
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.color = isEligible ? "limegreen" : "red";
  }

  function clearResults() {
    const resultsEl = document.getElementById("results");
    if (resultsEl) resultsEl.textContent = "";

    const downloadBtn = document.getElementById("downloadButton");
    if (downloadBtn) downloadBtn.style.display = "none";

    const sendBtn = document.getElementById("sendButton");
    if (sendBtn) sendBtn.style.display = "none";

    // ✅ ΜΟΝΟ pasteInput καθαρίζεται, όχι το random input
    const pasteInput = document.getElementById("pasteInput");
    if (pasteInput) pasteInput.value = "";
  }

  return {
    setWalletInfo,
    setAccessDenied,
    showSectionByMode,
    setProceedButtonEnabled,
    displayResults,
    downloadAddressesAsTxt,
    setEligibilityMessage,
    clearResults
  };
})();
