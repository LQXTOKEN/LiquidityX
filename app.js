// Secure Wallet Integration Module
(function() {
    'use strict';
    
    // Enhanced Secure Configuration Object
    const CONFIG = Object.freeze({
        POLYGON: Object.freeze({
            network: Object.freeze({
                chainId: 137,
                name: 'Polygon',
                rpcUrls: Object.freeze([
                    'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
                    'https://polygon-rpc.com/',
                    'https://matic-mainnet.chainstacklabs.com'
                ]),
                explorerUrl: 'https://polygonscan.com',
                currency: 'MATIC',
                type: 'EVM'
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
            }),
            contracts: Object.freeze({})
        }),
        COSMOS_HUB: Object.freeze({
            network: Object.freeze({
                chainId: 'cosmoshub-4',
                name: 'Cosmos Hub',
                rpcUrls: Object.freeze([
                    'https://rpc-cosmoshub.keplr.app',
                    'https://cosmos-rpc.polkachu.com'
                ]),
                explorerUrl: 'https://www.mintscan.io/cosmos',
                currency: 'ATOM',
                type: 'COSMOS'
            }),
            contracts: Object.freeze({})
        })
    });

    // Secure Wallet Definitions with sanitization
    const WALLETS = Object.freeze({
        METAMASK: Object.freeze({
            id: 'metamask',
            name: 'MetaMask',
            icon: 'fab fa-ethereum',
            supportedChains: Object.freeze(['EVM']),
            detect: () => isDefined(window.ethereum) && isMetaMask(window.ethereum),
            connect: async () => {
                validateEthereumProvider();
                const accounts = await requestAccountsSafely();
                return initializeEthersProvider(accounts);
            }
        }),
        KEPLR: Object.freeze({
            id: 'keplr',
            name: 'Keplr',
            icon: 'fas fa-atom',
            supportedChains: Object.freeze(['COSMOS']),
            detect: () => isDefined(window.keplr),
            connect: async (chainId) => {
                validateChainId(chainId);
                await enableKeplr(chainId);
                return getKeplrAccount(chainId);
            }
        })
    });

    // Security utility functions
    function isDefined(obj) {
        return typeof obj !== 'undefined' && obj !== null;
    }

    function isMetaMask(ethereum) {
        try {
            return ethereum.isMetaMask && 
                   typeof ethereum.request === 'function' &&
                   typeof ethereum.on === 'function';
        } catch (e) {
            return false;
        }
    }

    function validateEthereumProvider() {
        if (!isDefined(window.ethereum) || !window.ethereum.request) {
            throw new Error('Ethereum provider not available');
        }
    }

    async function requestAccountsSafely() {
        try {
            return await window.ethereum.request({ 
                method: 'eth_requestAccounts',
                params: [] // Explicit empty params for security
            });
        } catch (error) {
            throw new Error(`Account request failed: ${error.message}`);
        }
    }

    function initializeEthersProvider(accounts) {
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts available');
        }
        return new ethers.providers.Web3Provider(window.ethereum);
    }

    function validateChainId(chainId) {
        if (!chainId || typeof chainId !== 'string') {
            throw new Error('Invalid chain ID');
        }
    }

    async function enableKeplr(chainId) {
        try {
            await window.keplr.enable(chainId);
        } catch (error) {
            throw new Error(`Failed to enable Keplr: ${error.message}`);
        }
    }

    async function getKeplrAccount(chainId) {
        try {
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
            throw new Error(`Failed to get Keplr account: ${error.message}`);
        }
    }

    // Main application class
    class WalletIntegration {
        constructor() {
            this.currentAccount = null;
            this.currentChainId = null;
            this.currentWallet = null;
            this.provider = null;
            this.signer = null;
            this.cosmosProvider = null;
        }

        async init() {
            try {
                this.setupDOMReferences();
                this.initWalletSelector();
                await this.checkPersistedWallet();
                this.setupEventListeners();
                console.log('Wallet integration initialized securely');
            } catch (error) {
                this.handleError('Initialization failed', error);
            }
        }

        setupDOMReferences() {
            this.connectButton = document.getElementById('connectButton');
            this.walletStatus = document.getElementById('walletStatus');
            this.walletSelector = document.getElementById('walletSelector');
            
            if (!this.connectButton || !this.walletStatus || !this.walletSelector) {
                throw new Error('Required DOM elements not found');
            }
        }

        initWalletSelector() {
            this.walletSelector.innerHTML = '<option value="">Select Wallet</option>';
            
            Object.values(WALLETS).forEach(wallet => {
                if (wallet.detect()) {
                    const option = document.createElement('option');
                    option.value = wallet.id;
                    option.textContent = wallet.name;
                    this.walletSelector.appendChild(option);
                }
            });
            
            this.walletSelector.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.selectWallet(e.target.value).catch(error => {
                        this.handleError('Wallet selection failed', error);
                    });
                }
            });
        }

        async selectWallet(walletId) {
            const wallet = Object.values(WALLETS).find(w => w.id === walletId);
            if (!wallet) throw new Error('Invalid wallet selected');

            this.currentWallet = wallet;
            
            if (wallet.supportedChains.includes('EVM')) {
                await this.connectEVMWallet(wallet);
            } else if (wallet.supportedChains.includes('COSMOS')) {
                await this.connectCosmosWallet(wallet);
            }

            this.persistWalletSelection(walletId);
            this.updateUI();
        }

        async connectEVMWallet(wallet) {
            const { provider, signer, account } = await wallet.connect();
            this.provider = provider;
            this.signer = signer;
            this.currentAccount = account;
            this.currentChainId = await provider.getNetwork().then(n => n.chainId);
            
            await this.ensureCorrectNetwork();
        }

        async connectCosmosWallet(wallet) {
            const chainId = CONFIG.OSMOSIS.network.chainId;
            const { provider, signer, account } = await wallet.connect(chainId);
            
            this.cosmosProvider = provider;
            this.signer = signer;
            this.currentAccount = account;
            this.currentChainId = chainId;
        }

        persistWalletSelection(walletId) {
            localStorage.setItem('selectedWallet', walletId);
        }

        async checkPersistedWallet() {
            const walletId = localStorage.getItem('selectedWallet');
            if (walletId && WALLETS[walletId]?.detect()) {
                await this.selectWallet(walletId);
            }
        }

        updateUI() {
            if (this.currentAccount) {
                const shortAddress = `${this.currentAccount.substring(0, 6)}...${this.currentAccount.slice(-4)}`;
                this.walletStatus.textContent = `${this.currentWallet.name}: ${shortAddress}`;
                this.connectButton.textContent = 'Disconnect';
            } else {
                this.walletStatus.textContent = 'Not connected';
                this.connectButton.textContent = 'Connect Wallet';
            }
        }

        handleError(context, error) {
            console.error(`${context}:`, error);
            this.showNotification(`${context}: ${error.message}`, 'error');
        }

        showNotification(message, type) {
            // Implement secure notification system
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const walletIntegration = new WalletIntegration();
        walletIntegration.init().catch(error => {
            console.error('Failed to initialize wallet integration:', error);
        });
    });

})();
