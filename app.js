// Secure Configuration Object
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
    })
});

// Wallet Definitions
const WALLETS = Object.freeze({
    METAMASK: Object.freeze({
        id: 'metamask',
        name: 'MetaMask',
        icon: 'fab fa-ethereum',
        supportedChains: Object.freeze(['EVM'])
    }),
    TRUSTWALLET: Object.freeze({
        id: 'trustwallet',
        name: 'Trust Wallet',
        icon: 'fas fa-wallet',
        supportedChains: Object.freeze(['EVM'])
    }),
    KEPLR: Object.freeze({
        id: 'keplr',
        name: 'Keplr',
        icon: 'fas fa-atom',
        supportedChains: Object.freeze(['COSMOS'])
    }),
    LEAP: Object.freeze({
        id: 'leap',
        name: 'Leap',
        icon: 'fas fa-rocket',
        supportedChains: Object.freeze(['COSMOS'])
    })
});

// Global State
let currentAccount = null;
let currentChainId = null;

// DOM Elements
const connectButton = document.getElementById('connectButton');
const walletStatus = document.getElementById('walletStatus');

// Initialize the application
async function initApp() {
    try {
        // Load ABIs first
        const configWithABIs = await loadABIs();
        
        // Check if wallet is already connected
        if (window.ethereum) {
            await checkWalletConnection();
            
            // Set up event listeners
            setupWalletEventListeners();
        }
        
        // Initialize wallet connection button
        connectButton.addEventListener('click', handleWalletConnection);
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize application', 'error');
    }
}

// Secure ABI Loader
async function loadABIs() {
    try {
        const [stakingABI, lpTokenABI, lqxTokenABI] = await Promise.all([
            fetchABI('abis/LPStaking.json'),
            fetchABI('abis/LPToken.json'),
            fetchABI('abis/LQXToken.json')
        ]);

        return {
            ...CONFIG,
            POLYGON: {
                ...CONFIG.POLYGON,
                contracts: {
                    staking: { ...CONFIG.POLYGON.contracts.staking, abi: stakingABI },
                    lpToken: { ...CONFIG.POLYGON.contracts.lpToken, abi: lpTokenABI },
                    lqxToken: { ...CONFIG.POLYGON.contracts.lqxToken, abi: lqxTokenABI }
                }
            }
        };
    } catch (error) {
        console.error('Failed to load ABIs:', error);
        showNotification('Failed to load contract data', 'error');
        return CONFIG;
    }
}

async function fetchABI(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Wallet Connection Handler
async function handleWalletConnection() {
    if (!window.ethereum) {
        showNotification('Please install MetaMask!', 'error');
        window.open('https://metamask.io/download.html', '_blank');
        return;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        // Check network
        await checkAndSwitchNetwork();

        currentAccount = accounts[0];
        updateWalletStatus();
        showNotification('Wallet connected successfully!', 'success');

        // Initialize contract interactions
        initContractInteractions();
    } catch (error) {
        handleWalletError(error);
    }
}

// Check if wallet is already connected
async function checkWalletConnection() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            currentAccount = accounts[0];
            currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            updateWalletStatus();
            initContractInteractions();
        }
    } catch (error) {
        console.error('Error checking wallet connection:', error);
    }
}

// Network Handling
async function checkAndSwitchNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== '0x89') { // 0x89 = Polygon in hex
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x89' }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x89',
                            chainName: 'Polygon Mainnet',
                            nativeCurrency: {
                                name: 'MATIC',
                                symbol: 'MATIC',
                                decimals: 18
                            },
                            rpcUrls: CONFIG.POLYGON.network.rpcUrls,
                            blockExplorerUrls: [CONFIG.POLYGON.network.explorerUrl]
                        }],
                    });
                } catch (addError) {
                    throw new Error('Failed to add Polygon network to MetaMask');
                }
            } else {
                throw switchError;
            }
        }
    }
}

// Event Listeners
function setupWalletEventListeners() {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            currentAccount = null;
            showNotification('Wallet disconnected', 'warning');
        } else {
            currentAccount = accounts[0];
            showNotification('Account changed', 'info');
        }
        updateWalletStatus();
    });

    window.ethereum.on('chainChanged', (chainId) => {
        currentChainId = chainId;
        window.location.reload();
    });

    window.ethereum.on('disconnect', (error) => {
        currentAccount = null;
        showNotification(`Wallet disconnected: ${error.message}`, 'error');
        updateWalletStatus();
    });
}

// Error Handling
function handleWalletError(error) {
    console.error('Wallet error:', error);
    
    let message = 'Wallet connection error';
    if (error.code === 4001) {
        message = 'Connection rejected by user';
    } else if (error.code === -32002) {
        message = 'Connection request already pending';
    } else if (error.message.includes('Network changed')) {
        message = 'Please switch to Polygon network';
    }
    
    showNotification(message, 'error');
}

// UI Updates
function updateWalletStatus() {
    if (currentAccount) {
        const shortenedAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
        walletStatus.textContent = `Connected: ${shortenedAddress}`;
        walletStatus.style.color = '#4CAF50';
        connectButton.textContent = 'Disconnect';
    } else {
        walletStatus.textContent = 'Not connected';
        walletStatus.style.color = '#f44336';
        connectButton.textContent = 'Connect Wallet';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Contract Interactions
function initContractInteractions() {
    if (!currentAccount) return;
    
    // Initialize your contract interactions here
    console.log('Initializing contracts for account:', currentAccount);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
