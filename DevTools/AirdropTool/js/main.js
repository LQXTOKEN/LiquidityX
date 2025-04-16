// main.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");
  } catch (err) {
    console.error("[main.js] ❌ ABI loading failed", err);
    return;
  }

  console.log("[main.js] Starting initialization...");

  const connectWalletBtn = document.getElementById("connectWallet");
  const disconnectBtn = document.getElementById("disconnectWallet");
  const backToMainBtn = document.getElementById("backToMain");
  const checkTokenBtn = document.getElementById("checkToken");
  const proceedBtn = document.getElementById("proceedButton");
  const sendBtn = document.getElementById("sendButton");
  const recoverBtn = document.getElementById("recoverButton");
  const modeSelect = document.getElementById("mode");

  if (!connectWalletBtn || !disconnectBtn || !backToMainBtn || !checkTokenBtn || !proceedBtn || !sendBtn || !recoverBtn || !modeSelect) {
    console.error("[main.js] ❌ Missing DOM elements!");
    return;
  }

  // Global state
  window.selectedToken = null;
  window.tokenAmountPerUser = null;
  window.selectedAddresses = [];

  // Wallet buttons
  connectWalletBtn.addEventListener("click", async () => {
    console.log("[main.js] Connect button clicked");
    await walletModule.connect();
  });

  disconnectBtn.addEventListener("click", () => {
    walletModule.disconnect();
  });

  backToMainBtn.addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  // Token check
  checkTokenBtn.addEventListener("click", async () => {
    console.log("[main.js] Check Token button clicked");
    const tokenAddress = document.getElementById("tokenAddress").value.trim();
    if (!tokenAddress) return uiModule.log("❌ Please enter a token address", "error");

    try {
      const token = await tokenModule.loadToken(tokenAddress);
      window.selectedToken = token;
      uiModule.log(`✅ Token loaded: ${token.symbol}`, "success");
    } catch (err) {
      console.error("[main.js] Token load failed", err);
      uiModule.log("❌ Failed to load token", "error");
    }
  });

  // Mode selection
  modeSelect.addEventListener("change", (e) => {
    const selectedMode = e.target.value;
    console.log("[main.js] Mode changed:", selectedMode);
    uiModule.toggleModeSections(selectedMode);

    // ✅ Do not clear selectedToken on mode change
  });

  // Proceed
  proceedBtn.addEventListener("click", async () => {
    console.log("[main.js] Proceed button clicked");

    const mode = modeSelect.value;
    try {
      const addresses = await addressModule.getAddresses(mode);
      window.selectedAddresses = addresses;
      uiModule.displayAddresses(addresses);
    } catch (err) {
      console.error("[main.js] Error getting addresses", err);
      uiModule.log("❌ Failed to fetch addresses", "error");
    }
  });

  // Send Airdrop
  sendBtn.addEventListener("click", async () => {
    console.log("[main.js] Send button clicked");

    const token = window.selectedToken;
    const amountInput = document.getElementById("tokenAmount").value.trim();
    const recipients = window.selectedAddresses;

    if (!token) return uiModule.log("❌ Token is not selected", "error");
    if (!amountInput || isNaN(amountInput)) return uiModule.log("❌ Invalid amount", "error");
    if (!recipients || recipients.length === 0) return uiModule.log("❌ No addresses loaded", "error");

    const decimals = token.decimals;
    const amountWei = ethers.utils.parseUnits(amountInput, decimals).toString();

    console.log("[main.js] Parsed amount in wei:", amountWei);

    window.tokenAmountPerUser = amountWei;

    try {
      await window.airdropExecutor.executeAirdrop(token, amountWei, recipients);
    } catch (err) {
      console.error("[main.js] Airdrop execution failed", err);
      uiModule.log(`❌ Airdrop failed: ${err.message || err}`, "error");
    }
  });

  // Recover
  recoverBtn.addEventListener("click", async () => {
    console.log("[main.js] Recover button clicked");
    try {
      await window.recoveryExecutor.recoverFailedTransfers();
    } catch (err) {
      console.error("[main.js] Recovery failed", err);
      uiModule.log(`❌ Recovery failed: ${err.message || err}`, "error");
    }
  });

  // Last Airdrops (optional off-chain display)
  if (uiModule.updateLastAirdrops) {
    uiModule.updateLastAirdrops();
  }

  console.log("[main.js] Initialization complete ✅");
});
