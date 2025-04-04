// Configuration (EVM + Cosmos)
const CONFIG = {
  // Polygon Mainnet
  EVM: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    currency: "MATIC",
    nativeDecimals: 18
  },
  // Cosmos Chains (Osmosis + Custom wLQX)
  COSMOS: {
    'osmosis-1': {
      chainId: 'osmosis-1',
      chainName: 'Osmosis',
      rpcUrl: 'https://rpc.osmosis.zone',
      restUrl: 'https://lcd.osmosis.zone',
      currencies: [
        {
          coinDenom: 'OSMO',
          coinMinimalDenom: 'uosmo',
          coinDecimals: 6
        },
        {
          coinDenom: 'wLQX',
          coinMinimalDenom: 'ibc/...', // Add actual IBC denom
          coinDecimals: 18
        }
      ]
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
  },
  // Gas Settings
  GAS_OPTIONS: {
    low: { maxFeePerGas: ethers.utils.parseUnits('30', 'gwei'), maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei') },
    medium: { maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'), maxPriorityFeePerGas: ethers.utils.parseUnits('2.5', 'gwei') },
    high: { maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'), maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei') }
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
    balances: {
      osmo: '0',
      wlqx: '0'
    },
    staked: {
      osmo: '0',
      wlqx: '0'
    }
  },
  // UI
  walletType: null,
  gasOption: 'medium'
};

// Initialize App
async function init() {
  await initCosmosKit();
  setupEventListeners();
  checkSavedSession();
  setupNetworkWatchers();
}

// =====================
// EVM FUNCTIONALITY
// =====================

async function connectEVM(walletType) {
  if (!window.ethereum) throw new Error("Wallet not installed");
  
  // Verify network
  state.provider = new ethers.providers.Web3Provider(window.ethereum);
  await verifyNetwork();
  
  // Get accounts
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  state.userAddress = accounts[0];
  state.signer = state.provider.getSigner();
  state.walletType = walletType;
  
  // Initialize contracts
  initContracts();
  
  // Set up listeners
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
}

async function verifyNetwork() {
  const network = await state.provider.getNetwork();
  if (network.chainId !== CONFIG.EVM.chainId) {
    await switchNetwork();
  }
}

async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CONFIG.EVM.chainId.toString(16)}` }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await addNetwork();
    } else {
      throw switchError;
    }
  }
}

async function stakeOnPolygon(amount) {
  const gasEstimate = await state.contracts.staking.estimateGas.stake(amount);
  const tx = await state.contracts.staking.stake(amount, {
    ...CONFIG.GAS_OPTIONS[state.gasOption],
    gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
  });
  return tx;
}

// =====================
// COSMOS FUNCTIONALITY
// =====================

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
  
  // Load initial balances
  await loadCosmosBalances();
}

async function stakeOnCosmos(amount, denom = 'uosmo') {
  const { client, address } = state.cosmos;
  const msg = {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    value: {
      delegatorAddress: address,
      validatorAddress: getValidatorAddress(), // Implement validator selection
      amount: {
        denom,
        amount: amount.toString()
      }
    }
  };
  
  const fee = {
    amount: [{ denom: 'uosmo', amount: '5000' }], // 0.005 OSMO fee
    gas: '200000'
  };
  
  const tx = await client.signAndBroadcast(address, [msg], fee);
  return tx;
}

async function loadCosmosBalances() {
  const { client, address } = state.cosmos;
  
  // Load OSMO and wLQX balances
  const [osmoBalance, wlqxBalance] = await Promise.all([
    client.getBalance(address, 'uosmo'),
    client.getBalance(address, CONFIG.COSMOS['osmosis-1'].currencies[1].coinMinimalDenom)
  ]);
  
  state.cosmos.balances = {
    osmo: osmoBalance.amount / 1e6,
    wlqx: wlqxBalance.amount / 1e18
  };
  
  // Load staked amounts
  const stakingClient = new StakingClient(state.cosmos.client);
  const [osmoStaked, wlqxStaked] = await Promise.all([
    stakingClient.getDelegation(address, getValidatorAddress(), 'uosmo'),
    stakingClient.getDelegation(address, getValidatorAddress(), CONFIG.COSMOS['osmosis-1'].currencies[1].coinMinimalDenom)
  ]);
  
  state.cosmos.staked = {
    osmo: osmoStaked / 1e6,
    wlqx: wlqxStaked / 1e18
  };
}

// =====================
// WALLET MANAGEMENT
// =====================

function disconnectWallet() {
  // EVM cleanup
  if (window.ethereum && window.ethereum.removeListener) {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  }
  
  // Cosmos cleanup
  if (state.cosmos.client && state.cosmos.client.disconnect) {
    state.cosmos.client.disconnect();
  }
  
  // Reset state
  state = {
    ...state,
    provider: null,
    signer: null,
    userAddress: null,
    cosmos: {
      client: null,
      offlineSigner: null,
      chain: null,
      balances: { osmo: '0', wlqx: '0' },
      staked: { osmo: '0', wlqx: '0' }
    }
  };
  
  // Clear storage
  localStorage.removeItem('walletSession');
  
  // Update UI
  updateUI();
}

// =====================
// UI UPDATES
// =====================

function updateUI() {
  updateEVMBalances();
  updateCosmosBalances();
  updateWalletButton();
  updateGasOptions();
}

function updateGasOptions() {
  const gasOptionsElement = document.getElementById('gasOptions');
  if (gasOptionsElement) {
    gasOptionsElement.innerHTML = Object.keys(CONFIG.GAS_OPTIONS)
      .map(option => `
        <button class="${state.gasOption === option ? 'active' : ''}" 
                onclick="setGasOption('${option}')">
          ${option.toUpperCase()}
        </button>
      `).join('');
  }
}

function setGasOption(option) {
  state.gasOption = option;
  updateGasOptions();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
