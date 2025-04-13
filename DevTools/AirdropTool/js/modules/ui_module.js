window.uiModule = (function () {
  function updateWalletUI(address) {
    const walletAddressEl = document.getElementById("walletAddress");
    walletAddressEl.textContent = `Connected: ${address}`;
    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
  }

  function updateLQXBalance(balance) {
    const balanceEl = document.getElementById("lqxBalance");
    const messageEl = document.getElementById("eligibilityMessage");
    const accessEl = document.getElementById("accessDenied");
    const toolEl = document.getElementById("airdropTool");

    balanceEl.textContent = `LQX Balance: ${balance.formatted}`;

    if (parseFloat(balance.formatted) >= 1000) {
      toolEl.style.display = "block";
      accessEl.style.display = "none";
      messageEl.textContent = "";
    } else {
      toolEl.style.display = "none";
      accessEl.style.display = "block";
      messageEl.textContent = "You need at least 1000 LQX to use this tool.";
    }
  }

  function resetUI() {
    document.getElementById("walletAddress").textContent = "";
    document.getElementById("lqxBalance").textContent = "";
    document.getElementById("eligibilityMessage").textContent = "";
    document.getElementById("connectWallet").style.display = "inline-block";
    document.getElementById("disconnectWallet").style.display = "none";
    document.getElementById("airdropTool").style.display = "none";
    document.getElementById("accessDenied").style.display = "none";
  }

  function showError(message) {
    alert(message);
  }

  function showModeSection(mode) {
    document.querySelectorAll(".modeSection").forEach((section) => {
      section.style.display = "none";
    });

    if (mode === "paste") {
      document.getElementById("pasteSection").style.display = "block";
      document.getElementById("proceedButton").style.display = "none";
    } else if (mode === "create") {
      document.getElementById("createSection").style.display = "block";
      document.getElementById("proceedButton").style.display = "inline-block";
    } else if (mode === "random") {
      document.getElementById("randomSection").style.display = "block";
      document.getElementById("proceedButton").style.display = "inline-block";
    }
  }

  function displayAddresses(addresses) {
    const resultsEl = document.getElementById("results");
    resultsEl.textContent = addresses.join("\n");
    document.getElementById("downloadButton").style.display = "inline-block";
  }

  function getDisplayedAddresses() {
    const results = document.getElementById("results").textContent.trim();
    return results ? results.split("\n") : [];
  }

  function clearResults() {
    const resultsEl = document.getElementById("results");
    resultsEl.textContent = "";
    document.getElementById("downloadButton").style.display = "none";

    // Clear all input fields
    document.getElementById("polygonScanInput").value = "";
    document.getElementById("contractInput").value = "";
    document.getElementById("maxCreateAddresses").value = 100;
    document.getElementById("maxAddresses").value = 100;
  }

  return {
    updateWalletUI,
    updateLQXBalance,
    resetUI,
    showError,
    showModeSection,
    displayAddresses,
    getDisplayedAddresses,
    clearResults
  };
})();
