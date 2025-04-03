// Configuration
const CONFIG = {
    NETWORK: {
        chainId: 137, // Polygon Mainnet
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

let provider, signer, account;
let contracts = {};

function initContracts() {
    contracts = {
        lqx: new ethers.Contract(CONFIG.CONTRACTS.LQX_TOKEN.address, CONFIG.CONTRACTS.LQX_TOKEN.abi, signer),
        lp: new ethers.Contract(CONFIG.CONTRACTS.LP_TOKEN.address, CONFIG.CONTRACTS.LP_TOKEN.abi, signer),
        staking: new ethers.Contract(CONFIG.CONTRACTS.STAKING_CONTRACT.address, CONFIG.CONTRACTS.STAKING_CONTRACT.abi, signer)
    };
}

// Ελεγχος αν το contract έχει LQX tokens για rewards
async function checkContractBalance() {
    const lqxBalance = await contracts.lqx.balanceOf(CONFIG.CONTRACTS.STAKING_CONTRACT.address);
    if (lqxBalance.eq(0)) {
        showNotification("Το staking contract δεν έχει LQX tokens για rewards.", "warning");
    }
}

// Συνάρτηση για να ελέγξει το υπόλοιπο πριν το staking
async function checkStakingBalance(amount) {
    const lpBalance = await contracts.lp.balanceOf(account);
    if (lpBalance.lt(ethers.utils.parseUnits(amount, 18))) {
        throw new Error("Δεν έχεις αρκετά LP tokens για stake.");
    }
}

// Σύνδεση πορτοφολιού
async function connectWallet() {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    account = await signer.getAddress();
    initContracts();
    await checkContractBalance();
    await loadBalances();
}

// Φόρτωση υπολοίπων
async function loadBalances() {
    const lqxBalance = await contracts.lqx.balanceOf(account);
    const lpBalance = await contracts.lp.balanceOf(account);
    const stakedAmount = await contracts.staking.userStake(account);
    const pendingReward = await contracts.staking.earned(account);
    const apr = await contracts.staking.getAPR();

    document.getElementById('lqxBalance').textContent = ethers.utils.formatUnits(lqxBalance, 18);
    document.getElementById('lpBalance').textContent = ethers.utils.formatUnits(lpBalance, 18);
    document.getElementById('stakedAmount').textContent = ethers.utils.formatUnits(stakedAmount, 18);
    document.getElementById('pendingReward').textContent = ethers.utils.formatUnits(pendingReward, 18);
    document.getElementById('aprValue').textContent = `${ethers.utils.formatUnits(apr, 18)}%`;
}

// Stake Tokens
async function stakeTokens() {
    const amount = document.getElementById('stakeAmount').value;
    if (!amount) return alert("Εισήγαγε ποσότητα για staking.");
    
    await checkStakingBalance(amount);
    
    const tx = await contracts.lp.approve(CONFIG.CONTRACTS.STAKING_CONTRACT.address, ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    
    const stakeTx = await contracts.staking.stake(ethers.utils.parseUnits(amount, 18));
    await stakeTx.wait();

    await loadBalances();
}

// Unstake Tokens
async function unstakeTokens() {
    const amount = document.getElementById('unstakeAmount').value;
    if (!amount) return alert("Εισήγαγε ποσότητα για unstaking.");
    
    const tx = await contracts.staking.unstake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();

    await loadBalances();
}

// Claim Rewards
async function claimRewards() {
    const tx = await contracts.staking.claimRewards();
    await tx.wait();

    await loadBalances();
}

// Event Listeners
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeButton').addEventListener('click', stakeTokens);
document.getElementById('unstakeButton').addEventListener('click', unstakeTokens);
document.getElementById('claimButton').addEventListener('click', claimRewards);

// Auto-connect if cached
if (web3Modal.cachedProvider) {
    connectWallet();
}
