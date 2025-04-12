import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { LQX_ADDRESS, LQX_ABI, LQX_REQUIRED } from "./config.js";

let provider = null;
let signer = null;
let userAddress = null;
let lqxContract = null;

export async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask to continue.");
    return false;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
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
      return false;
    }

    document.getElementById("requirement-warning").innerText = "";
    return true;
  } catch (error) {
    console.error("🔌 Wallet connection error:", error);
    alert("Failed to connect wallet.");
    return false;
  }
}

export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  lqxContract = null;

  document.getElementById("wallet-info").innerText = "";
  document.getElementById("lqx-info").innerText = "";
  document.getElementById("requirement-warning").innerText = "🔌 Wallet disconnected.";
}

export function getUserAddress() {
  return userAddress;
}
