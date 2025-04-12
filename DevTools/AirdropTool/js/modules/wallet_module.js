import { 
  LQX_ADDRESS, 
  LQX_ABI, 
  LQX_REQUIRED, 
  POLYGON_MAINNET_CHAIN_ID,
  POLYGON_TESTNET_CHAIN_ID,
  POLYGON_RPC_URL
} from './config.js';

export let provider, signer, userAddress, lqxContract;

export async function connectWallet() {
  try {
    // 1. Check for MetaMask installation
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    // 2. Initialize provider
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    // 3. Handle network switching
    try {
      await checkAndSwitchToPolygon();
    } catch (networkError) {
      console.warn("Network switch failed:", networkError);
      throw new Error("Please switch to Polygon manually in MetaMask");
    }

    // 4. Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || accounts.length === 0) {
      throw new Error("User denied account access");
    }

    // 5. Initialize wallet components
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    // 6. Verify correct network
    const network = await provider.getNetwork();
    if (![POLYGON_MAINNET_CHAIN_ID, POLYGON_TESTNET_CHAIN_ID].includes(network.chainId)) {
      throw new Error("Unsupported network - Please use Polygon");
    }

    // 7. Initialize LQX contract and check balance
    lqxContract = new ethers.Contract(LQX_ADDRESS, LQX_ABI, provider);
    const balance = await lqxContract.balanceOf(userAddress);
    const formattedBalance = ethers.utils.formatUnits(balance, 18);

    // 8. Update UI
    updateWalletUI(userAddress, formattedBalance, balance);

    return {
      success: true,
      address: userAddress,
      balance: formattedBalance,
      hasEnoughLQX: balance.gte(LQX_REQUIRED)
    };

  } catch (err) {
    console.error("Wallet connection error:", err);
    updateWalletUI(null, "0", ethers.BigNumber.from(0));
    throw err; // Re-throw for calling code to handle
  }
}

export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  lqxContract = null;
  updateWalletUI(null, "0", ethers.BigNumber.from(0));
}

function updateWalletUI(address, balance, balanceBN) {
  const walletInfo = document.getElementById("wallet-info");
  const lqxInfo = document.getElementById("lqx-info");
  const warning = document.getElementById("requirement-warning");

  if (address) {
    walletInfo.innerText = `🧾 Connected: ${address}`;
    lqxInfo.innerText = `💰 LQX Balance: ${balance}`;
    
    if (balanceBN.lt(LQX_REQUIRED)) {
      warning.innerText = "⚠️ You must hold at least 1000 LQX tokens to use this tool.";
      disableToolUI();
    } else {
      warning.innerText = "";
      enableToolUI();
    }
  } else {
    walletInfo.innerText = "";
    lqxInfo.innerText = "";
    warning.innerText = "🔌 Wallet disconnected.";
    disableToolUI();
  }
}

function disableToolUI() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

function enableToolUI() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}

async function checkAndSwitchToPolygon() {
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

  if (![POLYGON_MAINNET_CHAIN_ID, POLYGON_TESTNET_CHAIN_ID].includes(currentChainId)) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: POLYGON_MAINNET_CHAIN_ID,
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: [POLYGON_RPC_URL],
        blockExplorerUrls: ['https://polygonscan.com/']
      }]
    });
  }
}
