import { connectWallet, disconnectWallet, getUserAddress, checkLQXBalance } from './modules/wallet_module.js';
import { handleProceed, downloadAddresses, clearAddressList } from './modules/address_module.js';
import { initUI, disableUI, enableUI, updateWalletInfo, updateLQXInfo, showWarning, clearWarning } from './modules/ui_module.js';

document.addEventListener("DOMContentLoaded", async () => {
  // Αρχικοποίηση UI
  initUI();

  // Σύνδεση wallet
  document.getElementById("connect-btn").addEventListener("click", async () => {
    const address = await connectWallet();
    if (address) {
      updateWalletInfo(address);
      const balance = await checkLQXBalance(address);
      updateLQXInfo(balance);

      if (balance >= 1000) {
        enableUI();
        clearWarning();
      } else {
        disableUI();
        showWarning("⚠️ You must hold at least 1000 LQX tokens to use this tool.");
      }
    }
  });

  // Αποσύνδεση wallet
  document.getElementById("disconnect-btn").addEventListener("click", () => {
    disconnectWallet();
    clearAddressList();
    disableUI();
    showWarning("🔌 Wallet disconnected.");
  });

  // Επιβεβαίωση και εξαγωγή διευθύνσεων
  document.getElementById("proceed-btn").addEventListener("click", handleProceed);

  // Download as .txt
  document.getElementById("download-btn").addEventListener("click", downloadAddresses);

  // Back to main site
  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  // Αρχικά απενεργοποιημένα τα inputs
  disableUI();
});
