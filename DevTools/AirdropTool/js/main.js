// js/main.js

import {
  connectWallet,
  disconnectWallet,
  getUserAddress,
  checkLQXBalance
} from "./modules/wallet_module.js";

import {
  extractAddressesFromScan,
  getPastedAddresses,
  getRandomWallets
} from "./modules/address_module.js";

import {
  updateWalletInfo,
  updateLQXInfo,
  showWarning,
  enableUIInputs,
  disableUIInputs,
  clearAddressListUI,
  showAddressList,
  toggleModeSections
} from "./modules/ui_module.js";

let selectedMode = "";
let addressList = [];

document.getElementById("connect-btn").addEventListener("click", async () => {
  const address = await connectWallet();
  if (!address) return;

  updateWalletInfo(address);
  const balance = await checkLQXBalance(address);

  if (balance.lt) {
    showWarning("⚠️ You must hold at least 1000 LQX tokens to use this tool.");
    disableUIInputs();
  } else {
    updateLQXInfo(balance.formatted);
    showWarning("");
    enableUIInputs();
  }
});

document.getElementById("disconnect-btn").addEventListener("click", () => {
  disconnectWallet();
  updateWalletInfo("");
  updateLQXInfo("");
  showWarning("🔌 Wallet disconnected.");
  disableUIInputs();
  clearAddressListUI();
  addressList = [];
});

document.getElementById("mode").addEventListener("change", () => {
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
  toggleModeSections(mode);
});

document.getElementById("proceed-btn").addEventListener("click", async () => {
  clearAddressListUI();

  if (selectedMode === "paste") {
    const addresses = getPastedAddresses();
    addressList = addresses;
    showAddressList(addressList);
  }

  if (selectedMode === "create") {
    const scanLink = document.getElementById("scan-link").value.trim();
    const max = parseInt(document.getElementById("max-addresses").value) || 100;
    try {
      addressList = await extractAddressesFromScan(scanLink, max);
      showAddressList(addressList);
    } catch (err) {
      console.error("PolygonScan fetch failed:", err);
      alert("⚠️ Failed to fetch addresses. Try another mode.");
    }
  }

  if (selectedMode === "random") {
    const count = parseInt(document.getElementById("random-count").value) || 100;
    try {
      addressList = await getRandomWallets(count);
      showAddressList(addressList);
    } catch (err) {
      console.error("Failed to load random wallets:", err);
      alert("⚠️ Failed to load random wallets. Try another mode.");
    }
  }
});

document.getElementById("download-btn").addEventListener("click", () => {
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
});

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "https://liquidityx.io";
});
