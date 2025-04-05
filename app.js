/**
 * LiquidityX Staking DApp - Secure Production Implementation
 * @file app.js
 * @version 1.0.0
 * @license MIT
 */

'use strict';

// Secure configuration with Object.freeze for immutability
const CONFIG = Object.freeze({
    POLYGON: Object.freeze({
        network: Object.freeze({
            chainId: 137,
            name: 'Polygon Mainnet',
            rpcUrls: Object.freeze([
                'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
                'https://polygon-rpc.com/',
                'https://matic-mainnet.chainstacklabs.com'
            ]),
            explorerUrl: 'https://polygonscan.com',
            currency: 'MATIC',
            type: 'EVM',
            blockExplorerUrls: Object.freeze(['https://polygonscan.com'])
        }),
        contracts: Object.freeze({
            staking: Object.freeze({
                address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
                abi: []
            }),
            lpToken: Object.freeze({
                address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
                abi: []
            }),
            lqxToken: Object.freeze({
                address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
                abi: []
            })
        })
    }),
    OSMOSIS: Object.freeze({
        network: Object.freeze({
            chainId: 'osmosis-1',
            name: 'Osmosis',
            rpcUrls: Object.freeze([
                'https://rpc-osmosis.keplr.app',
                'https://osmosis-rpc.polkachu.com',
                'https://rpc-osmosis.blockapsis.com'
            ]),
            explorerUrl: 'https://www.mintscan.io/osmosis',
            currency: 'OSMO',
            type: 'COSMOS'
        })
    })
});

// Wallet detectors with strict validation
const WALLET_DETECTORS = Object.freeze({
    METAMASK: Object.freeze({
        id: 'metamask',
        name: 'MetaMask',
        icon: 'fab fa-ethereum',
        supportedChains: Object.freeze(['EVM']),
        detect: () => {
            try {
                return Boolean(
                    typeof window.ethereum !== 'undefined' &&
                    window.ethereum.isMetaMask &&
                    typeof window.ethereum.request === 'function' &&
                    typeof window.ethereum.on === 'function'
                );
            } catch (error) {
                console.error('MetaMask detection error:', error);
                return false;
            }
        },
        connect: async () => {
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts',
                    params: []
                });
                
                if (!Array.isArray(accounts) || accounts.length === 0) {
                    throw new Error('No accounts returned');
                }
                
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                
                return { provider, signer, account: accounts[0] };
            } catch (error) {
                console.error('MetaMask connection error:', error);
                throw new Error(`Failed to connect MetaMask: ${error.message}`);
            }
        }
    }),
    KEPLR: Object.freeze({
        id: 'keplr',
        name: 'Keplr',
        icon: 'fas fa-atom',
        supportedChains: Object.freeze(['COSMOS']),
        detect: () => {
            try {
                return Boolean(
                    typeof window.keplr !== 'undefined' &&
                    typeof window.keplr.enable === 'function' &&
                    typeof window.keplr.getOfflineSigner === 'function'
                );
            } catch (error) {
                console.error('Keplr detection error:', error);
                return false;
            }
        },
        connect: async (chainId) => {
            try {
                if (!chainId || typeof chainId !== 'string') {
                    throw new Error('Invalid chain ID');
                }
                
                await window.keplr.enable(chainId);
                const offlineSigner = window.keplr.getOfflineSigner(chainId);
                const accounts = await offlineSigner.getAccounts();
                
                if (!accounts || accounts.length === 0) {
                    throw new Error('No accounts available');
                }
                
                return {
                    provider: window.keplr,
                    signer: offlineSigner,
                    account: accounts[0].address
                };
            } catch (error) {
                console.error('Keplr connection error:', error);
                throw new Error(`Failed to connect Keplr: ${error.message}`);
            }
        }
    })
});

// Secure state management
class AppState {
    constructor() {
        this._currentAccount = null;
        this._currentChainId = null;
        this._currentWallet = null;
        this._provider = null;
        this._signer = null;
        this._contracts = {};
        this._isInitialized = false;
    }

    // Getters with validation
    get currentAccount() {
        return this._currentAccount;
    }

    get currentChainId() {
        return this._currentChainId;
    }

    get currentWallet() {
        return this._currentWallet;
    }

    get provider() {
        return this._provider;
    }

    get signer() {
        return this._signer;
    }

    get contracts() {
        return Object.freeze({...this._contracts});
    }

    get isInitialized() {
        return this._isInitialized;
    }

    // Setters with validation
    set currentAccount(value) {
        if (value && typeof value !== 'string') {
            throw new Error('Account must be a string');
        }
        this._currentAccount = value;
    }

    // ... other setters with validation

    initializeContracts(contracts) {
        if (!contracts || typeof contracts !== 'object') {
            throw new Error('Invalid contracts object');
        }
        this._contracts = {...contracts};
        this._isInitialized = true;
    }

    reset() {
        this._currentAccount = null;
        this._currentChainId = null;
        this._currentWallet = null;
        this._provider = null;
        this._signer = null;
        this._contracts = {};
        this._isInitialized = false;
    }
}

// Main application class
class LiquidityXApp {
    constructor() {
        this.state = new AppState();
        this._bindMethods();
        this._setupDOMReferences();
        this._setupEventListeners();
        this._setupErrorHandling();
    }

    _bindMethods() {
        this.init = this.init.bind(this);
        this.connectWallet = this.connectWallet.bind(this);
        this.disconnectWallet = this.disconnectWallet.bind(this);
        this.handleWalletError = this.handleWalletError.bind(this);
        this._updateUI = this._updateUI.bind(this);
        this._showNotification = this._showNotification.bind(this);
    }

    _setupDOMReferences() {
        this.connectButton = document.getElementById('connectButton');
        this.walletStatus = document.getElementById('walletStatus');
        this.walletModal = document.getElementById('walletModal');
        this.stakeBtn = document.getElementById('stakeBtn');
        this.unstakeBtn = document.getElementById('unstakeBtn');
        this.claimBtn = document.getElementById('claimBtn');
        this.notificationContainer = document.getElementById('notificationContainer');
        
        if (!this.connectButton || !this.walletStatus) {
            throw new Error('Critical DOM elements missing');
        }
    }

    _setupEventListeners() {
        this.connectButton.addEventListener('click', this.connectWallet);
        
        // Wallet modal events
        document.querySelectorAll('.wallet-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const walletId = e.currentTarget.id.replace('Option', '').toUpperCase();
                this.connectWallet(walletId);
            });
        });
        
        // Transaction buttons
        if (this.stakeBtn) {
            this.stakeBtn.addEventListener('click', this._handleStake);
        }
        
        // Window events
        window.addEventListener('error', this._handleGlobalError);
        window.addEventListener('unhandledrejection', this._handlePromiseRejection);
    }

    _setupErrorHandling() {
        this._handleGlobalError = (event) => {
            console.error('Global error:', event.error);
            this._showNotification('An unexpected error occurred', 'error');
        };
        
        this._handlePromiseRejection = (event) => {
            console.error('Unhandled rejection:', event.reason);
            this._showNotification('An operation failed', 'error');
        };
    }

    async init() {
        try {
            await this._loadABIs();
            await this._checkPersistedSession();
            this._updateUI();
            this._showNotification('Application ready', 'success');
        } catch (error) {
            this.handleWalletError(error);
        }
    }

    async _loadABIs() {
        try {
            const [stakingABI, lpTokenABI, lqxTokenABI] = await Promise.all([
                this._fetchABI('/abis/staking.json'),
                this._fetchABI('/abis/lpToken.json'),
                this._fetchABI('/abis/lqxToken.json')
            ]);
            
            const contracts = {
                staking: new ethers.Contract(
                    CONFIG.POLYGON.contracts.staking.address,
                    stakingABI
                ),
                lpToken: new ethers.Contract(
                    CONFIG.POLYGON.contracts.lpToken.address,
                    lpTokenABI
                ),
                lqxToken: new ethers.Contract(
                    CONFIG.POLYGON.contracts.lqxToken.address,
                    lqxTokenABI
                )
            };
            
            this.state.initializeContracts(contracts);
        } catch (error) {
            console.error('ABI loading failed:', error);
            throw new Error('Failed to load contract ABIs');
        }
    }

    async _fetchABI(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const abi = await response.json();
            
            if (!Array.isArray(abi)) {
                throw new Error('Invalid ABI format');
            }
            
            return abi;
        } catch (error) {
            console.error(`Failed to fetch ABI from ${url}:`, error);
            throw error;
        }
    }

    async _checkPersistedSession() {
        try {
            const walletId = localStorage.getItem('selectedWallet');
            
            if (walletId && WALLET_DETECTORS[walletId]?.detect()) {
                await this.connectWallet(walletId);
            }
        } catch (error) {
            console.error('Session restoration failed:', error);
            localStorage.removeItem('selectedWallet');
        }
    }

    async connectWallet(walletId) {
        try {
            const wallet = WALLET_DETECTORS[walletId];
            
            if (!wallet || !wallet.detect()) {
                throw new Error(`${walletId} wallet not available`);
            }
            
            this._showNotification(`Connecting to ${wallet.name}...`, 'info');
            
            let connection;
            if (wallet.supportedChains.includes('EVM')) {
                connection = await this._connectEVMWallet(wallet);
            } else if (wallet.supportedChains.includes('COSMOS')) {
                connection = await this._connectCosmosWallet(wallet);
            } else {
                throw new Error('Unsupported chain type');
            }
            
            this.state.currentAccount = connection.account;
            this.state.currentWallet = wallet;
            this.state.provider = connection.provider;
            this.state.signer = connection.signer;
            
            if (wallet.supportedChains.includes('EVM')) {
                this.state.currentChainId = await connection.provider.getNetwork()
                    .then(network => network.chainId);
            }
            
            localStorage.setItem('selectedWallet', walletId);
            this._showNotification(`${wallet.name} connected`, 'success');
            this._updateUI();
            
            // Initialize balances and contracts
            await this._initializeBalances();
        } catch (error) {
            this.handleWalletError(error);
        }
    }

    async _connectEVMWallet(wallet) {
        try {
            const { provider, signer, account } = await wallet.connect();
            
            // Set up event listeners for EVM wallet
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.state.currentAccount = accounts[0];
                    this._updateUI();
                }
            });
            
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
            
            return { provider, signer, account };
        } catch (error) {
            console.error('EVM wallet connection failed:', error);
            throw error;
        }
    }

    async _connectCosmosWallet(wallet) {
        try {
            const chainId = CONFIG.OSMOSIS.network.chainId;
            const connection = await wallet.connect(chainId);
            
            this.state.currentChainId = chainId;
            return connection;
        } catch (error) {
            console.error('Cosmos wallet connection failed:', error);
            throw error;
        }
    }

    async disconnectWallet() {
        try {
            this.state.reset();
            localStorage.removeItem('selectedWallet');
            this._updateUI();
            this._showNotification('Wallet disconnected', 'info');
        } catch (error) {
            console.error('Disconnect failed:', error);
            this._showNotification('Failed to disconnect wallet', 'error');
        }
    }

    async _initializeBalances() {
        if (!this.state.isInitialized) return;
        
        try {
            // Load all balances in parallel
            const [lqxBalance, lpBalance, stakedAmount, pendingReward] = await Promise.all([
                this._getTokenBalance('lqxToken'),
                this._getTokenBalance('lpToken'),
                this._getStakedAmount(),
                this._getPendingReward()
            ]);
            
            // Update UI with balances
            this._updateBalanceUI('lqxBalance', lqxBalance);
            this._updateBalanceUI('lpBalance', lpBalance);
            this._updateBalanceUI('stakedAmount', stakedAmount);
            this._updateBalanceUI('pendingReward', pendingReward);
        } catch (error) {
            console.error('Balance initialization failed:', error);
            this._showNotification('Failed to load balances', 'error');
        }
    }

    async _getTokenBalance(tokenContract) {
        try {
            if (!this.state.currentAccount || !this.state.contracts[tokenContract]) {
                return '0';
            }
            
            const balance = await this.state.contracts[tokenContract]
                .balanceOf(this.state.currentAccount);
            
            return ethers.utils.formatUnits(balance, 18);
        } catch (error) {
            console.error(`Failed to get ${tokenContract} balance:`, error);
            return '0';
        }
    }

    async _getStakedAmount() {
        // Implementation for getting staked amount
        return '0'; // Placeholder
    }

    async _getPendingReward() {
        // Implementation for getting pending reward
        return '0'; // Placeholder
    }

    _updateBalanceUI(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    _updateUI() {
        // Update wallet connection status
        if (this.state.currentAccount) {
            const shortAddress = `${this.state.currentAccount.substring(0, 6)}...${this.state.currentAccount.substring(this.state.currentAccount.length - 4)}`;
            this.walletStatus.textContent = `${this.state.currentWallet.name}: ${shortAddress}`;
            this.connectButton.textContent = 'Disconnect';
            
            // Show wallet info section
            document.getElementById('walletInfo').classList.remove('hidden');
            document.getElementById('walletAddress').textContent = shortAddress;
            
            // Update network info
            const networkInfo = CONFIG.POLYGON.network.name;
            document.getElementById('networkInfo').textContent = networkInfo;
        } else {
            this.walletStatus.textContent = 'Not connected';
            this.connectButton.textContent = 'Connect Wallet';
            
            // Hide wallet info section
            document.getElementById('walletInfo').classList.add('hidden');
        }
        
        // Update wallet modal options
        this._updateWalletOptions();
    }

    _updateWalletOptions() {
        Object.values(WALLET_DETECTORS).forEach(wallet => {
            const statusElement = document.getElementById(`${wallet.id}Status`);
            if (statusElement) {
                statusElement.textContent = wallet.detect() ? 'Available' : 'Not Detected';
                statusElement.className = `wallet-status ${wallet.detect() ? 'available' : 'unavailable'}`;
            }
        });
    }

    _showNotification(message, type) {
        if (!this.notificationContainer) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    handleWalletError(error) {
        console.error('Wallet error:', error);
        this._showNotification(error.message || 'Wallet operation failed', 'error');
        this.state.reset();
        this._updateUI();
    }

    // Transaction handlers
    async _handleStake() {
        if (!this.state.currentAccount) {
            this._showNotification('Please connect your wallet first', 'warning');
            return;
        }
        
        try {
            const amount = document.getElementById('stakeAmount').value;
            
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                this._showNotification('Please enter a valid amount', 'warning');
                return;
            }
            
            this._showLoading('Staking LP tokens...');
            
            // Approve first if needed
            const allowance = await this.state.contracts.lpToken
                .allowance(this.state.currentAccount, CONFIG.POLYGON.contracts.staking.address);
            
            const amountWei = ethers.utils.parseUnits(amount, 18);
            
            if (allowance.lt(amountWei)) {
                await this._approveToken('lpToken', amountWei);
            }
            
            // Execute stake
            const tx = await this.state.contracts.staking
                .connect(this.state.signer)
                .stake(amountWei);
            
            await this._waitForTransaction(tx, 'Staking');
            this._showNotification('Successfully staked LP tokens', 'success');
            
            // Refresh balances
            await this._initializeBalances();
        } catch (error) {
            this.handleWalletError(error);
        } finally {
            this._hideLoading();
        }
    }

    async _approveToken(token, amount) {
        try {
            this._showLoading(`Approving ${token}...`);
            
            const tx = await this.state.contracts[token]
                .connect(this.state.signer)
                .approve(CONFIG.POLYGON.contracts.staking.address, amount);
            
            await this._waitForTransaction(tx, 'Approval');
            this._showNotification(`${token} approved`, 'success');
        } catch (error) {
            console.error(`Failed to approve ${token}:`, error);
            throw error;
        }
    }

    async _waitForTransaction(tx, action) {
        try {
            this._updateTxDetails(tx, action);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 0) {
                throw new Error('Transaction failed');
            }
            
            return receipt;
        } catch (error) {
            console.error('Transaction error:', error);
            throw error;
        }
    }

    _updateTxDetails(tx, action) {
        document.getElementById('loadingText').textContent = `${action} in progress...`;
        document.getElementById('txWallet').textContent = this.state.currentWallet?.name || 'Unknown';
        document.getElementById('txNetwork').textContent = CONFIG.POLYGON.network.name;
        document.getElementById('txHash').textContent = `${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}`;
        
        const explorerUrl = `${CONFIG.POLYGON.network.explorerUrl}/tx/${tx.hash}`;
        document.getElementById('txLink').href = explorerUrl;
    }

    _showLoading(message) {
        document.getElementById('loadingText').textContent = message || 'Processing...';
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    _hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new LiquidityXApp();
        app.init();
    } catch (error) {
        console.error('Application initialization failed:', error);
        
        // Show error message to user
        document.body.innerHTML = `
            <div class="error-container">
                <h2>Application Error</h2>
                <p>Failed to initialize the application. Please try refreshing the page.</p>
                <p>If the problem persists, please contact support.</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
});
