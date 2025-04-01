document.addEventListener('DOMContentLoaded', function() {
  // Configuration (όπως τη δική σου)
  const CONFIG = {
    LQX_TOKEN: {
      address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
      abi: ["function balanceOf(address account) public view returns (uint256)"]
    },
    LP_TOKEN: {
      address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
      abi: [
        "function balanceOf(address account) public view returns (uint256)",
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function allowance(address owner, address spender) public view returns (uint256)"
      ]
    },
    STAKING_CONTRACT: {
      address: '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9',
      abi: [
        "function stake(uint256 amount) public",
        "function withdraw(uint256 amount) public",
        "function claimRewards() public",
        "function getStakedAmount(address user) public view returns (uint256)"
      ]
    },
    NETWORK: {
      chainId: '0x89', // Polygon Mainnet
      name: 'Polygon'
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

  // Variables
  let provider;
  let signer;
  let stakingContract;
  let lpTokenContract;

  // Initialize Contracts
  function initContracts() {
    if (!provider || !signer) return;

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
      alert("MetaMask not detected! Please install it.");
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();

      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== parseInt(CONFIG.NETWORK.chainId, 16)) {
        alert(`Please switch to ${CONFIG.NETWORK.name} (ChainID: ${CONFIG.NETWORK.chainId})`);
        return;
      }

      // Update UI
      accountAddress.textContent = accounts[0];
      walletInfo.style.display = 'block';
      connectButton.style.display = 'none';

      // Initialize contracts
      initContracts();
      updateBalances();

      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        accountAddress.textContent = newAccounts[0];
        updateBalances();
      });

    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Connection failed: " + error.message);
    }
  }

  // Stake LP Tokens
  async function stakeLPTokens() {
    const amount = stakeAmountInput.value;
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount!");
      return;
    }

    try {
      // Approve staking contract to spend LP tokens
      const txApprove = await lpTokenContract.approve(
        CONFIG.STAKING_CONTRACT.address,
        ethers.utils.parseEther(amount)
      );
      await txApprove.wait();

      // Stake
      const txStake = await stakingContract.stake(ethers.utils.parseEther(amount));
      await txStake.wait();
      alert("Staked successfully!");
      updateBalances();

    } catch (error) {
      console.error("Staking error:", error);
      alert("Staking failed: " + error.message);
    }
  }

  // Withdraw LP Tokens
  async function withdrawLPTokens() {
    try {
      const tx = await stakingContract.withdraw(ethers.utils.parseEther(stakeAmountInput.value));
      await tx.wait();
      alert("Withdrawn successfully!");
      updateBalances();
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Withdraw failed: " + error.message);
    }
  }

  // Claim Rewards
  async function claimRewards() {
    try {
      const tx = await stakingContract.claimRewards();
      await tx.wait();
      alert("Rewards claimed!");
    } catch (error) {
      console.error("Claim error:", error);
      alert("Claim failed: " + error.message);
    }
  }

  // Update Balances (UI)
  async function updateBalances() {
    if (!provider || !accountAddress.textContent) return;

    const userAddress = accountAddress.textContent;
    
    // Get LP token balance
    const lpBalance = await lpTokenContract.balanceOf(userAddress);
    document.getElementById('lpBalance').textContent = ethers.utils.formatEther(lpBalance);

    // Get staked amount
    const stakedAmount = await stakingContract.getStakedAmount(userAddress);
    document.getElementById('stakedAmount').textContent = ethers.utils.formatEther(stakedAmount);
  }

  // Event Listeners
  connectButton.addEventListener('click', connectWallet);
  stakeButton.addEventListener('click', stakeLPTokens);
  withdrawButton.addEventListener('click', withdrawLPTokens);
  claimButton.addEventListener('click', claimRewards);
});
