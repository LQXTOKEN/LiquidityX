const { ethers } = window;

// State management
let provider;
let signer;
let connectedAddress = '';

// Check if MetaMask is installed
function hasInjectedProvider() {
  return typeof window.ethereum !== 'undefined';
}

async function connectWallet() {
  if (!hasInjectedProvider()) {
    alert('Please install MetaMask or another Web3 wallet!');
    return;
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    connectedAddress = accounts[0];
    
    // Initialize ethers provider
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    // Update UI
    document.getElementById('wallet-address').textContent = 
      `Connected: ${connectedAddress.substring(0, 6)}...${connectedAddress.slice(-4)}`;
    
    // Save connection state
    localStorage.setItem('walletConnected', 'true');
    
    // Set up event listeners
    window.ethereum.on('accountsChanged', (newAccounts) => {
      connectedAddress = newAccounts[0] || '';
      updateConnectionStatus();
    });
    
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

  } catch (error) {
    console.error("Connection error:", error);
    alert(`Connection failed: ${error.message}`);
  }
}

function disconnectWallet() {
  if (window.ethereum && window.ethereum.removeListener) {
    window.ethereum.removeListener('accountsChanged');
    window.ethereum.removeListener('chainChanged');
  }
  
  provider = null;
  signer = null;
  connectedAddress = '';
  updateConnectionStatus();
  
  localStorage.removeItem('walletConnected');
}

function updateConnectionStatus() {
  const el = document.getElementById('wallet-address');
  el.textContent = connectedAddress 
    ? `Connected: ${connectedAddress.substring(0, 6)}...${connectedAddress.slice(-4)}`
    : 'Not connected';
}

// APR Function (unchanged from your original)
async function getAPR() {
  try {
    const rpcProvider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
    const response = await fetch('abis/StakingContract.json');
    const StakingContractABI = await response.json();
    
    const stakingContract = new ethers.Contract(
      '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9',
      StakingContractABI,
      rpcProvider
    );

    const apr = await stakingContract.getAPR();
    document.getElementById('apr').innerText = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;
    console.log("✅ APR Fetched Successfully:", apr.toString());
  } catch (error) {
    console.error("APR error:", error);
  }
}

// Event Listeners
document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
document.getElementById('refresh-apr-btn').addEventListener('click', getAPR);

// Auto-connect if previously connected
if (localStorage.getItem('walletConnected') === 'true' && hasInjectedProvider()) {
  connectWallet();
}
