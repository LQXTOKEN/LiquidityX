'use strict';

// Enhanced Configuration Object
const CONFIG = {
    POLYGON: {
        network: {
            chainId: 137,
            name: 'Polygon Mainnet',
            rpcUrls: [
                'https://polygon-rpc.com',
                'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
                'https://matic-mainnet.chainstacklabs.com'
            ],
            explorerUrl: 'https://polygonscan.com',
            currency: 'MATIC',
            type: 'EVM'
        },
        contracts: {
            staking: {
                address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
                abi: []
            },
            lpToken: {
                address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
                abi: []
            },
            lqxToken: {
                address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
                abi: []
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
        }
    }
};

// State Management
const state = {
    currentAccount: null,
    provider: null,
    signer: null,
    walletType: null,
    network: null,
    contracts: {}
};

// Initialize
async function init() {
    console.log('Initializing application...');
    await loadABIs();
    setupEventListeners();
    console.log('Initialization complete.');
}

async function loadABIs() {
    try {
        const [stakingABI, lpTokenABI, lqxTokenABI] = await Promise.all([
            fetch('/abis/LPStaking.json').then(res => res.json()),
            fetch('/abis/LPToken.json').then(res => res.json()),
            fetch('/abis/LQXToken.json').then(res => res.json())
        ]);

        CONFIG.POLYGON.contracts.staking.abi = stakingABI;
        CONFIG.POLYGON.contracts.lpToken.abi = lpTokenABI;
        CONFIG.POLYGON.contracts.lqxToken.abi = lqxTokenABI;

        console.log('ABIs loaded successfully.');
    } catch (error) {
        console.error('Failed to load ABIs:', error);
    }
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('connectButton').addEventListener('click', connectWallet);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
}

async function connectWallet() {
    if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
    }

    try {
        state.provider = new ethers.providers.Web3Provider(window.ethereum);
        await state.provider.send('eth_requestAccounts', []);
        state.signer = state.provider.getSigner();
        state.currentAccount = await state.signer.getAddress();
        state.walletType = 'MetaMask';

        console.log('Connected account:', state.currentAccount);
        updateUI();
    } catch (error) {
        console.error('Failed to connect wallet:', error);
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
    } else {
        state.currentAccount = accounts[0];
        updateUI();
    }
}

function handleChainChanged(_chainId) {
    window.location.reload();
}

function updateUI() {
    if (state.currentAccount) {
        document.getElementById('walletAddress').textContent = `Connected: ${state.currentAccount}`;
    } else {
        document.getElementById('walletAddress').textContent = 'Not connected';
    }
}

// Initialize the application when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', init);
