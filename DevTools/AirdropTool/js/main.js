// main.js

import { connectWallet, disconnectWallet } from './modules/wallet_module.js';
import { handleProceed, downloadAddresses, handleModeChange } from './modules/ui_module.js';

// 🔌 Connect Wallet
document.getElementById("connect-btn").addEventListener("click", connectWallet);

// 🔌 Disconnect Wallet
document.getElementById("disconnect-btn").addEventListener("click", disconnectWallet);

// 🧭 Mode Selection (Paste / Create / Random)
document.getElementById("mode").addEventListener("change", handleModeChange);

// ✅ Proceed to extract or generate addresses
document.getElementById("proceed-btn").addEventListener("click", handleProceed);

// 💾 Download .txt with selected addresses
document.getElementById("download-btn").addEventListener("click", downloadAddresses);

// 🔙 Back to Main Website
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "https://liquidityx.io";
});
