'use strict';

// Configuration
const CONFIG = {
  CONTRACTS: {
    STAKING: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
    RPC_URLS: [
      'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY',
      'https://polygon-rpc.com'
    ]
  },
  MAX_GAS: '500000', // Prevent gas wars
  GAS_PRICE_BUFFER: 1.2 // 20% buffer
};

// State
let state = {
  user: null,
  provider: null,
  contracts: {},
  walletType: null
};

// DOM Elements
const elements = {
  connectBtn: document.getElementById('connectBtn'),
  walletModal: document.getElementById('walletModal'),
  txModal: document.getElementById('txModal'),
  notifications: document.getElementById('notifications')
};

// Initialize
async function init() {
  // Remove debug logs in production
  if (window.location.hostname !== 'localhost') {
    console.log = () => {};
  }

  // Event listeners
  elements.connectBtn.addEventListener('click', toggleWalletModal);
  
  // Auto-connect if previously connected
  const savedWallet = localStorage.getItem('connectedWallet');
  if (savedWallet) connectWallet(savedWallet);
}

// Wallet Connection
async function connectWallet(walletType) {
  try {
    // MetaMask
    if (walletType === 'metamask') {
      if (!window.ethereum) throw new Error('MetaMask not installed');
      
      state.provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      state.user = await state.provider.getSigner().getAddress();
      state.walletType = 'metamask';
    }
    // WalletConnect fallback
    else if (walletType === 'walletconnect') {
      // WalletConnect implementation
    }

    localStorage.setItem('connectedWallet', walletType);
    updateUI();
    showNotification('Wallet connected', 'success');
  } catch (error) {
    showNotification(`Connection failed: ${error.message}`, 'error');
  }
}

// Transaction Handling
async function stake(amount) {
  if (!state.user) {
    showNotification('Please connect wallet first', 'error');
    return;
  }

  try {
    // Show confirmation modal
    showTxModal({
      title: 'Confirm Stake',
      details: `Amount: ${amount} LP`,
      onConfirm: async () => {
        const contract = new ethers.Contract(
          CONFIG.CONTRACTS.STAKING,
          STAKING_ABI,
          state.provider.getSigner()
        );

        const tx = await contract.stake(
          ethers.utils.parseUnits(amount, 18),
          { gasLimit: CONFIG.MAX_GAS }
        );

        await tx.wait();
        showNotification('Stake successful!', 'success');
      }
    });
  } catch (error) {
    showNotification(`Stake failed: ${error.message}`, 'error');
  }
}

// UI Updates
function updateUI() {
  if (state.user) {
    elements.connectText.textContent = shortenAddress(state.user);
    elements.walletInfo.classList.remove('hidden');
    elements.walletAddress.textContent = shortenAddress(state.user);
  } else {
    elements.connectText.textContent = 'Connect Wallet';
    elements.walletInfo.classList.add('hidden');
  }
}

// Helpers
function shortenAddress(address) {
  return `${address.substring(0, 6)}...${address.slice(-4)}`;
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
    ${message}
  `;
  elements.notifications.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', init);
