// js/modules/ui_module.js

window.uiModule = (function () {
  function updateWalletUI(address) {
    document.getElementById("walletAddress").innerText = `Connected: ${address}`;
    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
    document.getElementById("airdropTool").style.display = "block";
    document.getElementById("accessDenied").style.display = "none";
  }

  function updateLQXBalance(balance) {
    document.getElementById("lqxBalance").innerText = `LQX Balance: ${balance}`;
  }

  function showError(message) {
    const el = document.getElementById("logOutput");
    const div = document.createElement("div");
    div.className = "log error";
    div.innerText = message;
    el.appendChild(div);
  }

  function addLog(message, type = "info") {
    const el = document.getElementById("logOutput");
    const div = document.createElement("div");
    div.className = `log ${type}`;
    div.innerText = message;
    el.appendChild(div);
  }

  function clearResults() {
    document.getElementById("results").innerText = "";
  }

  function displayAddresses(addresses) {
    document.getElementById("results").innerText = addresses.join("\n");
  }

  function showModeSection(mode) {
    ["pasteSection", "createSection", "randomSection"].forEach(id => {
      document.getElementById(id).style.display = "none";
    });

    if (mode === "paste") {
      document.getElementById("pasteSection").style.display = "block";
      document.getElementById("proceedButton").style.display = "none";
    } else {
      document.getElementById(`${mode}Section`).style.display = "block";
      document.getElementById("proceedButton").style.display = "inline-block";
    }
  }

  function resetUI() {
    document.getElementById("walletAddress").innerText = "";
    document.getElementById("connectWallet").style.display = "inline-block";
    document.getElementById("disconnectWallet").style.display = "none";
    document.getElementById("airdropTool").style.display = "none";
    document.getElementById("results").innerText = "";
    document.getElementById("lqxBalance").innerText = "";
    document.getElementById("downloadButton").style.display = "none";
    document.getElementById("downloadFailedButton").style.display = "none";
    document.getElementById("retryFailedButton").style.display = "none";
    document.getElementById("recoverTokensButton").style.display = "none";
    document.getElementById("recoveryResults").innerText = "";
  }

  function enableDownloadFailed(failedArray, callback) {
    const btn = document.getElementById("downloadFailedButton");
    btn.style.display = "inline-block";
    btn.onclick = () => callback(failedArray);
  }

  async function updateLastAirdrops() {
    try {
      const res = await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops");
      if (!res.ok) throw new Error("Could not fetch airdrop history");

      const data = await res.json();
      const section = document.createElement("div");
      section.className = "card";
      section.style.marginTop = "1rem";

      section.innerHTML = `
        <h2>📜 Last Airdrop Tokens</h2>
        <ul>
          ${data.slice(0, 5).map(entry => `<li><strong>${entry.token}</strong> → ${entry.count} recipients</li>`).join("")}
        </ul>
      `;

      const aboutSection = document.querySelector(".about-section");
      aboutSection.parentNode.insertBefore(section, aboutSection);
    } catch (err) {
      console.warn("[ui_module.js] Απέτυχε η φόρτωση του Fetch:", err);
    }
  }

  return {
    updateWalletUI,
    updateLQXBalance,
    showError,
    addLog,
    clearResults,
    displayAddresses,
    showModeSection,
    resetUI,
    enableDownloadFailed,
    updateLastAirdrops,
  };
})();
