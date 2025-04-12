// 📁 main.js
import { connectWallet, disconnectWallet } from "./modules/wallet_module.js";
import { populateAddressList, clearAddressListUI, toggleInputFields, showWarning } from "./modules/ui_module.js";
import { fetchAddressesFromToken } from "./modules/proxy_handler.js";
import { fetchRandomAddresses } from "./modules/random_module.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

let selectedMode = "";
let addressList = [];

// 🎯 Event Listeners
document.getElementById("connect-btn").addEventListener("click", connectWallet);
document.getElementById("disconnect-btn").addEventListener("click", disconnectWallet);
document.getElementById("mode").addEventListener("change", handleModeChange);
document.getElementById("proceed-btn").addEventListener("click", handleProceed);
document.getElementById("download-btn").addEventListener("click", downloadAddresses);
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "https://liquidityx.io";
});

function handleModeChange() {
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

async function handleProceed() {
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
      const data = await fetchAddressesFromToken(tokenAddress);
      addressList = data.slice(0, max);
      populateAddressList(addressList);
    } catch (err) {
      console.error("❌ PolygonScan fetch failed:", err);
      showWarning("⚠️ Failed to fetch from PolygonScan. Try another mode.");
    }
  }

  if (selectedMode === "random") {
    const count = parseInt(document.getElementById("random-count").value) || 100;
    try {
      const data = await fetchRandomAddresses(count);
      addressList = data;
      populateAddressList(addressList);
    } catch (err) {
      console.error("❌ Failed to load random wallets:", err);
      showWarning("⚠️ Failed to load random wallets. Try another mode.");
    }
  }
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
