// Configuration
const CONFIG = {
  network: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    currency: 'MATIC'
  },
  contracts: {
    staking: {
      address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
      abi: [
        "function stake(uint256 amount) external",
        "function unstake(uint256 amount) external",
        "function claimRewards() external",
        "function getAPR() view returns (uint256)",
        "function totalStaked() view returns (uint256)",
        "function userStake(address account) view returns (uint256)",
        "function earned(address account) view returns (uint256)"
      ]
    }
  }
};

let provider, signer, stakingContract;

async function init() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    stakingContract = new ethers.Contract(CONFIG.contracts.staking.address, CONFIG.contracts.staking.abi, signer);
    console.log('Initialization complete');
  } else {
    alert('Please install MetaMask!');
  }
}

async function connectWallet() {
  await provider.send("eth_requestAccounts", []);
  const address = await signer.getAddress();
  document.getElementById('connectButton').innerText = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  console.log('Wallet connected');
}

async function stake() {
  const amount = prompt('Enter amount to stake:');
  if (amount) {
    const tx = await stakingContract.stake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    alert('Stake successful!');
  }
}

async function unstake() {
  const amount = prompt('Enter amount to unstake:');
  if (amount) {
    const tx = await stakingContract.unstake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    alert('Unstake successful!');
  }
}

async function claimRewards() {
  const tx = await stakingContract.claimRewards();
  await tx.wait();
  alert('Rewards claimed!');
}

window.addEventListener('DOMContentLoaded', init);
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeBtn').addEventListener('click', stake);
document.getElementById('unstakeBtn').addEventListener('click', unstake);
document.getElementById('claimBtn').addEventListener('click', claimRewards);
