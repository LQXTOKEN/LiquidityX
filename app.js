'use strict';

/**
 * LiquidityX Staking DApp - Hybrid Secure Implementation
 * @file app.js
 * @version 2.0.0
 * @license MIT
 */

const CONFIG = {
  POLYGON: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrls: [
      'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
      'https://polygon-rpc.com',
      'https://matic-mainnet.chainstacklabs.com'
    ],
    contracts: {
      staking: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
      lpToken: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
      lqxToken: '0x9e27f48659b1005b1abc0f58465137e531430d4b'
    }
  }
};

let state = {
  currentAccount: null,
  provider: null,
  signer: null,
  contracts: {},
};

// Load ABIs securely
async function fetchABI(name) {
  const response = await fetch(`https://lqxtoken.github.io/LiquidityX/abis/${name}.json`);
  if (!response.ok) throw new Error(`Failed to fetch ABI: ${name}`);
  return await response.json();
}

// Initialize Contracts
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

// Connect Wallet
async function connectWallet() {
  if (window.ethereum) {
    state.provider = new ethers.providers.Web3Provider(window.ethereum);
    state.signer = state.provider.getSigner();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    state.currentAccount = accounts[0];
    await initContracts();
    updateUI();
  } else {
    alert('Please install MetaMask or use a compatible wallet.');
  }
}

// Update UI with User Information
function updateUI() {
  if (state.currentAccount) {
    document.getElementById('walletInfo').classList.remove('hidden');
    document.getElementById('walletAddress').textContent = state.currentAccount;
  }
}

// Stake Function
async function stake() {
  const amount = document.getElementById('stakeAmount').value;
  if (amount <= 0) return alert('Enter a valid amount.');

  const amountInWei = ethers.utils.parseUnits(amount, 18);

  try {
    const tx = await state.contracts.staking.connect(state.signer).stake(amountInWei);
    await tx.wait();
    alert('Stake Successful!');
  } catch (error) {
    console.error(error);
    alert('Stake failed!');
  }
}

// Unstake Function
async function unstake() {
  const amount = document.getElementById('unstakeAmount').value;
  if (amount <= 0) return alert('Enter a valid amount.');

  const amountInWei = ethers.utils.parseUnits(amount, 18);

  try {
    const tx = await state.contracts.staking.connect(state.signer).unstake(amountInWei);
    await tx.wait();
    alert('Unstake Successful!');
  } catch (error) {
    console.error(error);
    alert('Unstake failed!');
  }
}

// Claim Rewards Function
async function claimRewards() {
  try {
    const tx = await state.contracts.staking.connect(state.signer).claimRewards();
    await tx.wait();
    alert('Rewards Claimed Successfully!');
  } catch (error) {
    console.error(error);
    alert('Claim Rewards failed!');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectButton').addEventListener('click', connectWallet);
  document.getElementById('stakeBtn').addEventListener('click', stake);
  document.getElementById('unstakeBtn').addEventListener('click', unstake);
  document.getElementById('claimBtn').addEventListener('click', claimRewards);
});
