'use strict';

/**
 * LiquidityX Staking DApp - Hybrid Secure Implementation
 * @file app.js
 * @version 2.0.0
 * @license MIT
 */

// Configuration
const CONFIG = {
  POLYGON: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrls: [
      'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
      'https://polygon-rpc.com',
      'https://matic-mainnet.chainstacklabs.com'
    ],
    explorerUrl: 'https://polygonscan.com',
    contracts: {
      staking: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
      lpToken: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
      lqxToken: '0x9e27f48659b1005b1abc0f58465137e531430d4b'
    }
  },
  OSMOSIS: {
    chainId: 'osmosis-1',
    name: 'Osmosis',
    rpcUrls: [
      'https://rpc-osmosis.keplr.app',
      'https://osmosis-rpc.polkachu.com',
      'https://rpc-osmosis.blockapsis.com'
    ],
    explorerUrl: 'https://www.mintscan.io/osmosis'
  }
};

const state = {
  currentAccount: null,
  provider: null,
  signer: null,
  contracts: {},
  walletType: null,
};

// Helper Functions
async function fetchABI(name) {
  const response = await fetch(`https://lqxtoken.github.io/LiquidityX/abis/${name}.json`, {
    mode: 'cors'
  });
  if (!response.ok) throw new Error(`Failed to fetch ABI: ${name}`);
  return response.json();
}

async function initContracts() {
  const stakingABI = await fetchABI('LPStaking');
  const lpTokenABI = await fetchABI('LPToken');
  const lqxTokenABI = await fetchABI('LQXToken');

  state.contracts = {
    staking: new ethers.Contract(CONFIG.POLYGON.contracts.staking, stakingABI, state.signer),
    lpToken: new ethers.Contract(CONFIG.POLYGON.contracts.lpToken, lpTokenABI, state.signer),
    lqxToken: new ethers.Contract(CONFIG.POLYGON.contracts.lqxToken, lqxTokenABI, state.signer),
  };
}

async function connectWallet(walletType) {
  try {
    if (walletType === 'metamask') {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      state.currentAccount = accounts[0];
      state.provider = new ethers.providers.Web3Provider(window.ethereum);
      state.signer = state.provider.getSigner();
      state.walletType = 'metamask';
      await initContracts();
    } else if (walletType === 'keplr') {
      if (!window.keplr) throw new Error('Keplr Wallet not found');
      await window.keplr.enable('osmosis-1');
      const offlineSigner = window.keplr.getOfflineSigner('osmosis-1');
      const accounts = await offlineSigner.getAccounts();
      state.currentAccount = accounts[0].address;
      state.walletType = 'keplr';
    } else if (walletType === 'trustwallet') {
      if (!window.ethereum || !window.ethereum.isTrust) throw new Error('Trust Wallet not found');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      state.currentAccount = accounts[0];
      state.provider = new ethers.providers.Web3Provider(window.ethereum);
      state.signer = state.provider.getSigner();
      state.walletType = 'trustwallet';
      await initContracts();
    } else if (walletType === 'leap') {
      if (!window.leap) throw new Error('Leap Wallet not found');
      await window.leap.enable('osmosis-1');
      const offlineSigner = window.leap.getOfflineSigner('osmosis-1');
      const accounts = await offlineSigner.getAccounts();
      state.currentAccount = accounts[0].address;
      state.walletType = 'leap';
    }
    alert(`Connected: ${state.currentAccount}`);
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectButton').addEventListener('click', () => connectWallet('metamask'));
  document.getElementById('keplrOption').addEventListener('click', () => connectWallet('keplr'));
  document.getElementById('trustwalletOption').addEventListener('click', () => connectWallet('trustwallet'));
  document.getElementById('leapOption').addEventListener('click', () => connectWallet('leap'));
});
