import { PROXY_URL } from './config.js';
import { getUserAddress } from './wallet_module.js';

let addressList = [];
let selectedMode = "";

export function setMode(mode) {
  selectedMode = mode;
}

export function getAddressList() {
  return addressList;
}

export function clearAddressList() {
  addressList = [];
  document.getElementById("address-list").innerHTML = "";
  document.getElementById("address-count").innerText = "";
}

export async function handleProceed() {
  clearAddressList();

  if (selectedMode === "paste") {
    const raw = document.getElementById("paste-input").value.trim();
    const lines = raw.split(/\s+/).filter(line => ethers.utils.isAddress(line));
    addressList = lines;
    populateAddressList();
  }

  if (selectedMode === "create") {
    const scanLink = document.getElementById("scan-link").value.trim();
    const max = parseInt(document.getElementById("max-addresses").value) || 100;

    const regex = /token\/(0x[a-fA-F0-9]{40})/;
    const match = scanLink.match(regex);
    if (!match) {
      alert("❌ Invalid PolygonScan token link.");
      return;
    }

    const tokenAddress = match[1];
    
    try {
      const data = await fetchData(tokenAddress);
      addressList = data.slice(0, max);
      populateAddressList();
    } catch (err) {
      console.error("❌ PolygonScan fetch failed:", err);
      alert("⚠️ Failed to fetch PolygonScan data. Please try 'Paste' or 'Random' mode.");
    }
  }

  if (selectedMode === "random") {
    const count = parseInt(document.getElementById("random-count").value) || 100;
    try {
      const res = await fetch(`${PROXY_URL}/abis/active_polygon_wallets.json`);
      const all = await res.json();
      const shuffled = all.sort(() => 0.5 - Math.random());
      addressList = shuffled.slice(0, count);
      populateAddressList();
    } catch (err) {
      console.error("❌ Failed to load random wallets:", err);
      alert("⚠️ Failed to load random wallets. Try another mode.");
    }
  }
}

function populateAddressList() {
  const ul = document.getElementById("address-list");
  const countEl = document.getElementById("address-count");

  ul.innerHTML = "";
  addressList.forEach(addr => {
    const li = document.createElement("li");
    li.textContent = addr;
    ul.appendChild(li);
  });

  countEl.innerText = `✅ ${addressList.length} addresses loaded.`;
}

async function fetchData(tokenAddress) {
  const apiURL = `${PROXY_URL}/api/polygon?token=${tokenAddress}`;
  
  try {
    const res = await fetch(apiURL, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.addresses)) {
      return data.addresses;
    }

    if (data.status === "1" && data.result) {
      return [...new Set(data.result.map(tx => tx.to.toLowerCase()))];
    }

    throw new Error("Invalid data format");
  } catch (error) {
    console.error("Fetch failed, fallback to empty list");
    return [];
  }
}
