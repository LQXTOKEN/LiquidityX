// Configuration (EVM + Cosmos)
const CONFIG = {
  // Polygon Mainnet
  EVM: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    currency: "MATIC"
  },
  // Cosmos Chains (Osmosis example)
  COSMOS: {
    'osmosis-1': {
      chainId: 'osmosis-1',
      chainName: 'Osmosis',
      rpcUrl: 'https://rpc.osmosis.zone',
      restUrl: 'https://lcd.osmosis.zone',
      stakeCurrency: {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6
      }
    }
  },
  // Contracts (Polygon)
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
        "function claimRewards() external"
      ]
    }
  }
};

// App State
let state = {
  // EVM
  provider: null,
  signer: null,
  userAddress: null,
  contracts: {
    lpToken: null,
    staking: null
  },
  balances: {
    matic: '0',
    lp: '0',
    staked: '0',
    rewards: '0'
  },
  // Cosmos
  cosmos: {
    client: null,
    offlineSigner: null,
    chain: null,
    balance: '0'
  },
  // UI
  walletType: null // 'metamask', 'keplr', 'leap', 'trust'
};

// DOM Elements
const elements = {
  connectButton: document.getElementById('connectButton'),
  walletModal: document.getElementById('walletModal'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  // Balances
  lpBalance: document.getElementById('lpBalance'),
  stakedBalance: document.getElementById('stakedBalance'),
  rewardsBalance: document.getElementById('rewardsBalance'),
  cosmosBalance: document.getElementById('cosmosBalance'), // New!
  // Buttons
  stakeBtn: document.getElementById('stakeBtn'),
  unstakeBtn: document.getElementById('unstakeBtn'),
  claimBtn: document.getElementById('claimBtn')
};

// Initialize Cosmos-Kit (Keplr/Leap)
async function initCosmosKit() {
  const { ChainProvider, useWallet } = await import('@cosmos-kit/react');
  const { wallets: { keplr, leap } } = await import('@cosmos-kit/wallets');

  // Render Cosmos-Kit Provider (dynamically)
  const providerEl = document.createElement('div');
  providerEl.id = 'cosmos-kit-provider';
  document.body.appendChild(providerEl);

  ReactDOM.render(
    <ChainProvider
      chains={Object.values(CONFIG.COSMOS)}
      wallets={[...keplr, ...leap]}
    >
      <App />
    </ChainProvider>,
    providerEl
  );

  return { useWallet };
}

// Main App Initialization
async function init() {
  const { useWallet } = await initCosmosKit();
  window.useWallet = useWallet; // Make it global

  setupEventListeners();
  checkSavedSession();
}

// Connect Wallet (Unified for EVM + Cosmos)
async function connectWallet(walletType) {
  try {
    showLoading("Connecting...");

    if (walletType === 'metamask' || walletType === 'trust') {
      await connectEVM(walletType);
    } else if (walletType === 'keplr' || walletType === 'leap') {
      await connectCosmos(walletType);
    }

    // Save session
    localStorage.setItem('walletSession', JSON.stringify({
      walletType,
      address: state.userAddress
    }));

    updateUI();
    showNotification("Connected!", "success");
  } catch (error) {
    console.error("Connection error:", error);
    showNotification(`Failed: ${error.message}`, "error");
  } finally {
    hideLoading();
  }
}

// EVM Connection (Polygon) - MetaMask/Trust
async function connectEVM(walletType) {
  if (!window.ethereum) throw new Error("Install MetaMask/Trust Wallet");
  
  state.provider = new ethers.providers.Web3Provider(window.ethereum);
  await switchNetwork(); // Ensure Polygon
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  state.userAddress = accounts[0];
  state.signer = state.provider.getSigner();
  state.walletType = walletType;
  initContracts();
}

// Cosmos Connection (Keplr/Leap)
async function connectCosmos(walletType) {
  const { connect, getOfflineSigner } = window.useWallet();
  await connect(walletType);
  
  const signer = await getOfflineSigner(CONFIG.COSMOS['osmosis-1'].chainId);
  const accounts = await signer.getAccounts();
  
  state.cosmos = {
    client: signer,
    offlineSigner: signer,
    chain: CONFIG.COSMOS['osmosis-1'],
    address: accounts[0].address
  };
  state.userAddress = accounts[0].address;
  state.walletType = walletType;
}

// Initialize EVM Contracts
function initContracts() {
  if (!state.provider) return;
  
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

// Load Balances (EVM + Cosmos)
async function loadBalances() {
  if (state.walletType === 'metamask' || state.walletType === 'trust') {
    // EVM Balances
    const [lpBalance, staked] = await Promise.all([
      state.contracts.lpToken.balanceOf(state.userAddress),
      state.contracts.staking.userStake(state.userAddress)
    ]);
    state.balances.lp = ethers.utils.formatUnits(lpBalance, 18);
    state.balances.staked = ethers.utils.formatUnits(staked, 18);
  } else if (state.walletType === 'keplr' || state.walletType === 'leap') {
    // Cosmos Balances (example for Osmosis)
    const { client } = state.cosmos;
    const balance = await client.getBalance(state.userAddress, 'uosmo');
    state.cosmos.balance = balance.amount / 1e6; // OSMO has 6 decimals
  }
}

// Update UI
function updateUI() {
  if (!state.userAddress) return;
  
  // EVM
  elements.lpBalance.textContent = state.balances.lp || '0';
  elements.stakedBalance.textContent = state.balances.staked || '0';
  
  // Cosmos
  if (state.cosmos.balance) {
    elements.cosmosBalance.textContent = `${state.cosmos.balance} OSMO`;
  }
  
  // Wallet Button
  elements.connectButton.innerHTML = `
    <i class="fas fa-wallet"></i>
    ${shortenAddress(state.userAddress)}
  `;
}

// Helper: Shorten Address
function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
