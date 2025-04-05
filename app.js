// Configuration
const CONFIG = {
    NETWORK: {
        polygon: '0x89',
        osmosis: 'osmosis-1'
    },
    CONTRACTS: {
        staking: 'abis/LPStaking.json',
        lpToken: 'abis/LPToken.json',
        lqxToken: 'abis/LQXToken.json'
    }
};

let selectedWallet = null;
let selectedNetwork = null;

// Load ABI Files
async function loadABI(filePath) {
    const response = await fetch(filePath);
    return await response.json();
}

document.getElementById('connectButton').onclick = async () => {
    if (window.ethereum) {
        selectedWallet = 'metamask';
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        document.getElementById('walletStatus').innerText = 'Connected with MetaMask';
    } else {
        alert('MetaMask not installed!');
    }
};

document.getElementById('polygonNetwork').onclick = () => {
    selectedNetwork = 'polygon';
    document.getElementById('walletStatus').innerText = 'Polygon Network Selected';
};

document.getElementById('osmosisNetwork').onclick = () => {
    selectedNetwork = 'osmosis';
    document.getElementById('walletStatus').innerText = 'Osmosis Network Selected';
};

// Example functions to interact with contracts
async function stake() {
    const stakingAbi = await loadABI(CONFIG.CONTRACTS.staking);
    console.log('Loaded Staking ABI:', stakingAbi);
}

document.getElementById('stakeBtn').onclick = stake;
document.getElementById('unstakeBtn').onclick = () => alert('Unstake button clicked!');
document.getElementById('claimBtn').onclick = () => alert('Claim button clicked!');
