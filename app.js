// Configuration
const CONFIG = {
  lqxToken: {
    address: "0x9e27f48659b1005b1abc0f58465137e531430d4b",
    abi: require("./abis/LQXToken.json")
  },
  lpStaking: {
    address: "0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3",
    abi: require("./abis/LPStaking.json")
  },
  lpToken: {
    address: "0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E",
    abi: require("./abis/LPToken.json")
  }
};

// State Management
let state = {
  provider: null,
  signer: null,
  contracts: {},
  user: {
    address: null,
    lqxBalance: "0",
    lpBalance: "0",
    stakedLp: "0",
    pendingRewards: "0",
    apr: "0"
  }
};

// DOM Elements
const elements = {
  walletStatus: document.getElementById("walletStatus"),
  dashboard: document.getElementById("dashboard"),
  txStatus: document.getElementById("txStatus"),
  txStatusText: document.getElementById("txStatusText"),
  lqxBalance: document.getElementById("lqxBalance"),
  lpBalance: document.getElementById("lpBalance"),
  stakedAmount: document.getElementById("stakedAmount"),
  pendingRewards: document.getElementById("pendingRewards"),
  currentApr: document.getElementById("currentApr"),
  actionAmount: document.getElementById("actionAmount"),
  stakeBtn: document.getElementById("stakeBtn"),
  unstakeBtn: document.getElementById("unstakeBtn"),
  claimBtn: document.getElementById("claimBtn"),
  metamaskBtn: document.getElementById("metamaskBtn"),
  keplrBtn: document.getElementById("keplrBtn")
};

// Initialize Application
async function init() {
  setupEventListeners();
  
  // Auto-connect if wallet is already connected
  if (window.ethereum?.selectedAddress) {
    await connectEVMWallet();
  }
}

// Event Listeners Setup
function setupEventListeners() {
  elements.metamaskBtn.addEventListener("click", connectEVMWallet);
  elements.keplrBtn.addEventListener("click", connectCosmosWallet);
  
  elements.stakeBtn.addEventListener("click", stake);
  elements.unstakeBtn.addEventListener("click", unstake);
  elements.claimBtn.addEventListener("click", claim);
}

// EVM Wallet Connection
async function connectEVMWallet() {
  try {
    if (!window.ethereum) throw new Error("EVM wallet not detected");
    
    showTxStatus("Connecting wallet...");
    
    // Initialize provider and signer
    state.provider = new ethers.providers.Web3Provider(window.ethereum);
    await state.provider.send("eth_requestAccounts", []);
    state.signer = state.provider.getSigner();
    state.user.address = await state.signer.getAddress();
    
    // Initialize contracts
    state.contracts = {
      lqxToken: new ethers.Contract(
        CONFIG.lqxToken.address,
        CONFIG.lqxToken.abi,
        state.signer
      ),
      lpStaking: new ethers.Contract(
        CONFIG.lpStaking.address,
        CONFIG.lpStaking.abi,
        state.signer
      ),
      lpToken: new ethers.Contract(
        CONFIG.lpToken.address,
        CONFIG.lpToken.abi,
        state.signer
      )
    };
    
    // Update UI
    updateWalletStatus("metamask");
    await refreshData();
    
    // Set up listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    
    hideTxStatus();
  } catch (error) {
    showError(error);
  }
}

// Cosmos Wallet Connection
async function connectCosmosWallet() {
  try {
    if (!window.keplr) throw new Error("Keplr wallet not detected");
    
    showTxStatus("Connecting Keplr...");
    
    await window.keplr.enable("osmosis-1");
    const offlineSigner = window.keplr.getOfflineSigner("osmosis-1");
    const accounts = await offlineSigner.getAccounts();
    
    state.user.address = accounts[0].address;
    updateWalletStatus("keplr");
    
    // For demo purposes - in production you'd need Cosmos-specific contract interactions
    alert("For full functionality with LP Staking, please use MetaMask with Polygon");
    
    hideTxStatus();
  } catch (error) {
    showError(error);
  }
}

// Core Functions
async function stake() {
  try {
    const amount = ethers.utils.parseUnits(elements.actionAmount.value || "0", 18);
    if (amount.lte(0)) throw new Error("Invalid amount");
    
    showTxStatus("Approving LP tokens...");
    
    // Approve
    const approveTx = await state.contracts.lpToken.approve(
      CONFIG.lpStaking.address,
      amount
    );
    await approveTx.wait();
    
    showTxStatus("Staking LP tokens...");
    
    // Stake
    const stakeTx = await state.contracts.lpStaking.stake(amount);
    await stakeTx.wait();
    
    await refreshData();
    hideTxStatus();
    alert("Successfully staked LP tokens!");
  } catch (error) {
    showError(error);
  }
}

async function unstake() {
  try {
    const amount = ethers.utils.parseUnits(elements.actionAmount.value || "0", 18);
    if (amount.lte(0)) throw new Error("Invalid amount");
    
    showTxStatus("Unstaking LP tokens...");
    
    const tx = await state.contracts.lpStaking.unstake(amount);
    await tx.wait();
    
    await refreshData();
    hideTxStatus();
    alert("Successfully unstaked LP tokens!");
  } catch (error) {
    showError(error);
  }
}

async function claim() {
  try {
    showTxStatus("Claiming rewards...");
    
    const tx = await state.contracts.lpStaking.claimRewards();
    await tx.wait();
    
    await refreshData();
    hideTxStatus();
    alert("Rewards claimed successfully!");
  } catch (error) {
    showError(error);
  }
}

// Data Management
async function refreshData() {
  try {
    if (!state.user.address) return;
    
    showTxStatus("Loading data...");
    
    const [lqxBalance, lpBalance, stakedLp, pendingRewards, apr] = await Promise.all([
      state.contracts.lqxToken.balanceOf(state.user.address),
      state.contracts.lpToken.balanceOf(state.user.address),
      state.contracts.lpStaking.userStake(state.user.address),
      state.contracts.lpStaking.earned(state.user.address),
      state.contracts.lpStaking.getAPR()
    ]);
    
    state.user = {
      ...state.user,
      lqxBalance: ethers.utils.formatUnits(lqxBalance, 18),
      lpBalance: ethers.utils.formatUnits(lpBalance, 18),
      stakedLp: ethers.utils.formatUnits(stakedLp, 18),
      pendingRewards: ethers.utils.formatUnits(pendingRewards, 18),
      apr: apr.toString()
    };
    
    updateUI();
    hideTxStatus();
  } catch (error) {
    showError(error);
  }
}

// UI Updates
function updateUI() {
  elements.lqxBalance.textContent = state.user.lqxBalance;
  elements.lpBalance.textContent = state.user.lpBalance;
  elements.stakedAmount.textContent = state.user.stakedLp;
  elements.pendingRewards.textContent = state.user.pendingRewards;
  elements.currentApr.textContent = state.user.apr;
  
  elements.dashboard.classList.remove("hidden");
}

function updateWalletStatus(walletType) {
  const walletName = walletType === "metamask" ? "MetaMask" : "Keplr";
  const icon = walletType === "metamask" ? "fab fa-metamask" : "fas fa-wallet";
  
  elements.walletStatus.innerHTML = `
    <i class="${icon}"></i>
    <span>Connected with ${walletName}</span>
  `;
}

// Helpers
function showTxStatus(message) {
  elements.txStatusText.textContent = message;
  elements.txStatus.classList.remove("hidden");
}

function hideTxStatus() {
  elements.txStatus.classList.add("hidden");
}

function showError(error) {
  console.error(error);
  hideTxStatus();
  alert(`Error: ${error.message}`);
}

// Event Handlers
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // Wallet disconnected
    location.reload();
  } else {
    // Account changed
    state.user.address = accounts[0];
    refreshData();
  }
}

function handleChainChanged(chainId) {
  // Chain changed - reload app
  location.reload();
}

// Initialize
window.addEventListener("load", init);
