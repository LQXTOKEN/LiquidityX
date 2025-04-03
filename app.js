const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const { ethers } = window;

const CONFIG = {
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
            "function getAPR() public view returns (uint256)",
            "function rewardPerToken() public view returns (uint256)",
            "function emergencyPause(bool _paused) external",
            "function setAPR(uint256 apr) public"
        ]
    }
};

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: { 137: 'https://polygon-rpc.com' }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
    theme: 'dark'
});

let provider, signer, account;

// Προσθήκη: Έλεγχος αν ο χρήστης είναι στο Polygon Mainnet (chainId: 137)
async function checkNetwork() {
    if (!provider) return false;
    const network = await provider.getNetwork();
    return network.chainId === 137;
}

// Προσθήκη: Disconnect wallet
async function disconnectWallet() {
    if (web3Modal.cachedProvider) {
        web3Modal.clearCachedProvider();
        provider = null;
        signer = null;
        account = null;
        document.getElementById('connectButton').innerText = "Connect Wallet";
        document.getElementById('lqxBalance').innerText = "LQX Balance: 0";
        document.getElementById('lpBalance').innerText = "LP Balance: 0";
    }
}

// Προσθήκη: Ανανέωση balances μετά από συναλλαγές
async function refreshBalances() {
    if (account) await loadBalances();
}

async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance, "any");
        
        // Έλεγχος δικτύου
        if (!(await checkNetwork())) {
            alert("Please switch to Polygon Mainnet (ChainID: 137)");
            await disconnectWallet();
            return;
        }

        signer = provider.getSigner();
        account = await signer.getAddress();
        document.getElementById('connectButton').innerText = `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`;
        
        // Προσθήκη: Ακροατής για αλλαγές λογαριασμού/δικτύου
        instance.on("accountsChanged", () => window.location.reload());
        instance.on("chainChanged", () => window.location.reload());
        
        await loadBalances();
    } catch (error) {
        console.error("Connection error:", error);
        alert("Failed to connect wallet. Please try again.");
    }
}

async function loadBalances() {
    try {
        if (!(await checkNetwork())) {
            alert("Please switch to Polygon Mainnet!");
            return;
        }

        const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN.address, CONFIG.LQX_TOKEN.abi, signer);
        const lpContract = new ethers.Contract(CONFIG.LP_TOKEN.address, CONFIG.LP_TOKEN.abi, signer);

        const [lqxBalance, lpBalance] = await Promise.all([
            lqxContract.balanceOf(account).catch(() => ethers.BigNumber.from(0)),
            lpContract.balanceOf(account).catch(() => ethers.BigNumber.from(0))
        ]);

        document.getElementById('lqxBalance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)}`;
        document.getElementById('lpBalance').innerText = `LP Balance: ${ethers.utils.formatUnits(lpBalance, 18)}`;
    } catch (error) {
        console.error("Error loading balances:", error);
        alert("An error occurred. Please refresh the page.");
    }
}

// Προσθήκη: Stake function με auto-refresh
async function stake(amount) {
    try {
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);
        const tx = await stakingContract.stake(amount);
        await tx.wait();
        await refreshBalances(); // Αυτόματη ανανέωση
    } catch (error) {
        console.error("Stake error:", error);
        alert("Stake failed. Check console for details.");
    }
}

// Προσθήκη: Ενημέρωση UI κατά τη φόρτωση της σελίδας
window.addEventListener('load', () => {
    document.getElementById('connectButton').addEventListener('click', () => {
        if (account) disconnectWallet();
        else connectWallet();
    });
});
