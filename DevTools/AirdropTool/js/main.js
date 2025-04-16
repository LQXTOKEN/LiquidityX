// js/main.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");
    await uiModule.updateLastAirdrops();
  } catch (err) {
    console.error("[main.js] ❌ ABI loading failed", err);
    uiModule.showError("Failed to load contract ABIs.");
    return;
  }

  initializeApp();
});

async function initializeApp() {
  console.log("[main.js] Starting initialization...");

  const get = id => document.getElementById(id);

  const requiredIds = [
    "connectWallet", "disconnectWallet", "backToMain", "checkToken",
    "tokenAddress", "tokenAmount", "mode", "proceedButton", "sendButton",
    "downloadButton", "recoverButton"
  ];

  for (const id of requiredIds) {
    if (!get(id)) {
      console.error(`[main.js] ❌ Missing DOM element: ${id}`);
      return;
    }
  }

  get("connectWallet").addEventListener("click", async () => {
    console.log("[main.js] Connect button clicked");
    const result = await walletModule.connectWallet();

    if (result) {
      window.signer = result.signer;
      uiModule.updateWalletUI(result.userAddress);

      const lqx = await erc20Module.getLQXBalance(result.userAddress);
      if (lqx) {
        uiModule.updateLQXBalance(lqx);
      } else {
        uiModule.showError("Could not fetch LQX balance.");
      }

      get("recoveryCard").style.display = "block";
    }
  });

  get("disconnectWallet").addEventListener("click", () => {
    walletModule.disconnectWallet();
    uiModule.resetUI();
    get("recoveryCard").style.display = "none";
  });

  get("backToMain").addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  get("checkToken").addEventListener("click", async () => {
    console.log("[main.js] Check Token button clicked");
    try {
      const address = get("tokenAddress").value.trim();
      if (!address) return uiModule.showError("Please enter a token address.");

      await tokenModule.checkToken(address);
      const token = tokenModule.getSelectedToken();
      if (token) {
        window.selectedToken = token;
        window.currentTokenAddress = token.contractAddress;
        uiModule.updateTokenStatus(`✅ Token loaded: ${token.symbol}`, true);
      }
    } catch (err) {
      console.error("[main.js] Token check error:", err);
      uiModule.updateTokenStatus(`❌ ${err.message}`, false);
    }
  });

  get("mode").addEventListener("change", e => {
    const mode = e.target.value;
    console.log("[main.js] Mode changed:", mode);
    uiModule.clearResults();
    uiModule.showModeSection(mode);
  });

  get("proceedButton").addEventListener("click", async () => {
    console.log("[main.js] Proceed button clicked");

    const mode = get("mode").value;
    try {
      const addresses = await addressModule.fetchAddresses(mode);
      if (addresses?.length > 0) {
        window.selectedAddresses = addresses;
        uiModule.displayAddresses(addresses);
        get("downloadButton").style.display = "inline-block";
      } else {
        uiModule.showError("No addresses found.");
        get("downloadButton").style.display = "none";
      }
    } catch (err) {
      console.error("[main.js] Fetch address error:", err);
      uiModule.showError("Failed to fetch addresses.");
    }

    const amount = get("tokenAmount").value;
    if (!amount || isNaN(amount)) {
      uiModule.showError("Invalid amount per user.");
      return;
    }

    try {
      const parsedAmount = ethers.utils.parseUnits(amount, window.selectedToken?.decimals || 18);
      window.tokenAmountPerUser = parsedAmount;
      console.log("[main.js] Parsed amount in wei:", parsedAmount.toString());
    } catch (err) {
      console.error("[main.js] Amount parsing failed:", err);
      uiModule.showError("Failed to parse amount.");
    }
  });

  get("sendButton").addEventListener("click", () => {
    console.log("[main.js] Send button clicked");

    if (!window.selectedToken) return uiModule.showError("❌ Token not selected.");
    if (!window.tokenAmountPerUser) return uiModule.showError("❌ Invalid amount.");
    if (!window.selectedAddresses?.length) return uiModule.showError("❌ No recipients found.");

    sendModule.sendAirdrop(
      window.selectedToken.contractAddress,
      window.selectedToken.symbol,
      window.tokenAmountPerUser,
      window.selectedAddresses,
      window.signer
    );
  });

  get("recoverButton").addEventListener("click", async () => {
    console.log("[main.js] Recover button clicked");

    if (!window.selectedToken) {
      uiModule.addLog("❌ Token is missing or invalid.", "error");
      return;
    }

    try {
      await recoverModule.recoverFailed(window.selectedToken, window.signer);
    } catch (err) {
      uiModule.addLog(`❌ Recovery failed: ${err.message}`, "error");
    }
  });

  get("downloadButton").addEventListener("click", () => {
    const addresses = uiModule.getDisplayedAddresses();
    if (!addresses.length) return uiModule.showError("❌ No addresses to download.");

    const blob = new Blob([addresses.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "airdrop_addresses.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  console.log("[main.js] Initialization complete ✅");
}
