const Web3Modal = window.Web3Modal?.default;
const WalletConnectProvider = window.WalletConnectProvider?.default;
const { ethers } = window;

// Config με δυνατότητα ενημέρωσης από API στο μέλλον
const CONFIG = {
  NETWORK: {
    chainId: 137,
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    currency: "MATIC"
  },
  CONTRACTS: {
    LQX_TOKEN: {
      address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
      abi: ["function balanceOf(address account) view returns (uint256)"]
    },
    LP_TOKEN: {
      address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
      abi: [
        "function balanceOf(address account) view returns (uint256)",
        "function approve(address spender, uint256 amount) public returns (bool)"
      ]
    },
    STAKING_CONTRACT: {
      address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
      abi: [
        "function stake(uint256 amount) external",
        "function unstake(uint256 amount) external",
        "function claimRewards() external",
        "function userStake(address account) external view returns (uint256)",
        "function earned(address account) external view returns (uint256)",
        "function getAPR() public view returns (uint256)"
      ]
    }
  }
};

// Loading Indicator Elements
const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'loadingIndicator';
loadingIndicator.innerText = 'Loading... Please wait.';
loadingIndicator.style.display = 'none';
document.body.appendChild(loadingIndicator);

function showLoading() {
  loadingIndicator.style.display = 'block';
}

function hideLoading() {
  loadingIndicator.style.display = 'none';
}

// ======================
// Συμβολαιακές Συναρτήσεις
// ======================

async function unstake(amount) {
  if (!account) return;

  try {
    showLoading();
    const stakingContract = new ethers.Contract(
      CONFIG.CONTRACTS.STAKING_CONTRACT.address,
      CONFIG.CONTRACTS.STAKING_CONTRACT.abi,
      signer
    );

    const tx = await stakingContract.unstake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    await loadBalances();
    alert('Unstake successful!');
  } catch (error) {
    console.error('Unstake error:', error);
    alert(`Unstake failed: ${error.message}`);
  } finally {
    hideLoading();
  }
}

async function claimRewards() {
  if (!account) return;

  try {
    showLoading();
    const stakingContract = new ethers.Contract(
      CONFIG.CONTRACTS.STAKING_CONTRACT.address,
      CONFIG.CONTRACTS.STAKING_CONTRACT.abi,
      signer
    );

    const tx = await stakingContract.claimRewards();
    await tx.wait();
    await loadBalances();
    alert('Rewards claimed successfully!');
  } catch (error) {
    console.error('Claim rewards error:', error);
    alert(`Claim rewards failed: ${error.message}`);
  } finally {
    hideLoading();
  }
}

document.getElementById('unstakeButton').addEventListener('click', () => {
  const amount = document.getElementById('unstakeAmount').value;
  if (amount && parseFloat(amount) > 0) unstake(amount);
});

document.getElementById('claimButton').addEventListener('click', claimRewards);
