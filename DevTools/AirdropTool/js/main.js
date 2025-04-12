// js/main.js

import { connectWallet, disconnectWallet, checkLQXBalance, getUserAddress } from './modules/wallet_module.js';
import { handleModeChange, handleProceed, downloadAddresses, toggleInputFields, clearUI } from './modules/address_module.js';
import { displayWalletInfo, displayLQXBalance, showWarning, resetUI } from './modules/ui_module.js';

let selectedMode = "";
let addressList = [];

document.addEventListener("DOMContentLoaded", async () => {
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const backBtn = document.getElementById("back-btn");
  const modeSelect = document.getElementById("mode");
  const proceedBtn = document.getElementById("proceed-btn");
  const downloadBtn = document.getElementById("download-btn");

  connectBtn.addEventListener("click", async () => {
    const wallet = await connectWallet();
    if (wallet) {
      displayWalletInfo(wallet.address);
      const lqxBalance = await checkLQXBalance(wallet.provider, wallet.address);
      displayLQXBalance(lqxBalance.formatted);
      if (lqxBalance.ok) {
        enableUI();
      } else {
        showWarning("⚠️ You must hold at least 1000 LQX tokens to use this tool.");
        disableUI();
      }
    }
  });

  disconnectBtn.addEventListener("click", () => {
    disconnectWallet();
    resetUI();
    disableUI();
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  modeSelect.addEventListener("change", (e) => {
    const newMode = e.target.value;
    if (addressList.length > 0) {
      const confirmClear = confirm("Switching modes will clear your current address list. Proceed?");
      if (!confirmClear) {
        modeSelect.value = selectedMode;
        return;
      }
      addressList = [];
      clearUI();
    }
    selectedMode = newMode;
    toggleInputFields(newMode);
  });

  proceedBtn.addEventListener("click", async () => {
    addressList = await handleProceed(selectedMode);
  });

  downloadBtn.addEventListener("click", () => {
    downloadAddresses(addressList);
  });

  function disableUI() {
    modeSelect.disabled = true;
    proceedBtn.disabled = true;
    downloadBtn.disabled = true;
  }

  function enableUI() {
    modeSelect.disabled = false;
    proceedBtn.disabled = false;
    downloadBtn.disabled = false;
  }
});
