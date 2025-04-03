// Configuration
const CONFIG = {
    NETWORK: {
        chainId: 137,
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

// Initialize Web3Modal
const providerOptions = {
    walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
            rpc: {
                137: CONFIG.NETWORK.rpcUrl
            }
        }
    }
};

const web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions,
    theme: 'dark'
});

// App State
let provider, signer, account;
let contracts = {};

// DOM Elements
const connectButton = document.getElementById('connectButton');
const stakeButton = document.getElementById('stakeButton');
const unstakeButton = document.getElementById('unstakeButton');
const claimButton = document.getElementById('claimButton');
const stakeAmountInput = document.getElementById('stakeAmount');
const unstakeAmountInput = document.getElementById('unstakeAmount');
const loadingOverlay = document.getElementById('loadingOverlay');
const notification = document.getElementById('notification');

// Initialize Contracts
function initContracts() {
    contracts = {
        lqx: new ethers.Contract(CONFIG.CONTRACTS.LQX_TOKEN.address, CONFIG.CONTRACTS.LQX_TOKEN.abi, provider),
        lp: new ethers.Contract(CONFIG.CONTRACTS.LP_TOKEN.address, CONFIG.CONTRACTS.LP_TOKEN.abi, provider),
        staking: new ethers.Contract(CONFIG.CONTRACTS.STAKING_CONTRACT.address, CONFIG.CONTRACTS.STAKING_CONTRACT.abi, signer)
    };
}

// Connect Wallet
async function connectWallet() {
    try {
        showLoading("Connecting wallet...");
        
        // Check if MetaMask is installed
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance, "any");
        
        // Check network
        const network = await provider.getNetwork();
        if (network.chainId !== CONFIG.NETWORK.chainId) {
            throw new Error(`Please switch to ${CONFIG.NETWORK.name}`);
        }
        
        signer = provider.getSigner();
        account = await signer.getAddress();
        
        // Initialize contracts
        initContracts();
        
        // Set up event listeners
        instance.on("accountsChanged", () => window.location.reload());
        instance.on("chainChanged", () => window.location.reload());
        
        // Update UI
        updateUI();
        await loadBalances();
        
        showNotification("Wallet connected successfully!", "success");
    } catch (error) {
        console.error("Connection error:", error);
        showNotification(`Connection failed: ${error.message}`, "error");
    } finally {
        hideLoading();
    }
}

// Disconnect Wallet
function disconnectWallet() {
    if (web3Modal.cachedProvider) {
        web3Modal.clearCachedProvider();
    }
    provider = null;
    signer = null;
    account = null;
    contracts = {};
    updateUI();
}

// Update UI State
function updateUI() {
    if (account) {
        connectButton.querySelector('.btn-text').textContent = `${account.substring(0, 6)}...${account.substring(38)}`;
        connectButton.onclick = disconnectWallet;
    } else {
        connectButton.querySelector('.btn-text').textContent = "Connect Wallet";
        connectButton.onclick = connectWallet;
    }
}

// Load Balances
async function loadBalances() {
    if (!account) return;
    
    try {
        showLoading("Loading balances...");
        
        const [lqxBalance, lpBalance, stakedAmount, pendingReward, apr] = await Promise.all([
            contracts.lqx.balanceOf(account).catch(() => ethers.BigNumber.from(0)),
            contracts.lp.balanceOf(account).catch(() => ethers.BigNumber.from(0)),
            contracts.staking.userStake(account).catch(() => ethers.BigNumber.from(0)),
            contracts.staking.earned(account).catch(() => ethers.BigNumber.from(0)),
            contracts.staking.getAPR().catch(() => ethers.BigNumber.from(0))
        ]);
        
        // Update DOM
        document.getElementById('lqxBalance').textContent = ethers.utils.formatUnits(lqxBalance, 18);
        document.getElementById('lpBalance').textContent = ethers.utils.formatUnits(lpBalance, 18);
        document.getElementById('stakedAmount').textContent = ethers.utils.formatUnits(stakedAmount, 18);
        document.getElementById('pendingReward').textContent = ethers.utils.formatUnits(pendingReward, 18);
        document.getElementById('aprValue').textContent = `${ethers.utils.formatUnits(apr, 18)}%`;
        
    } catch (error) {
        console.error("Load balances error:", error);
        showNotification("Failed to load balances", "error");
    } finally {
        hideLoading();
    }
}

// Stake Tokens
async function stakeTokens() {
    if (!account) return;
    
    const amount = stakeAmountInput.value;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        showNotification("Please enter a valid amount", "warning");
        return;
    }
    
    try {
        showLoading("Staking tokens...");
        
        // Approve tokens first
        const approveTx = await contracts.lp.approve(
            CONFIG.CONTRACTS.STAKING_CONTRACT.address,
            ethers.utils.parseUnits(amount, 18)
        );
        await approveTx.wait();
        
        // Then stake
        const stakeTx = await contracts.staking.stake(
            ethers.utils.parseUnits(amount, 18)
        );
        await stakeTx.wait();
        
        // Update balances
        await loadBalances();
        stakeAmountInput.value = "";
        
        showNotification("Tokens staked successfully!", "success");
    } catch (error) {
        console.error("Staking error:", error);
        showNotification(`Staking failed: ${error.message}`, "error");
    } finally {
        hideLoading();
    }
}

// Unstake Tokens
async function unstakeTokens() {
    if (!account) return;
    
    const amount = unstakeAmountInput.value;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        showNotification("Please enter a valid amount", "warning");
        return;
    }
    
    try {
        showLoading("Unstaking tokens...");
        
        const tx = await contracts.staking.unstake(
            ethers.utils.parseUnits(amount, 18)
        );
        await tx.wait();
        
        // Update balances
        await loadBalances();
        unstakeAmountInput.value = "";
        
        showNotification("Tokens unstaked successfully!", "success");
    } catch (error) {
        console.error("Unstaking error:", error);
        showNotification(`Unstaking failed: ${error.message}`, "error");
    } finally {
        hideLoading();
    }
}

// Claim Rewards
async function claimRewards() {
    if (!account) return;
    
    try {
        showLoading("Claiming rewards...");
        
        const tx = await contracts.staking.claimRewards();
        await tx.wait();
        
        // Update balances
        await loadBalances();
        
        showNotification("Rewards claimed successfully!", "success");
    } catch (error) {
        console.error("Claim error:", error);
        showNotification(`Claim failed: ${error.message}`, "error");
    } finally {
        hideLoading();
    }
}

// UI Helpers
function showLoading(message) {
    document.getElementById('loadingText').textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showNotification(message, type = "info") {
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Event Listeners
connectButton.addEventListener('click', connectWallet);
stakeButton.addEventListener('click', stakeTokens);
unstakeButton.addEventListener('click', unstakeTokens);
claimButton.addEventListener('click', claimRewards);

// MAX Buttons (Add these in your HTML)
document.getElementById('maxStakeBtn')?.addEventListener('click', () => {
    stakeAmountInput.value = document.getElementById('lpBalance').textContent;
});

document.getElementById('maxUnstakeBtn')?.addEventListener('click', () => {
    unstakeAmountInput.value = document.getElementById('stakedAmount').textContent;
});

// Initialize
if (web3Modal.cachedProvider) {
    connectWallet();
}
