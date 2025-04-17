// js/modules/ui_module.js

window.uiModule = (function () {
  const walletAddressEl = document.getElementById("walletAddress");
  const lqxBalanceEl = document.getElementById("lqxBalance");
  const eligibilityEl = document.getElementById("eligibilityMessage");
  const airdropToolEl = document.getElementById("airdropTool");
  const accessDeniedEl = document.getElementById("accessDenied");
  const resultsEl = document.getElementById("results");
  const logOutputEl = document.getElementById("logOutput");

  function updateWalletUI(address) {
    walletAddressEl.textContent = `Connected: ${address}`;
    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
  }

  function updateLQXBalance(balanceBN) {
    try {
      const formatted = ethers.utils.formatUnits(balanceBN, 18);
      lqxBalanceEl.textContent = `LQX Balance: ${formatted}`;
      const showTool = balanceBN.gte(ethers.utils.parseUnits("1000", 18));
      airdropToolEl.style.display = showTool ? "block" : "none";
      accessDeniedEl.style.display = showTool ? "none" : "block";
    } catch (e) {
      lqxBalanceEl.textContent = `LQX Balance: [error]`;
    }
  }

  function updateTokenStatus(message, success = true) {
    const el = document.getElementById("tokenStatus");
    if (!el) return;
    el.textContent = message;
    el.style.color = success ? "var(--accent-green)" : "var(--accent-red)";
  }

  function showModeSection(mode) {
    ["paste", "create", "random"].forEach((m) => {
      const section = document.getElementById(`${m}Section`);
      if (section) section.style.display = mode === m ? "block" : "none";
    });

    // Κρύψε το κουμπί Proceed στο Paste mode
    const proceedButton = document.getElementById("proceedButton");
    if (proceedButton) {
      proceedButton.style.display = mode === "paste" ? "none" : "inline-block";
    }
  }

  function displayAddresses(addresses) {
    resultsEl.textContent = addresses.join("\n");
  }

  function showError(message) {
    addLog(`❌ ${message}`, "error");
  }

  function addLog(message, level = "info") {
    const p = document.createElement("p");
    p.textContent = message;

    if (level === "error") {
      p.style.color = "var(--accent-red)";
    } else if (level === "warn") {
      p.style.color = "orange";
    } else {
      p.style.color = "var(--accent-green)";
    }

    logOutputEl.appendChild(p);
    logOutputEl.scrollTop = logOutputEl.scrollHeight;
  }

  function clearResults() {
    resultsEl.textContent = "";
  }

  function resetUI() {
    walletAddressEl.textContent = "";
    lqxBalanceEl.textContent = "";
    eligibilityEl.textContent = "";
    resultsEl.textContent = "";
    logOutputEl.innerHTML = "";

    document.getElementById("connectWallet").style.display = "inline-block";
    document.getElementById("disconnectWallet").style.display = "none";
    document.getElementById("airdropTool").style.display = "none";
    document.getElementById("accessDenied").style.display = "none";

    document.getElementById("downloadFailedButton").style.display = "none";
    document.getElementById("retryFailedButton").style.display = "none";
    document.getElementById("recoverTokensButton").style.display = "none";

    const recoveryResults = document.getElementById("recoveryResults");
    if (recoveryResults) recoveryResults.innerHTML = "";
  }

  async function updateLastAirdrops() {
    try {
      const res = await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops");
      if (!res.ok) throw new Error("Response not ok");

      const data = await res.json();
      const container = document.createElement("div");
      container.className = "card";
      container.style.marginTop = "1.5rem";

      const title = document.createElement("h2");
      title.textContent = "📦 Last Airdrop Tokens";
      container.appendChild(title);

      if (!Array.isArray(data) || data.length === 0) {
        const p = document.createElement("p");
        p.textContent = "No recent airdrops found.";
        container.appendChild(p);
      } else {
        const list = document.createElement("ul");
        data.forEach((item) => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${item.symbol}</strong> – ${item.amount} tokens sent to ${item.recipients} users`;
          list.appendChild(li);
        });
        container.appendChild(list);
      }

      const aboutSection = document.querySelector(".about-section");
      if (aboutSection && aboutSection.parentNode) {
        aboutSection.parentNode.insertBefore(container, aboutSection);
      }
    } catch (err) {
      console.warn("[ui_module.js] Απέτυχε η φόρτωση του Fetch:", err);
    }
  }

  function enableDownloadFailed(failedArray, callback) {
    const downloadBtn = document.getElementById("downloadFailedButton");
    if (!downloadBtn) return;

    downloadBtn.style.display = "inline-block";
    downloadBtn.onclick = () => callback(failedArray);
  }

  return {
    updateWalletUI,
    updateLQXBalance,
    updateTokenStatus,
    showModeSection,
    displayAddresses,
    showError,
    addLog,
    clearResults,
    resetUI,
    updateLastAirdrops,
    enableDownloadFailed
  };
})();
