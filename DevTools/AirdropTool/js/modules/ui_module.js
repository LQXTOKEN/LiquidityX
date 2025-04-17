// js/modules/ui_module.js

window.uiModule = (function () {
  const logContainer = document.getElementById("logOutput");
  const resultsContainer = document.getElementById("results");

  function showError(message) {
    addLog(message, "error");
  }

  function addLog(message, type = "info") {
    const entry = document.createElement("div");
    entry.textContent = message;
    entry.className = `log-entry ${type}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function clearResults() {
    resultsContainer.textContent = "";
    document.getElementById("downloadButton").style.display = "none";
  }

  function displayAddresses(addresses) {
    resultsContainer.textContent = addresses.join("\n");
  }

  function showModeSection(mode) {
    document.querySelectorAll(".modeSection").forEach((section) => {
      section.style.display = "none";
    });

    const target = document.getElementById(`${mode}Section`);
    if (target) target.style.display = "block";

    const proceedBtn = document.getElementById("proceedButton");
    if (proceedBtn) proceedBtn.style.display = mode === "paste" ? "none" : "inline-block";
  }

  function updateLQXBalance(amount) {
    const balanceElement = document.getElementById("lqxBalance");
    if (balanceElement) {
      balanceElement.textContent = `LQX Balance: ${amount}`;
    }
  }

  function updateWalletUI(address) {
    const walletAddr = document.getElementById("walletAddress");
    if (walletAddr) walletAddr.textContent = `Connected: ${address}`;

    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const toolSection = document.getElementById("airdropTool");

    if (connectBtn) connectBtn.style.display = "none";
    if (disconnectBtn) disconnectBtn.style.display = "inline-block";
    if (toolSection) toolSection.style.display = "block";
  }

  function resetUI() {
    const walletAddr = document.getElementById("walletAddress");
    const balance = document.getElementById("lqxBalance");
    const message = document.getElementById("eligibilityMessage");
    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const toolSection = document.getElementById("airdropTool");
    const retryBtn = document.getElementById("retryFailedButton");
    const recoverBtn = document.getElementById("recoverTokensButton");

    if (walletAddr) walletAddr.textContent = "";
    if (balance) balance.textContent = "";
    if (message) message.textContent = "";
    if (connectBtn) connectBtn.style.display = "inline-block";
    if (disconnectBtn) disconnectBtn.style.display = "none";
    if (toolSection) toolSection.style.display = "none";
    if (retryBtn) retryBtn.style.display = "none";
    if (recoverBtn) recoverBtn.style.display = "none";

    clearResults();
    logContainer.innerHTML = "";
  }

  function enableDownloadFailed(failedList, callback) {
    const button = document.getElementById("downloadFailedButton");
    if (!button) return;
    button.style.display = "inline-block";
    button.onclick = () => callback(failedList);
  }

  async function updateLastAirdrops() {
    try {
      const response = await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops");
      if (!response.ok) throw new Error("Failed to fetch airdrops");
      const data = await response.json();

      const container = document.getElementById("lastAirdropsContainer");
      if (!container) {
        console.warn("[ui_module.js] #lastAirdropsContainer not found");
        return;
      }

      container.innerHTML = `
        <h2>🔥 Last Airdrop Tokens</h2>
        <ul class="airdrop-list">
          ${data.map(item => `<li><strong>${item.symbol}</strong> to <code>${item.count}</code> users</li>`).join("")}
        </ul>
      `;
    } catch (err) {
      console.warn("[ui_module.js] Απέτυχε η φόρτωση του Fetch:", err);
    }
  }

  function insertLastAirdropSection() {
    const section = document.createElement("div");
    section.className = "card";
    section.id = "lastAirdropsContainer";

    const aboutSection = document.querySelector(".about-section");
    if (aboutSection && aboutSection.parentNode) {
      aboutSection.parentNode.insertBefore(section, aboutSection);
    }

    updateLastAirdrops();
  }

  return {
    showError,
    addLog,
    clearResults,
    displayAddresses,
    showModeSection,
    updateLQXBalance,
    updateWalletUI,
    resetUI,
    enableDownloadFailed,
    updateLastAirdrops,
    insertLastAirdropSection,
  };
})();
