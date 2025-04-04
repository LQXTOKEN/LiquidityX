// Configuration
const CONFIG = {
    NETWORK: {
        chainId: 137,
        name: "Polygon",
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
                "function approve(address spender, uint256 amount) public returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)"
            ]
        },
        STAKING_CONTRACT: {
            address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
            abi: [
                "function stake(uint256 amount) external",
                "function unstake(uint256 amount) external",
                "function claimRewards() external",
                "function compound() external",
                "function userStake(address account) external view returns (uint256)",
                "function earned(address account) external view returns (uint256)",
                "function getAPR() public view returns (uint256)",
                "function totalStaked() public view returns (uint256)",
                "function paused() public view returns (bool)"
            ]
        }
    }
};

// App State
let state = {
    provider: null,
    signer: null,
    userAddress: null,
    contracts: {
        lqxToken: null,
        lpToken: null,
        staking: null
    },
    balances: {
        matic: '0',
        lqx: '0',
        lp: '0',
        staked: '0',
        rewards: '0'
    },
    poolInfo: {
        apr: '0',
        totalStaked: '0',
        userShare: '0'
    },
    gasPrices: {
        low: 0,
        medium: 0,
        high: 0
    },
    currentGasPrice: 'medium'
};

// DOM Elements
const elements = {
    connectButton: document.getElementById('connectButton'),
    walletModal: document.getElementById('walletModal'),
    txModal: document.getElementById('txModal'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    notificationContainer: document.getElementById('notificationContainer'),
    // Balance elements
    lpBalance: document.getElementById('lpBalance'),
    stakedBalance: document.getElementById('stakedBalance'),
    rewardsBalance: document.getElementById('rewardsBalance'),
    // Pool info elements
    aprValue: document.getElementById('aprValue'),
    totalStaked: document.getElementById('totalStaked'),
    userShare: document.getElementById('userShare'),
    // Action inputs
    stakeAmount: document.getElementById('stakeAmount'),
    unstakeAmount: document.getElementById('unstakeAmount'),
    // Buttons
    maxStakeBtn: document.getElementById('maxStakeBtn'),
    maxUnstakeBtn: document.getElementById('maxUnstakeBtn'),
    stakeBtn: document.getElementById('stakeBtn'),
    unstakeBtn: document.getElementById('unstakeBtn'),
    claimBtn: document.getElementById('claimBtn'),
    compoundBtn: document.getElementById('compoundBtn'),
    // Transaction history
    txHistory: document.getElementById('txHistory'),
    // Modal elements
    confirmTxBtn: document.getElementById('confirmTxBtn'),
    txDetails: document.getElementById('txDetails'),
    gasEstimate: document.getElementById('gasEstimate')
};

// Initialize the app
async function init() {
    setupEventListeners();
    checkSavedSession();
    loadGasPrices();
}

// Set up event listeners
function setupEventListeners() {
    // Wallet connection
    elements.connectButton.addEventListener('click', openWalletModal);
    document.querySelectorAll('.wallet-option').forEach(btn => {
        btn.addEventListener('click', () => connectWallet(btn.dataset.wallet));
    });
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Staking actions
    elements.maxStakeBtn.addEventListener('click', setMaxStake);
    elements.maxUnstakeBtn.addEventListener('click', setMaxUnstake);
    elements.stakeBtn.addEventListener('click', () => prepareStake());
    elements.unstakeBtn.addEventListener('click', () => prepareUnstake());
    elements.claimBtn.addEventListener('click', () => prepareClaim());
    elements.compoundBtn.addEventListener('click', () => prepareCompound());

    // Gas options
    document.querySelectorAll('.gas-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.gas-option.active').classList.remove('active');
            btn.classList.add('active');
            state.currentGasPrice = btn.dataset.speed;
            updateGasEstimate();
        });
    });

    // Confirm transaction
    elements.confirmTxBtn.addEventListener('click', confirmTransaction);
}

// Check for saved session
async function checkSavedSession() {
    const savedSession = localStorage.getItem('lqxStakingSession');
    if (savedSession) {
        try {
            const { walletType, address } = JSON.parse(savedSession);
            await connectWallet(walletType);
        } catch (error) {
            console.error("Failed to load saved session:", error);
            localStorage.removeItem('lqxStakingSession');
        }
    }
}

// Connect wallet
async function connectWallet(walletType) {
    try {
        showLoading("Connecting wallet...");
        
        let provider;
        if (walletType === 'metamask') {
            if (!window.ethereum) throw new Error("MetaMask not installed");
            provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Check network
            const network = await provider.getNetwork();
            if (network.chainId !== CONFIG.NETWORK.chainId) {
                await switchNetwork();
            }
            
            // Get accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length === 0) throw new Error("No accounts found");
            
            state.userAddress = accounts[0];
            
            // Set up event listeners
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) disconnectWallet();
                else {
                    state.userAddress = accounts[0];
                    updateUI();
                    loadBalances();
                }
            });
            
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        } else if (walletType === 'walletconnect') {
            const walletConnectProvider = new WalletConnectProvider({
                rpc: {
                    [CONFIG.NETWORK.chainId]: CONFIG.NETWORK.rpcUrl
                }
            });
            
            await walletConnectProvider.enable();
            provider = new ethers.providers.Web3Provider(walletConnectProvider);
            
            const accounts = await provider.listAccounts();
            if (accounts.length === 0) throw new Error("No accounts found");
            state.userAddress = accounts[0];
        } else {
            throw new Error("Unsupported wallet type");
        }
        
        state.provider = provider;
        state.signer = provider.getSigner();
        
        // Initialize contracts
        initializeContracts();
        
        // Save session
        localStorage.setItem('lqxStakingSession', JSON.stringify({
            walletType,
            address: state.userAddress
        }));
        
        // Update UI
        updateUI();
        loadBalances();
        
        showNotification("Wallet connected successfully", "success");
    } catch (error) {
        console.error("Wallet connection error:", error);
        showNotification(`Connection failed: ${error.message}`, "error");
    } finally {
        hideLoading();
        closeAllModals();
    }
}

// Initialize contracts
function initializeContracts() {
    state.contracts.lpToken = new ethers.Contract(
        CONFIG.CONTRACTS.LP_TOKEN.address,
        CONFIG.CONTRACTS.LP_TOKEN.abi,
        state.signer
    );
    
    state.contracts.staking = new ethers.Contract(
        CONFIG.CONTRACTS.STAKING_CONTRACT.address,
        CONFIG.CONTRACTS.STAKING_CONTRACT.abi,
        state.signer
    );
}

// Switch network
async function switchNetwork() {
    try {
        showLoading("Switching network...");
        
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${Number(CONFIG.NETWORK.chainId).toString(16)}` }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${Number(CONFIG.NETWORK.chainId).toString(16)}`,
                        chainName: CONFIG.NETWORK.name,
                        nativeCurrency: {
                            name: CONFIG.NETWORK.currency,
                            symbol: CONFIG.NETWORK.currency,
                            decimals: 18
                        },
                        rpcUrls: [CONFIG.NETWORK.rpcUrl],
                        blockExplorerUrls: [CONFIG.NETWORK.explorerUrl]
                    }],
                });
            } catch (addError) {
                throw new Error(`Failed to add network: ${addError.message}`);
            }
        } else {
            throw new Error(`Failed to switch network: ${switchError.message}`);
        }
    } finally {
        hideLoading();
    }
}

// Load balances
async function loadBalances() {
    if (!state.userAddress) return;
    
    try {
        showLoading("Loading balances...");
        
        // Load native balance
        const maticBalance = await state.provider.getBalance(state.userAddress);
        state.balances.matic = ethers.utils.formatUnits(maticBalance, 18);
        
        // Load token balances
        const [lqxBalance, lpBalance, stakedAmount, rewards, apr, totalStaked] = await Promise.all([
            state.contracts.lqxToken.balanceOf(state.userAddress),
            state.contracts.lpToken.balanceOf(state.userAddress),
            state.contracts.staking.userStake(state.userAddress),
            state.contracts.staking.earned(state.userAddress),
            state.contracts.staking.getAPR(),
            state.contracts.staking.totalStaked()
        ]);
        
        state.balances.lqx = ethers.utils.formatUnits(lqxBalance, 18);
        state.balances.lp = ethers.utils.formatUnits(lpBalance, 18);
        state.balances.staked = ethers.utils.formatUnits(stakedAmount, 18);
        state.balances.rewards = ethers.utils.formatUnits(rewards, 18);
        
        // Pool info
        state.poolInfo.apr = ethers.utils.formatUnits(apr, 2);
        state.poolInfo.totalStaked = ethers.utils.formatUnits(totalStaked, 18);
        state.poolInfo.userShare = totalStaked.gt(0) 
            ? stakedAmount.mul(10000).div(totalStaked).toNumber() / 100 
            : 0;
        
        updateUI();
    } catch (error) {
        console.error("Failed to load balances:", error);
        showNotification("Failed to load balances. Please try again.", "error");
    } finally {
        hideLoading();
    }
}

// Update UI
function updateUI() {
    if (state.userAddress) {
        // Update balances
        elements.lpBalance.textContent = state.balances.lp;
        elements.stakedBalance.textContent = state.balances.staked;
        elements.rewardsBalance.textContent = state.balances.rewards;
        
        // Update pool info
        elements.aprValue.textContent = `${state.poolInfo.apr}%`;
        elements.totalStaked.textContent = `${state.poolInfo.totalStaked} LP`;
        elements.userShare.textContent = `${state.poolInfo.userShare}%`;
        
        // Update connect button
        elements.connectButton.innerHTML = `
            <i class="fas fa-wallet"></i>
            ${state.userAddress.substring(0, 6)}...${state.userAddress.substring(38)}
        `;
    } else {
        // Reset UI
        elements.lpBalance.textContent = "0.00";
        elements.stakedBalance.textContent = "0.00";
        elements.rewardsBalance.textContent = "0.00";
        elements.aprValue.textContent = "0.00%";
        elements.totalStaked.textContent = "0.00 LP";
        elements.userShare.textContent = "0.00%";
        
        elements.connectButton.innerHTML = `
            <i class="fas fa-wallet"></i> Connect Wallet
        `;
    }
}

// Prepare stake transaction
async function prepareStake() {
    const amount = elements.stakeAmount.value;
    if (!amount || amount <= 0) {
        showNotification("Please enter a valid amount", "error");
        return;
    }
    
    const amountWei = ethers.utils.parseUnits(amount, 18);
    
    // Check allowance
    const allowance = await state.contracts.lpToken.allowance(
        state.userAddress,
        CONFIG.CONTRACTS.STAKING_CONTRACT.address
    );
    
    if (allowance.lt(amountWei)) {
        showApprovalModal(amountWei, () => executeStake(amountWei));
    } else {
        showStakeModal(amountWei);
    }
}

// Execute stake
async function executeStake(amountWei) {
    try {
        showLoading(`Staking ${ethers.utils.formatUnits(amountWei, 18)} LP...`);
        
        const tx = await state.contracts.staking.stake(amountWei, {
            gasPrice: state.gasPrices[state.currentGasPrice]
        });
        
        await handleTransaction(tx, "Stake");
        await loadBalances();
    } catch (error) {
        console.error("Staking error:", error);
        showNotification(`Staking failed: ${error.message}`, "error");
    }
}

// Handle transaction
async function handleTransaction(tx, action) {
    try {
        elements.txLink.href = `${CONFIG.NETWORK.explorerUrl}/tx/${tx.hash}`;
        elements.txLink.style.display = 'none';
        
        const receipt = await tx.wait();
        if (receipt.status === 1) {
            showNotification(`${action} successful!`, "success");
            elements.txLink.style.display = 'inline-block';
            addTransactionToHistory(tx.hash, action.toLowerCase());
            return true;
        } else {
            throw new Error("Transaction failed");
        }
    } catch (error) {
        console.error("Transaction error:", error);
        showNotification(`${action} failed: ${error.message}`, "error");
        return false;
    } finally {
        hideLoading();
    }
}

// Add transaction to history
function addTransactionToHistory(txHash, type) {
    const txElement = document.createElement('div');
    txElement.className = 'tx-item';
    txElement.innerHTML = `
        <span class="tx-type ${type}">${type}</span>
        <a href="${CONFIG.NETWORK.explorerUrl}/tx/${txHash}" target="_blank" class="tx-link">
            View <i class="fas fa-external-link-alt"></i>
        </a>
    `;
    
    if (elements.txHistory.querySelector('.history-placeholder')) {
        elements.txHistory.innerHTML = '';
    }
    
    elements.txHistory.prepend(txElement);
}

// Show notification
function showNotification(message, type = "info") {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 
                          type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    elements.notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initialize the app
window.addEventListener('DOMContentLoaded', init);
