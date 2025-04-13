document.addEventListener("DOMContentLoaded", () => {
  console.log("[main.js] DOM loaded");

  let selectedToken = null;

  const modeSelect = document.getElementById("modeSelect");
  modeSelect.addEventListener("change", function () {
    console.log("[main.js] Mode changed:", this.value);

    if (document.getElementById("results").textContent.trim().length > 0) {
      const confirmChange = confirm("Changing mode will clear your current address list. Continue?");
      if (!confirmChange) {
        this.value = uiModule.lastMode || "paste";
        return;
      }
      document.getElementById("results").textContent = "";
      document.getElementById("downloadButton").style.display = "none";
    }

    uiModule.lastMode = this.value;
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

    const message = meetsRequirement
      ? "✅ You meet the requirement to use this tool."
      : "⚠️ You need at least 1000 LQX to use this tool.";
    document.getElementById("requirementMessage").textContent = message;

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
    const amountPerUser = parseFloat(document.getElementById("tokenAmountPerUser").value || "0");

    if (parseFloat(balance) <= 0) {
      document.getElementById("tokenStatus").textContent = `⚠️ You have 0 ${tokenDetails.symbol} tokens.`;
    } else {
      document.getElementById("tokenStatus").textContent = `✅ Token: ${tokenDetails.symbol}, Balance: ${balance}`;
      selectedToken = {
        address: tokenInput,
        symbol: tokenDetails.symbol,
        decimals: tokenDetails.decimals,
        contract: tokenDetails.contract,
        amountPerUser: amountPerUser
      };
      console.log("[main.js] Token selected:", selectedToken);
    }
  });

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

  async function fetchAddresses(mode) {
    console.log("[main.js] Fetching addresses for mode:", mode);

    const provider = walletModule.getProvider();
    const userAddress = walletModule.getUserAddress();
    if (!provider || !userAddress) {
      console.warn("[main.js] Provider or user address not available");
      return [];
    }

    if (mode === "paste") {
      const rawInput = document.getElementById("polygonScanInput").value.trim();
      const lines = rawInput.split("\n").map(line => line.trim()).filter(line => addressModule.isValidAddress(line));
      return lines.slice(0, 1000);
    }

    if (mode === "create") {
      const contractInput = document.getElementById("contractInput").value.trim();
      const max = parseInt(document.getElementById("maxCreateAddresses").value || "100");

      if (!addressModule.isValidAddress(contractInput)) {
        alert("Please enter a valid contract address to create your list from.");
        return [];
      }

      try {
        const response = await fetch(`${CONFIG.PROXY_API_URL}?contract=${contractInput}`);
        const data = await response.json();
        console.log("[main.js] Proxy API response (create):", data);

        return data.addresses ? data.addresses.slice(0, Math.min(max, 1000)) : [];

      } catch (err) {
        console.error("[main.js] Proxy fetch failed (create mode):", err);
        return [];
      }
    }

    if (mode === "random") {
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
