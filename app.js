// Contract Addresses (Προσαρμόστε με τα δικά σας)
const CONTRACT_ADDRESSES = {
  osmosis: {
    lqxToken: "0x...",
    lpStaking: "0x..."
  },
  polygon: {
    lqxToken: "0x9E27F48659B1005b1aBc0F58465137E531430d4b",
    lpStaking: "0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3"
  }
};

// Αρχικοποίηση Μεταβλητών
let currentWallet = null;
let currentNetwork = null;
let userAddress = null;

// DOM Elements
const walletStatus = document.getElementById('walletStatus');
const walletSelector = document.getElementById('walletSelector');
const networkSelector = document.getElementById('networkSelector');
const connectionDetails = document.getElementById('connectionDetails');

// Wallet Buttons
document.getElementById('metamaskBtn').addEventListener('click', () => connectWallet('metamask'));
document.getElementById('trustBtn').addEventListener('click', () => connectWallet('trust'));
document.getElementById('keplrBtn').addEventListener('click', () => connectWallet('keplr'));
document.getElementById('leapBtn').addEventListener('click', () => connectWallet('leap'));

// Network Buttons
document.getElementById('osmosisBtn').addEventListener('click', () => selectNetwork('osmosis'));
document.getElementById('polygonBtn').addEventListener('click', () => selectNetwork('polygon'));

// Σύνδεση Wallet
async function connectWallet(walletType) {
  try {
    // Reset προηγούμενης σύνδεσης
    resetConnection();

    // EVM Wallets (MetaMask/Trust)
    if (walletType === 'metamask' || walletType === 'trust') {
      if (!window.ethereum) throw new Error(`${walletType} not detected!`);
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      currentWallet = walletType;
      
      // EVM wallets auto-connect to their current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      currentNetwork = chainId === '0x89' ? 'polygon' : 'other-evm';
      
      updateUI();
      showConnectionDetails();
    }
    // Cosmos Wallets (Keplr/Leap)
    else if (walletType === 'keplr' || walletType === 'leap') {
      if (!window[walletType]) throw new Error(`${walletType} not detected!`);
      
      currentWallet = walletType;
      showNetworkSelector();
    }
    
    walletStatus.textContent = `Connected: ${walletType}`;
  } catch (error) {
    console.error("Connection error:", error);
    walletStatus.textContent = `Error: ${error.message}`;
  }
}

// Επιλογή Δικτύου
async function selectNetwork(network) {
  try {
    if (currentWallet === 'keplr' || currentWallet === 'leap') {
      // Cosmos network selection
      if (network === 'polygon') {
        throw new Error("Keplr/Leap don't support Polygon directly. Use MetaMask for Polygon.");
      }
      
      await window[currentWallet].enable('osmosis-1');
      const offlineSigner = window[currentWallet].getOfflineSigner('osmosis-1');
      const accounts = await offlineSigner.getAccounts();
      userAddress = accounts[0].address;
      currentNetwork = 'osmosis';
    }
    
    updateUI();
    showConnectionDetails();
  } catch (error) {
    console.error("Network selection error:", error);
    walletStatus.textContent = `Network Error: ${error.message}`;
  }
}

// UI Updates
function updateUI() {
  document.getElementById('connectedWallet').textContent = currentWallet;
  document.getElementById('connectedNetwork').textContent = currentNetwork;
  document.getElementById('connectedAddress').textContent = 
    userAddress ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}` : '-';
}

function showNetworkSelector() {
  walletSelector.classList.add('hidden');
  networkSelector.classList.remove('hidden');
}

function showConnectionDetails() {
  networkSelector.classList.add('hidden');
  connectionDetails.classList.remove('hidden');
}

function resetConnection() {
  currentWallet = null;
  currentNetwork = null;
  userAddress = null;
  walletSelector.classList.remove('hidden');
  networkSelector.classList.add('hidden');
  connectionDetails.classList.add('hidden');
}

// Έλεγχος για αυτόματη επανασύνδεση
window.addEventListener('load', async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    await connectWallet(window.ethereum.isMetaMask ? 'metamask' : 'trust');
  }
});
