// main.js

// Constants
const ABI_LOAD_TIMEOUT = 5000; // 5 seconds timeout
const ABI_CHECK_INTERVAL = 100;

// 🔁 Wait for ABIs with timeout protection
const waitForAbis = async () => {
  let elapsed = 0;

  while (!window.ERC20_ABI || !window.AIRDROP_ABI) {
    if (elapsed >= ABI_LOAD_TIMEOUT) {
      throw new Error("ABI loading timed out");
    }

    await new Promise(resolve => setTimeout(resolve, ABI_CHECK_INTERVAL));
    elapsed += ABI_CHECK_INTERVAL;
  }
};

// Main initialization
const initializeApp = async () => {
  try {
    console.log("[main.js] Starting initialization...");

    await waitForAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");

    // Cache DOM elements
    const elements = {
      connectButton: document.getElementById("connectWallet"),
      disconnectButton: document.getElementById("disconnectWallet"),
      backToMainButton: document.getElementById("backToMain"),
      checkTokenButton: document.getElementById("checkToken"),
      proceedButton: document.getElementById("proceedButton"),
      modeSelect: document.getElementById("modeSelect"),
      sendButton: document.getElementById("sendButton"),
      tokenAddressInput: document.getElementById("tokenAddressInput"),
      tokenAmountPerUser: document.getElementById("tokenAmountPerUser")
    };

    // Event listeners
    elements.connectButton.addEventListener("click", async () => {
      try {
        console.log("[main.js] Connect button clicked");
        const result = await walletModule.connectWallet();
        if (result) {
          uiModule.updateWalletUI(result.userAddress);
          const balance = await erc20Module.getLQXBalance(result.userAddress);
          uiModule.updateLQXBalance(balance);
        }
      } catch (error) {
        console.error("[main.js] Wallet connection error:", error);
        uiModule.showError("Failed to connect wallet");
      }
    });

    elements.disconnectButton.addEventListener("click", () => {
      walletModule.disconnectWallet();
      uiModule.resetUI();
    });

    elements.backToMainButton.addEventListener("click", () => {
      window.location.href = "https://liquidityx.io";
    });

    elements.checkTokenButton.addEventListener("click", async () => {
      try {
        const tokenAddress = elements.tokenAddressInput.value.trim();
        if (!tokenAddress) {
          uiModule.showError("Please enter a token address");
          return;
        }
        await tokenModule.checkToken(tokenAddress);
      } catch (error) {
        console.error("[main.js] Token check error:", error);
        uiModule.showError("Token verification failed");
      }
    });

    elements.modeSelect.addEventListener("change", (event) => {
      const mode = event.target.value;
      console.log("[main.js] Mode changed:", mode);
      uiModule.clearResults();
      uiModule.showModeSection(mode);
    });

    elements.proceedButton.addEventListener("click", async () => {
      try {
        const mode = elements.modeSelect.value;
        console.log("[main.js] Proceed button clicked");
        const addresses = await addressModule.fetchAddresses(mode);
        if (addresses?.length > 0) {
          uiModule.displayAddresses(addresses);
        } else {
          uiModule.showError("No addresses found");
        }
      } catch (error) {
        console.error("[main.js] Address fetch error:", error);
        uiModule.showError("Failed to fetch addresses");
      }
    });

    elements.sendButton.addEventListener("click", async () => {
      try {
        console.log("[main.js] Send button clicked");
        const token = tokenModule.getSelectedToken();
        const amountPerUser = elements.tokenAmountPerUser.value;
        const addresses = uiModule.getDisplayedAddresses();

        if (!token) {
          uiModule.showError("No token selected");
          return;
        }
        if (!amountPerUser || isNaN(amountPerUser)) {
          uiModule.showError("Invalid amount");
          return;
        }
        if (!addresses?.length) {
          uiModule.showError("No addresses available");
          return;
        }

        await airdropExecutor.executeAirdrop(token, amountPerUser, addresses);
      } catch (error) {
        console.error("[main.js] Airdrop execution error:", error);
        uiModule.showError("Airdrop failed");
      }
    });

    console.log("[main.js] Initialization complete ✅");
  } catch (error) {
    console.error("[main.js] ❌ Initialization failed:", error);
    uiModule.showError("Application failed to initialize");
  }
};

// Expose globally
window.initializeApp = initializeApp;

// Trigger when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("[main.js] DOM loaded");
});
