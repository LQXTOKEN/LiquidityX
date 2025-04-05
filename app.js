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
      abi: require('./abis/LPStaking.json')
    },
    lpToken: {
      address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
      abi: require('./abis/LPToken.json')
    },
    lqxToken: {
      address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
      abi: require('./abis/LQXToken.json')
    }
  }
};

let provider, signer, stakingContract, lpTokenContract, lqxTokenContract;

async function init() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    stakingContract = new ethers.Contract(CONFIG.contracts.staking.address, CONFIG.contracts.staking.abi, signer);
    lpTokenContract = new ethers.Contract(CONFIG.contracts.lpToken.address, CONFIG.contracts.lpToken.abi, signer);
    lqxTokenContract = new ethers.Contract(CONFIG.contracts.lqxToken.address, CONFIG.contracts.lqxToken.abi, signer);
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
  loadBalances();
}

async function loadBalances() {
  const address = await signer.getAddress();
  const lqxBalance = await lqxTokenContract.balanceOf(address);
  const lpBalance = await lpTokenContract.balanceOf(address);
  const stakedAmount = await stakingContract.userStake(address);
  const pendingReward = await stakingContract.earned(address);
  const apr = await stakingContract.getAPR();
  const totalStaked = await stakingContract.totalStaked();

  document.getElementById('lqxBalance').innerText = ethers.utils.formatUnits(lqxBalance, 18);
  document.getElementById('lpBalance').innerText = ethers.utils.formatUnits(lpBalance, 18);
  document.getElementById('stakedAmount').innerText = ethers.utils.formatUnits(stakedAmount, 18);
  document.getElementById('pendingReward').innerText = ethers.utils.formatUnits(pendingReward, 18);
  document.getElementById('aprValue').innerText = `${ethers.utils.formatUnits(apr, 2)}%`;
  document.getElementById('totalStaked').innerText = `${ethers.utils.formatUnits(totalStaked, 18)} LP`;
}

window.addEventListener('DOMContentLoaded', init);
document.getElementById('connectButton').addEventListener('click', connectWallet);
