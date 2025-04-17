// main.js
//
// 📦 Entry point του εργαλείου. Συνδέει UI με modules και triggers.
// ✅ Δεν περιέχει καμία business λογική — όλα τα calls γίνονται σε modules.

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");
  } catch (e) {
    return uiModule.showError("❌ Failed to load smart contract definitions");
  }

  // 🔄 Initial placeholder log
  uiModule.updateLastAirdrops();

  // 🟢 Κουμπί σύνδεσης
  document.getElementById("connectWallet").addEventListener("click", () => {
    console.log("[main.js] Connect button clicked");
    window.handleWalletConnected();
  });

  // 🔴 Κουμπί αποσύνδεσης
  document.getElementById("disconnectWallet").addEventListener("click", () => {
    walletModule.disconnectWallet();
    uiModule.resetUI();
  });

  // 🔁 Κουμπί επανάληψης αποτυχημένων
  document.getElementById("retryFailedButton").addEventListener("click", () => {
    window.appRetry();
  });

  // 💸 Κουμπί ανάκτησης tokens
  document.getElementById("recoverTokensButton").addEventListener("click", () => {
    window.appRecover();
  });

  // 📦 Κουμπί προβολής προηγούμενης εγγραφής
  document.getElementById("checkRecordButton").addEventListener("click", () => {
    document.getElementById("recoveryCard").style.display = "block";
    window.appRecover(); // ή αν θες, show fetch-only: sendModule.checkMyRecord()
  });

  // 🔍 Token validation
  document.getElementById("checkToken").addEventListener("click", () => {
    console.log("[main.js] Check Token button clicked");
    const tokenAddr = document.getElementById("tokenAddressInput").value.trim();
    tokenModule.checkToken(tokenAddr);
  });

  // 🔀 Mode selection
  document.getElementById("modeSelect").addEventListener("change", (e) => {
    const mode = e.target.value;
    console.log("[main.js] Mode changed:", mode);
    uiModule.showModeSection(mode);
  });

  // 🧠 Fetch addresses
  document.getElementById("proceedButton").addEventListener("click", async () => {
    console.log("[main.js] Proceed button clicked");

    const token = tokenModule.getSelectedToken();
    if (!token) {
      uiModule.showError("❌ Please select a token first");
      return;
    }

    try {
      const mode = document.getElementById("modeSelect").value;
      const addresses = await addressModule.fetchAddresses(mode);

      if (!addresses.length) {
        uiModule.showError("❌ No valid addresses found");
        return;
      }

      uiModule.displayAddresses(addresses);
    } catch (err) {
      console.error("[main.js] Address fetch error:", err);
      uiModule.showError("❌ Failed to fetch addresses");
    }
  });

  // 🚀 Send Airdrop
  document.getElementById("sendButton").addEventListener("click", () => {
    console.log("[main.js] Send button clicked");

    const amountStr = document.getElementById("tokenAmountPerUser").value.trim();
    const recipients = uiModule.getDisplayedAddresses();

    if (!amountStr || isNaN(amountStr)) {
      uiModule.showError("❌ Invalid amount");
      return;
    }

    if (!recipients.length) {
      uiModule.showError("❌ No recipients to send to");
      return;
    }

    const token = tokenModule.getSelectedToken();
    if (!token) {
      uiModule.showError("❌ No token selected");
      return;
    }

    const amount = ethers.utils.parseUnits(amountStr, token.decimals);
    console.log("[main.js] Parsed amount in wei:", amount.toString());

    window.appSend(amount, recipients);
  });

  console.log("[main.js] Initialization complete ✅");
});
