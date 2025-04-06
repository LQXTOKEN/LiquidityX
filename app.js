const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';

const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
let stakingContract;
let lqxContract;
let lpContract;

const STAKING_CONTRACT_ABI = [
    'function claimRewards() public',
    'function getAPR() public view returns (uint256)',
    'function earned(address account) public view returns (uint256)',
    'function userStake(address account) public view returns (uint256)',
    'function stake(uint256 amount) public',
    'function unstake(uint256 amount) public'
];

const LQX_ABI = [
    'function balanceOf(address account) public view returns (uint256)'
];

const LP_ABI = [
    'function balanceOf(address account) public view returns (uint256)',
    'function approve(address spender, uint256 amount) public returns (bool)',
    'function allowance(address owner, address spender) public view returns (uint256)'
];

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask or another Web3 wallet!');
        return;
    }

    try {
        console.log("🔌 Attempting to connect wallet...");

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        connectedAddress = await signer.getAddress();

        console.log("✅ Wallet Connected Successfully:", connectedAddress);
        document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;

        stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
        lqxContract = new ethers.Contract('0x9e27f48659b1005b1abc0f58465137e531430d4b', LQX_ABI, provider);
        lpContract = new ethers.Contract('0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E', LP_ABI, provider);

        await fetchAllData();

    } catch (error) {
        console.error("❌ Connection error:", error);
    }
}

async function fetchAllData() {
    try {
        console.log("📊 Fetching all data...");

        // Εμφανίζουμε πάντα το Loading αρχικά
        document.getElementById('apr').innerText = `APR: Loading...`;

        // Fetch APR
        const apr = await stakingContract.getAPR();
        const aprFormatted = ethers.utils.formatUnits(apr, 2);
        console.log("📈 APR:", aprFormatted);
        document.getElementById('apr').innerText = `APR: ${aprFormatted}%`;

        // Fetch LQX Balance
        const lqxBalance = await lqxContract.balanceOf(connectedAddress);
        document.getElementById('lqx-balance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)}`;

        // Fetch LP Token Balance
        const lpBalance = await lpContract.balanceOf(connectedAddress);
        document.getElementById('lp-balance').innerText = `LP Token Balance: ${ethers.utils.formatUnits(lpBalance, 18)}`;

        // Fetch Staked Amount
        const stakedAmount = await stakingContract.userStake(connectedAddress);
        document.getElementById('staked-amount').innerText = `Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)}`;

        // Fetch Earned Rewards
        const earned = await stakingContract.earned(connectedAddress);
        document.getElementById('earned-rewards').innerText = `Earned Rewards: ${ethers.utils.formatUnits(earned, 18)}`;

    } catch (error) {
        console.error("❌ Error Fetching Data:", error);
        document.getElementById('apr').innerText = `APR: Error fetching`;
    }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
