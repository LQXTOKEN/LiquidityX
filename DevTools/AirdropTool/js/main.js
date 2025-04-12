// js/main.js

import { CONFIG } from './config.js';
import { getERC20Balance } from './erc20_module.js';
import { getProvider, getUserAddress } from './wallet_module.js';
import { showSectionByMode, displayResults, downloadAddressesAsTxt } from './ui_module.js';

export async function fetchAddresses(mode) {
  const provider = getProvider();
  const userAddress = getUserAddress();
  if (!provider || !userAddress) return [];

  if (mode === "paste") {
    const url = document.getElementById("polygonScanInput").value.trim();
    const tokenAddress = extractTokenAddress(url);
    if (!tokenAddress) {
      alert("Invalid URL format.");
      return [];
    }

    try {
      const response = await fetch(`${CONFIG.PROXY_API_URL}?contract=${tokenAddress}`);
      const data = await response.json();
      return data.addresses || [];
    } catch (err) {
      console.error("Proxy fetch failed:", err);
      return [];
    }

  } else if (mode === "create") {
    const contractInput = document.getElementById("contractInput").value.trim();
    if (!ethers.utils.isAddress(contractInput)) {
      alert("Invalid contract address.");
      return [];
    }

    try {
      const response = await fetch(`${CONFIG.PROXY_API_URL}?contract=${contractInput}`);
      const data = await response.json();
      return data.addresses || [];
    } catch (err) {
      console.error("Proxy fetch failed:", err);
      return [];
    }

  } else if (mode === "random") {
    const max = parseInt(document.getElementById("maxAddresses").value || "100");
    try {
      const response = await fetch(CONFIG.ACTIVE_WALLETS_JSON);
      const data = await response.json();
      return data.slice(0, Math.min(max, 1000));
    } catch (err) {
      console.error("Failed to load random wallets JSON:", err);
      return [];
    }
  }

  return [];
}

function extractTokenAddress(url) {
  const regex = /address\\/(0x[a-fA-F0-9]{40})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function initModeSelector() {
  const modeSelect = document.getElementById("modeSelect");
  modeSelect.addEventListener("change", (e) => {
    showSectionByMode(e.target.value);
  });
}
