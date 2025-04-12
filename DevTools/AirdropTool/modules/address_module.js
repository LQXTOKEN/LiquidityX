// js/modules/address_module.js

import { fetchDataFromPolygonScan, fetchRandomAddresses } from './utils_module.js';

export let addressList = [];
let selectedMode = "";

export function getSelectedMode() {
  return selectedMode;
}

export function setupAddressModuleEvents() {
  document.getElementById("mode").addEventListener("change", handleModeChange);
  document.getElementById("proceed-btn").addEventListener("click", handleProceed);
  document.getElementById("download-btn").addEventListener("click", downloadAddresses);
}

function handleModeChange() {
  const mode = document.getElementById("mode").value;
  if (addressList.length > 0) {
    const confirmClear = confirm("Switching modes will clear your current address list. Proceed?");
    if (!confirmClear) {
      document.getElementById("mode").value = selectedMode;
      return;
    }
    addressList = [];
    clearUI();
  }

  selectedMode = mode;
  toggleInputFields(mode);
}

function toggleInputFields(mode) {
  document.getElementById("paste-box").style.display = mode === "paste" ? "block" : "none";
  document.getElementById("scan-box").style.display = mode === "create" ? "block" : "none";
  document.getElementById("random-box").style.display = mode === "random" ? "block" : "none";
  document.getElementById("download-btn").style.display = (mode === "random" || mode === "create") ? "inline-block" : "none";
}

function clearUI() {
  document.getElementById("address-list").innerHTML = "";
  document.getElementById("address-count").innerText = "";
}

async function handleProceed() {
  clearUI();

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
      const data = await fetchDataFromPolygonScan(tokenAddress);
      addressList = data.slice(0, max);
      populateAddressList();
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      alert("⚠️ Failed to fetch data. Try 'Paste' or 'Random' mode.");
    }
  }

  if (selectedMode === "random") {
    const count = parseInt(document.getElementById("random-count").value) || 100;
    try {
      const data = await fetchRandomAddresses(count);
      addressList = data;
      populateAddressList();
    } catch (err) {
      console.error("❌ Failed to load random wallets:", err);
      alert("⚠️ Failed to load random wallets.");
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

function downloadAddresses() {
  if (addressList.length === 0) {
    alert("No addresses to download.");
    return;
  }

  const blob = new Blob([addressList.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "airdrop_addresses.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
