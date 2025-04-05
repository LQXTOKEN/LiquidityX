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

let provider, signer, stakingContract, selectedWallet;

// Initialize Application
async function init() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    stakingContract = new ethers.Contract(CONFIG.contracts.staking.address, CONFIG.contracts.staking.abi, signer);
    console.log('Initialization complete');
  } else {
    alert('Please install MetaMask or Trust Wallet!');
  }
}

async function connectWallet(walletType) {
  try {
    if (walletType === 'metamask' || walletType === 'trust') {
      await provider.send("eth_requestAccounts", []);
      const address = await signer.getAddress();
      selectedWallet = walletType;
      document.getElementById('connectButton').innerText = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } else if (walletType === 'keplr' || walletType === 'leap') {
      alert(`Support for ${walletType} is under development!`);
    }
    console.log(`Connected with ${walletType}`);
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

function openWalletModal() {
  document.getElementById('walletModal').style.display = 'block';
}

function closeWalletModal() {
  document.getElementById('walletModal').style.display = 'none';
}

document.getElementById('connectButton').addEventListener('click', openWalletModal);
document.querySelectorAll('.wallet-option').forEach(button => {
  button.addEventListener('click', () => {
    const walletType = button.getAttribute('data-wallet');
    connectWallet(walletType);
    closeWalletModal();
  });
});

window.addEventListener('DOMContentLoaded', init);
