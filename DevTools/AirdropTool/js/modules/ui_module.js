// js/modules/ui_module.js

window.uiModule = (function () {
  const walletAddressEl = document.getElementById("walletAddress");
  const lqxBalanceEl = document.getElementById("lqxBalance");
  const eligibilityMessageEl = document.getElementById("eligibilityMessage");
  const tokenStatusEl = document.getElementById("tokenStatus");
  const logOutput = document.getElementById("logOutput");
  const resultsEl = document.getElementById("results");
  const airdropToolEl = document.getElementById("airdropTool");

  function updateWalletUI(address) {
    walletAddressEl.textContent = `Connected: ${address}`;
    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
  }

  function updateLQXBalance(balance) {
    lqxBalanceEl.textContent = `LQX Balance: ${balance.formatted}`;
    if (parseFloat(balance.formatted) >= 1000) {
      airdropToolEl.style.display = "block";
      eligibilityMessageEl.textContent = "✅ You are eligible to use the tool.";
      document.getElementById("accessDenied").style.display = "none";
    } else {
      airdropToolEl.style.display = "none";
      eligibilityMessageEl.textContent = "";
      document.getElementById("accessDenied").style.display = "block";
    }
  }

  function updateTokenStatus(message, success) {
    tokenStatusEl.textContent = message;
    tokenStatusEl.style.color = success ? "var(--accent-green)" : "var(--accent-red)";
  }

  function showError(message) {
    addLog(message, "error");
  }

  function addLog(message, type = "info") {
    const line = document.createElement("div");
    line.textContent = `[LOG][${type.toUpperCase()}] ${message}`;
    line.style.color = {
      info: "#ffffff",
      error: "var(--accent-red)",
      warn: "var(--accent-yellow)"
    }[type] || "#ffffff";

    logOutput.appendChild(line);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function clearResults() {
    resultsEl.textContent = "";
    logOutput.innerHTML = "";
  }

  function displayAddresses(addresses) {
    resultsEl.textContent = addresses.join("\n");
  }

  function showModeSection(mode) {
    const sections = ["pasteSection", "createSection", "randomSection"];
    sections.forEach((id) => {
      document.getElementById(id).style.display = id.startsWith(mode) ? "block" : "none";
    });

    // Κρύψε κουμπί proceed αν είναι paste
    document.getElementById("proceedButton").style.display = mode === "paste" ? "none" : "inline-block";
  }

  function resetUI() {
    walletAddressEl.textContent = "";
    lqxBalanceEl.textContent = "";
    tokenStatusEl.textContent = "";
    resultsEl.textContent = "";
    logOutput.innerHTML = "";
    document.getElementById("connectWallet").style.display = "inline-block";
    document.getElementById("disconnectWallet").style.display = "none";
    document.getElementById("airdropTool").style.display = "none";
    document.getElementById("accessDenied").style.display = "none";
    document.getElementById("retryFailedButton").style.display = "none";
    document.getElementById("recoverTokensButton").style.display = "none";
    document.getElementById("recoveryResults").innerHTML = "";
  }

  async function updateLastAirdrops() {
    try {
      const res = await fetch(`${CONFIG.PROXY_API_URL.replace("/api/polygon", "/api/last-airdrops")}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const div = document.createElement("div");
        div.classList.add("card");
        div.style.marginTop = "1.5rem";

        div.innerHTML = `<h2>📦 Last Airdrops</h2><ul style="padding-left: 1.2rem;">${data.map((r) => `
          <li>Sender: ${r.sender}, Token: ${r.token}, Recipients: ${r.count}</li>
        `).join("")}</ul>`;

        document.querySelector(".container").appendChild(div);
      }
    } catch (err) {
      console.warn("[uiModule] Could not load last airdrops");
    }
  }

  function enableDownloadFailed(addresses, callback) {
    const btn = document.getElementById("downloadFailedButton");
    btn.style.display = "inline-block";
    btn.onclick = () => callback(addresses);
  }

  return {
    updateWalletUI,
    updateLQXBalance,
    updateTokenStatus,
    showError,
    addLog,
    clearResults,
    displayAddresses,
    showModeSection,
    resetUI,
    updateLastAirdrops,
    enableDownloadFailed
  };
})();
