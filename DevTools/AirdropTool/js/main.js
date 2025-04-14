// js/main.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");
  } catch (err) {
    console.error("[main.js] ❌ Initialization failed: ABI loading error");
    return;
  }

  initializeApp();
});

async function initializeApp() {
  try {
    console.log("[main.js] Starting initialization...");

    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const backBtn = document.getElementById("backToMain");
    const checkTokenButton = document.getElementById("checkToken");
    const tokenAddressInput = document.getElementById("tokenAddressInput");
    const tokenAmountInput = document.getElementById("tokenAmountPerUser");
    const modeSelect = document.getElementById("modeSelect");
    const proceedButton = document.getElementById("proceedButton");
    const sendButton = document.getElementById("sendButton");

    connectBtn.addEventListener("click", async () => {
      console.log("[main.js] Connect button clicked");
      const result = await walletModule.connectWallet();

      if (result) {
        uiModule.updateWalletUI(result.userAddress);
        const lqx = await erc20Module.getLQXBalance(result.userAddress);
        if (lqx) {
          uiModule.updateLQXBalance(lqx);
        } else {
          uiModule.showError("Could not fetch LQX balance.");
        }
      }
    });

    disconnectBtn.addEventListener("click", () => {
      walletModule.disconnectWallet();
      uiModule.resetUI();
    });

    backBtn.addEventListener("click", () => {
      window.location.href = "https://liquidityx.io";
    });

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
        }
      } catch (err) {
        console.error("[main.js] Token check error:", err);
        uiModule.showError("Token verification failed");
      }
    });

    modeSelect.addEventListener("change", (event) => {
      const mode = event.target.value;
      console.log("[main.js] Mode changed:", mode);
      uiModule.clearResults();
      uiModule.showModeSection(mode);
    });

    proceedButton.addEventListener("click", async () => {
      console.log("[main.js] Proceed button clicked");

      const mode = modeSelect.value;
      try {
        const addresses = await addressModule.fetchAddresses(mode);
        if (addresses?.length > 0) {
          window.selectedAddresses = addresses;
          uiModule.displayAddresses(addresses);
        } else {
          uiModule.showError("No addresses found");
        }
      } catch (error) {
        console.error("[main.js] Address fetch error:", error);
        uiModule.showError("Failed to fetch addresses");
      }

      const amount = tokenAmountInput.value;
      if (!amount || isNaN(amount)) {
        uiModule.showError("Invalid amount per user");
        return;
      }
      window.tokenAmountPerUser = amount;
    });

    sendButton.addEventListener("click", () => {
      console.log("[main.js] Send button clicked");

      // Εδώ επιβεβαιώνουμε ότι έχουμε τις global μεταβλητές σωστά
      if (!window.selectedToken) {
        uiModule.showError("❌ Token not selected.");
        return;
      }

      if (!window.tokenAmountPerUser || isNaN(window.tokenAmountPerUser)) {
        uiModule.showError("❌ Invalid amount per address.");
        return;
      }

      if (!window.selectedAddresses || window.selectedAddresses.length === 0) {
        uiModule.showError("❌ No recipient addresses.");
        return;
      }

      // Δεν κάνουμε execute εδώ. Το app.js διαχειρίζεται το airdropExecutor.
      // Εμείς ενημερώνουμε μόνο τις global παραμέτρους.
    });

    console.log("[main.js] Initialization complete ✅");
  } catch (err) {
    console.error("[main.js] ❌ Unexpected error:", err);
  }
}
