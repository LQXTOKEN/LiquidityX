const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';

// Νέο συμβόλαιο LPStakingContractHybrid
const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
const STAKING_CONTRACT_ABI = [
    'function claimRewards() public',
    'function getAPR() public view returns (uint256)'
];

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
    console.log("🔌 Attempting to connect wallet...");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    connectedAddress = await signer.getAddress();

    console.log("✅ Wallet Connected Successfully:", connectedAddress);
    document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;

    localStorage.setItem('walletConnected', 'true');
  } catch (error) {
    console.error("❌ Connection error:", error);
    alert(`Connection failed: ${error.message}`);
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
    
    const stakingContract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      rpcProvider
    );

    const apr = await stakingContract.getAPR();
    const formattedAPR = ethers.utils.formatUnits(apr, 2);
    document.getElementById('apr').innerText = `APR: ${formattedAPR}%`;
    console.log("✅ APR Fetched Successfully:", formattedAPR);
  } catch (error) {
    console.error("❌ APR error:", error);
  }
}

async function claimRewards() {
  if (!signer) {
    alert('Please connect your wallet first.');
    return;
  }

  try {
    console.log("📥 Attempting to claim rewards...");

    const stakingContract = new ethers.Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );

    const tx = await stakingContract.claimRewards();
    console.log("⏳ Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt);
    alert("Rewards Claimed Successfully.");
  } catch (error) {
    console.error("❌ Error Claiming Rewards:", error);
    alert(`Error Claiming Rewards: ${error.message}`);
  }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
document.getElementById('refresh-apr-btn').addEventListener('click', getAPR);
document.getElementById('claim-rewards-btn').addEventListener('click', claimRewards);

// Auto-connect if previously connected
if (localStorage.getItem('walletConnected') === 'true' && hasInjectedProvider()) {
  connectWallet();
}
