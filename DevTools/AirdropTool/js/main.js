// 📄 js/main.js
// Περιγραφή: Entry point του εργαλείου. Κάνει init ABIs, wallet και binds UI listeners.

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded, now initializing wallet");
    tryConnectWallet();
  } catch (err) {
    uiModule.showError("❌ Failed to initialize ABIs. Reload page.");
  }

  // ✅ Event listeners για modes
  const modeSelect = document.getElementById("modeSelect");
  const pasteSection = document.getElementById("pasteSection");
  const createSection = document.getElementById("createSection");
  const randomSection = document.getElementById("randomSection");

  modeSelect.addEventListener("change", () => {
    const mode = modeSelect.value;
    pasteSection.style.display = mode === "paste" ? "block" : "none";
    createSection.style.display = mode === "create" ? "block" : "none";
    randomSection.style.display = mode === "random" ? "block" : "none";

    // ✅ Always show Proceed button regardless of mode
    document.getElementById("proceedButton").style.display = "inline-block";
  });

  // ✅ Trigger mode change manually on load to show correct section
  modeSelect.dispatchEvent(new Event("change"));

  // ✅ Connect wallet
  document.getElementById("connectWallet").addEventListener("click", handleWalletConnected);

  // ✅ Disconnect
  document.getElementById("disconnectWallet").addEventListener("click", () => {
    walletModule.disconnectWallet();
    window.location.reload();
  });

  // ✅ Back to main site
  document.getElementById("backToMain").addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  // ✅ Token check
  document.getElementById("checkToken").addEventListener("click", tokenModule.checkToken);

  // ✅ Proceed
  document.getElementById("proceedButton").addEventListener("click", async () => {
    const mode = document.getElementById("modeSelect").value;
    if (mode === "paste") return addressModule.handlePasteMode();
    if (mode === "create") return addressModule.handleCreateMode();
    if (mode === "random") return addressModule.handleRandomMode();
  });

  // ✅ Send
  document.getElementById("sendButton").addEventListener("click", appSend);

  // ✅ Download
  document.getElementById("downloadButton").addEventListener("click", addressModule.downloadAddresses);
  document.getElementById("downloadFailedButton").addEventListener("click", sendModule.downloadFailed);

  // ✅ Recovery
  document.getElementById("checkRecordButton").addEventListener("click", appCheckRecord);
  document.getElementById("retryFailedButton").addEventListener("click", appRetry);
  document.getElementById("recoverTokensButton").addEventListener("click", appRecover);
});

async function tryConnectWallet() {
  const wallet = await walletModule.connectWallet();
  if (wallet) await handleWalletConnected();
}
