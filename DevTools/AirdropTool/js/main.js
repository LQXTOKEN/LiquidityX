// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // Mode switch
  const modeSelect = document.getElementById("modeSelect");
  modeSelect.addEventListener("change", function () {
    uiModule.showSectionByMode(this.value);
  });

  // Connect wallet
  document.getElementById("connectWallet").addEventListener("click", async () => {
    const result = await walletModule.connectWallet();
    if (!result) return;

    const { provider, userAddress } = result;
    const balanceInfo = await erc20Module.getERC20Balance(CONFIG.LQX_TOKEN_ADDRESS, userAddress, provider);
    if (!balanceInfo) return;

    const meetsRequirement = parseFloat(balanceInfo.formatted) >= CONFIG.MIN_LQX_REQUIRED;
    uiModule.setWalletInfo(userAddress, balanceInfo.formatted, balanceInfo.symbol);
    uiModule.setAccessDenied(!meetsRequirement);

    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
  });

  // Disconnect wallet
  document.getElementById("disconnectWallet").addEventListener("click", () => {
    walletModule.disconnectWallet();
    window.location.reload();
  });

  // Back to main site
  document.getElementById("backToMain").addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  // Proceed button
  document.getElementById("proceedButton").addEventListener("click", async () => {
    const mode = document.getElementById("modeSelect").value;
    const addresses = await fetchAddresses(mode);
    if (addresses && addresses.length > 0) {
      uiModule.displayResults(addresses);
    } else {
      alert("No addresses found.");
    }
  });

  // Download .txt button
  document.getElementById("downloadButton").addEventListener("click", () => {
    const results = document.getElementById("results").textContent.trim().split("\n");
    if (results.length > 0) {
      uiModule.downloadAddressesAsTxt(results);
    }
  });
});

async function fetchAddresses(mode) {
  const provider = walletModule.getProvider();
  const userAddress = walletModule.getUserAddress();
  if (!provider || !userAddress) return [];

  if (mode === "paste") {
    const url = document.getElementById("polygonScanInput").value.trim();
    const tokenAddress = extractTokenAddress(url);
    if (!tokenAddress) {
      alert("Invalid URL format.");
      return [];
    }

    try {
      const response = await fetch(`${CONFIG.PROXY_API_URL}?contract=${tokenAddress}`);
      const data = await response.json();
      return data.addresses || [];
    } catch (err) {
      console.error("Proxy fetch failed:", err);
      return [];
    }

  } else if (mode === "create") {
    const contractInput = document.getElementById("contractInput").value.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractInput)) {
      alert("Invalid contract address.");
      return [];
    }

    try {
      const response = await fetch(`${CONFIG.PROXY_API_URL}?contract=${contractInput}`);
      const data = await response.json();
      return data.addresses || [];
    } catch (err) {
      console.error("Proxy fetch failed:", err);
      return [];
    }

  } else if (mode === "random") {
    const max = parseInt(document.getElementById("maxAddresses").value || "100");
    try {
      const response = await fetch(CONFIG.ACTIVE_WALLETS_JSON);
      const data = await response.json();
      return data.slice(0, Math.min(max, 1000));
    } catch (err) {
      console.error("Failed to load random wallets JSON:", err);
      return [];
    }
  }

  return [];
}

function extractTokenAddress(url) {
  const regex = /address\\/(0x[a-fA-F0-9]{40})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
