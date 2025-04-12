import { connectWallet, disconnectWallet, isConnected, getUserAddress, checkLQXBalance } from './modules/wallet_module.js';
import { handleTokenCheck, getSelectedToken } from './modules/token_module.js';
import { handleModeChange, handleProceed, getAddressList, downloadAddresses } from './modules/address_module.js';
import { initUI, disableUI, enableUI } from './modules/ui_module.js';

document.addEventListener("DOMContentLoaded", async () => {
  initUI();

  document.getElementById("connect-btn").addEventListener("click", async () => {
    const connected = await connectWallet();
    if (connected) {
      const hasRequired = await checkLQXBalance();
      if (hasRequired) {
        enableUI();
      } else {
        disableUI("⚠️ You must hold at least 1000 LQX tokens to use this tool.");
      }
    }
  });

  document.getElementById("disconnect-btn").addEventListener("click", () => {
    disconnectWallet();
    disableUI("🔌 Wallet disconnected.");
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  document.getElementById("mode").addEventListener("change", handleModeChange);
  document.getElementById("proceed-btn").addEventListener("click", handleProceed);
  document.getElementById("download-btn").addEventListener("click", downloadAddresses);
  document.getElementById("check-token-btn").addEventListener("click", handleTokenCheck);
});
