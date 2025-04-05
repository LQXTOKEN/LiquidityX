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

// Enhanced Wallet Definitions with detection methods
const WALLETS = Object.freeze({
    METAMASK: Object.freeze({
        id: 'metamask',
        name: 'MetaMask',
        icon: 'fab fa-ethereum',
        supportedChains: Object.freeze(['EVM']),
        detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
        connect: async () => {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return new ethers.providers.Web3Provider(window.ethereum);
        }
    }),
    TRUSTWALLET: Object.freeze({
        id: 'trustwallet',
        name: 'Trust Wallet',
        icon: 'fas fa-wallet',
        supportedChains: Object.freeze(['EVM']),
        detect: () => typeof window.ethereum !== 'undefined' && window.ethereum.isTrust,
        connect: async () => {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return new ethers.providers.Web3Provider(window.ethereum);
        }
    }),
    KEPLR: Object.freeze({
        id: 'keplr',
        name: 'Keplr',
        icon: 'fas fa-atom',
        supportedChains: Object.freeze(['COSMOS']),
        detect: () => typeof window.keplr !== 'undefined',
        connect: async (chainId) => {
            if (!window.keplr) throw new Error('Keplr extension not found');
            
            await window.keplr.enable(chainId);
            const offlineSigner = window.keplr.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            
            return {
                provider: window.keplr,
                signer: offlineSigner,
                account: accounts[0].address
            };
        }
    }),
    LEAP: Object.freeze({
        id: 'leap',
        name: 'Leap',
        icon: 'fas fa-rocket',
        supportedChains: Object.freeze(['COSMOS']),
        detect: () => typeof window.leap !== 'undefined',
        connect: async (chainId) => {
            if (!window.leap) throw new Error('Leap extension not found');
            
            await window.leap.enable(chainId);
            const offlineSigner = window.leap.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            
            return {
                provider: window.leap,
                signer: offlineSigner,
                account: accounts[0].address
            };
        }
    })
});

// Global State
let currentAccount = null;
let currentChainId = null;
let currentWallet = null;
let provider = null;
let signer = null;
let cosmosProvider = null;

// DOM Elements
const connectButton = document.getElementById('connectButton');
const walletStatus = document.getElementById('walletStatus');
const walletSelector = document.getElementById('walletSelector');

// Initialize the application
async function initApp() {
    try {
        // Initialize wallet selector dropdown
        initWalletSelector();
        
        // Load ABIs first
        const configWithABIs = await loadABIs();
        
        // Check if wallet is already connected from localStorage
        await checkPersistedWalletConnection();
        
        // Set up event listeners
        setupWalletEventListeners();
        
        // Initialize wallet connection button
        connectButton.addEventListener('click', handleWalletConnection);
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize application', 'error');
    }
}

// Initialize wallet selector dropdown
function initWalletSelector() {
    if (!walletSelector) return;
    
    // Clear existing options
    walletSelector.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Wallet';
    walletSelector.appendChild(defaultOption);
    
    // Add detected wallets
    for (const [key, wallet] of Object.entries(WALLETS)) {
        if (wallet.detect()) {
            const option = document.createElement('option');
            option.value = wallet.id;
            option.textContent = wallet.name;
            walletSelector.appendChild(option);
        }
    }
    
    // Add wallet change handler
    walletSelector.addEventListener('change', async (e) => {
        if (e.target.value) {
            await selectWallet(e.target.value);
        }
    });
}

// Select and connect to a specific wallet
async function selectWallet(walletId) {
    try {
        const wallet = Object.values(WALLETS).find(w => w.id === walletId);
        if (!wallet) throw new Error('Wallet not found');
        
        currentWallet = wallet;
        
        if (wallet.supportedChains.includes('EVM')) {
            // EVM wallet connection
            provider = await wallet.connect();
            signer = provider.getSigner();
            currentAccount = await signer.getAddress();
            currentChainId = await provider.getNetwork().then(network => network.chainId);
            
            // Check and switch network if needed
            await checkAndSwitchNetwork();
        } else if (wallet.supportedChains.includes('COSMOS')) {
            // Cosmos wallet connection (default to Osmosis)
            const chainId = CONFIG.OSMOSIS.network.chainId;
            const connection = await wallet.connect(chainId);
            
            cosmosProvider = connection.provider;
            signer = connection.signer;
            currentAccount = connection.account;
            currentChainId = chainId;
        }
        
        // Persist wallet selection
        localStorage.setItem('selectedWallet', walletId);
        
        updateWalletStatus();
        showNotification(`${wallet.name} connected successfully!`, 'success');
        
        // Initialize contract interactions
        initContractInteractions();
    } catch (error) {
        handleWalletError(error);
        walletSelector.value = '';
    }
}

// Check persisted wallet connection from localStorage
async function checkPersistedWalletConnection() {
    const selectedWalletId = localStorage.getItem('selectedWallet');
    if (selectedWalletId) {
        const wallet = Object.values(WALLETS).find(w => w.id === selectedWalletId);
        if (wallet && wallet.detect()) {
            walletSelector.value = selectedWalletId;
            await selectWallet(selectedWalletId);
        } else {
            localStorage.removeItem('selectedWallet');
        }
    }
}

// Wallet Connection Handler
async function handleWalletConnection() {
    if (!currentWallet && walletSelector.value) {
        await selectWallet(walletSelector.value);
        return;
    }
    
    if (!currentAccount) {
        if (currentWallet) {
            await selectWallet(currentWallet.id);
        } else {
            showNotification('Please select a wallet first', 'warning');
        }
    } else {
        await disconnectWallet();
    }
}

async function disconnectWallet() {
    try {
        // Reset all wallet-related state
        currentAccount = null;
        currentChainId = null;
        currentWallet = null;
        provider = null;
        signer = null;
        cosmosProvider = null;
        
        // Remove persisted wallet
        localStorage.removeItem('selectedWallet');
        
        // Reset UI
        if (walletSelector) walletSelector.value = '';
        updateWalletStatus();
        showNotification('Wallet disconnected', 'info');
    } catch (error) {
        console.error('Disconnect error:', error);
        showNotification('Error disconnecting wallet', 'error');
    }
}

// Enhanced Network Handling
async function checkAndSwitchNetwork() {
    if (!currentWallet || !currentWallet.supportedChains.includes('EVM')) return;
    
    const targetChainId = `0x${CONFIG.POLYGON.network.chainId.toString(16)}`;
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (currentChainId !== targetChainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: targetChainId,
                            chainName: CONFIG.POLYGON.network.name,
                            nativeCurrency: {
                                name: CONFIG.POLYGON.network.currency,
                                symbol: CONFIG.POLYGON.network.currency,
                                decimals: 18
                            },
                            rpcUrls: CONFIG.POLYGON.network.rpcUrls,
                            blockExplorerUrls: [CONFIG.POLYGON.network.explorerUrl]
                        }],
                    });
                } catch (addError) {
                    throw new Error(`Failed to add ${CONFIG.POLYGON.network.name} network to wallet`);
                }
            } else {
                throw switchError;
            }
        }
    }
}

// Enhanced Signing Functions
async function signMessage(message) {
    if (!currentAccount || !signer) {
        throw new Error('Wallet not connected');
    }
    
    if (currentWallet.supportedChains.includes('EVM')) {
        // EVM wallet signing
        return await signer.signMessage(message);
    } else if (currentWallet.supportedChains.includes('COSMOS')) {
        // Cosmos wallet signing
        const chainInfo = getChainInfo(currentChainId);
        const signDoc = {
            chain_id: chainInfo.chainId,
            account_number: '0',
            sequence: '0',
            fee: {
                gas: '200000',
                amount: []
            },
            msgs: [{
                type: 'sign/MsgSignData',
                value: {
                    signer: currentAccount,
                    data: Buffer.from(message).toString('base64')
                }
            }],
            memo: ''
        };
        
        if (currentWallet.id === 'keplr') {
            return await window.keplr.signArbitrary(
                chainInfo.chainId,
                currentAccount,
                message
            );
        } else if (currentWallet.id === 'leap') {
            return await window.leap.signArbitrary(
                chainInfo.chainId,
                currentAccount,
                message
            );
        }
    }
}

async function approveTransaction(transaction) {
    if (!currentAccount || !signer) {
        throw new Error('Wallet not connected');
    }
    
    if (currentWallet.supportedChains.includes('EVM')) {
        // EVM wallet transaction approval
        return await signer.sendTransaction(transaction);
    } else if (currentWallet.supportedChains.includes('COSMOS')) {
        // Cosmos wallet transaction approval
        const chainInfo = getChainInfo(currentChainId);
        const { account_number, sequence } = await cosmosProvider.getAccount(currentAccount);
        
        const fee = {
            amount: [],
            gas: transaction.gasLimit || '200000'
        };
        
        const signedTx = await signer.sign(
            currentAccount,
            transaction.msgs,
            fee,
            transaction.memo || '',
            {
                accountNumber: account_number,
                sequence,
                chainId: chainInfo.chainId
            }
        );
        
        return await cosmosProvider.broadcastTx(signedTx);
    }
}

function getChainInfo(chainId) {
    for (const [_, config] of Object.entries(CONFIG)) {
        if (config.network.chainId === chainId || 
            (typeof chainId === 'string' && config.network.chainId.toString() === chainId)) {
            return config.network;
        }
    }
    throw new Error('Chain not supported');
}

// Enhanced UI Updates
function updateWalletStatus() {
    if (!walletStatus) {
        console.error('Wallet status element not found');
        return;
    }

    if (currentAccount) {
        const shortenedAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
        walletStatus.textContent = `${currentWallet.name}: ${shortenedAddress}`;
        walletStatus.style.color = '#4CAF50';
        connectButton.textContent = 'Disconnect';
    } else {
        walletStatus.textContent = 'Not connected';
        walletStatus.style.color = '#f44336';
        connectButton.textContent = 'Connect Wallet';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
