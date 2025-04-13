window.addEventListener("load", async () => {
  console.log("[main.js] DOM loaded");

  try {
    console.log("[main.js] ✅ ABIs loaded and verified");

    // Connect button
    const connectButton = document.getElementById("connectButton");
    connectButton.addEventListener("click", async () => {
      console.log("[main.js] Connect button clicked");
      const wallet = await walletModule.connectWallet();
      if (wallet && wallet.userAddress) {
        console.log("[main.js] Wallet connected:", wallet);
        const lqxBalance = await erc20Module.getLQXBalance(wallet.userAddress);
        console.log("[main.js] LQX balance info:", lqxBalance);
        uiModule.showLQXBalance(lqxBalance.formatted);

        const hasEnough = parseFloat(lqxBalance.formatted) >= 1000;
        uiModule.toggleUI(hasEnough);
        if (!hasEnough) {
          uiModule.showError("You need at least 1000 LQX to use this tool.");
        }
      }
    });

    // Mode change
    const modeSelect = document.getElementById("mode");
    modeSelect.addEventListener("change", () => {
      const mode = modeSelect.value;
      console.log("[main.js] Mode changed:", mode);
      uiModule.clearResults();
      uiModule.clearPasteInput();
      uiModule.clearHowManyInput();
      uiModule.toggleModeSections(mode);
    });

    // Proceed button
    const proceedButton = document.getElementById("proceedButton");
    proceedButton.addEventListener("click", async () => {
      const mode = document.getElementById("mode").value;
      console.log("[main.js] Proceed button clicked");

      let addresses = [];
      if (mode === "paste") {
        const text = document.getElementById("pasteArea").value;
        addresses = text.split("\n").map(a => a.trim()).filter(Boolean);
      } else if (mode === "random") {
        const count = parseInt(document.getElementById("randomCount").value, 10);
        const response = await fetch(config.activeWalletsUrl);
        const data = await response.json();
        const shuffled = data.sort(() => 0.5 - Math.random());
        addresses = shuffled.slice(0, Math.min(count, 1000));
      } else if (mode === "create") {
        const tokenAddress = document.getElementById("tokenAddress").value.trim();
        const url = `${config.proxyApiUrl}?token=${tokenAddress}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          addresses = result.addresses.slice(0, 1000);
          console.log("[main.js] Proxy API response (create):", result);
        }
      }

      console.log("[main.js] Fetched addresses:", addresses);
      window.currentAddressList = addresses;
      uiModule.displayAddresses(addresses);
    });

    // Send button
    const sendButton = document.getElementById("sendButton");
    sendButton.addEventListener("click", async () => {
      console.log("[main.js] Send button clicked");

      const tokenAddress = document.getElementById("tokenAddress").value.trim();
      const amountPerUser = document.getElementById("amountPerUser").value.trim();

      const token = await erc20Module.getTokenDetails(tokenAddress);
      const addresses = window.currentAddressList;

      if (!token || !amountPerUser || !addresses || addresses.length === 0) {
        return uiModule.showError("Missing token, amount, or recipient list.");
      }

      console.log("[main.js] Executing airdrop with", {
        token,
        amountPerUser,
        addresses,
      });

      await airdropExecutor.executeAirdrop(token, amountPerUser, addresses);
    });
  } catch (err) {
    console.error("[main.js] ❌ Unexpected error:", err);
  }
});
