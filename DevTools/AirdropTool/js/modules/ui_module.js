// js/modules/ui_module.js

window.uiModule = (function () {
  // ✅ Ενημέρωση Wallet UI
  function updateWalletUI(address) {
    document.getElementById("walletAddress").textContent = `Connected: ${address}`;
    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
    document.getElementById("airdropTool").style.display = "block";
  }

  // ✅ Ενημέρωση LQX Balance και eligibility
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

  // ✅ Reset ολόκληρου UI
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
    clearLogs();
  }

  // ✅ Εμφάνιση error
  function showError(message) {
    const results = document.getElementById("results");
    results.textContent = `❌ ${message}`;
    results.style.color = "var(--accent-red)";
  }

  // ✅ Καθαρισμός αποτελεσμάτων διευθύνσεων
  function clearResults() {
    const results = document.getElementById("results");
    results.textContent = "";
    results.style.color = "";
  }

  // ✅ Καθαρισμός log output
  function clearLogs() {
    const log = document.getElementById("logOutput");
    if (log) log.innerHTML = "";
  }

  // ✅ Εμφάνιση της αντίστοιχης ενότητας ανά mode
  function showModeSection(mode) {
    document.querySelectorAll(".modeSection").forEach(section => {
      section.style.display = "none";
    });

    if (mode === "paste") {
      document.getElementById("pasteSection").style.display = "block";
      document.getElementById("proceedButton").style.display = "inline-block"; // ✅ always show it
    } else {
      document.getElementById("proceedButton").style.display = "inline-block";
      const target = mode === "create" ? "createSection" : "randomSection";
      document.getElementById(target).style.display = "block";
    }
  }

  // ✅ Εμφάνιση διευθύνσεων που φορτώθηκαν
  function displayAddresses(addresses) {
    const results = document.getElementById("results");
    results.textContent = addresses.join("\n");
    results.style.color = "var(--text-light)";
    document.getElementById("downloadButton").style.display = "inline-block";
  }

  // ✅ Απόκτηση των εμφανιζόμενων διευθύνσεων
  function getDisplayedAddresses() {
    const results = document.getElementById("results").textContent.trim();
    return results ? results.split("\n") : [];
  }

  // ✅ Ενημέρωση status token (επιτυχία/αποτυχία)
  function updateTokenStatus(message, isSuccess = true) {
    const status = document.getElementById("tokenStatus");
    status.textContent = message;
    status.style.color = isSuccess ? "var(--accent-green)" : "var(--accent-red)";
  }

  // ✅ Προσθήκη μηνύματος στο log (UI + console)
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

  // ✅ Ενεργοποίηση κουμπιού Download Failed (.txt)
  function enableDownloadFailed(failedArray, onClickHandler) {
    const btn = document.getElementById("downloadFailedButton");
    if (!btn) return;

    btn.style.display = "inline-block";
    btn.onclick = () => onClickHandler(failedArray);
  }

  // ✅ Ενημέρωση με τα τελευταία airdrops (μέσω backend)
  function updateLastAirdrops() {
    const container = document.getElementById("lastAirdrops");
    if (!container) return;

    fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops")
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          container.innerHTML = "<p>No recent airdrops.</p>";
          return;
        }

        const html = data
          .map((drop, i) => {
            const short = addr => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
            return `<div class="airdrop-item">
              <p>#${i + 1}</p>
              <p><strong>Sender:</strong> ${short(drop.sender)}</p>
              <p><strong>Token:</strong> ${short(drop.token)}</p>
              <p><strong>Count:</strong> ${drop.count}</p>
              <p><strong>Date:</strong> ${new Date(drop.timestamp * 1000).toLocaleString()}</p>
            </div>`;
          })
          .join("");

        container.innerHTML = html;
      })
      .catch(err => {
        console.warn("[uiModule] Failed to fetch last airdrops:", err);
        container.innerHTML = "<p>Could not load recent airdrops.</p>";
      });
  }

  return {
    updateWalletUI,
    updateLQXBalance,
    resetUI,
    showError,
    clearResults,
    clearLogs,
    showModeSection,
    displayAddresses,
    getDisplayedAddresses,
    updateTokenStatus,
    addLog,
    enableDownloadFailed,
    updateLastAirdrops
  };
})();
