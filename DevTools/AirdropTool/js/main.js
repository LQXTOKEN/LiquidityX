import { connectWallet, disconnectWallet } from './modules/wallet_module.js';
import { fetchData } from './modules/fetch_module.js';
import { 
  populateAddressList, 
  clearUI, 
  toggleInputFields, 
  enableInputs, 
  disableInputs 
} from './modules/ui_module.js';
import { LQX_REQUIRED } from './modules/config.js';

// Application state
const appState = {
  selectedMode: "",
  addressList: [],
  isConnected: false
};

// DOM Elements cache
const domElements = {
  connectBtn: document.getElementById("connect-btn"),
  disconnectBtn: document.getElementById("disconnect-btn"),
  modeSelect: document.getElementById("mode"),
  proceedBtn: document.getElementById("proceed-btn"),
  downloadBtn: document.getElementById("download-btn"),
  backBtn: document.getElementById("back-btn"),
  pasteInput: document.getElementById("paste-input"),
  scanLink: document.getElementById("scan-link"),
  maxAddresses: document.getElementById("max-addresses"),
  randomCount: document.getElementById("random-count")
};

// Initialize event listeners
function initEventListeners() {
  domElements.connectBtn.addEventListener("click", handleConnect);
  domElements.disconnectBtn.addEventListener("click", handleDisconnect);
  domElements.modeSelect.addEventListener("change", handleModeChange);
  domElements.proceedBtn.addEventListener("click", handleProceed);
  domElements.downloadBtn.addEventListener("click", downloadAddresses);
  domElements.backBtn.addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });
}

// Connection handlers
async function handleConnect() {
  try {
    const result = await connectWallet();
    if (result?.hasEnoughLQX) {
      appState.isConnected = true;
      enableInputs();
    } else {
      disableInputs();
    }
  } catch (error) {
    console.error("Connection error:", error);
    alert("Failed to connect wallet");
  }
}

function handleDisconnect() {
  disconnectWallet();
  appState.isConnected = false;
  disableInputs();
  clearUI();
}

// Mode handling
function handleModeChange() {
  const newMode = domElements.modeSelect.value;
  
  if (appState.addressList.length > 0) {
    if (!confirm("Switching modes will clear your current address list. Proceed?")) {
      domElements.modeSelect.value = appState.selectedMode;
      return;
    }
    appState.addressList = [];
    clearUI();
  }

  appState.selectedMode = newMode;
  toggleInputFields(newMode);
}

// Address processing
async function handleProceed() {
  try {
    clearUI();
    
    switch (appState.selectedMode) {
      case "paste":
        await handlePasteMode();
        break;
      case "create":
        await handleCreateMode();
        break;
      case "random":
        await handleRandomMode();
        break;
      default:
        throw new Error("Invalid mode selected");
    }
    
    if (appState.addressList.length > 0) {
      populateAddressList(appState.addressList);
    }
  } catch (error) {
    console.error("Proceed error:", error);
    alert(error.message);
  }
}

async function handlePasteMode() {
  const raw = domElements.pasteInput.value.trim();
  if (!raw) throw new Error("No addresses pasted");
  
  appState.addressList = raw.split(/\s+/)
    .filter(line => ethers.utils.isAddress(line));
}

async function handleCreateMode() {
  const scanLink = domElements.scanLink.value.trim();
  const max = parseInt(domElements.maxAddresses.value) || 100;

  const tokenAddress = extractTokenAddress(scanLink);
  const data = await fetchData(tokenAddress);
  appState.addressList = data.slice(0, max);
}

async function handleRandomMode() {
  const count = parseInt(domElements.randomCount.value) || 100;
  const response = await fetch('https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json');
  const all = await response.json();
  appState.addressList = shuffleArray(all).slice(0, count);
}

// Helper functions
function extractTokenAddress(scanLink) {
  const regex = /token\/(0x[a-fA-F0-9]{40})/;
  const match = scanLink.match(regex);
  if (!match) throw new Error("Invalid PolygonScan token link");
  return match[1];
}

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function downloadAddresses() {
  if (appState.addressList.length === 0) {
    alert("No addresses to download.");
    return;
  }

  try {
    const blob = new Blob([appState.addressList.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `airdrop_addresses_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download addresses");
  }
}

// Initialize the application
initEventListeners();
