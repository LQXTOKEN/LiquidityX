const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';

const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
const LQX_TOKEN = '0x9e27f48659b1005b1abc0f58465137e531430d4b';
const LP_TOKEN = '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E';

// Detect wallet provider (MetaMask, Trust Wallet, etc.)
function detectProvider() {
    if (window.ethereum) {
        if (window.ethereum.isTrust) {
            console.log("📱 Trust Wallet detected");
            return window.ethereum;
        } else if (window.ethereum.isMetaMask) {
            console.log("🦊 MetaMask detected");
            return window.ethereum;
        } else {
            console.log("🔍 Ethereum provider detected (other than MetaMask/Trust Wallet)");
            return window.ethereum;
        }
    } else if (window.BinanceChain) {
        console.log("🌉 Binance Chain Wallet detected");
        return window.BinanceChain;
    } else {
        alert("No compatible wallet detected! Please install MetaMask, Trust Wallet, or Binance Chain Wallet.");
        return null;
    }
}

async function connectWallet() {
    const detectedProvider = detectProvider();

    if (!detectedProvider) {
        return;
    }

    try {
        console.log("🔌 Attempting to connect wallet...");

        provider = new ethers.providers.Web3Provider(detectedProvider, "any");
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        connectedAddress = await signer.getAddress();

        console.log("✅ Wallet Connected Successfully:", connectedAddress);
        document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;
    } catch (error) {
        console.error("❌ Connection error:", error);
    }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
