import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/+esm";
import { LQX_ADDRESS, LQX_ABI } from './config.js';

let provider, signer, userAddress;

export async function connectWallet() {
  try {
    // 1. Έλεγχος αν το MetaMask είναι εγκατεστημένο
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    // 2. Ζητάμε πρόσβαση στον λογαριασμό
    const accounts = await window.ethereum.request({ 
      method: "eth_requestAccounts" 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error("User denied account access");
    }

    // 3. Αρχικοποίηση Provider & Signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = accounts[0];

    // 4. Έλεγχος δικτύου (Polygon Mainnet)
    const network = await provider.getNetwork();
    if (network.chainId !== 137) { // 137 = Polygon Mainnet
      await switchToPolygon();
    }

    // 5. Έλεγχος υπολοίπου LQX
    const lqxContract = new ethers.Contract(LQX_ADDRESS, LQX_ABI, provider);
    const balance = await lqxContract.balanceOf(userAddress);
    const hasEnoughLQX = balance.gte(ethers.utils.parseUnits("1000", 18));

    return {
      success: true,
      address: userAddress,
      hasEnoughLQX,
      balance: ethers.utils.formatUnits(balance, 18)
    };

  } catch (error) {
    console.error("Connection error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function switchToPolygon() {
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0x89", // 137 in hex (Polygon)
        chainName: "Polygon Mainnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18
        },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com/"]
      }]
    });
  } catch (switchError) {
    throw new Error("Please switch to Polygon manually in MetaMask");
  }
}
