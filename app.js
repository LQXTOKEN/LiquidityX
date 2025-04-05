// Main Application
class StakingApp {
  constructor() {
    this.walletManager = new WalletManager();
    this.stakingManager = new StakingManager(this.walletManager);
    this.uiManager = new UIManager();
    
    this.initEventListeners();
  }

  initEventListeners() {
    // Connect wallet button
    document.getElementById('connectButton').addEventListener('click', () => {
      this.uiManager.showWalletModal();
    });
    
    // Stake button
    document.getElementById('stakeBtn').addEventListener('click', async () => {
      const amount = parseFloat(document.getElementById('stakeAmount').value);
      if (amount > 0) {
        await this.stakingManager.stake(amount);
      }
    });
    
    // Unstake button
    document.getElementById('unstakeBtn').addEventListener('click', async () => {
      const amount = parseFloat(document.getElementById('unstakeAmount').value);
      if (amount > 0) {
        await this.stakingManager.unstake(amount);
      }
    });
    
    // Claim button
    document.getElementById('claimBtn').addEventListener('click', async () => {
      await this.stakingManager.claimRewards();
    });
    
    // Max buttons
    document.getElementById('maxStakeBtn').addEventListener('click', () => {
      const lpBalance = parseFloat(document.getElementById('lpBalance').textContent);
      document.getElementById('stakeAmount').value = lpBalance.toFixed(4);
    });
    
    document.getElementById('maxUnstakeBtn').addEventListener('click', () => {
      const stakedBalance = parseFloat(document.getElementById('stakedBalance').textContent);
      document.getElementById('unstakeAmount').value = stakedBalance.toFixed(4);
    });
  }

  async init() {
    try {
      // Check if wallet is already connected (e.g., page refresh)
      if (window.ethereum && window.ethereum.selectedAddress) {
        await this.walletManager.connectWallet('METAMASK');
      }
      
      // Start monitoring rewards
      this.stakingManager.startRewardsMonitoring();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
  const app = new StakingApp();
  app.init();
});
