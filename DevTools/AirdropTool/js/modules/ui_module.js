// js/modules/ui_module.js

window.uiModule = (function () {
  function updateWalletUI(address) {
    document.getElementById("walletAddress").textContent = `Connected: ${address}`;
    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
    document.getElementById("airdropTool").style.display = "block";
  }

  function updateLQXBalance(balanceInfo) {
    const balanceText = `${balanceInfo.formatted} ${balanceInfo.symbol}`;
    const balanceElement = document.getElementById("lqxBalance");
    balanceElement.textContent = `LQX Balance: ${balanceText}`;

    const eligible = parseFloat(balanceInfo.formatted) >= 1000;
    const message = document.getElementById("eligibilityMessage");
    const toolSection = document.getElementById("airdropTool");
    const accessDenied = document.getElementById("accessDenied");

    if (eligible) {
      message.textContent = "✅ You are eligible to use the airdrop tool.";
      message.style.color = "var(--accent-green)";
      toolSection.style.display = "block";
      accessDenied.style.display = "none";
    } else {
      message.textContent = "❌ You need at least 1000 LQX to use this tool.";
      message.style.color = "var(--accent-red)";
      toolSection.style.display = "none";
      accessDenied.style.display = "block";
    }
  }

  function resetUI() {
    document.getElementById("walletAddress").textContent = "";
    document.getElementById("lqxBalance").textContent = "";
    document.getElementById("eligibilityMessage").textContent = "";
    document.getElementById("connectWallet").style.display = "inline-block";
    document.getElementById("disconnectWallet").style.display = "none";
    document.getElementById("airdropTool").style.display = "none";
    document.getElementById("tokenStatus").textContent = "";
    document.getElementById("recoveryResults").innerHTML = "";
    document.getElementById("recoveryCard").style.display = "none";
    clearResults();
    clearLog();
  }

  function showError(message) {
    const results = document.getElementById("results");
    results.textContent = `❌ ${message}`;
    results.style.color = "var(--accent-red)";
  }

  function clearResults() {
    const results = document.getElementById("results");
    results.textContent = "";
    results.style.color = "";
  }

  function showModeSection(mode) {
    document.querySelectorAll(".modeSection").forEach(section => {
      section.style.display = "none";
    });

    if (mode === "paste") {
      document.getElementById("pasteSection").style.display = "block";
      document.getElementById("proceedButton").style.display = "none";
    } else {
      document.getElementById("proceedButton").style.display = "inline-block";
      const target = mode === "create" ? "createSection" : "randomSection";
      document.getElementById(target).style.display = "block";
    }
  }

  function displayAddresses(addresses) {
    const results = document.getElementById("results");
    results.textContent = addresses.join("\n");
    results.style.color = "var(--text-light)";
    document.getElementById("downloadButton").style.display = "inline-block";
  }

  function getDisplayedAddresses() {
    const results = document.getElementById("results").textContent.trim();
    return results ? results.split("\n") : [];
  }

  function updateTokenStatus(message, isSuccess = true) {
    const status = document.getElementById("tokenStatus");
    status.textContent = message;
    status.style.color = isSuccess ? "var(--accent-green)" : "var(--accent-red)";
  }

  // ✅ Log με μηνύματα κατάστασης
  function addLog(message, type = "info") {
    console.log(`[LOG][${type.toUpperCase()}] ${message}`);
    const container = document.getElementById("logOutput");
    if (!container) return;

    const p = document.createElement("p");
    p.textContent = message;
    p.style.margin = "0.2rem 0";
    p.style.fontSize = "0.9rem";
    p.style.color =
      type === "error"
        ? "var(--accent-red)"
        : type === "success"
        ? "var(--accent-green)"
        : type === "warn"
        ? "var(--accent-yellow)"
        : "var(--text-light)";
    container.appendChild(p);
    container.scrollTop = container.scrollHeight; // ✅ scroll to bottom
  }

  function clearLog() {
    const container = document.getElementById("logOutput");
    if (container) container.innerHTML = "";
  }

  function enableDownloadFailed(failedArray, onClickHandler) {
    const btn = document.getElementById("downloadFailedButton");
    if (!btn) return;

    btn.style.display = "inline-block";
    btn.onclick = () => onClickHandler(failedArray);
  }

  // ✅ Ενημέρωση τελευταίων airdrops μέσω backend proxy
  async function updateLastAirdrops() {
    try {
      const res = await fetch(`${CONFIG.proxyUrl}/api/airdrops`);
      if (!res.ok) throw new Error("Failed to fetch airdrops");
      const data = await res.json();

      const container = document.getElementById("recoveryResults");
      if (!container) return;

      const last = data.slice(0, 5);
      container.innerHTML = "<h4>📦 Last Airdrop Records</h4>";
      last.forEach(record => {
        const p = document.createElement("p");
        p.textContent = `🪙 ${record.token} → ${record.recipients.length} wallets`;
        p.style.color = "var(--text-light)";
        container.appendChild(p);
      });
    } catch (err) {
      console.warn("[uiModule] Could not load airdrop logs:", err);
    }
  }

  return {
    updateWalletUI,
    updateLQXBalance,
    resetUI,
    showError,
    clearResults,
    showModeSection,
    displayAddresses,
    getDisplayedAddresses,
    updateTokenStatus,
    addLog,
    clearLog,
    enableDownloadFailed,
    updateLastAirdrops
  };
})();
