// js/modules/wallet_module.js

import { 
  LQX_ADDRESS, 
  LQX_ABI, 
  LQX_REQUIRED, 
  POLYGON_MAINNET_CHAIN_ID,
  POLYGON_TESTNET_CHAIN_ID,
  POLYGON_RPC_URL
} from './config.js';

export let provider, signer, userAddress, lqxContract;

export async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    await checkAndSwitchToPolygon(); // Εναλλαγή δικτύου εάν δεν είναι Polygon
    await provider.send("eth_requestAccounts", []);
    
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("wallet-info").innerText = `🧾 Connected: ${userAddress}`;

    // Έλεγχος αν είναι σε Polygon Mainnet ή Mumbai
    const network = await provider.getNetwork();
    if (![137, 80001].includes(network.chainId)) {
      alert("⚠️ Please switch to Polygon Mainnet or Mumbai Testnet!");
      return;
    }

    lqxContract = new ethers.Contract(LQX_ADDRESS, LQX_ABI, provider);
    const balance = await lqxContract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(balance, 18);

    document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${formatted}`;

    if (balance.lt(LQX_REQUIRED)) {
      document.getElementById("requirement-warning").innerText =
        "⚠️ You must hold at least 1000 LQX tokens to use this tool.";
      disableToolUI();
    } else {
      document.getElementById("requirement-warning").innerText = "";
      enableToolUI();
    }

  } catch (err) {
    console.error("Wallet connection error:", err);
    alert("❌ Failed to connect wallet.");
  }
}

export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  document.getElementById("wallet-info").innerText = "";
  document.getElementById("lqx-info").innerText = "";
  document.getElementById("requirement-warning").innerText = "🔌 Wallet disconnected.";
  disableToolUI();
}

function disableToolUI() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

function enableToolUI() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}

// ✅ Switch to Polygon if necessary
async function checkAndSwitchToPolygon() {
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

  if (currentChainId !== POLYGON_MAINNET_CHAIN_ID && currentChainId !== POLYGON_TESTNET_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: POLYGON_MAINNET_CHAIN_ID,
          chainName: 'Polygon Mainnet',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
          },
          rpcUrls: [POLYGON_RPC_URL],
          blockExplorerUrls: ['https://polygonscan.com/']
        }]
      });
    } catch (error) {
      console.error("❌ Failed to switch to Polygon:", error);
      throw new Error("Please switch to Polygon manually in MetaMask.");
    }
  }
}
