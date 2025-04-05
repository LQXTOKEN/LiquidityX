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
let provider = null;
let signer = null;

// DOM Elements
const connectButton = document.getElementById('connectButton');
const walletStatus = document.getElementById('walletStatus');

// Initialize the application
async function initApp() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            showNotification('MetaMask is not installed!', 'error');
            connectButton.disabled = true;
            return;
        }

        // Load ABIs first
        const configWithABIs = await loadABIs();
        
        // Check if wallet is already connected
        await checkWalletConnection();
        
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

// Secure ABI Loader with CORS handling
async function loadABIs() {
    try {
        const [stakingABI, lpTokenABI, lqxTokenABI] = await Promise.all([
            fetchWithCORS('abis/LPStaking.json'),
            fetchWithCORS('abis/LPToken.json'),
            fetchWithCORS('abis/LQXToken.json')
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

async function fetchWithCORS(path) {
    try {
        const response = await fetch(path, {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Wallet Connection Handler
async function handleWalletConnection() {
    if (!currentAccount) {
        await connectWallet();
    } else {
        await disconnectWallet();
    }
}

async function connectWallet() {
    try {
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        // Initialize provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Check and switch network
        await checkAndSwitchNetwork();

        currentAccount = accounts[0];
        currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        updateWalletStatus();
        showNotification('Wallet connected successfully!', 'success');

        // Initialize contract interactions
        initContractInteractions();
    } catch (error) {
        handleWalletError(error);
    }
}

async function disconnectWallet() {
    try {
        // In MetaMask, there's no direct disconnect, so we just reset state
        currentAccount = null;
        currentChainId = null;
        provider = null;
        signer = null;
        
        updateWalletStatus();
        showNotification('Wallet disconnected', 'info');
    } catch (error) {
        console.error('Disconnect error:', error);
        showNotification('Error disconnecting wallet', 'error');
    }
}

// Check if wallet is already connected
async function checkWalletConnection() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
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
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // Wallet disconnected
            currentAccount = null;
            showNotification('Wallet disconnected', 'warning');
        } else {
            // Account changed
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
    if (!walletStatus) {
        console.error('Wallet status element not found');
        return;
    }

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
    const notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        console.error('Notification container not found');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Manual close
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });
}

// Contract Interactions
function initContractInteractions() {
    if (!currentAccount || !signer) return;
    
    console.log('Initializing contracts for account:', currentAccount);
    // Here you would initialize your contract instances
    // Example:
    // const stakingContract = new ethers.Contract(
    //     CONFIG.POLYGON.contracts.staking.address,
    //     CONFIG.POLYGON.contracts.staking.abi,
    //     signer
    // );
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
