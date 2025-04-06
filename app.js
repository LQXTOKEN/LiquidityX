// app.js

const { ethers } = window;
const Web3Modal = window.Web3Modal.default || window.Web3Modal;

console.log("🚀 App.js Loaded");

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

async function getAPR() {
  try {
    console.log("📊 Fetching APR...");
    const web3Provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const response = await fetch('abis/StakingContract.json');
    const StakingContractABI = await response.json();

    const stakingContract = new ethers.Contract(
      '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9',
      StakingContractABI,
      web3Provider
    );

    const apr = await stakingContract.getAPR();
    document.getElementById('apr').innerText = `APR: ${ethers.formatUnits(apr, 2)}%`;
    console.log("✅ APR Fetched Successfully:", apr.toString());
  } catch (error) {
    console.error("❌ Error Fetching APR:", error);
  }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
document.getElementById('refresh-apr-btn').addEventListener('click', getAPR);

if (localStorage.getItem('connectedAddress')) {
  document.getElementById('wallet-address').innerText = `Connected: ${localStorage.getItem('connectedAddress')}`;
}
