document.addEventListener('DOMContentLoaded', () => {
  console.log("Ethers loaded:", typeof ethers !== 'undefined'); // Debug

  const CONFIG = {
    LQX_TOKEN: {
      address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
      abi: ["function balanceOf(address account) view returns (uint256)"]
    },
    LP_TOKEN: {
      address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
      abi: [
        "function balanceOf(address account) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ]
    },
    STAKING_CONTRACT: {
      address: '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9',
      abi: [
        "function stake(uint256 amount) external",
        "function withdraw(uint256 amount) external",
        "function claimRewards() external",
        "function getStakedAmount(address user) view returns (uint256)"
      ]
    }
  };

  // DOM Elements
  const connectButton = document.getElementById('connectButton');
  const walletInfo = document.getElementById('walletInfo');
  const accountAddress = document.getElementById('accountAddress');
  const stakeButton = document.getElementById('stakeButton');
  const withdrawButton = document.getElementById('withdrawButton');
  const claimButton = document.getElementById('claimButton');
  const stakeAmountInput = document.getElementById('stakeAmount');
  const statusMessage = document.getElementById('statusMessage');
  const lpBalanceSpan = document.getElementById('lpBalance');
  const stakedAmountSpan = document.getElementById('stakedAmount');

  let provider, signer, stakingContract, lpTokenContract;

  // Initialize Contracts
  function initContracts() {
    stakingContract = new ethers.Contract(
      CONFIG.STAKING_CONTRACT.address,
      CONFIG.STAKING_CONTRACT.abi,
      signer
    );
    lpTokenContract = new ethers.Contract(
      CONFIG.LP_TOKEN.address,
      CONFIG.LP_TOKEN.abi,
      signer
    );
  }

  // Connect Wallet
  async function connectWallet() {
    if (!window.ethereum) {
      statusMessage.textContent = "MetaMask not installed!";
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();

      // Check Network (Polygon Mainnet)
      const network = await provider.getNetwork();
      if (network.chainId !== 137) {
        statusMessage.textContent = "Please switch to Polygon Mainnet (ChainID: 137)";
        return;
      }

      // Update UI
      accountAddress.textContent = accounts[0];
      walletInfo.style.display = 'block';
      connectButton.style.display = 'none';
      statusMessage.textContent = "Connected successfully!";
      statusMessage.style.color = "green";

      // Init Contracts
      initContracts();
      updateBalances();

    } catch (error) {
      statusMessage.textContent = "Connection failed: " + error.message;
      statusMessage.style.color = "red";
    }
  }

  // Update Balances
  async function updateBalances() {
    const userAddress = accountAddress.textContent;
    const lpBalance = await lpTokenContract.balanceOf(userAddress);
    const stakedAmount = await stakingContract.getStakedAmount(userAddress);

    lpBalanceSpan.textContent = ethers.utils.formatEther(lpBalance);
    stakedAmountSpan.textContent = ethers.utils.formatEther(stakedAmount);
  }

  // Stake Tokens
  async function stakeTokens() {
    const amount = stakeAmountInput.value;
    if (!amount || isNaN(amount)) {
      statusMessage.textContent = "Please enter a valid amount!";
      return;
    }

    try {
      // Approve
      const approveTx = await lpTokenContract.approve(
        CONFIG.STAKING_CONTRACT.address,
        ethers.utils.parseEther(amount)
      );
      await approveTx.wait();

      // Stake
      const stakeTx = await stakingContract.stake(ethers.utils.parseEther(amount));
      await stakeTx.wait();
      statusMessage.textContent = "Staked successfully!";
      updateBalances();
    } catch (error) {
      statusMessage.textContent = "Stake failed: " + error.message;
      statusMessage.style.color = "red";
    }
  }

  // Event Listeners
  connectButton.addEventListener('click', connectWallet);
  stakeButton.addEventListener('click', stakeTokens);
  withdrawButton.addEventListener('click', withdrawTokens);
  claimButton.addEventListener('click', claimRewards);

  // Placeholder functions (implement similarly to stakeTokens)
  async function withdrawTokens() {
    alert("Implement withdraw similar to stakeTokens()");
  }

  async function claimRewards() {
    alert("Implement claimRewards()");
  }
});
