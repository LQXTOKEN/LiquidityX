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

  function addLog(message, type = "info") {
    console.log(`[LOG][${type.toUpperCase()}] ${message}`);
    const container = document.getElementById("logOutput");
    if (!container) return;

    const p = document.createElement("p");
    p.textContent = message;
    p.style.color =
      type === "error"
        ? "var(--accent-red)"
        : type === "success"
        ? "var(--accent-green)"
        : type === "warn"
        ? "var(--accent-yellow)"
        : "var(--text-light)";
    container.appendChild(p);
  }

  function enableDownloadFailed(failedArray, onClickHandler) {
    const btn = document.getElementById("downloadFailedButton");
    if (!btn) return;

    btn.style.display = "inline-block";
    btn.onclick = () => onClickHandler(failedArray);
  }

  async function updateLastAirdrops() {
    const endpoint = "https://proxy-git-main-lqxtokens-projects.vercel.app/api/airdrops";
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch airdrops");

      const logs = await response.json();
      console.log("[uiModule] Loaded last airdrops:", logs);

      const container = document.getElementById("logOutput");
      if (container && logs.length > 0) {
        container.innerHTML += `<p><strong>LAST AIRDROP TOKENS:</strong></p>`;
        logs.slice(0, 5).forEach((log, i) => {
          const p = document.createElement("p");
          p.textContent = `#${i + 1} – ${log.token} → ${log.count} wallets`;
          p.style.color = "var(--accent-yellow)";
          container.appendChild(p);
        });
      }

    } catch (err) {
      console.warn("[uiModule] Could not load airdrop logs:", err);
      addLog("ℹ️ Could not load latest airdrop logs.", "warn");
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
    enableDownloadFailed,
    updateLastAirdrops
  };
})();
