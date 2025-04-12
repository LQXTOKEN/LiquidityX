import { connectWallet, disconnectWallet } from './modules/wallet_module.js';
import { fetchData } from './modules/fetch_module.js';
import { populateAddressList, clearUI, toggleInputFields, enableInputs, disableInputs } from './modules/ui_module.js';
import { LQX_REQUIRED } from './modules/config.js';

let selectedMode = "";
let addressList = [];

document.getElementById("connect-btn").addEventListener("click", async () => {
  const result = await connectWallet();
  if (result && result.hasEnoughLQX) {
    enableInputs();
  } else {
    disableInputs();
  }
});

document.getElementById("disconnect-btn").addEventListener("click", () => {
  disconnectWallet();
  disableInputs();
  clearUI();
});

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
    clearUI();
  }

  selectedMode = mode;
  toggleInputFields(mode);
}

async function handleProceed() {
  clearUI();

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
      alert("⚠️ Failed to fetch PolygonScan data. Please try another mode.");
    }
  }

  if (selectedMode === "random") {
    const count = parseInt(document.getElementById("random-count").value) || 100;
    try {
      const res = await fetch('https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json');
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
