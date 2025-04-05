// Contract Addresses
const LQX_TOKEN_ADDRESS = "0x9e27f48659b1005b1abc0f58465137e531430d4b";
const LP_STAKING_ADDRESS = "0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3";
const LP_TOKEN_ADDRESS = "0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E";

// Contract ABIs (simplified versions)
const LQX_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)"
];

const LP_STAKING_ABI = [
    "function stake(uint256 amount)",
    "function unstake(uint256 amount)",
    "function claimRewards()",
    "function userStake(address) view returns (uint256)",
    "function earned(address) view returns (uint256)",
    "function getAPR() view returns (uint256)"
];

const LP_TOKEN_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address) view returns (uint256)"
];

let provider, signer, lqxContract, lpStakingContract, lpTokenContract;
let currentAccount = null;

// Initialize the DApp
async function init() {
    // Connect to MetaMask
    document.getElementById('connectButton').onclick = connectWallet;
    document.getElementById('stakeButton').onclick = stakeLP;
    document.getElementById('unstakeButton').onclick = unstakeLP;
    document.getElementById('claimButton').onclick = claimRewards;

    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        currentAccount = await signer.getAddress();

        // Initialize contracts
        lqxContract = new ethers.Contract(LQX_TOKEN_ADDRESS, LQX_ABI, signer);
        lpStakingContract = new ethers.Contract(LP_STAKING_ADDRESS, LP_STAKING_ABI, signer);
        lpTokenContract = new ethers.Contract(LP_TOKEN_ADDRESS, LP_TOKEN_ABI, signer);

        // Update UI
        document.getElementById('walletStatus').textContent = `Connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
        
        // Load data
        await updateBalances();
        
        // Set up periodic refresh
        setInterval(updateBalances, 10000);
    } catch (error) {
        console.error("Connection error:", error);
        alert("Connection failed: " + error.message);
    }
}

async function updateBalances() {
    if (!currentAccount) return;

    try {
        // Get LQX balance
        const lqxBalance = await lqxContract.balanceOf(currentAccount);
        document.getElementById('lqxBalance').textContent = ethers.utils.formatUnits(lqxBalance, 18);

        // Get staking info
        const userStake = await lpStakingContract.userStake(currentAccount);
        const pendingRewards = await lpStakingContract.earned(currentAccount);
        const currentAPR = await lpStakingContract.getAPR();

        document.getElementById('userStake').textContent = ethers.utils.formatUnits(userStake, 18);
        document.getElementById('pendingRewards').textContent = ethers.utils.formatUnits(pendingRewards, 18);
        document.getElementById('currentAPR').textContent = currentAPR.toString();
    } catch (error) {
        console.error("Update error:", error);
    }
}

async function stakeLP() {
    const amount = document.getElementById('stakeAmount').value;
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    try {
        // Approve LP tokens first
        const amountWei = ethers.utils.parseUnits(amount, 18);
        const approveTx = await lpTokenContract.approve(LP_STAKING_ADDRESS, amountWei);
        await approveTx.wait();

        // Then stake
        const stakeTx = await lpStakingContract.stake(amountWei);
        await stakeTx.wait();
        
        alert("Staking successful!");
        await updateBalances();
    } catch (error) {
        console.error("Staking error:", error);
        alert("Staking failed: " + error.message);
    }
}

async function unstakeLP() {
    const amount = document.getElementById('stakeAmount').value;
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    try {
        const amountWei = ethers.utils.parseUnits(amount, 18);
        const tx = await lpStakingContract.unstake(amountWei);
        await tx.wait();
        
        alert("Unstaking successful!");
        await updateBalances();
    } catch (error) {
        console.error("Unstaking error:", error);
        alert("Unstaking failed: " + error.message);
    }
}

async function claimRewards() {
    try {
        const tx = await lpStakingContract.claimRewards();
        await tx.wait();
        
        alert("Rewards claimed successfully!");
        await updateBalances();
    } catch (error) {
        console.error("Claim error:", error);
        alert("Claim failed: " + error.message);
    }
}

// Start the DApp
window.onload = init;
