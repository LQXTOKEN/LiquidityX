// 📄 js/modules/ui_module.js
// Περιέχει: ενημέρωση UI, εμφανίσεις logs, αποτελέσματα, reset, μετρητές, holder check κ.ά.

window.uiModule = (function () {
  const walletAddressEl = document.getElementById("walletAddress");
  const lqxBalanceEl = document.getElementById("lqxBalance");
  const eligibilityMsgEl = document.getElementById("eligibilityMessage");
  const tokenStatusEl = document.getElementById("tokenStatus");
  const resultsEl = document.getElementById("results");
  const logOutputEl = document.getElementById("logOutput");
  const recoveryResultsEl = document.getElementById("recoveryResults");
  const airdropToolCard = document.getElementById("airdropTool");
  const lastAirdropCard = document.getElementById("lastAirdropCard");
  const accessDeniedEl = document.getElementById("accessDenied");

  function updateWalletUI(address) {
    walletAddressEl.textContent = `Wallet: ${address}`;
    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
  }

  function updateLQXBalance({ formatted, symbol }) {
    lqxBalanceEl.textContent = `Balance: ${formatted} ${symbol}`;
    const threshold = 1000;

    if (parseFloat(formatted) >= threshold) {
      eligibilityMsgEl.textContent = "✅ You are eligible to use the airdrop tool.";
      accessDeniedEl.style.display = "none";
      airdropToolCard.style.display = "block";
    } else {
      eligibilityMsgEl.textContent = "";
      accessDeniedEl.style.display = "block";
      airdropToolCard.style.display = "none";
    }
  }

  function showError(message) {
    log(`❌ ${message}`);
  }

  function log(message) {
    const line = document.createElement("div");
    line.textContent = message;
    logOutputEl.appendChild(line);
    logOutputEl.scrollTop = logOutputEl.scrollHeight;
  }

  function clearLogs() {
    logOutputEl.innerHTML = "";
  }

  function clearResults() {
    resultsEl.textContent = "";
  }

  function displayAddresses(addresses) {
    resultsEl.textContent = addresses.join("\n");
  }

  function updateTokenStatus(text) {
    tokenStatusEl.textContent = text;
  }

  function updateRecoveryResults(text) {
    recoveryResultsEl.textContent = text;
  }

  function resetUI() {
    walletAddressEl.textContent = "";
    lqxBalanceEl.textContent = "";
    eligibilityMsgEl.textContent = "";
    tokenStatusEl.textContent = "";
    resultsEl.textContent = "";
    logOutputEl.innerHTML = "";
    recoveryResultsEl.innerHTML = "";
    lastAirdropCard.innerHTML = "";
    airdropToolCard.style.display = "none";
    accessDeniedEl.style.display = "none";
    document.getElementById("connectWallet").style.display = "inline-block";
    document.getElementById("disconnectWallet").style.display = "none";
  }

  function showModeSection(mode) {
    ["pasteSection", "createSection", "randomSection"].forEach((id) => {
      document.getElementById(id).style.display = "none";
    });
    if (mode === "paste") {
      document.getElementById("pasteSection").style.display = "block";
    } else if (mode === "create") {
      document.getElementById("createSection").style.display = "block";
    } else if (mode === "random") {
      document.getElementById("randomSection").style.display = "block";
    }
  }

  function updateLastAirdrops() {
    // ✅ Placeholder για εμφάνιση ιστορικού airdrops
    console.log("[uiModule] Placeholder: updateLastAirdrops");
  }

  return {
    updateWalletUI,
    updateLQXBalance,
    showError,
    log,
    clearLogs,
    clearResults,
    displayAddresses,
    updateTokenStatus,
    updateRecoveryResults,
    resetUI,
    showModeSection,
    updateLastAirdrops
  };
})();
