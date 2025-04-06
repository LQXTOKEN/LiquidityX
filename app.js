// app.js

const { ethers } = window;
const Web3Modal = window.Web3Modal.default || window.Web3Modal;

console.log("🚀 App.js Loaded");

// Έλεγχος αν η βιβλιοθήκη φορτώθηκε σωστά
console.log("📦 Ethers.js Version:", ethers.version);

let provider;
let signer;
let connectedAddress = '';

const providerOptions = {
  injected: {
    package: null,
  }
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

async function connectWallet() {
  try {
    console.log("🔌 Attempting to connect wallet...");
    
    const instance = await web3Modal.connect();

    // Έλεγχος αν η κλάση BrowserProvider υπάρχει
    if (!ethers.BrowserProvider) {
      console.error("❌ BrowserProvider is not available in ethers.js. Check your ethers.js version.");
      return;
    }

    provider = new ethers.BrowserProvider(instance);
    signer = await provider.getSigner();
    connectedAddress = await signer.getAddress();
    
    console.log("✅ Wallet Connected Successfully:", connectedAddress);
    document.getElementById('wallet-address').innerText = `Connected: ${connectedAddress}`;
    
    localStorage.setItem('connectedAddress', connectedAddress);
  } catch (error) {
    console.error("❌ Error Connecting Wallet:", error);
  }
}

async function disconnectWallet() {
  console.log("🔌 Disconnecting Wallet...");
  web3Modal.clearCachedProvider();
  provider = null;
  signer = null;
  connectedAddress = '';
  document.getElementById('wallet-address').innerText = 'Disconnected';
  localStorage.removeItem('connectedAddress');
  console.log("✅ Wallet Disconnected Successfully");
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);

if (localStorage.getItem('connectedAddress')) {
  document.getElementById('wallet-address').innerText = `Connected: ${localStorage.getItem('connectedAddress')}`;
}
