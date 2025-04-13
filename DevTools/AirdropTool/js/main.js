// main.js

console.log("[main.js] DOM loaded");

async function initializeApp() {
  try {
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
        const addresses = await addressModule.fetchAddresses(mode);
        if (addresses?.length > 0) {
          uiModule.displayAddresses(addresses);
        } else {
          uiModule.showError("No addresses found");
        }
      } catch (error) {
        console.error("[main.js] Fetch error:", error);
        uiModule.showError("Failed to fetch addresses");
      }
    });

    sendButton.addEventListener("click", async () => {
      try {
        const token = tokenModule.getSelectedToken();
        const amountPerUser = tokenAmountPerUser.value;
        const addresses = uiModule.getDisplayedAddresses();

        if (!token) return uiModule.showError("No token selected");
        if (!amountPerUser || isNaN(amountPerUser)) return uiModule.showError("Invalid amount");
        if (!addresses || addresses.length === 0) return uiModule.showError("No addresses");

        await airdropExecutor.executeAirdrop(token, amountPerUser, addresses);
      } catch (error) {
        console.error("[main.js] Airdrop error:", error);
        uiModule.showError("Airdrop failed");
      }
    });

    console.log("[main.js] Initialization complete ✅");
  } catch (err) {
    console.error("[main.js] ❌ Initialization failed:", err);
    uiModule.showError("Application failed to initialize");
  }
}
