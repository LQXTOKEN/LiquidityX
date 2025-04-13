document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    // ABIs πρέπει να έχουν φορτωθεί ήδη από config.js
    if (!window.AIRDROP_ABI || !window.ERC20_ABI) {
      throw new Error("ABIs not loaded");
    }
    console.log("[main.js] ✅ ABIs loaded and verified");

    // Συνδέσεις κουμπιών
    const connectButton = document.getElementById("connectWallet");
    const disconnectButton = document.getElementById("disconnectWallet");

    if (!connectButton || !disconnectButton) {
      throw new Error("Wallet buttons not found");
    }

    connectButton.addEventListener("click", async () => {
      console.log("[main.js] Connect button clicked");
      const walletInfo = await walletModule.connectWallet();
      if (!walletInfo) return;

      console.log("[main.js] Wallet connected:", walletInfo);
      uiModule.showWalletAddress(walletInfo.userAddress);

      // Έλεγχος LQX balance
      const lqxBalance = await erc20Module.getTokenBalance(
        walletInfo.provider,
        walletInfo.userAddress,
        window.config.LQX_TOKEN_ADDRESS
      );
      console.log("[main.js] LQX balance info:", lqxBalance);

      uiModule.updateLQXBalance(lqxBalance.formatted);
      const isEligible = parseFloat(lqxBalance.formatted) >= 1000;
      uiModule.setEligibility(isEligible);

      if (isEligible) {
        document.getElementById("airdropTool").style.display = "block";
      } else {
        document.getElementById("accessDenied").style.display = "block";
      }
    });

    disconnectButton.addEventListener("click", () => {
      walletModule.disconnectWallet();
      uiModule.resetWalletUI();
    });

    // Mode selector handler
    const modeSelect = document.getElementById("modeSelect");
    if (modeSelect) {
      modeSelect.addEventListener("change", (e) => {
        const mode = e.target.value;
        console.log("[main.js] Mode changed:", mode);
        uiModule.switchMode(mode);
      });
    }

    // Proceed button
    const proceedButton = document.getElementById("proceedButton");
    if (proceedButton) {
      proceedButton.addEventListener("click", async () => {
        console.log("[main.js] Proceed button clicked");

        const mode = document.getElementById("modeSelect").value;
        console.log("[main.js] Fetching addresses for mode:", mode);

        let addresses = await addressModule.getAddressesByMode(mode);
        console.log("[main.js] Fetched addresses:", addresses);

        uiModule.displayAddresses(addresses);
        window.selectedAddresses = addresses; // Για χρήση από app.js
      });
    }

    // Send button
    const sendButton = document.getElementById("sendButton");
    if (sendButton) {
      sendButton.addEventListener("click", async () => {
        console.log("[main.js] Send button clicked");

        const tokenAddress = document.getElementById("tokenAddressInput").value.trim();
        const amountPerUser = document.getElementById("tokenAmountPerUser").value.trim();
        const addresses = window.selectedAddresses || [];

        const token = {
          address: tokenAddress,
          contract: null, // Θα φορτωθεί από app.js ή token_module.js
        };

        app.executeAirdrop({ token, amountPerUser, addresses });
      });
    }
  } catch (err) {
    console.error("[main.js] ❌ Unexpected error:", err);
  }
});
