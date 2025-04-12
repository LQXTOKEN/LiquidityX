import { ethers } from "ethers";
import {
  LQX_ADDRESS,
  LQX_ABI,
  LQX_REQUIRED
} from "./config.js";

let provider, signer, userAddress, lqxContract;

// 🔗 Σύνδεση Πορτοφολιού & Έλεγχος LQX Balance
export async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await checkAndSwitchToPolygon();
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("wallet-info").innerText = `🧾 Connected: ${userAddress}`;

    lqxContract = new ethers.Contract(LQX_ADDRESS, LQX_ABI, provider);
    const balance = await lqxContract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(balance, 18);
    document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${formatted}`;

    if (balance.lt(LQX_REQUIRED)) {
      document.getElementById("requirement-warning").innerText =
        "⚠️ You must hold at least 1000 LQX tokens to use this tool.";
      disableUI();
    } else {
      document.getElementById("requirement-warning").innerText = "";
      enableUI();
    }

  } catch (err) {
    console.error("Wallet connection error:", err);
    alert("❌ Failed to connect wallet.");
  }
}

// 🔌 Αποσύνδεση Πορτοφολιού
export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  document.getElementById("wallet-info").innerText = "";
  document.getElementById("lqx-info").innerText = "";
  document.getElementById("requirement-warning").innerText = "🔌 Wallet disconnected.";
  disableUI();
}

// 🧠 Επιστροφή Διεύθυνσης Χρήστη
export function getUserAddress() {
  return userAddress;
}

// 🔄 Αυτόματος Έλεγχος & Εναλλαγή στο Polygon
async function checkAndSwitchToPolygon() {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  const POLYGON_MAINNET_CHAIN_ID = "0x89"; // 137
  const POLYGON_RPC = "https://polygon-rpc.com/";

  if (chainId !== POLYGON_MAINNET_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: POLYGON_MAINNET_CHAIN_ID,
          chainName: "Polygon Mainnet",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18
          },
          rpcUrls: [POLYGON_RPC],
          blockExplorerUrls: ["https://polygonscan.com"]
        }]
      });
    } catch (error) {
      console.error("Failed to switch to Polygon:", error);
      throw new Error("Please switch to the Polygon network manually.");
    }
  }
}

// 🧩 Helpers για UI
function enableUI() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}

function disableUI() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}
