const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';

// Νέο συμβόλαιο LPStakingContractHybrid
const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
let stakingContract;

// Check if MetaMask is installed
function hasInjectedProvider() {
  return typeof window.ethereum !== 'undefined';
}

async function loadABI() {
  console.log("📂 Loading ABI from abis folder...");
  const response = await fetch('abis/StakingContract.json');
  if (!response.ok) {
    console.error("❌ Failed to load ABI file.");
    throw new Error("Failed to load ABI file.");
  }
  return await response.json();
}

async function connectWallet() {
  if (!hasInjectedProvider()) {
    alert('Please install MetaMask or another Web3 wallet!');
    return;
  }

  try {
    console.log("🔌 Attempting to connect wallet...");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    connectedAddress = await signer.getAddress();

    console.log("✅ Wallet Connected Successfully:", connectedAddress);
    document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;

    localStorage.setItem('walletConnected', 'true');

    const StakingContractABI = await loadABI();
    stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, signer);

  } catch (error) {
    console.error("❌ Connection error:", error);
  }
}

function disconnectWallet() {
  provider = null;
  signer = null;
  connectedAddress = '';
  document.getElementById('wallet-address').textContent = 'Disconnected';
  localStorage.removeItem('walletConnected');
  console.log("✅ Disconnected successfully.");
}

async function getAPR() {
  try {
    console.log("📊 Fetching APR...");
    const rpcProvider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
    const StakingContractABI = await loadABI();
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, rpcProvider);
    const apr = await stakingContract.getAPR();
    document.getElementById('apr').innerText = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;
    console.log("✅ APR Fetched Successfully:", apr.toString());
  } catch (error) {
    console.error("❌ APR error:", error);
  }
}

async function claimRewards() {
  try {
    console.log("💰 Claiming Rewards...");
    const tx = await stakingContract.claimRewards();
    await tx.wait();
    console.log("✅ Rewards Claimed Successfully.");
    alert("Rewards Claimed Successfully.");
  } catch (error) {
    console.error("❌ Error Claiming Rewards:", error);
  }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
document.getElementById('refresh-apr-btn').addEventListener('click', getAPR);
document.getElementById('claim-rewards-btn').addEventListener('click', claimRewards);
