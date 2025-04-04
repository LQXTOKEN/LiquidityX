// Configuration
const CONFIG = {
    NETWORK: {
        chainId: 137, // Polygon Mainnet
        name: "Polygon Mainnet",
        rpcUrl: "https://polygon-rpc.com",
        explorerUrl: "https://polygonscan.com",
        currency: "MATIC"
    },
    CONTRACTS: {
        LQX_TOKEN: {
            address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
            abi: ["function balanceOf(address account) view returns (uint256)"]
        },
        LP_TOKEN: {
            address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
            abi: [
                "function balanceOf(address account) view returns (uint256)",
                "function approve(address spender, uint256 amount) public returns (bool)"
            ]
        },
        STAKING_CONTRACT: {
            address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
            abi: [
                "function stake(uint256 amount) external",
                "function unstake(uint256 amount) external",
                "function claimRewards() external",
                "function userStake(address account) external view returns (uint256)",
                "function earned(address account) external view returns (uint256)",
                "function getAPR() public view returns (uint256)"
            ]
        }
    }
};

let provider, signer, account;
let contracts = {};

function initContracts() {
    contracts = {
        lqx: new ethers.Contract(CONFIG.CONTRACTS.LQX_TOKEN.address, CONFIG.CONTRACTS.LQX_TOKEN.abi, signer),
        lp: new ethers.Contract(CONFIG.CONTRACTS.LP_TOKEN.address, CONFIG.CONTRACTS.LP_TOKEN.abi, signer),
        staking: new ethers.Contract(CONFIG.CONTRACTS.STAKING_CONTRACT.address, CONFIG.CONTRACTS.STAKING_CONTRACT.abi, signer)
    };
}

// Initialize Web3Modal with proper defaults
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                137: CONFIG.NETWORK.rpcUrl
            }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions
});

// Συνάρτηση για να συνδέσει το πορτοφόλι
async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();
        account = await signer.getAddress();

        initContracts();
        await loadBalances();
        showNotification('Wallet connected successfully!', 'success');
    } catch (error) {
        console.error(error);
        showNotification('Failed to connect wallet.', 'error');
    }
}

async function loadBalances() {
    const lqxBalance = await contracts.lqx.balanceOf(account);
    const lpBalance = await contracts.lp.balanceOf(account);
    const stakedAmount = await contracts.staking.userStake(account);
    const pendingReward = await contracts.staking.earned(account);
    const apr = await contracts.staking.getAPR();

    document.getElementById('lqxBalance').textContent = ethers.utils.formatUnits(lqxBalance, 18);
    document.getElementById('lpBalance').textContent = ethers.utils.formatUnits(lpBalance, 18);
    document.getElementById('stakedAmount').textContent = ethers.utils.formatUnits(stakedAmount, 18);
    document.getElementById('pendingReward').textContent = ethers.utils.formatUnits(pendingReward, 18);
    document.getElementById('aprValue').textContent = `${apr}%`;
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.className = notification.className.replace('show', '');
    }, 5000);
}

// Event listeners
const connectButton = document.getElementById('connectButton');
connectButton.addEventListener('click', connectWallet);
