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
    entry.textContent = `[LOG][${type.toUpperCase()}] ${message}`;
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

  async function updateLastAirdrops() {
    try {
      const container = document.getElementById("lastAirdropsContainer");
      const response = await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops");
      if (!response.ok) throw new Error("Failed to fetch last airdrops");
      const data = await response.json();

      container.innerHTML = ""; // Καθαρισμός προηγούμενου περιεχομένου

      if (!data || data.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-sm">No recent airdrops available.</p>`;
        return;
      }

      data.slice(0, 5).forEach(item => {
        const div = document.createElement("div");
        div.className = "bg-gray-800 rounded-xl p-3 mb-2 shadow-md";

        div.innerHTML = `
          <p class="text-sm text-white"><strong>Token:</strong> ${item.tokenSymbol}</p>
          <p class="text-sm text-white"><strong>Amount per user:</strong> ${item.amount}</p>
          <p class="text-sm text-white"><strong>Total recipients:</strong> ${item.recipients}</p>
          <p class="text-sm text-white"><strong>Sender:</strong> ${shortenAddress(item.sender)}</p>
          <p class="text-sm text-white"><strong>Timestamp:</strong> ${new Date(item.timestamp).toLocaleString()}</p>
        `;

        container.appendChild(div);
      });
    } catch (err) {
      console.warn("[ui_module.js] Απέτυχε η φόρτωση του Fetch:", err);
    }
  }

  function shortenAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return {
    showError,
    hideError,
    addLog,
    clearLogs,
    enableDownloadFailed,
    updateLastAirdrops
  };
})();
