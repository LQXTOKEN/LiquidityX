const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';

const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
const LQX_TOKEN = '0x9e27f48659b1005b1abc0f58465137e531430d4b';
const LP_TOKEN = '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E';

const STAKING_CONTRACT_ABI = [
    'function claimRewards() public',
    'function getAPR() public view returns (uint256)',
    'function earned(address account) public view returns (uint256)',
    'function userStake(address account) public view returns (uint256)',
    'function stake(uint256 amount) public',
    'function unstake(uint256 amount) public'
];

let stakingContract;

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or another Web3 wallet!');
        return;
    }

    try {
        console.log("🔌 Attempting to connect wallet...");

        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        connectedAddress = await signer.getAddress();

        console.log("✅ Wallet Connected Successfully:", connectedAddress);
        document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;

        stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);

        await fetchAllData();

    } catch (error) {
        console.error("❌ Connection error:", error);
    }
}

async function stakeTokens() {
    try {
        const amount = document.getElementById('stake-amount').value;
        if (!amount || amount <= 0) return alert("Please enter a valid amount.");

        const tx = await stakingContract.stake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert("✅ Successfully Staked Tokens!");

        await fetchAllData();
    } catch (error) {
        console.error("❌ Error Staking Tokens:", error);
    }
}

async function unstakeTokens() {
    try {
        const amount = document.getElementById('unstake-amount').value;
        if (!amount || amount <= 0) return alert("Please enter a valid amount.");

        const tx = await stakingContract.unstake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert("✅ Successfully Unstaked Tokens!");

        await fetchAllData();
    } catch (error) {
        console.error("❌ Error Unstaking Tokens:", error);
    }
}

async function claimRewards() {
    try {
        const tx = await stakingContract.claimRewards();
        await tx.wait();
        alert("✅ Rewards Claimed Successfully!");

        await fetchAllData();
    } catch (error) {
        console.error("❌ Error Claiming Rewards:", error);
    }
}

async function fetchAllData() {
    try {
        const apr = await stakingContract.getAPR();
        const aprFormatted = ethers.utils.formatUnits(apr, 2);
        document.getElementById('apr').innerText = `APR: ${aprFormatted}%`;
    } catch (error) {
        console.error("❌ Error Fetching Data:", error);
    }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('stake-btn').addEventListener('click', stakeTokens);
document.getElementById('unstake-btn').addEventListener('click', unstakeTokens);
document.getElementById('claim-rewards-btn').addEventListener('click', claimRewards);
