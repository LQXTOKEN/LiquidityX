// Configuration
const CONFIG = {
    POLYGON: {
        network: {
            chainId: 137,
            name: 'Polygon',
            rpcUrls: [
                'https://polygon-rpc.com',
                'https://rpc-mainnet.matic.quiknode.pro',
                'https://polygon-rpc.com'
            ],
            explorerUrl: 'https://polygonscan.com',
            currency: 'MATIC',
            type: 'EVM'
        },
        contracts: {
            staking: {
                address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
                abi: [] // Will be loaded dynamically
            },
            lpToken: {
                address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
                abi: [] // Will be loaded dynamically
            },
            lqxToken: {
                address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
                abi: [] // Will be loaded dynamically
            }
        }
    },
    OSMOSIS: {
        network: {
            chainId: 'osmosis-1',
            name: 'Osmosis',
            rpcUrls: [
                'https://rpc-osmosis.keplr.app',
                'https://osmosis-rpc.polkachu.com',
                'https://rpc-osmosis.blockapsis.com'
            ],
            explorerUrl: 'https://www.mintscan.io/osmosis',
            currency: 'OSMO',
            type: 'COSMOS'
        },
        contracts: {
            // Cosmos contracts would be defined here
        }
    }
};

// Wallet Definitions
const WALLETS = {
    METAMASK: {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'fab fa-ethereum',
        supportedChains: ['EVM']
    },
    TRUSTWALLET: {
        id: 'trustwallet',
        name: 'Trust Wallet',
        icon: 'fas fa-wallet',
        supportedChains: ['EVM']
    },
    KEPLR: {
        id: 'keplr',
        name: 'Keplr',
        icon: 'fas fa-atom',
        supportedChains: ['COSMOS']
    },
    LEAP: {
        id: 'leap',
        name: 'Leap',
        icon: 'fas fa-rocket',
        supportedChains: ['COSMOS']
    }
};

class WalletManager {
    constructor() {
        this.currentWallet = null;
        this.currentNetwork = null;
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.rpcIndex = 0;
        this.account = null;
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
        this.handleChainChanged = this.handleChainChanged.bind(this);
    }

    async connectWallet(walletType) {
        try {
            // Disconnect previous connection if exists
            if (this.currentWallet) await this.disconnect();
            
            const wallet = WALLETS[walletType];
            if (!wallet) throw new Error('Invalid wallet type');
            
            this.currentWallet = wallet;
            
            // EVM Wallets
            if (wallet.supportedChains.includes('EVM')) {
                if (!window.ethereum) throw new Error(`${wallet.name} not detected`);
                
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.signer = this.provider.getSigner();
                
                // Set up event listeners
                window.ethereum.on('accountsChanged', this.handleAccountsChanged);
                window.ethereum.on('chainChanged', this.handleChainChanged);
                
                await this.switchNetwork('POLYGON');
            }
            // Cosmos Wallets
            else if (wallet.supportedChains.includes('COSMOS')) {
                if (!window[wallet.id]) throw new Error(`${wallet.name} not detected`);
                
                await this.switchNetwork('OSMOSIS');
                await window[wallet.id].enable(CONFIG.OSMOSIS.network.chainId);
                
                this.provider = window[wallet.id];
                this.signer = window[wallet.id].getOfflineSigner(CONFIG.OSMOSIS.network.chainId);
            }
            
            // Get account address
            this.account = await this.getAccount();
            
            return this.getWalletInfo();
        } catch (error) {
            console.error(`Error connecting ${walletType}:`, error);
            showNotification(`Failed to connect ${walletType}: ${error.message}`, 'error');
            throw error;
        }
    }

    async switchNetwork(networkKey) {
        const network = CONFIG[networkKey].network;
        this.currentNetwork = network;
        
        try {
            // EVM Network Switching
            if (network.type === 'EVM') {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: `0x${network.chainId.toString(16)}`,
                                chainName: network.name,
                                nativeCurrency: {
                                    name: network.currency,
                                    symbol: network.currency,
                                    decimals: 18
                                },
                                rpcUrls: network.rpcUrls,
                                blockExplorerUrls: [network.explorerUrl]
                            }]
                        });
                    } else {
                        throw switchError;
                    }
                }
            }
            
            // Initialize contracts for the new network
            await this.initContracts();
            
            return network;
        } catch (error) {
            console.error('Error switching network:', error);
            showNotification(`Failed to switch to ${network.name}: ${error.message}`, 'error');
            throw error;
        }
    }

    async initContracts() {
        showLoading('Initializing contracts...');
        
        try {
            // Fallback RPC mechanism
            let success = false;
            let lastError = null;
            
            for (let i = 0; i < this.currentNetwork.rpcUrls.length; i++) {
                try {
                    this.rpcIndex = i;
                    const rpcUrl = this.currentNetwork.rpcUrls[i];
                    
                    if (this.currentNetwork.type === 'EVM') {
                        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                        this.signer = this.provider.getSigner();
                        
                        // Load contract ABIs
                        const stakingABI = await fetchABI('abis/LPStaking.json');
                        const lpTokenABI = await fetchABI('abis/LPToken.json');
                        const lqxTokenABI = await fetchABI('abis/LQXToken.json');
                        
                        // Initialize contracts
                        this.contracts.staking = new ethers.Contract(
                            CONFIG[this.currentNetwork.name].contracts.staking.address,
                            stakingABI,
                            this.signer
                        );
                        
                        this.contracts.lpToken = new ethers.Contract(
                            CONFIG[this.currentNetwork.name].contracts.lpToken.address,
                            lpTokenABI,
                            this.signer
                        );
                        
                        this.contracts.lqxToken = new ethers.Contract(
                            CONFIG[this.currentNetwork.name].contracts.lqxToken.address,
                            lqxTokenABI,
                            this.signer
                        );
                    } else {
                        // Initialize Cosmos contracts
                        // ...
                    }
                    
                    success = true;
                    break;
                } catch (error) {
                    lastError = error;
                    console.warn(`RPC endpoint ${rpcUrl} failed, trying next...`);
                }
            }
            
            if (!success) throw lastError || new Error('All RPC endpoints failed');
            
            hideLoading();
            return true;
        } catch (error) {
            hideLoading();
            console.error('Error initializing contracts:', error);
            showNotification('Failed to initialize contracts', 'error');
            throw error;
        }
    }

    async getAccount() {
        if (!this.currentWallet) return null;
        
        try {
            if (this.currentWallet.supportedChains.includes('EVM')) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                return accounts[0] || null;
            } else {
                // Cosmos account handling
                const accounts = await this.signer.getAccounts();
                return accounts[0]?.address || null;
            }
        } catch (error) {
            console.error('Error getting account:', error);
            return null;
        }
    }

    async disconnect() {
        // Clear all wallet-related data
        this.currentWallet = null;
        this.currentNetwork = null;
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.account = null;
        
        // Update UI
        updateUI();
        
        // Remove event listeners
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', this.handleChainChanged);
        }
        
        showNotification('Wallet disconnected', 'info');
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // Wallet locked or disconnected
            this.disconnect();
        } else {
            // Account changed
            this.account = accounts[0];
            updateUI();
            showNotification('Account changed', 'info');
        }
    }

    handleChainChanged(chainId) {
        window.location.reload();
    }

    getWalletInfo() {
        if (!this.currentWallet || !this.account) return null;
        
        const shortAddress = `${this.account.substring(0, 6)}...${this.account.substring(this.account.length - 4)}`;
        
        return {
            isConnected: true,
            walletName: this.currentWallet.name,
            walletIcon: this.currentWallet.icon,
            address: this.account,
            shortAddress,
            networkName: this.currentNetwork?.name || 'Unknown'
        };
    }
}

class StakingManager {
    constructor(walletManager) {
        this.wallet = walletManager;
        this.stakingContract = null;
        this.rewardsInterval = null;
    }

    async stake(amount) {
        if (!this.wallet.account || !this.wallet.contracts.staking) {
            throw new Error('Wallet not connected');
        }
        
        try {
            showLoading('Processing stake...');
            
            // For EVM chains
            if (this.wallet.currentNetwork.type === 'EVM') {
                // First approve the staking contract to spend LP tokens
                const approveTx = await this.wallet.contracts.lpToken.approve(
                    this.wallet.contracts.staking.address,
                    ethers.utils.parseUnits(amount.toString(), 18)
                );
                await approveTx.wait();
                
                // Then stake the tokens
                const stakeTx = await this.wallet.contracts.staking.stake(
                    ethers.utils.parseUnits(amount.toString(), 18)
                );
                await stakeTx.wait();
                
                addTransaction('Stake', stakeTx.hash, true);
                showNotification('Successfully staked tokens', 'success');
                await this.updateBalances();
            }
            // For Cosmos chains
            else {
                // Implement Cosmos staking logic
            }
        } catch (error) {
            console.error('Staking error:', error);
            showNotification(`Staking failed: ${error.message}`, 'error');
            throw error;
        } finally {
            hideLoading();
        }
    }

    async unstake(amount) {
        if (!this.wallet.account || !this.wallet.contracts.staking) {
            throw new Error('Wallet not connected');
        }
        
        try {
            showLoading('Processing unstake...');
            
            if (this.wallet.currentNetwork.type === 'EVM') {
                const tx = await this.wallet.contracts.staking.unstake(
                    ethers.utils.parseUnits(amount.toString(), 18)
                );
                await tx.wait();
                
                addTransaction('Unstake', tx.hash, true);
                showNotification('Successfully unstaked tokens', 'success');
                await this.updateBalances();
            } else {
                // Cosmos unstaking logic
            }
        } catch (error) {
            console.error('Unstaking error:', error);
            showNotification(`Unstaking failed: ${error.message}`, 'error');
            throw error;
        } finally {
            hideLoading();
        }
    }

    async claimRewards() {
        if (!this.wallet.account || !this.wallet.contracts.staking) {
            throw new Error('Wallet not connected');
        }
        
        try {
            showLoading('Claiming rewards...');
            
            if (this.wallet.currentNetwork.type === 'EVM') {
                const tx = await this.wallet.contracts.staking.claimRewards();
                await tx.wait();
                
                addTransaction('Claim Rewards', tx.hash, true);
                showNotification('Rewards claimed successfully', 'success');
                await this.updateBalances();
            } else {
                // Cosmos rewards claim logic
            }
        }
          async calculateAPR() {
        if (!this.wallet.account || !this.wallet.contracts.staking) return 0;
        
        try {
            // For EVM chains
            if (this.wallet.currentNetwork.type === 'EVM') {
                const rewardsRate = await this.wallet.contracts.staking.rewardsRate();
                const totalStaked = await this.wallet.contracts.staking.totalStaked();
                
                if (totalStaked.eq(0)) return 0;
                
                const annualRewards = rewardsRate.mul(60 * 60 * 24 * 365);
                const apr = annualRewards.mul(10000).div(totalStaked); // in basis points
                
                return apr.toNumber() / 100; // Convert to percentage
            }
            // For Cosmos chains
            else {
                // Implement Cosmos APR calculation
                return 0;
            }
        } catch (error) {
            console.error('APR calculation error:', error);
            return 0;
        }
    }

    async updateBalances() {
        if (!this.wallet.account) return;
        
        try {
            // For EVM chains
            if (this.wallet.currentNetwork.type === 'EVM') {
                const [lpBalance, stakedBalance, rewardsBalance, totalStaked] = await Promise.all([
                    this.wallet.contracts.lpToken.balanceOf(this.wallet.account),
                    this.wallet.contracts.staking.userStake(this.wallet.account),
                    this.wallet.contracts.staking.earned(this.wallet.account),
                    this.wallet.contracts.staking.totalStaked()
                ]);
                
                const userShare = totalStaked.gt(0) 
                    ? stakedBalance.mul(10000).div(totalStaked).toNumber() / 100 
                    : 0;
                
                const apr = await this.calculateAPR();
                
                updateUI({
                    lpBalance: formatUnits(lpBalance, 18),
                    stakedBalance: formatUnits(stakedBalance, 18),
                    rewardsBalance: formatUnits(rewardsBalance, 18),
                    totalStaked: formatUnits(totalStaked, 18),
                    userShare: userShare.toFixed(2),
                    apr: apr.toFixed(2)
                });
            }
            // For Cosmos chains
            else {
                // Implement Cosmos balance fetching
            }
        } catch (error) {
            console.error('Error updating balances:', error);
        }
    }

    startRewardsMonitoring() {
        if (this.rewardsInterval) clearInterval(this.rewardsInterval);
        
        // Update immediately
        this.updateBalances();
        
        // Then set up periodic updates
        this.rewardsInterval = setInterval(() => {
            this.updateBalances();
        }, 30000); // Update every 30 seconds
    }

    stopRewardsMonitoring() {
        if (this.rewardsInterval) clearInterval(this.rewardsInterval);
        this.rewardsInterval = null;
    }
}

// UI Helper Functions
function formatUnits(value, decimals) {
    return parseFloat(ethers.utils.formatUnits(value, decimals)).toFixed(4);
}

function showLoading(message = 'Processing...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const toast = document.getElementById('transactionToast');
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function addTransaction(type, hash, success) {
    const txHistory = document.getElementById('transactionHistory');
    const emptyState = txHistory.querySelector('.empty-state');
    
    if (emptyState) {
        txHistory.removeChild(emptyState);
    }
    
    const txItem = document.createElement('div');
    txItem.className = 'transaction-item';
    
    const txType = document.createElement('div');
    txType.className = `transaction-type ${success ? 'transaction-success' : 'transaction-failed'}`;
    txType.innerHTML = `
        <i class="fas fa-${getTransactionIcon(type)}"></i>
        <span>${type}</span>
    `;
    
    const txLink = document.createElement('a');
    txLink.href = `${CONFIG[walletManager.currentNetwork?.name]?.network.explorerUrl}/tx/${hash}`;
    txLink.target = '_blank';
    txLink.rel = 'noopener noreferrer';
    txLink.innerHTML = `
        <i class="fas fa-external-link-alt"></i>
        View
    `;
    
    txItem.appendChild(txType);
    txItem.appendChild(txLink);
    txHistory.insertBefore(txItem, txHistory.firstChild);
    
    // Limit to 10 transactions
    if (txHistory.children.length > 10) {
        txHistory.removeChild(txHistory.lastChild);
    }
}

function getTransactionIcon(type) {
    switch(type.toLowerCase()) {
        case 'stake': return 'lock';
        case 'unstake': return 'unlock';
        case 'claim rewards': return 'gift';
        default: return 'exchange-alt';
    }
}

async function fetchABI(path) {
    try {
        const response = await fetch(path);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ABI from ${path}:`, error);
        throw error;
    }
}

function updateUI(data = {}) {
    const walletInfo = walletManager.getWalletInfo();
    
    // Update wallet connection status
    if (walletInfo) {
        document.getElementById('connectButton').innerHTML = `
            <i class="${walletInfo.walletIcon}"></i>
            <span class="btn-text">${walletInfo.shortAddress}</span>
        `;
        
        document.getElementById('networkIndicator').classList.remove('hidden');
        document.getElementById('networkStatusText').textContent = 
            `Connected to ${walletInfo.networkName}`;
            
        // Enable action buttons
        document.getElementById('stakeBtn').disabled = false;
        document.getElementById('unstakeBtn').disabled = false;
        document.getElementById('claimBtn').disabled = false;
    } else {
        document.getElementById('connectButton').innerHTML = `
            <i class="fas fa-wallet"></i>
            <span class="btn-text">Connect</span>
        `;
        
        document.getElementById('networkIndicator').classList.add('hidden');
        
        // Disable action buttons
        document.getElementById('stakeBtn').disabled = true;
        document.getElementById('unstakeBtn').disabled = true;
        document.getElementById('claimBtn').disabled = true;
    }
    
    // Update balances if provided
    if (data.lpBalance) document.getElementById('lpBalance').textContent = data.lpBalance;
    if (data.stakedBalance) document.getElementById('stakedBalance').textContent = data.stakedBalance;
    if (data.rewardsBalance) document.getElementById('rewardsBalance').textContent = data.rewardsBalance;
    if (data.totalStaked) document.getElementById('totalStaked').textContent = `${data.totalStaked} LP`;
    if (data.userShare) document.getElementById('userShare').textContent = `${data.userShare}%`;
    if (data.apr) document.getElementById('aprValue').textContent = `${data.apr}%`;
}

// Initialize the application
const walletManager = new WalletManager();
const stakingManager = new StakingManager(walletManager);

// Event Listeners
document.getElementById('connectButton').addEventListener('click', () => {
    document.getElementById('walletModal').classList.remove('hidden');
});

document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('walletModal').classList.add('hidden');
});

document.querySelectorAll('.wallet-option').forEach(option => {
    option.addEventListener('click', async () => {
        const walletType = option.dataset.wallet;
        document.getElementById('walletModal').classList.add('hidden');
        
        try {
            await walletManager.connectWallet(walletType);
            stakingManager.startRewardsMonitoring();
        } catch (error) {
            console.error('Wallet connection failed:', error);
        }
    });
});

document.querySelectorAll('.network-option').forEach(option => {
    option.addEventListener('click', async () => {
        document.querySelectorAll('.network-option').forEach(btn => {
            btn.classList.remove('active');
        });
        option.classList.add('active');
        
        const networkKey = option.dataset.network;
        try {
            await walletManager.switchNetwork(networkKey);
            stakingManager.startRewardsMonitoring();
        } catch (error) {
            console.error('Network switch failed:', error);
        }
    });
});

document.getElementById('stakeBtn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('stakeAmount').value);
    if (amount > 0) {
        try {
            await stakingManager.stake(amount);
            document.getElementById('stakeAmount').value = '';
        } catch (error) {
            console.error('Staking failed:', error);
        }
    }
});

document.getElementById('unstakeBtn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('unstakeAmount').value);
    if (amount > 0) {
        try {
            await stakingManager.unstake(amount);
            document.getElementById('unstakeAmount').value = '';
        } catch (error) {
            console.error('Unstaking failed:', error);
        }
    }
});

document.getElementById('claimBtn').addEventListener('click', async () => {
    try {
        await stakingManager.claimRewards();
    } catch (error) {
        console.error('Claim rewards failed:', error);
    }
});

document.getElementById('maxStakeBtn').addEventListener('click', () => {
    const lpBalance = parseFloat(document.getElementById('lpBalance').textContent);
    document.getElementById('stakeAmount').value = lpBalance.toFixed(4);
});

document.getElementById('maxUnstakeBtn').addEventListener('click', () => {
    const stakedBalance = parseFloat(document.getElementById('stakedBalance').textContent);
    document.getElementById('unstakeAmount').value = stakedBalance.toFixed(4);
});

document.getElementById('switchNetworkBtn').addEventListener('click', async () => {
    const currentNetwork = walletManager.currentNetwork?.name;
    const newNetwork = currentNetwork === 'POLYGON' ? 'OSMOSIS' : 'POLYGON';
    
    try {
        await walletManager.switchNetwork(newNetwork);
        stakingManager.startRewardsMonitoring();
    } catch (error) {
        console.error('Network switch failed:', error);
    }
});

document.getElementById('disconnectBtn').addEventListener('click', async () => {
    await walletManager.disconnect();
    stakingManager.stopRewardsMonitoring();
});

// Check for wallet connection on page load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.ethereum && window.ethereum.selectedAddress) {
            await walletManager.connectWallet('METAMASK');
            stakingManager.startRewardsMonitoring();
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }
});
