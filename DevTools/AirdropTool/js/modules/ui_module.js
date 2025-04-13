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
    const sections = {
      paste: document.getElementById("pasteSection"),
      create: document.getElementById("createSection"),
      random: document.getElementById("randomSection"),
    };

    // Κρύβουμε όλα τα sections
    Object.values(sections).forEach(section => {
      section.style.display = "none";
    });

    // Εμφανίζουμε το επιλεγμένο section
    if (sections[mode]) {
      sections[mode].style.display = "block";
    }

    // Ελέγχουμε αν θα εμφανιστεί το κουμπί Proceed
    const proceedBtn = document.getElementById("proceedButton");
    if (proceedBtn) {
      proceedBtn.style.display = (mode === "paste") ? "none" : "inline-block";
    }
  }

  function setProceedButtonEnabled(enabled) {
    const btn = document.getElementById("proceedButton");
    if (btn) {
      btn.disabled = !enabled;
    }
  }

  function displayResults(addresses) {
    const resultsEl = document.getElementById("results");
    resultsEl.textContent = addresses.join("\n");

    const downloadBtn = document.getElementById("downloadButton");
    if (downloadBtn) {
      downloadBtn.style.display = "block";
    }
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
    setProceedButtonEnabled,
    displayResults,
    downloadAddressesAsTxt
  };
})();
