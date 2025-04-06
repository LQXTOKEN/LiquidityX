const { ethers } = window;

// Configuration
const CONFIG = {
    STAKING_CONTRACT_ADDRESS: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
    LQX_TOKEN: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
    LP_TOKEN: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
    NETWORK: {
        id: 137, // Polygon Mainnet
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com/',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        }
    },
    TOKEN_DECIMALS: 18
};

// State
let provider;
let signer;
let connectedAddress = '';
let currentWallet = '';
let stakingContract;
let lqxContract;
let lpContract;

// Initialize
async function init() {
    await detectWallets();
    setupEventListeners();
    
    if (localStorage.getItem('walletConnected') === 'true') {
        connectWallet(localStorage.getItem('lastUsedWallet'));
    }
}

// Ανίχνευση διαθέσιμων wallets
async function detectWallets() {
    const walletSelect = document.getElementById('wallet-select');
    walletSelect.innerHTML = '<option value="">Select Wallet</option>';
    
    if (window.ethereum) {
        addWalletOption(walletSelect, 'MetaMask', 'metamask');
        
        if (window.ethereum.isCoinbaseWallet) addWalletOption(walletSelect, 'Coinbase Wallet', 'coinbase');
        if (window.ethereum.isTrust) addWalletOption(walletSelect, 'Trust Wallet', 'trust');
        if (window.ethereum.isTokenPocket) addWalletOption(walletSelect, 'TokenPocket', 'tokenpocket');
        if (window.ethereum.isBraveWallet) addWalletOption(walletSelect, 'Brave Wallet', 'brave');
    }
    
    if (window.BinanceChain) addWalletOption(walletSelect, 'Binance Chain Wallet', 'binance');
}

function addWalletOption(selectElement, name, value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    selectElement.appendChild(option);
}

// Συνάρτηση σύνδεσης wallet
async function connectWallet(walletId = null) {
    try {
        if (!walletId) walletId = document.getElementById('wallet-select').value;
        if (!walletId) return alert('Please select a wallet first');

        console.log(`🔌 Connecting to ${walletId}...`);

        // Initialize provider based on wallet
        if (walletId === 'binance') {
            provider = new ethers.providers.Web3Provider(window.BinanceChain, "any");
            await window.BinanceChain.enable();
        } else {
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
        }

        // Check and switch network if needed
        await checkAndSwitchNetwork();

        // Initialize contracts
        await initializeContracts();

        // Get user address
        signer = provider.getSigner();
        connectedAddress = await signer.getAddress();
        currentWallet = walletId;
        
        updateUIAfterConnection();
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('lastUsedWallet', walletId);
        
        await fetchAllData();

    } catch (error) {
        console.error(`❌ Connection error:`, error);
        alert(`Connection failed: ${error.message}`);
    }
}

async function checkAndSwitchNetwork() {
    const network = await provider.getNetwork();
    if (network.chainId === CONFIG.NETWORK.id) return;
    
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: `0x${CONFIG.NETWORK.id.toString(16)}`,
                chainName: CONFIG.NETWORK.name,
                nativeCurrency: CONFIG.NETWORK.nativeCurrency,
                rpcUrls: [CONFIG.NETWORK.rpcUrl],
                blockExplorerUrls: ['https://polygonscan.com/']
            }]
        });
    } catch (error) {
        console.error('Network switch error:', error);
        throw new Error('Please switch to Polygon network manually');
    }
}

async function initializeContracts() {
    // Load ABIs
    const stakingABI = await loadABI('StakingContract.json');
    const lqxABI = await loadABI('LQXToken.json');
    const lpABI = await loadABI('LPToken.json');
    
    // Initialize contract instances
    stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT_ADDRESS, stakingABI, signer);
    lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN, lqxABI, signer);
    lpContract = new ethers.Contract(CONFIG.LP_TOKEN, lpABI, signer);
}

async function loadABI(abiFileName) {
    try {
        const response = await fetch(`abis/${abiFileName}`);
        if (!response.ok) throw new Error(`Failed to load ABI: ${abiFileName}`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ABI ${abiFileName}:`, error);
        throw error;
    }
}

function updateUIAfterConnection() {
    const shortAddress = `${connectedAddress.substring(0, 6)}...${connectedAddress.substring(38)}`;
    document.getElementById('wallet-address').textContent = `Connected (${currentWallet}): ${shortAddress}`;
    document.getElementById('connect-btn').style.display = 'none';
    document.getElementById('disconnect-btn').style.display = 'block';
    document.getElementById('wallet-select').disabled = true;
}

function disconnectWallet() {
    provider = null;
    signer = null;
    connectedAddress = '';
    currentWallet = '';
    
    document.getElementById('wallet-address').textContent = 'Disconnected';
    document.getElementById('connect-btn').style.display = 'block';
    document.getElementById('disconnect-btn').style.display = 'none';
    document.getElementById('wallet-select').disabled = false;
    
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('lastUsedWallet');
    
    console.log("✅ Wallet Disconnected Successfully");
}

// Fetch all data
async function fetchAllData() {
    if (!signer) return;
    
    try {
        const [apr, lqxBalance, lpBalance, stakedAmount, earned] = await Promise.all([
            stakingContract.getAPR(),
            lqxContract.balanceOf(connectedAddress),
            lpContract.balanceOf(connectedAddress),
            stakingContract.userStake(connectedAddress),
            stakingContract.earned(connectedAddress)
        ]);
        
        // Update UI
        document.getElementById('apr').textContent = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;
        document.getElementById('lqx-balance').textContent = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, CONFIG.TOKEN_DECIMALS)}`;
        document.getElementById('lp-balance').textContent = `LP Balance: ${ethers.utils.formatUnits(lpBalance, CONFIG.TOKEN_DECIMALS)}`;
        document.getElementById('staked-amount').textContent = `Staked: ${ethers.utils.formatUnits(stakedAmount, CONFIG.TOKEN_DECIMALS)}`;
        document.getElementById('earned-rewards').textContent = `Earned: ${ethers.utils.formatUnits(earned, CONFIG.TOKEN_DECIMALS)}`;

        console.log("✅ All data fetched successfully");
    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }
}

// Stake Tokens
async function stakeTokens() {
    try {
        const amount = document.getElementById('stake-amount').value;
        if (!amount || amount <= 0) return alert("Please enter a valid amount");
        
        const parsedAmount = ethers.utils.parseUnits(amount, CONFIG.TOKEN_DECIMALS);
        
        // Check allowance first
        const allowance = await lpContract.allowance(connectedAddress, CONFIG.STAKING_CONTRACT_ADDRESS);
        if (allowance.lt(parsedAmount)) {
            console.log("🔏 Approving tokens...");
            const approveTx = await lpContract.approve(CONFIG.STAKING_CONTRACT_ADDRESS, parsedAmount);
            await approveTx.wait();
        }
        
        console.log("📥 Staking tokens...");
        const tx = await stakingContract.stake(parsedAmount);
        await tx.wait();
        
        alert("✅ Successfully staked tokens!");
        await fetchAllData();
    } catch (error) {
        console.error("❌ Error staking tokens:", error);
        alert(`Staking failed: ${error.message}`);
    }
}

// Unstake Tokens
async function unstakeTokens() {
    try {
        const amount = document.getElementById('unstake-amount').value;
        if (!amount || amount <= 0) return alert("Please enter a valid amount");
        
        const parsedAmount = ethers.utils.parseUnits(amount, CONFIG.TOKEN_DECIMALS);
        
        console.log("📤 Unstaking tokens...");
        const tx = await stakingContract.unstake(parsedAmount);
        await tx.wait();
        
        alert("✅ Successfully unstaked tokens!");
        await fetchAllData();
    } catch (error) {
        console.error("❌ Error unstaking tokens:", error);
        alert(`Unstaking failed: ${error.message}`);
    }
}

// Claim Rewards
async function claimRewards() {
    try {
        console.log("💰 Claiming rewards...");
        const tx = await stakingContract.claimRewards();
        await tx.wait();
        
        alert("✅ Rewards claimed successfully!");
        await fetchAllData();
    } catch (error) {
        console.error("❌ Error claiming rewards:", error);
        alert(`Claiming rewards failed: ${error.message}`);
    }
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('connect-btn').addEventListener('click', connectWallet);
    document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
    document.getElementById('stake-btn').addEventListener('click', stakeTokens);
    document.getElementById('unstake-btn').addEventListener('click', unstakeTokens);
    document.getElementById('claim-rewards-btn').addEventListener('click', claimRewards);
    
    // Handle wallet and network changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                connectedAddress = accounts[0];
                updateUIAfterConnection();
                fetchAllData();
            }
        });
        
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
