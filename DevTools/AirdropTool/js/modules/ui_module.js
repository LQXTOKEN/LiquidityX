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
    const proceedButton = document.getElementById("proceedButton");

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id.startsWith(mode) ? "block" : "none";
    });

    // Hide proceed button in paste mode (not needed)
    if (mode === "paste") {
      proceedButton.style.display = "none";
    } else {
      proceedButton.style.display = "inline-block";
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

  function clearResults() {
    document.getElementById("results").textContent = "";
    document.getElementById("downloadButton").style.display = "none";

    const resetFields = [
      "polygonScanInput",
      "contractInput",
      "maxCreateAddresses",
      "maxAddresses"
    ];
    resetFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = el.type === "number" ? el.defaultValue || 100 : "";
    });
  }

  return {
    setWalletInfo,
    setAccessDenied,
    showSectionByMode,
    setProceedButtonEnabled,
    displayResults,
    downloadAddressesAsTxt,
    clearResults
  };
})();
