// Secure Configuration Object
const CONFIG = Object.freeze({
    POLYGON: Object.freeze({
        network: Object.freeze({
            chainId: 137,
            name: 'Polygon',
            rpcUrls: Object.freeze([
                'https://polygon-rpc.com',
                'https://rpc-mainnet.matic.quiknode.pro',
                'https://polygon-rpc.com'
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

// Secure ABI Loader with Error Handling
async function loadABIs() {
    try {
        const [stakingABI, lpTokenABI, lqxTokenABI] = await Promise.all([
            fetchABI('abis/LPStaking.json'),
            fetchABI('abis/LPToken.json'),
            fetchABI('abis/LQXToken.json')
        ]);

        // Create new config object instead of modifying original
        const updatedConfig = {
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

        console.log('ABIs loaded successfully');
        return updatedConfig;
    } catch (error) {
        console.error('Failed to load ABIs:', error);
        showErrorToUser('Failed to load contract data. Please refresh the page.');
        return CONFIG; // Return original config if loading fails
    }
}

async function fetchABI(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Secure Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const configWithABIs = await loadABIs();
        initializeApp(configWithABIs);
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

function initializeApp(config) {
    // App initialization logic here
    // Use the config object with ABIs loaded
}
