const Web3Modal = window.Web3Modal?.default;
const WalletConnectProvider = window.WalletConnectProvider?.default;
const { ethers } = window;

// Config με δυνατότητα ενημέρωσης από API στο μέλλον
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

// Web3Modal Setup (για WalletConnect)
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
  cacheProvider: false,
  providerOptions,
  theme: 'dark'
});

let provider, signer, account;

// ======================
// Βοηθητικές Συναρτήσεις
// ======================

/**
 * Προσθήκη Polygon Network στο MetaMask αν λείπει
 */
async function addPolygonNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${CONFIG.NETWORK.chainId.toString(16)}`,
        chainName: CONFIG.NETWORK.name,
        nativeCurrency: {
          name: CONFIG.NETWORK.currency,
          symbol: CONFIG.NETWORK.currency,
          decimals: 18
        },
        rpcUrls: [CONFIG.NETWORK.rpcUrl],
        blockExplorerUrls: [CONFIG.NETWORK.explorerUrl]
      }]
    });
    return true;
  } catch (error) {
    console.error("Failed to add network:", error);
    return false;
  }
}

/**
 * Έλεγχος αν ο χρήστης είναι στο σωστό δίκτυο
 */
async function isCorrectNetwork() {
  if (!provider) return false;
  const network = await provider.getNetwork();
  return network.chainId === CONFIG.NETWORK.chainId;
}

/**
 * Αποσύνδεση Wallet
 */
async function disconnectWallet() {
  if (web3Modal.cachedProvider) {
    web3Modal.clearCachedProvider();
  }
  provider = null;
  signer = null;
  account = null;
  updateUI();
}

/**
 * Ενημέρωση UI κατάστασης
 */
function updateUI() {
  const connectButton = document.getElementById('connectButton');
  if (account) {
    connectButton.innerText = `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`;
    connectButton.onclick = disconnectWallet;
  } else {
    connectButton.innerText = "Connect Wallet";
    connectButton.onclick = connectWallet;
    document.getElementById('lqxBalance').innerText = "LQX Balance: 0";
    document.getElementById('lpBalance').innerText = "LP Balance: 0";
  }
}

// ======================
// Κύριες Συναρτήσεις
// ======================

/**
 * Σύνδεση Wallet (MetaMask ή WalletConnect)
 */
async function connectWallet() {
  try {
    let instance;
    
    // Προτεραιότητα στο MetaMask αν υπάρχει
    if (window.ethereum) {
      instance = await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    } else {
      // Fallback στο WalletConnect (Trust Wallet κλπ)
      instance = await web3Modal.connect();
      provider = new ethers.providers.Web3Provider(instance, "any");
    }

    // Έλεγχος δικτύου
    if (!(await isCorrectNetwork())) {
      const added = await addPolygonNetwork();
      if (!added) throw new Error("Wrong network. Please switch to Polygon.");
    }

    signer = provider.getSigner();
    account = await signer.getAddress();

    // Ακροατές για αλλαγές
    if (instance.on) {
      instance.on("accountsChanged", () => window.location.reload());
      instance.on("chainChanged", () => window.location.reload());
    }

    updateUI();
    await loadBalances();
  } catch (error) {
    console.error("Connection error:", error);
    alert(`Connection failed: ${error.message}`);
  }
}

/**
 * Φόρτωση Balances (LQX + LP)
 */
async function loadBalances() {
  if (!account) return;

  try {
    // Έλεγχος δικτύου ξανά
    if (!(await isCorrectNetwork())) {
      throw new Error("Wrong network. Please switch to Polygon.");
    }

    const [lqxBalance, lpBalance] = await Promise.all([
      getTokenBalance(CONFIG.CONTRACTS.LQX_TOKEN, account),
      getTokenBalance(CONFIG.CONTRACTS.LP_TOKEN, account)
    ]);

    document.getElementById('lqxBalance').innerText = `LQX Balance: ${lqxBalance}`;
    document.getElementById('lpBalance').innerText = `LP Balance: ${lpBalance}`;
  } catch (error) {
    console.error("Load balances error:", error);
    alert(`Failed to load balances: ${error.message}`);
  }
}

/**
 * Βοηθητική συνάρτηση για ανάγνωση balance
 */
async function getTokenBalance(tokenConfig, address) {
  try {
    const contract = new ethers.Contract(
      tokenConfig.address,
      tokenConfig.abi,
      provider // Χρήση provider (read-only)
    );
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error(`Error fetching ${tokenConfig.address} balance:`, error);
    return "Error";
  }
}

// ======================
// Συμβολαιακές Συναρτήσεις
// ======================

async function stake(amount) {
  if (!account) return;

  try {
    const stakingContract = new ethers.Contract(
      CONFIG.CONTRACTS.STAKING_CONTRACT.address,
      CONFIG.CONTRACTS.STAKING_CONTRACT.abi,
      signer
    );

    const tx = await stakingContract.stake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    await loadBalances(); // Αυτόματη ανανέωση
    alert("Stake successful!");
  } catch (error) {
    console.error("Stake error:", error);
    alert(`Stake failed: ${error.message}`);
  }
}

// ======================
// Αρχικοποίηση
// ======================

document.getElementById('connectButton').addEventListener('click', connectWallet);

// Αν ο χρήστης είναι ήδη συνδεδεμένος (π.χ. ανανέωση σελίδας)
if (web3Modal.cachedProvider) {
  connectWallet();
}
