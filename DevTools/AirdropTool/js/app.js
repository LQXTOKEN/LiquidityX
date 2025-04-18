// app.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[app.js] DOM loaded");

  try {
    // ✅ Φορτώνουμε και επαληθεύουμε τα ABIs
    await CONFIG.loadAbis();
    console.log("[app.js] ✅ ABIs loaded and verified");

    // ✅ Αρχικοποίηση του Send Button
    const sendButton = document.getElementById("sendButton");
    if (!sendButton) {
      console.error("[app.js] ❌ sendButton not found in DOM!");
      return;
    }

    // ✅ Προσθήκη event listener στο Send Button
    sendButton.addEventListener("click", async () => {
      console.log("[app.js] Send button clicked");

      // ✅ Επαλήθευση σύνδεσης wallet
      if (!window.signer) {
        uiModule.showError("❌ Wallet not connected.");
        return;
      }

      // ✅ Ανάκτηση global παραμέτρων
      const selectedToken = window.selectedToken;
      const tokenAmountPerUser = window.tokenAmountPerUser;
      const selectedAddresses = window.selectedAddresses;

      // ✅ Έλεγχος παραμέτρων πριν την εκτέλεση του airdrop
      if (!selectedToken) {
        uiModule.showError("⚠️ Token not selected.");
        return;
      }

      if (!tokenAmountPerUser) {
        uiModule.showError("⚠️ Amount per user not specified.");
        return;
      }

      if (!selectedAddresses || selectedAddresses.length === 0) {
        uiModule.showError("⚠️ No recipient addresses found.");
        return;
      }

      // ✅ Εκτέλεση του airdrop
      try {
        await window.airdropExecutor.executeAirdrop({
          token: selectedToken,
          amountPerUser: tokenAmountPerUser,
          addresses: selectedAddresses
        });
        uiModule.addLog("✅ Airdrop execution successful.");
      } catch (err) {
        console.error("[app.js] ❌ Airdrop execution failed:", err);
        uiModule.showError("❌ Airdrop failed. Check console for details.");
      }
    });

    console.log("[app.js] Initialization complete ✅");
  } catch (err) {
    console.error("[app.js] ❌ Initialization failed:", err);
    uiModule.showError("❌ Initialization failed. Check console.");
  }
});
