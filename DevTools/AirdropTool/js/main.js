// main.js

// Timeout config για ασφάλεια
const ABI_LOAD_TIMEOUT = 5000; // 5 seconds
const ABI_CHECK_INTERVAL = 100;

// 🔁 Περιμένει να φορτωθούν και τα δύο ABIs
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

// 🔁 Περιμένει να φορτωθεί το DOM και ξεκινάει την εφαρμογή
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await waitForAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");

    const connectButton = document.getElementById("connectWallet");
    const disconnectButton = document.getElementById("disconnectWallet");
    const backToMainButton = document.getElementById("backToMain");
    const checkTokenButton = document.getElementById("checkToken");
    const proceedButton = document.getElementById("proceedButton");
    const modeSelect = document.getElementById("modeSelect");
    const sendButton = document.getElementById("sendButton");
    const tokenAddressInput = document.getElementById("tokenAddressInput");
    const tokenAmountPerUser = document.getElementById("tokenAmountPerUser");

    connectButton.addEventListener("click", async () => {
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

    disconnectButton.addEventListener("click", () => {
      walletModule.disconnectWallet();
      uiModule.resetUI();
    });

    backToMainButton.addEventListener("click", () => {
      window.location.href = "https://liquidityx.io";
    });

    checkTokenButton.addEventListener("click", async () => {
      try {
        const tokenAddress = tokenAddressInput.value.trim();
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

    modeSelect.addEventListener("change", (event) => {
      const mode = event.target.value;
      console.log("[main.js] Mode changed:", mode);
      uiModule.clearResults();
      uiModule.showModeSection(mode);
    });

    proceedButton.addEventListener("click", async () => {
      try {
        const mode = modeSelect.value;
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

    sendButton.addEventListener("click", async () => {
      try {
        console.log("[main.js] Send button clicked");

        const token = tokenModule.getSelectedToken();
        const amountPerUser = tokenAmountPerUser.value;
        const addresses = uiModule.getDisplayedAddresses();

        if (!token) {
          uiModule.showError("No token selected");
          return;
        }

        if (!amountPerUser || isNaN(amountPerUser)) {
          uiModule.showError("Invalid amount");
          return;
        }

        if (!addresses || addresses.length === 0) {
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
});
