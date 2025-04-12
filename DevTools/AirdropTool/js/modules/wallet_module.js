import { LQX_ADDRESS, LQX_ABI, LQX_REQUIRED } from './config.js';

let provider, signer, userAddress, lqxContract;

export async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("wallet-info").innerText = `🧾 Connected: ${userAddress}`;

    lqxContract = new ethers.Contract(LQX_ADDRESS, LQX_ABI, provider);
    const balance = await lqxContract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(balance, 18);

    document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${formatted}`;

    if (balance.lt(ethers.utils.parseUnits(LQX_REQUIRED, 18))) {
      document.getElementById("requirement-warning").innerText =
        "⚠️ You must hold at least 1000 LQX tokens to use this tool.";
      disableUI();
    } else {
      document.getElementById("requirement-warning").innerText = "";
      enableUI();
    }
  } catch (err) {
    console.error("Wallet connection error:", err);
    alert("Failed to connect wallet.");
  }
}

export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  document.getElementById("wallet-info").innerText = "";
  document.getElementById("lqx-info").innerText = "";
  document.getElementById("requirement-warning").innerText = "🔌 Wallet disconnected.";
  disableUI();
}

export function getUserAddress() {
  return userAddress;
}

function disableUI() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

function enableUI() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}
