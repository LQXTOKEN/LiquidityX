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
        },
        contracts: {
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

// Loading ABIs from abis folder
async function loadABIs() {
    const stakingABI = await fetch('abis/LPStaking.json').then(res => res.json());
    const lpTokenABI = await fetch('abis/LPToken.json').then(res => res.json());
    const lqxTokenABI = await fetch('abis/LQXToken.json').then(res => res.json());

    CONFIG.POLYGON.contracts.staking.abi = stakingABI;
    CONFIG.POLYGON.contracts.lpToken.abi = lpTokenABI;
    CONFIG.POLYGON.contracts.lqxToken.abi = lqxTokenABI;

    console.log('ABIs loaded successfully');
}

window.addEventListener('DOMContentLoaded', loadABIs);

