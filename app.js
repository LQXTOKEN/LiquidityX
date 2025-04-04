// Αρχικοποίηση Εφαρμογής
class LiquidityXApp {
    constructor() {
        this.currentChain = null;
        this.userAddress = null;
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.currentGasPrice = 'medium';
        this.tokenBalances = {
            lqx: '0',
            lp: '0',
            staked: '0',
            rewards: '0'
        };
        this.txHistory = [];
        this.aprHistory = [];
        this.tvlHistory = [];
        
        this.init();
    }
    
    async init() {
        // Αρχικοποίηση UI
        this.initUI();
        
        // Έλεγχος για προηγούμενη σύνδεση
        await this.checkSavedSession();
        
        // Αρχικοποίηση charts
        this.initCharts();
        
        // Εκκίνηση παρακολούθησης δεδομένων
        this.startDataPolling();
        
        // Εκκίνηση tutorial
        this.startTutorial();
    }
    
    initUI() {
        // Network selector
        document.querySelectorAll('.network-option').forEach(option => {
            option.addEventListener('click', () => this.switchNetwork(option.dataset.chain));
        });
        
        // Wallet connection
        document.getElementById('connectButton').addEventListener('click', () => this.showWalletModal());
        
        // Staking actions
        document.getElementById('stakeButton').addEventListener('click', () => this.showStakeConfirmation());
        document.getElementById('unstakeButton').addEventListener('click', () => this.showUnstakeConfirmation());
        document.getElementById('claimButton').addEventListener('click', () => this.showClaimConfirmation());
        document.getElementById('compoundButton').addEventListener('click', () => this.showCompoundConfirmation());
        
        // MAX buttons
        document.getElementById('maxStakeBtn').addEventListener('click', () => {
            document.getElementById('stakeAmount').value = this.tokenBalances.lp;
        });
        document.getElementById('maxUnstakeBtn').addEventListener('click', () => {
            document.getElementById('unstakeAmount').value = this.tokenBalances.staked;
        });
        
        // Gas options
        document.querySelectorAll('.gas-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelector('.gas-option.active').classList.remove('active');
                option.classList.add('active');
                this.currentGasPrice = option.dataset.speed;
                this.updateGasEstimate();
            });
        });
        
        // Transaction filters
        document.getElementById('txTypeFilter').addEventListener('change', () => this.loadTxHistory());
        document.getElementById('txTimeFilter').addEventListener('change', () => this.loadTxHistory());
    }
    
    async checkSavedSession() {
        const savedSession = localStorage.getItem('lqxStakingSession');
        if (savedSession) {
            const { chainId, walletType, address } = JSON.parse(savedSession);
            try {
                await this.connectWallet(walletType, chainId);
                this.userAddress = address;
                await this.loadUserData();
            } catch (error) {
                console.error("Failed to restore session:", error);
                localStorage.removeItem('lqxStakingSession');
            }
        }
    }
    
    async connectWallet(walletType, chainId) {
        try {
            this.showLoading(`Connecting ${walletType}...`);
            
            // Initialize wallet connection based on type
            if (walletType === 'metamask') {
                await this.connectMetaMask(chainId);
            } else if (walletType === 'walletconnect') {
                await this.connectWalletConnect(chainId);
            } else if (walletType === 'keplr') {
                await this.connectKeplr(chainId);
            }
            
            // Initialize contract
            await this.initContract();
            
            // Save session
            localStorage.setItem('lqxStakingSession', JSON.stringify({
                chainId,
                walletType,
                address: this.userAddress
            }));
            
            // Update UI
            this.updateWalletDisplay();
            await this.loadUserData();
            
            this.showNotification('Wallet connected successfully', 'success');
        } catch (error) {
            console.error("Wallet connection failed:", error);
            this.showNotification(`Connection failed: ${error.message}`, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }
    
    async connectMetaMask(chainId) {
        if (!window.ethereum) throw new Error('MetaMask not installed');
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.userAddress = accounts[0];
        
        // Switch to selected chain
        await this.switchChain(chainId);
        
        // Set up provider
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) this.disconnectWallet();
            else {
                this.userAddress = accounts[0];
                this.updateWalletDisplay();
                this.loadUserData();
            }
        });
        
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }
    
    async switchChain(chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
            });
            this.currentChain = chainId;
            this.updateNetworkDisplay();
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    const chainConfig = CHAINS[chainId];
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${Number(chainId).toString(16)}`,
                            chainName: chainConfig.name,
                            nativeCurrency: {
                                name: chainConfig.currency,
                                symbol: chainConfig.currency,
                                decimals: 18
                            },
                            rpcUrls: chainConfig.rpcs,
                            blockExplorerUrls: [chainConfig.explorer]
                        }],
                    });
                    this.currentChain = chainId;
                    this.updateNetworkDisplay();
                } catch (addError) {
                    throw new Error(`Failed to add network: ${addError.message}`);
                }
            } else {
                throw new Error(`Failed to switch network: ${switchError.message}`);
            }
        }
    }
    
    async initContract() {
        const chainConfig = CHAINS[this.currentChain];
        this.contract = new ethers.Contract(
            chainConfig.stakingContract,
            STAKING_ABI,
            this.signer
        );
        
        // Load contract metadata
        await this.loadContractData();
    }
    
    async loadUserData() {
        try {
            // Load token balances
            await this.loadTokenBalances();
            
            // Load staking data
            await this.loadStakingData();
            
            // Load transaction history
            await this.loadTxHistory();
            
            // Load APR history
            await this.loadAprHistory();
        } catch (error) {
            console.error("Failed to load user data:", error);
            this.showNotification("Failed to load data. Please try again.", 'error');
        }
    }
    
    async loadTokenBalances() {
        const chainConfig = CHAINS[this.currentChain];
        
        // Load native balance
        const nativeBalance = await this.provider.getBalance(this.userAddress);
        document.getElementById('nativeBalance').textContent = 
            `${ethers.utils.formatUnits(nativeBalance, 18)} ${chainConfig.currency}`;
        
        // Load LQX balance
        const lqxContract = new ethers.Contract(chainConfig.lqxToken, ERC20_ABI, this.signer);
        const lqxBalance = await lqxContract.balanceOf(this.userAddress);
        this.tokenBalances.lqx = ethers.utils.formatUnits(lqxBalance, 18);
        
        // Load LP balance
        const lpContract = new ethers.Contract(chainConfig.lpToken, ERC20_ABI, this.signer);
        const lpBalance = await lpContract.balanceOf(this.userAddress);
        this.tokenBalances.lp = ethers.utils.formatUnits(lpBalance, 18);
    }
    
    async loadStakingData() {
        // Load staked amount
        const stakedAmount = await this.contract.userStake(this.userAddress);
        this.tokenBalances.staked = ethers.utils.formatUnits(stakedAmount, 18);
        document.getElementById('stakedAmount').textContent = this.tokenBalances.staked;
        
        // Load pending rewards
        const pendingReward = await this.contract.earned(this.userAddress);
        this.tokenBalances.rewards = ethers.utils.formatUnits(pendingReward, 18);
        document.getElementById('pendingReward').textContent = this.tokenBalances.rewards;
        
        // Load APR
        const apr = await this.contract.getAPR();
        document.getElementById('aprValue').textContent = `${ethers.utils.formatUnits(apr, 2)}%`;
        
        // Load TVL
        const tvl = await this.contract.totalStaked();
        document.getElementById('tvlValue').textContent = 
            `${ethers.utils.formatUnits(tvl, 18)} LP`;
        
        // Calculate user share
        const userShare = stakedAmount.mul(10000).div(tvl);
        document.getElementById('userShare').textContent = 
            `${(userShare / 100).toFixed(2)}%`;
        
        // Calculate daily estimate
        const dailyEstimate = pendingReward.mul(86400).div(await this.contract.SECONDS_IN_A_YEAR());
        document.getElementById('dailyEstimate').textContent = 
            `${ethers.utils.formatUnits(dailyEstimate, 18)} LQX/day`;
    }
    
    async showStakeConfirmation() {
        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            this.showNotification("Please enter a valid amount", 'error');
            return;
        }
        
        // Calculate approval needed
        const allowance = await this.getLpAllowance();
        const amountWei = ethers.utils.parseUnits(amount, 18);
        
        if (allowance.lt(amountWei)) {
            this.showApprovalModal(amountWei, () => this.executeStake(amountWei));
        } else {
            this.showStakeModal(amountWei);
        }
    }
    
    async executeStake(amountWei) {
        try {
            this.showLoading("Staking LP tokens...");
            
            const tx = await this.contract.stake(amountWei, {
                gasPrice: await this.getGasPrice()
            });
            
            await this.waitForTransaction(tx);
            await this.loadUserData();
            
            this.showNotification("Successfully staked LP tokens", 'success');
        } catch (error) {
            console.error("Staking failed:", error);
            this.showNotification(`Staking failed: ${error.message}`, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }
    
    startDataPolling() {
        // Refresh data every 30 seconds
        this.dataPollInterval = setInterval(() => {
            if (this.userAddress) {
                this.loadUserData();
            }
        }, 30000);
        
        // Refresh gas prices every minute
        this.gasPollInterval = setInterval(() => {
            this.updateGasPrices();
        }, 60000);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : ''}
                ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : ''}
                ${type === 'info' ? '<i class="fas fa-info-circle"></i>' : ''}
            </div>
            <div class="notification-content">${message}</div>
            <div class="notification-close"><i class="fas fa-times"></i></div>
        `;
        
        document.getElementById('notificationContainer').appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Εκκίνηση εφαρμογής όταν φορτωθεί η σελίδα
window.addEventListener('DOMContentLoaded', () => {
    window.liquidityXApp = new LiquidityXApp();
});
