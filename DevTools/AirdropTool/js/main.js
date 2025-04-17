// 📄 js/main.js
// 🔄 Entry point του UI – φορτώνει ABIs, κάνει auto-connect, χειρίζεται UI triggers

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ⏳ Βήμα 1: Περιμένουμε να φορτωθούν τα ABIs
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded, now initializing wallet");

    // ✅ Βήμα 2: Προσπάθεια αυτόματης σύνδεσης (αν έχει ενεργό wallet)
    await tryConnectWallet();

    // ✅ Βήμα 3: Ενεργοποίηση των κουμπιών
    initEventListeners();
  } catch (err) {
    console.error("[main.js] ❌ Initialization error:", err);
    uiModule.showError("❌ Failed to initialize app – ABI loading issue.");
  }
});

async function tryConnectWallet() {
  const wallet = await walletModule.connectWallet();
  if (wallet) {
    await handleWalletConnected();
  }
}

function initEventListeners() {
  document.getElementById("connectWallet").addEventListener("click", handleWalletConnected);
  document.getElementById("disconnectWallet").addEventListener("click", () => {
    walletModule.disconnectWallet();
    location.reload();
  });

  document.getElementById("checkToken").addEventListener("click", tokenModule.checkToken);
  document.getElementById("proceedButton").addEventListener("click", addressModule.handleProceed);
  document.getElementById("sendButton").addEventListener("click", appSend);

  document.getElementById("retryFailedButton").addEventListener("click", appRetry);
  document.getElementById("recoverTokensButton").addEventListener("click", appRecover);
  document.getElementById("checkRecordButton").addEventListener("click", appCheckRecord);
  document.getElementById("backToMain").addEventListener("click", () => {
    window.location.href = "https://liquidityx.finance";
  });

  document.getElementById("modeSelect").addEventListener("change", uiModule.switchMode);
}
