// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("[main.js] DOM loaded");

  let selectedToken = null;

  const modeSelect = document.getElementById("modeSelect");
  modeSelect.addEventListener("change", function () {
    console.log("[main.js] Mode changed:", this.value);
    uiModule.showSectionByMode(this.value);
  });

  document.getElementById("connectWallet").addEventListener("click", async () => {
    console.log("[main.js] Connect button clicked");

    const result = await walletModule.connectWallet();
    if (!result) {
      console.warn("[main.js] Wallet connection failed or cancelled");
      return;
    }

    const { provider, userAddress } = result;
    console.log("[main.js] Wallet connected:", userAddress);

    const balanceInfo = await erc20Module.getERC20Balance(CONFIG.LQX_TOKEN_ADDRESS, userAddress, provider);
    if (!balanceInfo) {
      console.error("[main.js] Could not fetch LQX balance");
      return;
    }

    console.log("[main.js] LQX balance info:", balanceInfo);

    const meetsRequirement = parseFloat(balanceInfo.formatted) >= CONFIG.MIN_LQX_REQUIRED;
    uiModule.setWalletInfo(userAddress, balanceInfo.formatted, balanceInfo.symbol);
    uiModule.setAccessDenied(!meetsRequirement);

    document.getElementById("connectWallet").style.display = "none";
    document.getElementById("disconnectWallet").style.display = "inline-block";
  });

  document.getElementById("disconnectWallet").addEventListener("click", () => {
    console.log("[main.js] Disconnect clicked");
    walletModule.disconnectWallet();
    window.location.reload();
  });

  document.getElementById("backToMain").addEventListener("click", () => {
    console.log("[main.js] Back to Main Website");
    window.location.href = "https://liquidityx.io";
  });

  // Token Selection
  document.getElementById("checkToken").addEventListener("click", async () => {
    const tokenInput = document.getElementById("tokenAddressInput").value.trim();

    console.log("[main.js] Token check initiated for:", tokenInput);

    if (!addressModule.isValidAddress(tokenInput)) {
      document.getElementById("tokenStatus").textContent = "❌ Invalid token address.";
      selectedToken = null;
      return;
    }

    const provider = walletModule.getProvider();
    const userAddress = walletModule.getUserAddress();
    if (!provider || !userAddress) {
      document.getElementById("tokenStatus").textContent = "Please connect wallet first.";
      return;
    }

    const tokenDetails = await tokenModule.getTokenDetails(tokenInput, provider);
    if (!tokenDetails) {
      document.getElementById("tokenStatus").textContent = "❌ Could not read token metadata.";
      return;
    }

    const balance = await tokenModule.getFormattedBalance(tokenDetails.contract, userAddress, tokenDetails.decimals);

    if (parseFloat(balance) <= 0) {
      document.getElementById("tokenStatus").textContent = `⚠️ You have 0 ${tokenDetails.symbol} tokens.`;
    } else {
      document.getElementById("tokenStatus").textContent = `✅ Token: ${tokenDetails.symbol}, Balance: ${balance}`;
      selectedToken = {
        address: tokenInput,
        symbol: tokenDetails.symbol,
        decimals: tokenDetails.decimals,
        contract: tokenDetails.contract
      };
      console.log("[main.js] Token selected:", selectedToken);
    }
  });

  // Proceed
  document.getElementById("proceedButton").addEventListener("click", async () => {
    console.log("[main.js] Proceed button clicked");

    const mode = document.getElementById("modeSelect").value;
    const addresses = await fetchAddresses(mode);
    console.log("[main.js] Fetched addresses:", addresses);

    if (addresses && addresses.length > 0) {
      uiModule.displayResults(addresses);
    } else {
      alert("No addresses found.");
    }
  });

  document.getElementById("downloadButton").addEventListener("click", () => {
    console.log("[main.js] Download button clicked");
    const results = document.getElementById("results").textContent.trim().split("\n");
    if (results.length > 0) {
      uiModule.downloadAddressesAsTxt(results);
    }
  });

  // Fetch Logic
  async function fetchAddresses(mode) {
    console.log("[main.js] Fetching addresses for mode:", mode);

    const provider = walletModule.getProvider();
    const userAddress = walletModule.getUserAddress();
    if (!provider || !userAddress) {
      console.warn("[main.js] Provider or user address not available");
      return [];
    }

    if (mode === "paste") {
      const url = document.getElementById("polygonScanInput").value.trim();
      const tokenAddress = addressModule.extractTokenAddress(url);
      console.log("[main.js] Extracted token address from URL:", tokenAddress);
      if (!tokenAddress) {
        alert("Invalid URL format.");
        return [];
      }

      try {
        const response = await fetch(`${CONFIG.PROXY_API_URL}?contract=${tokenAddress}`);
        const data = await response.json();
        console.log("[main.js] Proxy API response (paste):", data);
        return data.addresses || [];
      } catch (err) {
        console.error("[main.js] Proxy fetch failed (paste mode):", err);
        return [];
      }

    } else if (mode === "create") {
      const contractInput = document.getElementById("contractInput").value.trim();

      if (!addressModule.isValidAddress(contractInput)) {
        alert("Please enter a valid contract address to create your list from.");
        return [];
      }

      try {
        const response = await fetch(`${CONFIG.PROXY_API_URL}?contract=${contractInput}`);
        const data = await response.json();
        console.log("[main.js] Proxy API response (create):", data);
        return data.addresses || [];
      } catch (err) {
        console.error("[main.js] Proxy fetch failed (create mode):", err);
        return [];
      }

    } else if (mode === "random") {
      const max = parseInt(document.getElementById("maxAddresses").value || "100");
      try {
        const response = await fetch(CONFIG.ACTIVE_WALLETS_JSON);
        const data = await response.json();
        console.log("[main.js] Loaded random wallets:", data.length);
        return data.slice(0, Math.min(max, 1000));
      } catch (err) {
        console.error("[main.js] Failed to load random wallets JSON:", err);
        return [];
      }
    }

    return [];
  }
});
