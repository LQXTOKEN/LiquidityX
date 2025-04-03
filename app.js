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

const web3Modal = new Web3Modal({
    cacheProvider: true, // Enable cache for auto-reconnect
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
const maxStakeBtn = document.getElementById('maxStakeBtn');
const maxUnstakeBtn = document.getElementById('maxUnstakeBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const notification = document.getElementById('notification');

// Initialize Contracts
function initContracts() {
    contracts = {
        lqx: new ethers.Contract(
            CONFIG.CONTRACTS.LQX_TOKEN.address, 
            CONFIG.CONTRACTS.LQX_TOKEN.abi, 
            provider
        ),
        lp: new ethers.Contract(
            CONFIG.CONTRACTS.LP_TOKEN.address, 
            CONFIG.CONTRACTS.LP_TOKEN.abi, 
            provider
        ),
        staking: new ethers.Contract(
            CONFIG.CONTRACTS.STAKING_CONTRACT.address, 
            CONFIG.CONTRACTS.STAKING_CONTRACT.abi, 
            signer
        )
    };
}

// Connect Wallet (MetaMask/WalletConnect)
async function connectWallet() {
    try {
        showLoading("Connecting wallet...");
        
        // 1. Connect via Web3Modal
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance, "any");
        
        // 2. Check network
        const network = await provider.getNetwork();
        if (network.chainId !== CONFIG.NETWORK.chainId) {
            await switchToCorrectNetwork(provider);
        }
        
        // 3. Get signer and account
        signer = provider.getSigner();
        account = await signer.getAddress();
        
        // 4. Update UI
        updateWalletUI(account);
        
        // 5. Initialize contracts and load data
        initContracts();
        await loadBalances();
        
        // 6. Setup event listeners
        setupEventListeners(instance);
        
        showNotification("Wallet connected successfully!", "success");
    } catch (error) {
        console.error("Connection error:", error);
        showNotification(
            error.message.includes("rejected") 
                ? "Connection canceled" 
                : "Connection failed. Please try again.",
            "error"
        );
    } finally {
        hideLoading();
    }
}

// Switch to Polygon Network
async function switchToCorrectNetwork(provider) {
    try {
        await provider.send("wallet_switchEthereumChain", [{ 
            chainId: `0x${CONFIG.NETWORK.chainId.toString(16)}` 
        }]);
    } catch (switchError) {
        if (switchError.code === 4902) {
            await provider.send("wallet_addEthereumChain", [{
                chainId: `0x${CONFIG.NETWORK.chainId.toString(16)}`,
                chainName: CONFIG.NETWORK.name,
                rpcUrls: [CONFIG.NETWORK.rpcUrl],
                nativeCurrency: {
                    name: CONFIG.NETWORK.currency,
                    symbol: CONFIG.NETWORK.currency,
                    decimals: 18
                },
                blockExplorerUrls: [CONFIG.NETWORK.explorerUrl]
            }]);
        } else {
            throw new Error("Failed to switch network");
        }
    }
}

// Load Balances and Staking Info
async function loadBalances() {
    if (!account) return;
    
    try {
        showLoading("Loading data...");
        
        const [lqxBalance, lpBalance, stakedAmount, pendingReward, apr] = await Promise.all([
            contracts.lqx.balanceOf(account),
            contracts.lp.balanceOf(account),
            contracts.staking.userStake(account),
            contracts.staking.earned(account),
            contracts.staking.getAPR()
        ]);
        
        // Update UI
        document.getElementById('lqxBalance').textContent = formatUnits(lqxBalance, 18);
        document.getElementById('lpBalance').textContent = formatUnits(lpBalance, 18);
        document.getElementById('stakedAmount').textContent = formatUnits(stakedAmount, 18);
        document.getElementById('pendingReward').textContent = formatUnits(pendingReward, 18);
        document.getElementById('aprValue').textContent = `${formatUnits(apr, 18)}%`;
        
    } catch (error) {
        console.error("Failed to load balances:", error);
        showNotification("Failed to load data. Please refresh.", "error");
    } finally {
        hideLoading();
    }
}

// Stake LP Tokens
async function stakeTokens() {
    const amount = stakeAmountInput.value;
    if (!validateAmount(amount)) return;
    
    try {
        showLoading("Staking tokens...");
        
        // 1. Approve tokens
        const approveTx = await contracts.lp.approve(
            CONFIG.CONTRACTS.STAKING_CONTRACT.address,
            parseUnits(amount, 18)
        );
        await approveTx.wait();
        
        // 2. Stake tokens
        const stakeTx = await contracts.staking.stake(parseUnits(amount, 18));
        await stakeTx.wait();
        
        // 3. Update UI
        stakeAmountInput.value = "";
        await loadBalances();
        
        showNotification("Tokens staked successfully!", "success");
    } catch (error) {
        console.error("Staking error:", error);
        showNotification(`Staking failed: ${error.message.split("(")[0]}`, "error");
    } finally {
        hideLoading();
    }
}

// Unstake LP Tokens
async function unstakeTokens() {
    const amount = unstakeAmountInput.value;
    if (!validateAmount(amount)) return;
    
    try {
        showLoading("Unstaking tokens...");
        
        const tx = await contracts.staking.unstake(parseUnits(amount, 18));
        await tx.wait();
        
        unstakeAmountInput.value = "";
        await loadBalances();
        
        showNotification("Tokens unstaked successfully!", "success");
    } catch (error) {
        console.error("Unstaking error:", error);
        showNotification(`Unstaking failed: ${error.message.split("(")[0]}`, "error");
    } finally {
        hideLoading();
    }
}

// Claim Rewards
async function claimRewards() {
    try {
        showLoading("Claiming rewards...");
        
        const tx = await contracts.staking.claimRewards();
        await tx.wait();
        
        await loadBalances();
        showNotification("Rewards claimed successfully!", "success");
    } catch (error) {
        console.error("Claim error:", error);
        showNotification(`Claim failed: ${error.message.split("(")[0]}`, "error");
    } finally {
        hideLoading();
    }
}

// Helper Functions
function formatUnits(value, decimals) {
    return parseFloat(ethers.utils.formatUnits(value, decimals)).toFixed(4);
}

function parseUnits(value, decimals) {
    return ethers.utils.parseUnits(value.toString(), decimals);
}

function validateAmount(amount) {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        showNotification("Please enter a valid amount", "warning");
        return false;
    }
    return true;
}

function updateWalletUI(address) {
    connectButton.innerHTML = `
        <span class="wallet-icon">🟢</span>
        ${address.slice(0, 6)}...${address.slice(-4)}
        <span class="disconnect-icon">✕</span>
    `;
    connectButton.onclick = disconnectWallet;
}

function setupEventListeners(provider) {
    provider.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) disconnectWallet();
        else window.location.reload();
    });
    
    provider.on("chainChanged", () => window.location.reload());
}

function disconnectWallet() {
    if (web3Modal.cachedProvider) {
        web3Modal.clearCachedProvider();
    }
    provider = null;
    account = null;
    contracts = {};
    
    connectButton.innerHTML = `
        <span class="wallet-icon">🔴</span>
        Connect Wallet
    `;
    connectButton.onclick = connectWallet;
    
    // Reset UI
    document.querySelectorAll('.balance-value').forEach(el => {
        el.textContent = '0';
    });
}

// MAX Button Handlers
maxStakeBtn.addEventListener('click', () => {
    stakeAmountInput.value = document.getElementById('lpBalance').textContent;
});

maxUnstakeBtn.addEventListener('click', () => {
    unstakeAmountInput.value = document.getElementById('stakedAmount').textContent;
});

// UI Helpers
function showLoading(message) {
    document.getElementById('loadingText').textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    connectButton.addEventListener('click', connectWallet);
    stakeButton.addEventListener('click', stakeTokens);
    unstakeButton.addEventListener('click', unstakeTokens);
    claimButton.addEventListener('click', claimRewards);
    
    // Auto-connect if cached
    if (web3Modal.cachedProvider) {
        connectWallet();
    }
});
