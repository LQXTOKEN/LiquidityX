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

    document.getElementById("backToMain").addEventListener("click", () => {
      window.location.href = "https://liquidityx.io";
    });

    console.log("[main.js] Initialization complete ✅");
  } catch (err) {
    console.error("[main.js] ❌ Unexpected error:", err);
  }
}
