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

  function setEligibilityMessage(eligible) {
    const msg = document.getElementById("eligibilityMessage");
    if (!msg) return;

    if (eligible) {
      msg.textContent = "✅ You meet the requirement to use this tool.";
      msg.style.color = "var(--accent-green)";
    } else {
      msg.textContent = "❌ You must hold at least 1000 LQX to use this tool.";
      msg.style.color = "var(--accent-red)";
    }
  }

  function showSectionByMode(mode) {
    const sections = ["pasteSection", "createSection", "randomSection"];
    sections.forEach((id) => {
      document.getElementById(id).style.display = id.startsWith(mode) ? "block" : "none";
    });

    // Εμφάνιση / Απόκρυψη proceed ανά mode
    const proceedBtn = document.getElementById("proceedButton");
    if (proceedBtn) {
      proceedBtn.style.display = (mode === "paste") ? "none" : "inline-block";
    }
  }

  function displayResults(addresses) {
    const resultsEl = document.getElementById("results");
    const sendBtn = document.getElementById("sendButton");
    const downloadBtn = document.getElementById("downloadButton");

    resultsEl.textContent = addresses.join("\n");

    if (addresses.length > 0) {
      if (sendBtn) sendBtn.style.display = "inline-block";
      if (downloadBtn) downloadBtn.style.display = "inline-block";
    } else {
      if (sendBtn) sendBtn.style.display = "none";
      if (downloadBtn) downloadBtn.style.display = "none";
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
    setEligibilityMessage,
    showSectionByMode,
    displayResults,
    downloadAddressesAsTxt,
  };
})();
