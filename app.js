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
      abi: [] // ABI will be loaded dynamically from abis/LPStaking.json
    },
    lpToken: {
      address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
      abi: [] // ABI will be loaded dynamically from abis/LPToken.json
    },
    lqxToken: {
      address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
      abi: [] // ABI will be loaded dynamically from abis/LQXToken.json
    }
  }
};

let provider, signer, stakingContract, lpTokenContract, lqxTokenContract;

async function loadABIs() {
  const stakingABI = await fetch('abis/LPStaking.json').then(res => res.json());
  const lpTokenABI = await fetch('abis/LPToken.json').then(res => res.json());
  const lqxTokenABI = await fetch('abis/LQXToken.json').then(res => res.json());

  CONFIG.contracts.staking.abi = stakingABI;
  CONFIG.contracts.lpToken.abi = lpTokenABI;
  CONFIG.contracts.lqxToken.abi = lqxTokenABI;

  stakingContract = new ethers.Contract(CONFIG.contracts.staking.address, CONFIG.contracts.staking.abi, signer);
  lpTokenContract = new ethers.Contract(CONFIG.contracts.lpToken.address, CONFIG.contracts.lpToken.abi, signer);
  lqxTokenContract = new ethers.Contract(CONFIG.contracts.lqxToken.address, CONFIG.contracts.lqxToken.abi, signer);
}

async function init() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    await loadABIs();
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

async function loadBalances() {
  const address = await signer.getAddress();

  const lqxBalance = await lqxTokenContract.balanceOf(address);
  const lpBalance = await lpTokenContract.balanceOf(address);
  const stakedAmount = await stakingContract.userStake(address);
  const pendingReward = await stakingContract.earned(address);

  document.getElementById('lqxBalance').textContent = ethers.utils.formatUnits(lqxBalance, 18);
  document.getElementById('lpBalance').textContent = ethers.utils.formatUnits(lpBalance, 18);
  document.getElementById('stakedAmount').textContent = ethers.utils.formatUnits(stakedAmount, 18);
  document.getElementById('pendingReward').textContent = ethers.utils.formatUnits(pendingReward, 18);
}

async function claimRewards() {
  const tx = await stakingContract.claimRewards();
  await tx.wait();
  alert('Rewards claimed!');
  await loadBalances();
}

window.addEventListener('DOMContentLoaded', init);
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('claimBtn').addEventListener('click', claimRewards);
