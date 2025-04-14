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

  // 🔹 Νέες προσθήκες για στάδιο 3

  // Live Logs στο UI
  function addLog(message, type = "info") {
    const logBox = document.getElementById("logOutput");
    if (!logBox) return;
    const p = document.createElement("p");
    p.textContent = message;

    if (type === "success") p.style.color = "#4ade80";      // green
    else if (type === "error") p.style.color = "#f87171";   // red
    else if (type === "warn") p.style.color = "#facc15";    // yellow
    else p.style.color = "#93c5fd";                         // blue

    logBox.appendChild(p);
    logBox.scrollTop = logBox.scrollHeight;
  }

  // Ενεργοποίηση κουμπιού Download Failed
  function enableDownloadFailed(failed, callback) {
    const btn = document.getElementById("downloadFailedBtn");
    if (!btn) return;
    btn.style.display = "inline-block";
    btn.onclick = () => callback(failed);
  }

  // Δυναμική εμφάνιση των τελευταίων airdrops
  async function updateLastAirdrops() {
    const container = document.getElementById("lastAirdrops");
    if (!container) return;

    try {
      const res = await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/logs");
      const data = await res.json();

      container.innerHTML = "";
      data.forEach(entry => {
        const div = document.createElement("div");
        div.className = "airdrop-log-entry";
        div.innerHTML = `
          <p><strong>Sender:</strong> ${shorten(entry.sender)}</p>
          <p><strong>Token:</strong> ${entry.symbol}</p>
          <p><strong>Recipients:</strong> ${entry.recipientCount}</p>
          <p><strong>Amount:</strong> ${ethers.utils.formatUnits(entry.amountPerRecipient, 18)}</p>
          <p><strong>TX:</strong> <a href="https://polygonscan.com/tx/${entry.txHash}" target="_blank">View</a></p>
          <hr>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Failed to load last airdrops:", err);
    }
  }

  function shorten(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  // 🔚 Επιστρέφουμε τα πάντα στο module
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
