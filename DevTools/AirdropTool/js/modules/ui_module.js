import { clearAddressList } from './address_module.js';
import { disconnectWallet } from './wallet_module.js';

let selectedMode = "";

// UI Elements cache
const uiElements = {
  backBtn: document.getElementById("back-btn"),
  disconnectBtn: document.getElementById("disconnect-btn"),
  modeSelect: document.getElementById("mode"),
  pasteBox: document.getElementById("paste-box"),
  scanBox: document.getElementById("scan-box"),
  randomBox: document.getElementById("random-box"),
  downloadBtn: document.getElementById("download-btn"),
  lqxInfo: document.getElementById("lqx-info"),
  walletInfo: document.getElementById("wallet-info"),
  warning: document.getElementById("requirement-warning"),
  proceedBtn: document.getElementById("proceed-btn")
};

export function initUI() {
  // Event listeners
  uiElements.backBtn.addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  uiElements.disconnectBtn.addEventListener("click", disconnectWallet);
  uiElements.modeSelect.addEventListener("change", handleModeChange);

  // Initialize UI state
  toggleInputFields("");
}

function handleModeChange() {
  const newMode = uiElements.modeSelect.value;

  if (selectedMode && selectedMode !== newMode) {
    if (!confirm("Switching modes will clear your current address list. Proceed?")) {
      uiElements.modeSelect.value = selectedMode;
      return;
    }
    clearAddressList();
  }

  selectedMode = newMode;
  toggleInputFields(newMode);
}

function toggleInputFields(mode) {
  // Show/hide input sections based on selected mode
  uiElements.pasteBox.style.display = mode === "paste" ? "block" : "none";
  uiElements.scanBox.style.display = mode === "create" ? "block" : "none";
  uiElements.randomBox.style.display = mode === "random" ? "block" : "none";
  
  // Download button visibility logic
  uiElements.downloadBtn.style.display = ["create", "random"].includes(mode) 
    ? "inline-block" 
    : "none";
}

// Wallet information display functions
export function updateLQXInfo(balance) {
  uiElements.lqxInfo.innerText = `💰 LQX Balance: ${balance}`;
}

export function updateWalletInfo(address) {
  uiElements.walletInfo.innerText = `🧾 Connected: ${address}`;
}

// Warning message functions
export function showWarning(message) {
  uiElements.warning.innerText = message;
}

export function clearWarning() {
  uiElements.warning.innerText = "";
}

// UI state functions
export function disableUI() {
  uiElements.modeSelect.disabled = true;
  uiElements.proceedBtn.disabled = true;
}

export function enableUI() {
  uiElements.modeSelect.disabled = false;
  uiElements.proceedBtn.disabled = false;
}
