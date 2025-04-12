import { PROXY_URL } from './config.js';
import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/+esm';

// Address list state management
const addressState = {
  list: [],
  mode: "",
  lastFetched: null
};

// DOM element cache
const domElements = {
  addressList: document.getElementById("address-list"),
  addressCount: document.getElementById("address-count"),
  pasteInput: document.getElementById("paste-input"),
  scanLink: document.getElementById("scan-link"),
  maxAddresses: document.getElementById("max-addresses"),
  randomCount: document.getElementById("random-count")
};

export function setMode(mode) {
  addressState.mode = mode;
}

export function getAddressList() {
  return [...addressState.list]; // Return copy to prevent direct mutation
}

export function clearAddressList() {
  addressState.list = [];
  domElements.addressList.innerHTML = "";
  domElements.addressCount.innerText = "";
}

export async function handleProceed() {
  try {
    clearAddressList();
    
    switch (addressState.mode) {
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
    
    if (addressState.list.length > 0) {
      populateAddressList();
    }
  } catch (error) {
    console.error("Address processing error:", error);
    showError(error.message);
  }
}

async function handlePasteMode() {
  const raw = domElements.pasteInput.value.trim();
  if (!raw) throw new Error("No addresses pasted");
  
  addressState.list = raw.split(/\s+/)
    .filter(line => ethers.utils.isAddress(line))
    .map(addr => ethers.utils.getAddress(addr)); // Normalize addresses
}

async function handleCreateMode() {
  const scanLink = domElements.scanLink.value.trim();
  const max = parseInt(domElements.maxAddresses.value) || 100;
  
  const tokenAddress = extractTokenAddress(scanLink);
  addressState.list = await fetchTokenHolders(tokenAddress, max);
}

async function handleRandomMode() {
  const count = parseInt(domElements.randomCount.value) || 100;
  addressState.list = await fetchRandomWallets(count);
}

function populateAddressList() {
  domElements.addressList.innerHTML = addressState.list
    .map(addr => `<li class="address-item">${addr}</li>`)
    .join("");
  
  domElements.addressCount.innerHTML = `
    <span class="success">✅ ${addressState.list.length} addresses loaded</span>
    ${addressState.lastFetched ? `<br><small>Last fetched: ${new Date(addressState.lastFetched).toLocaleTimeString()}</small>` : ''}
  `;
}

// Helper functions
function extractTokenAddress(scanLink) {
  const regex = /token\/(0x[a-fA-F0-9]{40})/i;
  const match = scanLink.match(regex);
  if (!match) throw new Error("Invalid PolygonScan token link format");
  return match[1];
}

async function fetchTokenHolders(tokenAddress, limit) {
  try {
    const response = await fetch(`${PROXY_URL}/api/polygon?token=${tokenAddress}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`API responded with ${response.status}`);
    
    const data = await response.json();
    addressState.lastFetched = Date.now();
    
    // Handle different API response formats
    if (data.success && Array.isArray(data.addresses)) {
      return data.addresses.slice(0, limit);
    }
    if (data.status === "1" && data.result) {
      return [...new Set(data.result.map(tx => ethers.utils.getAddress(tx.to)))].slice(0, limit);
    }
    
    throw new Error("Unexpected API response format");
  } catch (error) {
    console.error("Failed to fetch token holders:", error);
    throw new Error("Could not fetch token holders. Please try another mode.");
  }
}

async function fetchRandomWallets(limit) {
  try {
    const response = await fetch(`${PROXY_URL}/abis/active_polygon_wallets.json`);
    if (!response.ok) throw new Error(`Failed to fetch wallets (${response.status})`);
    
    const allWallets = await response.json();
    addressState.lastFetched = Date.now();
    
    return shuffleArray(allWallets).slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch random wallets:", error);
    throw new Error("Could not load random wallets. Please try another mode.");
  }
}

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function showError(message) {
  domElements.addressCount.innerHTML = `<span class="error">❌ ${message}</span>`;
}
