// js/modules/ui_module.js

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

    // Also toggle proceed button visibility
    toggleProceedButton(mode);

    // Clear results if changing mode
    const results = document.getElementById("results");
    if (results && results.textContent.trim().length > 0) {
      const confirmChange = confirm("Switching mode will clear your current list. Continue?");
      if (confirmChange) {
        results.textContent = "";
        document.getElementById("downloadButton").style.display = "none";
      }
    }
  }

  function toggleProceedButton(mode) {
    const proceedBtn = document.getElementById("proceedButton");
    if (!proceedBtn) return;
    proceedBtn.style.display = (mode === "paste") ? "none" : "inline-block";
  }

  function setEligibilityMessage(message, isValid) {
    const el = document.getElementById("eligibilityMessage");
    if (!el) return;
    el.textContent = message;
    el.style.color = isValid ? "var(--accent-green)" : "var(--accent-red)";
  }

  function setProceedButtonEnabled(enabled) {
    const btn = document.getElementById("proceedButton");
    if (btn) btn.disabled = !enabled;
  }

  function displayResults(addresses) {
    const resultsEl = document.getElementById("results");
    resultsEl.textContent = addresses.join("\n");
    document.getElementById("downloadButton").style.display = "block";
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

  return {
    setWalletInfo,
    setAccessDenied,
    showSectionByMode,
    setEligibilityMessage,
    toggleProceedButton,
    setProceedButtonEnabled,
    displayResults,
    downloadAddressesAsTxt
  };
})();
