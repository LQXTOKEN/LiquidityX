const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';

const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3'; // Διεύθυνση Staking Contract
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

        provider = new ethers.providers.Web3Provider(window.ethereum, "any"); // Δεχόμαστε οποιοδήποτε δίκτυο
        await provider.send("eth_requestAccounts", []); // Ζητάμε από το MetaMask να συνδεθεί
        signer = provider.getSigner();
        connectedAddress = await signer.getAddress();

        console.log("✅ Wallet Connected Successfully:", connectedAddress);
        document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;

        // Δημιουργούμε το staking contract
        stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);

        // Φόρτωσε τα δεδομένα με την πρώτη σύνδεση
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

        console.log("📈 Fetching APR from contract...");
        const apr = await stakingContract.getAPR();

        if (!apr) {
            console.error("❌ APR returned undefined or null.");
            document.getElementById('apr').innerText = `APR: Error fetching`;
            return;
        }

        const aprFormatted = ethers.utils.formatUnits(apr, 2);
        console.log("✅ APR Fetched Successfully:", aprFormatted);
        document.getElementById('apr').innerText = `APR: ${aprFormatted}%`;

    } catch (error) {
        console.error("❌ Error Fetching Data:", error);
        document.getElementById('apr').innerText = `APR: Error fetching`;
    }
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
