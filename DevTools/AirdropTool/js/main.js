import { connectWallet, disconnectWallet, isConnected, getUserAddress, checkLQXBalance } from './js/modules/wallet_module.js';
import { handleAddressModeChange, handleProceed, downloadAddresses } from './js/modules/address_module.js';
import { checkTokenInfo } from './js/modules/token_module.js';
import { setupUI, disableUI, enableUI } from './js/modules/ui_module.js';

// Global state
let walletConnected = false;

// Run on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  setupUI();

  // Connect Wallet
  document.getElementById("connect-btn").addEventListener("click", async () => {
    const connected = await connectWallet();
    if (connected) {
      walletConnected = true;

      const isHolder = await checkLQXBalance();
      if (!isHolder) {
        disableUI("⚠️ You must hold at least 1000 LQX tokens to use this tool.");
        return;
      }

      enableUI();
    }
  });

  // Disconnect Wallet
  document.getElementById("disconnect-btn").addEventListener("click", () => {
    disconnectWallet();
    walletConnected = false;
    disableUI("🔌 Wallet disconnected.");
  });

  // ERC20 Check Button
  document.getElementById("check-token-btn").addEventListener("click", async () => {
    if (!walletConnected) {
      alert("Please connect wallet first.");
      return;
    }
    await checkTokenInfo();
  });

  // Address Mode Change
  document.getElementById("mode").addEventListener("change", handleAddressModeChange);

  // Proceed button
  document.getElementById("proceed-btn").addEventListener("click", handleProceed);

  // Download addresses
  document.getElementById("download-btn").addEventListener("click", downloadAddresses);

  // Back button
  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });
});
