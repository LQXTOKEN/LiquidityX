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
    const checkTokenBtn = document.getElementById("checkToken");
    const tokenInput = document.getElementById("tokenAddressInput");
    const proceedBtn = document.getElementById("proceedButton");
    const sendBtn = document.getElementById("sendButton");
    const modeSelect = document.getElementById("modeSelect");
    const amountInput = document.getElementById("tokenAmountPerUser");

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

    checkTokenBtn.addEventListener("click", async () => {
      console.log("[main.js] Check Token button clicked");
      const tokenAddress = tokenInput.value.trim();
      if (!tokenAddress) {
        uiModule.showError("Please enter a token address");
        return;
      }

      try {
        await tokenModule.checkToken(tokenAddress);
      } catch (err) {
        console.error("[main.js] Token check error:", err);
        uiModule.showError("Token verification failed");
      }
    });

    modeSelect.addEventListener("change", (e) => {
      const selectedMode = e.target.value;
      console.log("[main.js] Mode changed:", selectedMode);
      uiModule.clearResults();
      uiModule.showModeSection(selectedMode);
    });

    proceedBtn.addEventListener("click", async () => {
      try {
        console.log("[main.js] Proceed button clicked");
        const selectedMode = modeSelect.value;
        const addresses = await addressModule.fetchAddresses(selectedMode);

        if (addresses && addresses.length > 0) {
          uiModule.displayAddresses(addresses);
        } else {
          uiModule.showError("No addresses found.");
        }
      } catch (err) {
        console.error("[main.js] Address fetch error:", err);
        uiModule.showError("Address fetch failed.");
      }
    });

    sendBtn.addEventListener("click", async () => {
      try {
        console.log("[main.js] Send button clicked");

        const token = tokenModule.getSelectedToken();
        const amount = amountInput.value;
        const addresses = uiModule.getDisplayedAddresses();

        if (!token) {
          uiModule.showError("No token selected.");
          return;
        }
        if (!amount || isNaN(amount)) {
          uiModule.showError("Invalid amount.");
          return;
        }
        if (!addresses || addresses.length === 0) {
          uiModule.showError("No recipient addresses.");
          return;
        }

        await airdropExecutor.executeAirdrop(token, amount, addresses);
      } catch (err) {
        console.error("[main.js] Airdrop execution error:", err);
        uiModule.showError("Airdrop failed.");
      }
    });

    console.log("[main.js] Initialization complete ✅");
  } catch (err) {
    console.error("[main.js] ❌ Unexpected error:", err);
    uiModule.showError("Unexpected initialization error.");
  }
}
