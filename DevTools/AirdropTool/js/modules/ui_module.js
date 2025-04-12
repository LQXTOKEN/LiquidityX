import { clearAddressList } from './address_module.js';
import { disconnectWallet } from './wallet_module.js';

let selectedMode = "";

export function initUI() {
  // Back to main website
  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  // Disconnect wallet
  document.getElementById("disconnect-btn").addEventListener("click", () => {
    disconnectWallet();
  });

  // Handle dropdown change
  document.getElementById("mode").addEventListener("change", handleModeChange);

  // Hide all input sections initially
  toggleInputFields("");
}

function handleModeChange() {
  const mode = document.getElementById("mode").value;

  if (selectedMode && selectedMode !== mode) {
    const confirmClear = confirm("Switching modes will clear your current address list. Proceed?");
    if (!confirmClear) {
      document.getElementById("mode").value = selectedMode;
      return;
    }
    clearAddressList();
  }

  selectedMode = mode;
  toggleInputFields(mode);
}

function toggleInputFields(mode) {
  const pasteBox = document.getElementById("paste-box");
  const scanBox = document.getElementById("scan-box");
  const randomBox = document.getElementById("random-box");
  const downloadBtn = document.getElementById("download-btn");

  pasteBox.style.display = mode === "paste" ? "block" : "none";
  scanBox.style.display = mode === "create" ? "block" : "none";
  randomBox.style.display = mode === "random" ? "block" : "none";
  downloadBtn.style.display = (mode === "create" || mode === "random") ? "inline-block" : "none";
}

export function updateLQXInfo(balance) {
  document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${balance}`;
}

export function updateWalletInfo(address) {
  document.getElementById("wallet-info").innerText = `🧾 Connected: ${address}`;
}

export function showWarning(msg) {
  document.getElementById("requirement-warning").innerText = msg;
}

export function clearWarning() {
  document.getElementById("requirement-warning").innerText = "";
}

export function disableUI() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

export function enableUI() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}
