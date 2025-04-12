// 📦 address_module.js
import { fetchData } from "./proxy_helper.js";
import { populateAddressList, clearAddressListUI } from "./ui_module.js";

let addressList = [];
let selectedMode = "";
const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";

export function getAddressList() {
  return addressList;
}

export function getSelectedMode() {
  return selectedMode;
}

export function handleModeChange() {
  const mode = document.getElementById("mode").value;
  if (addressList.length > 0) {
    const confirmClear = confirm("Switching modes will clear your current address list. Proceed?");
    if (!confirmClear) {
      document.getElementById("mode").value = selectedMode;
      return;
    }
    addressList = [];
    clearAddressListUI();
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

export async function handleProceed() {
  clearAddressListUI();

  if (selectedMode === "paste") {
    const raw = document.getElementById("paste-input").value.trim();
    const lines = raw.split(/\s+/).filter(line => ethers.utils.isAddress(line));
    addressList = lines;
    populateAddressList(addressList);
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
      populateAddressList(addressList);
    } catch (err) {
      console.error("❌ PolygonScan fetch failed:", err);
      alert("⚠️ Failed to fetch PolygonScan data. Try another mode.");
    }
  }

  if (selectedMode === "random") {
    const count = parseInt(document.getElementById("random-count").value) || 100;
    try {
      const res = await fetch(`${PROXY_URL}/abis/active_polygon_wallets.json`);
      const all = await res.json();
      const shuffled = all.sort(() => 0.5 - Math.random());
      addressList = shuffled.slice(0, count);
      populateAddressList(addressList);
    } catch (err) {
      console.error("❌ Failed to load random wallets:", err);
      alert("⚠️ Failed to load random wallets. Try another mode.");
    }
  }
}

export function downloadAddresses() {
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
