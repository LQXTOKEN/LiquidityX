// app.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[app.js] DOM loaded");

  // Περιμένουμε πρώτα να φορτωθούν τα ABIs
  await CONFIG.loadAbis();
  console.log("[app.js] ✅ ABIs loaded and verified");

  const sendButton = document.getElementById("sendButton");

  if (sendButton) {
    sendButton.addEventListener("click", async () => {
      console.log("[app.js] Send button clicked");

      const selectedToken = window.selectedToken;
      const tokenAmountPerUser = window.tokenAmountPerUser;
      const addresses = window.selectedAddresses;
      const signer = window.signer;

      console.log("[app.js] Executing airdrop with", {
        token: selectedToken,
        amountPerUser: tokenAmountPerUser?.toString?.() || tokenAmountPerUser,
        addresses: addresses
      });

      if (!selectedToken || !selectedToken.contractAddress) {
        console.warn("[app.js] ⚠️ Token missing");
        uiModule.addLog("❌ Token is missing or invalid.", "error");
        return;
      }

      if (!tokenAmountPerUser || !ethers.BigNumber.isBigNumber(tokenAmountPerUser)) {
        console.warn("[app.js] ⚠️ Invalid amount");
        uiModule.addLog("❌ Invalid amount per address.", "error");
        return;
      }

      if (!addresses || addresses.length === 0) {
        console.warn("[app.js] ⚠️ No addresses");
        uiModule.addLog("❌ No recipient addresses.", "error");
        return;
      }

      if (!signer) {
        console.warn("[app.js] ⚠️ No signer");
        uiModule.addLog("❌ Wallet not connected.", "error");
        return;
      }

      try {
        await sendModule.sendAirdrop(
          selectedToken.contractAddress,
          selectedToken.symbol,
          tokenAmountPerUser,
          addresses,
          signer
        );
      } catch (err) {
        console.error("[app.js] ❌ Airdrop execution error:", err);
        uiModule.addLog(`❌ Airdrop failed: ${err.reason || err.message || "Unknown error"}`, "error");
      }
    });
  } else {
    console.error("[app.js] ❌ sendButton not found in DOM!");
  }
});
