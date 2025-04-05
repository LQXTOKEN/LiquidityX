// Contracts Configuration
const CONFIG = {
    staking: {
        address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
        abi: [] // Will be loaded from abis/LPStaking.json
    },
    lpToken: {
        address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
        abi: [] // Will be loaded from abis/LPToken.json
    },
    lqxToken: {
        address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
        abi: [] // Will be loaded from abis/LQXToken.json
    }
};

// Global Variables
let provider, signer;
let stakingContract, lpTokenContract, lqxTokenContract;
let currentAccount = null;
let currentChainId = null;
let walletConnectProvider = null;

// Initialize the application
async function init() {
    await loadABIs();
    setupEventListeners();
    
    // Check if wallet is already connected
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await connectWallet('metamask');
        }
    }
}

// Load contract ABIs
async function loadABIs() {
    try {
        const [stakingABI, lpTokenABI, lqxTokenABI] = await Promise.all([
            fetch('abis/LPStaking.json').then(res => res.json()),
            fetch('abis/LPToken.json').then(res => res.json()),
            fetch('abis/LQXToken.json').then(res => res.json())
        ]);
        
        CONFIG.staking.abi = stakingABI;
        CONFIG.lpToken.abi = lpTokenABI;
        CONFIG.lqxToken.abi = lqxTokenABI;
    } catch (error) {
        console.error('Error loading ABIs:', error);
        showNotification('Failed to load contract data', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Connect button
    document.getElementById('connectButton').addEventListener('click', () => {
        document.getElementById('walletModal').classList.remove('hidden');
    });
    
    // Close modal button
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('walletModal').classList.add('hidden');
    });
    
    // Wallet options
    document.querySelectorAll('.wallet-option').forEach(option => {
        option.addEventListener('click', async () => {
            const walletType = option.dataset.wallet;
            document.getElementById('walletModal').classList.add('hidden');
            await connectWallet(walletType);
        });
    });
    
    // Switch network button
    document.getElementById('switchNetworkBtn').addEventListener('click', switchNetwork);
    
    // Disconnect button
    document.getElementById('disconnectBtn').addEventListener('click', disconnectWallet);
    
    // Stake button
    document.getElementById('stakeBtn').addEventListener('click', stake);
    
    // Unstake button
    document.getElementById('unstakeBtn').addEventListener('click', unstake);
    
    // Claim button
    document.getElementById('claimBtn').addEventListener('click', claimRewards);
    
    // Max buttons
    document.getElementById('maxStakeBtn').addEventListener('click', () => {
        const balance = document.getElementById('lpBalance').textContent;
        document.getElementById('stakeAmount').value = balance;
    });
    
    document.getElementById('maxUnstakeBtn').addEventListener('click', () => {
        const balance = document.getElementById('stakedBalance').textContent;
        document.getElementById('unstakeAmount').value = balance;
    });
    
    // Handle account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }
}

// Connect wallet
async function connectWallet(walletType) {
    try {
        showLoading('Connecting wallet...');
        
        if (walletType === 'metamask' || walletType === 'trustwallet') {
            if (!window.ethereum) throw new Error('Wallet not installed');
            
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            
            // Get network and account
            const network = await provider.getNetwork();
            currentChainId = network.chainId;
            currentAccount = await signer.getAddress();
            
            // Check if we're on Polygon
            if (currentChainId !== 137) {
                await switchNetwork();
            }
        } 
        else if (walletType === 'walletconnect') {
            walletConnectProvider = new WalletConnectProvider.default({
                rpc: {
                    137: 'https://polygon-rpc.com'
                }
            });
            
            await walletConnectProvider.enable();
            provider = new ethers.providers.Web3Provider(walletConnectProvider);
            signer = provider.getSigner();
            
            currentAccount = await signer.getAddress();
            currentChainId = 137; // WalletConnect defaults to configured chain
        }
        
        // Initialize contracts
        initContracts();
        
        // Update UI
        updateUI();
        startBalanceUpdates();
        
        showNotification('Wallet connected successfully', 'success');
    } catch (error) {
        console.error('Wallet connection error:', error);
        showNotification(`Connection failed: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Initialize contracts
function initContracts() {
    stakingContract = new ethers.Contract(
        CONFIG.staking.address,
        CONFIG.staking.abi,
        signer
    );
    
    lpTokenContract = new ethers.Contract(
        CONFIG.lpToken.address,
        CONFIG.lpToken.abi,
        signer
    );
    
    lqxTokenContract = new ethers.Contract(
        CONFIG.lqxToken.address,
        CONFIG.lqxToken.abi,
        signer
    );
}

// Switch to Polygon network
async function switchNetwork() {
    try {
        showLoading('Switching network...');
        
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], // Polygon chainId
        });
        
        // Reload after network switch
        window.location.reload();
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x89',
                        chainName: 'Polygon Mainnet',
                        nativeCurrency: {
                            name: 'MATIC',
                            symbol: 'MATIC',
                            decimals: 18
                        },
                        rpcUrls: ['https://polygon-rpc.com/'],
                        blockExplorerUrls: ['https://polygonscan.com/']
                    }]
                });
            } catch (addError) {
                console.error('Error adding Polygon network:', addError);
                showNotification('Failed to add Polygon network', 'error');
            }
        } else {
            console.error('Error switching network:', switchError);
            showNotification('Failed to switch network', 'error');
        }
    } finally {
        hideLoading();
    }
}

// Disconnect wallet
async function disconnectWallet() {
    try {
        if (walletConnectProvider) {
            await walletConnectProvider.disconnect();
            walletConnectProvider = null;
        }
        
        provider = null;
        signer = null;
        stakingContract = null;
        lpTokenContract = null;
        lqxTokenContract = null;
        currentAccount = null;
        
        updateUI();
        stopBalanceUpdates();
        
        showNotification('Wallet disconnected', 'info');
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
    }
}

// Handle account changes
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // Wallet disconnected
        await disconnectWallet();
    } else {
        // Account changed
        currentAccount = accounts[0];
        updateUI();
    }
}

// Handle chain changes
function handleChainChanged(chainId) {
    // Reload the page when network changes
    window.location.reload();
}

// Stake tokens
async function stake() {
    const amount = document.getElementById('stakeAmount').value;
    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    try {
        showLoading('Processing stake...');
        
        // First approve the staking contract to spend tokens
        const approveTx = await lpTokenContract.approve(
            CONFIG.staking.address,
            ethers.utils.parseUnits(amount, 18)
        );
        await approveTx.wait();
        
        // Then stake the tokens
        const stakeTx = await stakingContract.stake(
            ethers.utils.parseUnits(amount, 18)
        );
        await stakeTx.wait();
        
        // Add to transaction history
        addTransaction('Stake', stakeTx.hash);
        
        // Update balances
        await updateBalances();
        
        showNotification('Tokens staked successfully!', 'success');
        document.getElementById('stakeAmount').value = '';
    } catch (error) {
        console.error('Staking error:', error);
        showNotification(`Staking failed: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Unstake tokens
async function unstake() {
    const amount = document.getElementById('unstakeAmount').value;
    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    try {
        showLoading('Processing unstake...');
        
        const tx = await stakingContract.unstake(
            ethers.utils.parseUnits(amount, 18)
        );
        await tx.wait();
        
        // Add to transaction history
        addTransaction('Unstake', tx.hash);
        
        // Update balances
        await updateBalances();
        
        showNotification('Tokens unstaked successfully!', 'success');
        document.getElementById('unstakeAmount').value = '';
    } catch (error) {
        console.error('Unstaking error:', error);
        showNotification(`Unstaking failed: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Claim rewards
async function claimRewards() {
    try {
        showLoading('Claiming rewards...');
        
        const tx = await stakingContract.claimRewards();
        await tx.wait();
        
        // Add to transaction history
        addTransaction('Claim Rewards', tx.hash);
        
        // Update balances
        await updateBalances();
        
        showNotification('Rewards claimed successfully!', 'success');
    } catch (error) {
        console.error('Claim rewards error:', error);
        showNotification(`Claim failed: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Update all balances
async function updateBalances() {
    if (!currentAccount) return;
    
    try {
        const [lpBalance, stakedBalance, rewardsBalance, totalStaked] = await Promise.all([
            lpTokenContract.balanceOf(currentAccount),
            stakingContract.userStake(currentAccount),
            stakingContract.earned(currentAccount),
            stakingContract.totalStaked()
        ]);
        
        // Calculate APR
        const rewardsRate = await stakingContract.rewardsRate();
        const annualRewards = rewardsRate.mul(60 * 60 * 24 * 365);
        const apr = totalStaked.gt(0) 
            ? annualRewards.mul(10000).div(totalStaked).toNumber() / 100 
            : 0;
        
        // Calculate user share
        const userShare = totalStaked.gt(0) 
            ? stakedBalance.mul(10000).div(totalStaked).toNumber() / 100 
            : 0;
        
        // Update UI
        document.getElementById('lpBalance').textContent = 
            parseFloat(ethers.utils.formatUnits(lpBalance, 18)).toFixed(4);
        document.getElementById('stakedBalance').textContent = 
            parseFloat(ethers.utils.formatUnits(stakedBalance, 18)).toFixed(4);
        document.getElementById('rewardsBalance').textContent = 
            parseFloat(ethers.utils.formatUnits(rewardsBalance, 18)).toFixed(4);
        document.getElementById('totalStaked').textContent = 
            parseFloat(ethers.utils.formatUnits(totalStaked, 18)).toFixed(2) + ' LP';
        document.getElementById('aprValue').textContent = apr.toFixed(2) + '%';
        document.getElementById('userShare').textContent = userShare.toFixed(2) + '%';
        
        // Enable/disable buttons
        document.getElementById('stakeBtn').disabled = false;
        document.getElementById('unstakeBtn').disabled = false;
        document.getElementById('claimBtn').disabled = rewardsBalance.lte(0);
    } catch (error) {
        console.error('Error updating balances:', error);
    }
}

// Start periodic balance updates
function startBalanceUpdates() {
    // Update immediately
    updateBalances();
    
    // Then every 30 seconds
    balanceUpdateInterval = setInterval(updateBalances, 30000);
}

// Stop balance updates
function stopBalanceUpdates() {
    if (balanceUpdateInterval) {
        clearInterval(balanceUpdateInterval);
        balanceUpdateInterval = null;
    }
}

// Add transaction to history
function addTransaction(type, hash) {
    const txHistory = document.getElementById('transactionHistory');
    const emptyState = txHistory.querySelector('.empty-state');
    
    if (emptyState) {
        txHistory.removeChild(emptyState);
    }
    
    const txItem = document.createElement('div');
    txItem.className = 'transaction-item';
    
    const txType = document.createElement('div');
    txType.className = 'transaction-type';
    txType.innerHTML = `
        <i class="fas fa-${getTransactionIcon(type)}"></i>
        <span>${type}</span>
    `;
    
    const txLink = document.createElement('a');
    txLink.href = `https://polygonscan.com/tx/${hash}`;
    txLink.target = '_blank';
    txLink.rel = 'noopener noreferrer';
    txLink.innerHTML = `
        <i class="fas fa-external-link-alt"></i>
        View
    `;
    
    txItem.appendChild(txType);
    txItem.appendChild(txLink);
    txHistory.insertBefore(txItem, txHistory.firstChild);
    
    // Limit to 10 transactions
    if (txHistory.children.length > 10) {
        txHistory.removeChild(txHistory.lastChild);
    }
}

// Get transaction icon
function getTransactionIcon(type) {
    switch(type.toLowerCase()) {
        case 'stake': return 'lock';
        case 'unstake': return 'unlock';
        case 'claim rewards': return 'gift';
        default: return 'exchange-alt';
    }
}

// Update UI based on connection state
function updateUI() {
    if (currentAccount) {
        // Wallet connected
        const shortAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
        document.getElementById('connectButton').innerHTML = `
            <i class="fas fa-wallet"></i>
            <span class="btn-text">${shortAddress}</span>
        `;
        
        document.getElementById('networkIndicator').classList.remove('hidden');
        document.getElementById('networkStatusText').textContent = 'Connected to Polygon';
        
        // Enable action buttons
        document.getElementById('stakeBtn').disabled = false;
        document.getElementById('unstakeBtn').disabled = false;
    } else {
        // Wallet disconnected
        document.getElementById('connectButton').innerHTML = `
            <i class="fas fa-wallet"></i>
            <span class="btn-text">Connect</span>
        `;
        
        document.getElementById('networkIndicator').classList.add('hidden');
        
        // Reset balances
        document.getElementById('lpBalance').textContent = '0.00';
        document.getElementById('stakedBalance').textContent = '0.00';
        document.getElementById('rewardsBalance').textContent = '0.00';
        document.getElementById('totalStaked').textContent = '0.00 LP';
        document.getElementById('aprValue').textContent = '0.00%';
        document.getElementById('userShare').textContent = '0.00%';
        
        // Disable action buttons
        document.getElementById('stakeBtn').disabled = true;
        document.getElementById('unstakeBtn').disabled = true;
        document.getElementById('claimBtn').disabled = true;
    }
}

// Show loading overlay
function showLoading(message = 'Processing...') {
    document.getElementById('loadingOverlay').classList.remove('hidden');
    document.getElementById('loadingText').textContent = message;
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Show notification toast
function showNotification(message, type = 'info') {
    const toast = document.getElementById('transactionToast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
