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
                "function totalStaked() public view returns (uint256)"
            ]
        }
    }
};

// App State
let state = {
    provider: null,
    signer: null,
    userAddress: null,
    walletType: null,
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
        totalStaked: '0'
    },
    gasPrice: 'medium'
};

// DOM Elements
const elements = {
    connectButton: document.getElementById('connectButton'),
    walletModal: document.getElementById('walletModal'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    notificationContainer: document.getElementById('notificationContainer'),
    // Balance elements
    lpBalance: document.getElementById('lpBalance'),
    stakedBalance: document.getElementById('stakedBalance'),
    rewardsBalance: document.getElementById('rewardsBalance'),
    // Pool info elements
    aprValue: document.getElementById('aprValue'),
    totalStaked: document.getElementById('totalStaked'),
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
    // Mobile elements
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    // Modal elements
    confirmTxBtn: document.getElementById('confirmTxBtn'),
    txDetails: document.getElementById('txDetails'),
    gasEstimate: document.getElementById('gasEstimate'),
    txLink: document.getElementById('txLink')
};

// Initialize the app
async function init() {
    setupEventListeners();
    checkSavedSession();
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
    elements.stakeBtn.addEventListener('click', prepareStake);
    elements.unstakeBtn.addEventListener('click', prepareUnstake);
    elements.claimBtn.addEventListener('click', prepareClaim);
    elements.compoundBtn.addEventListener('click', prepareCompound);

    // Mobile menu
    elements.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('.mobile-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });
}

// Check for saved session
async function checkSavedSession() {
    const savedSession = localStorage.getItem('lqxStakingSession');
    if (savedSession) {
        try {
            const { walletType, address } = JSON.parse(savedSession);
            await connectWallet(walletType);
            state.userAddress = address;
            initializeContracts();
            updateUI();
            loadBalances();
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
        
        if (walletType === 'metamask') {
            await connectMetaMask();
        } else if (walletType === 'walletconnect') {
            await connectWalletConnect();
        } else {
            throw new Error("Unsupported wallet type");
        }
        
        state.walletType = walletType;
        initializeContracts();
        
        // Save session
        localStorage.setItem('lqxStakingSession', JSON.stringify({
            walletType,
            address: state.userAddress
        }));
        
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

// Connect MetaMask
async function connectMetaMask() {
    if (!window.ethereum) {
        throw new Error("MetaMask not installed");
    }
    
    state.provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Check network
    const network = await state.provider.getNetwork();
    if (network.chainId !== CONFIG.NETWORK.chainId) {
        await switchNetwork();
    }
    
    // Get accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
        throw new Error("No accounts found");
    }
    
    state.userAddress = accounts[0];
    state.signer = state.provider.getSigner();
    
    // Set up event listeners
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            state.userAddress = accounts[0];
            updateUI();
            loadBalances();
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// Connect WalletConnect (v2 without Project ID)
async function connectWalletConnect() {
    // Create WalletConnect provider without projectId
    const provider = new WalletConnectProvider({
        rpc: {
            [CONFIG.NETWORK.chainId]: CONFIG.NETWORK.rpcUrl
        },
        qrcodeModalOptions: {
            mobileLinks: [
                "metamask",
                "trust",
                "rainbow",
                "argent",
                "imtoken",
                "pillar"
            ]
        }
    });
    
    try {
        // Enable session (triggers QR Code modal)
        await provider.enable();
        
        state.provider = new ethers.providers.Web3Provider(provider);
        state.signer = state.provider.getSigner();
        
        const accounts = await state.provider.listAccounts();
        if (accounts.length === 0) {
            throw new Error("No accounts found");
        }
        
        state.userAddress = accounts[0];
        
        // Handle disconnection
        provider.on("disconnect", (code, reason) => {
            console.log("WalletConnect disconnected:", code, reason);
            disconnectWallet();
        });
        
        // Handle session change
        provider.on("accountsChanged", (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                state.userAddress = accounts[0];
                updateUI();
                loadBalances();
            }
        });
        
        provider.on("chainChanged", () => {
            window.location.reload();
        });
    } catch (error) {
        console.error("WalletConnect error:", error);
        throw error;
    }
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

// Load balances
async function loadBalances() {
    if (!state.userAddress) return;
    
    try {
        showLoading("Loading balances...");
        
        // Load native balance
        const maticBalance = await state.provider.getBalance(state.userAddress);
        state.balances.matic = ethers.utils.formatUnits(maticBalance, 18);
        
        // Load token balances
        const [lpBalance, stakedAmount, rewards, apr, totalStaked] = await Promise.all([
            state.contracts.lpToken.balanceOf(state.userAddress),
            state.contracts.staking.userStake(state.userAddress),
            state.contracts.staking.earned(state.userAddress),
            state.contracts.staking.getAPR(),
            state.contracts.staking.totalStaked()
        ]);
        
        state.balances.lp = ethers.utils.formatUnits(lpBalance, 18);
        state.balances.staked = ethers.utils.formatUnits(stakedAmount, 18);
        state.balances.rewards = ethers.utils.formatUnits(rewards, 18);
        
        // Pool info
        state.poolInfo.apr = ethers.utils.formatUnits(apr, 2);
        state.poolInfo.totalStaked = ethers.utils.formatUnits(totalStaked, 18);
        
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
        
        // Update connect button
        elements.connectButton.innerHTML = `
            <i class="fas fa-wallet"></i>
            <span class="btn-text">${state.userAddress.substring(0, 6)}...${state.userAddress.substring(38)}</span>
        `;
    } else {
        // Reset UI
        elements.lpBalance.textContent = "0.00";
        elements.stakedBalance.textContent = "0.00";
        elements.rewardsBalance.textContent = "0.00";
        elements.aprValue.textContent = "0.00%";
        elements.totalStaked.textContent = "0.00 LP";
        
        elements.connectButton.innerHTML = `
            <i class="fas fa-wallet"></i>
            <span class="btn-text">Connect</span>
        `;
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    elements.mobileMenu.classList.toggle('active');
}

// Navigate to section
function navigateToSection(section) {
    // Implementation depends on your navigation structure
    console.log("Navigating to:", section);
    toggleMobileMenu();
}

// Initialize the app
window.addEventListener('DOMContentLoaded', init);
