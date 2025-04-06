// app.js

const { ethers } = window;
const Web3Modal = window.Web3Modal.default || window.Web3Modal;  // ✅ Έλεγχος και για .default
const WalletConnectProvider = window.WalletConnectProvider.default || window.WalletConnectProvider;  // ✅ Έλεγχος και για .default

console.log("🚀 App.js Loaded - Web3Modal:", Web3Modal);
console.log("🟢 WalletConnectProvider:", WalletConnectProvider);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        137: 'https://polygon-rpc.com',
      },
    },
  },
};

console.log("📦 Provider Options Set:", providerOptions);

try {
    const web3Modal = new Web3Modal({  // ✅ Σιγουρευόμαστε ότι καλείται σωστά
      cacheProvider: true,
      providerOptions,
      disableInjectedProvider: false,
    });
    console.log("🌟 Web3Modal Instance Created:", web3Modal);
} catch (error) {
    console.error("❌ Error Creating Web3Modal Instance:", error);
}

let provider;
let signer;
let connectedAddress = '';

async function loadABI(abiFileName) {
  console.log(`📂 Loading ABI File: ${abiFileName}`);
  const response = await fetch(`abis/${abiFileName}`);
  if (!response.ok) {
    console.error(`❌ Failed to load ABI: ${abiFileName}`);
    throw new Error(`Failed to load ABI: ${abiFileName}`);
  }
  console.log(`✅ Successfully loaded ABI: ${abiFileName}`);
  return await response.json();
}

async function connectWallet() {
  try {
    console.log("🔌 Attempting to connect wallet...");
    
    provider = await web3Modal.connect();
    console.log("✅ Wallet Connected Successfully - Provider:", provider);
    
    const web3Provider = new ethers.providers.Web3Provider(provider);
    signer = web3Provider.getSigner();
    connectedAddress = await signer.getAddress();
    
    console.log("🎉 Connected Address:", connectedAddress);
    
    document.getElementById('wallet-address').innerText = `Connected: ${connectedAddress}`;
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
  console.log("✅ Wallet Disconnected Successfully");
}

async function getAPR() {
  try {
    console.log("📊 Fetching APR...");
    const web3Provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
    const StakingContractABI = await loadABI('StakingContract.json');
    const stakingContract = new ethers.Contract('0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9', StakingContractABI, web3Provider);
    const apr = await stakingContract.getAPR();
    document.getElementById('apr').innerText = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;
    console.log("✅ APR Fetched Successfully:", apr.toString());
  } catch (error) {
    console.error("❌ Error Fetching APR:", error);
  }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
document.getElementById('refresh-apr-btn').addEventListener('click', getAPR);

if (provider) {
  getAPR();
}
