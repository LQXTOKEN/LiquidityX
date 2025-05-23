// js/main.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");

    // ✅ Φόρτωσε τα τελευταία airdrops κατά το load
    uiModule.updateLastAirdrops();
  } catch (err) {
    console.error("[main.js] ❌ Initialization failed: ABI loading error");
    return;
  }

  initializeApp();
});

async function initializeApp() {
  try {
    console.log("[main.js] Starting initialization...");

    // 📌 Δηλώσεις στοιχείων DOM
    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const backBtn = document.getElementById("backToMain");
    const checkTokenButton = document.getElementById("checkToken");
    const tokenAddressInput = document.getElementById("tokenAddressInput");
    const tokenAmountInput = document.getElementById("tokenAmountPerUser");
    const modeSelect = document.getElementById("modeSelect");
    const proceedButton = document.getElementById("proceedButton");
    const sendButton = document.getElementById("sendButton");
    const downloadButton = document.getElementById("downloadButton");
    const checkRecordButton = document.getElementById("checkRecordButton");
    const retryFailedButton = document.getElementById("retryFailedButton");
    const recoverTokensButton = document.getElementById("recoverTokensButton");

    // ✅ Σύνδεση wallet
    connectBtn.addEventListener("click", async () => {
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

        document.getElementById("recoveryCard").style.display = "block";
      }
    });

    // ✅ Αποσύνδεση
    disconnectBtn.addEventListener("click", () => {
      walletModule.disconnectWallet();
      uiModule.resetUI();
      document.getElementById("recoveryCard").style.display = "none";
    });

    // 🔙 Πίσω στην αρχική
    backBtn.addEventListener("click", () => {
      window.location.href = "https://liquidityx.io";
    });

    // ✅ Έλεγχος Token
    checkTokenButton.addEventListener("click", async () => {
      console.log("[main.js] Check Token button clicked");
      try {
        const tokenAddress = tokenAddressInput.value.trim();
        if (!tokenAddress) {
          uiModule.showError("Please enter a token address");
          return;
        }

        await tokenModule.checkToken(tokenAddress);
        const selected = tokenModule.getSelectedToken();
        if (selected) {
          window.selectedToken = selected;
          window.currentTokenAddress = selected.contractAddress;
        }
      } catch (err) {
        console.error("[main.js] Token check error:", err);
        uiModule.showError("Token verification failed");
      }
    });

    // ✅ Εναλλαγή Mode (Paste / Create / Random)
    modeSelect.addEventListener("change", (event) => {
      const mode = event.target.value;
      console.log("[main.js] Mode changed:", mode);
      uiModule.clearResults();
      uiModule.showModeSection(mode);
    });

    // ✅ Κουμπί Proceed (φόρτωση διευθύνσεων και υπολογισμός ποσότητας)
    proceedButton.addEventListener("click", async () => {
      console.log("[main.js] Proceed button clicked");

      const mode = modeSelect.value;
      try {
        const addresses = await addressModule.fetchAddresses(mode);
        if (addresses?.length > 0) {
          window.selectedAddresses = addresses;
          uiModule.displayAddresses(addresses);
          downloadButton.style.display = "inline-block";
        } else {
          uiModule.showError("No addresses found");
          downloadButton.style.display = "none";
        }
      } catch (error) {
        console.error("[main.js] Address fetch error:", error);
        uiModule.showError("Failed to fetch addresses");
        downloadButton.style.display = "none";
      }

      const amount = tokenAmountInput.value;
      if (!amount || isNaN(amount)) {
        uiModule.showError("Invalid amount per user");
        return;
      }

      try {
        const parsedAmount = ethers.utils.parseUnits(amount, window.selectedToken.decimals);
        window.tokenAmountPerUser = parsedAmount;
        console.log("[main.js] Parsed amount in wei:", parsedAmount.toString());
      } catch (err) {
        console.error("[main.js] ❌ Failed to parse amount:", err);
        uiModule.showError("❌ Failed to convert amount to token decimals");
        return;
      }
    });

    // ✅ Send Airdrop
    sendButton.addEventListener("click", () => {
      console.log("[main.js] Send button clicked");

      if (!window.selectedToken) {
        uiModule.showError("❌ Token not selected.");
        return;
      }

      if (!window.tokenAmountPerUser || !ethers.BigNumber.isBigNumber(window.tokenAmountPerUser)) {
        uiModule.showError("❌ Invalid amount per address.");
        return;
      }

      if (!window.selectedAddresses || window.selectedAddresses.length === 0) {
        uiModule.showError("❌ No recipient addresses.");
        return;
      }

      sendModule.sendAirdrop(
        window.selectedToken.contractAddress,
        window.selectedToken.symbol,
        window.tokenAmountPerUser,
        window.selectedAddresses,
        window.signer
      );
    });

    // ✅ Κατέβασμα διευθύνσεων
    downloadButton.addEventListener("click", () => {
      if (!window.selectedAddresses || window.selectedAddresses.length === 0) {
        uiModule.showError("❌ No addresses to download.");
        return;
      }

      const content = window.selectedAddresses.join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "airdrop_addresses.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // ✅ Recovery / Retry / Check buttons
    checkRecordButton.addEventListener("click", () => sendModule.checkMyRecord(window.signer));
    retryFailedButton.addEventListener("click", () => sendModule.retryFailed(window.signer, window.currentTokenAddress));
    recoverTokensButton.addEventListener("click", () => sendModule.recoverTokens(window.signer, window.currentTokenAddress));

    console.log("[main.js] Initialization complete ✅");
  } catch (err) {
    console.error("[main.js] ❌ Unexpected error:", err);
  }
}
