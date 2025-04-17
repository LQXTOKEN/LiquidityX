// js/modules/ui_module.js

window.uiModule = (function () {
  function showError(message) {
    const el = document.getElementById("errorMessage");
    el.textContent = message;
    el.style.display = "block";
    el.scrollIntoView({ behavior: "smooth" });
  }

  function hideError() {
    const el = document.getElementById("errorMessage");
    el.style.display = "none";
  }

  function addLog(message, type = "info") {
    const logBox = document.getElementById("logBox");
    const entry = document.createElement("div");
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    entry.className = `log-entry ${type}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function clearLogs() {
    const logBox = document.getElementById("logBox");
    logBox.innerHTML = "";
  }

  function enableDownloadFailed(failedAddresses, callback) {
    const downloadButton = document.getElementById("downloadFailedButton");
    downloadButton.style.display = "inline-block";
    downloadButton.onclick = () => callback(failedAddresses);
  }

  function showRecoveryButtons() {
    document.getElementById("retryFailedButton").style.display = "inline-block";
    document.getElementById("recoverTokensButton").style.display = "inline-block";
  }

  function updateLastAirdrops() {
    const container = document.getElementById("lastAirdropsContainer");
    fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch last airdrops");
        return res.json();
      })
      .then(data => {
        container.innerHTML = ""; // clear previous

        if (!Array.isArray(data) || data.length === 0) {
          container.innerHTML = `<p class="text-sm text-gray-400">No recent airdrops available.</p>`;
          return;
        }

        data.slice(0, 5).forEach(drop => {
          const card = document.createElement("div");
          card.className = "bg-gray-800 rounded-xl p-4 mb-3 shadow-md text-white";

          card.innerHTML = `
            <p><strong>Token:</strong> ${drop.tokenSymbol}</p>
            <p><strong>Amount per user:</strong> ${drop.amount}</p>
            <p><strong>Recipients:</strong> ${drop.recipients}</p>
            <p><strong>Sender:</strong> ${shorten(drop.sender)}</p>
            <p><strong>Time:</strong> ${new Date(drop.timestamp).toLocaleString()}</p>
          `;

          container.appendChild(card);
        });
      })
      .catch(err => {
        console.warn("[ui_module] ❌ Failed to fetch last-airdrops:", err);
        container.innerHTML = `<p class="text-sm text-red-500">Error loading last airdrops.</p>`;
      });
  }

  function shorten(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  function insertLastAirdropSection() {
    const section = document.createElement("section");
    section.id = "lastAirdropsSection";
    section.className = "mt-10";
    section.innerHTML = `
      <h3 class="text-xl font-semibold text-white mb-2">📦 Last Airdrop Tokens</h3>
      <div id="lastAirdropsContainer" class="space-y-2"></div>
    `;

    const target = document.querySelector("#aboutAirdrop"); // το section "What is the LiquidityX Airdrop Tool?"
    if (target) {
      target.parentNode.insertBefore(section, target);
    }

    updateLastAirdrops();
  }

  return {
    showError,
    hideError,
    addLog,
    clearLogs,
    enableDownloadFailed,
    showRecoveryButtons,
    updateLastAirdrops,
    insertLastAirdropSection
  };
})();
