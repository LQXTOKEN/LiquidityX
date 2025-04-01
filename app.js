const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const { ethers } = window;

const CONFIG = {
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
        address: '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9',
        abi: [
            "function stake(uint256 amount) public",
            "function unstake(uint256 amount) public",
            "function claimReward() public",
            "function getUserStake(address account) external view returns (uint256)",
            "function getPendingReward(address account) external view returns (uint256)"
        ]
    }
};

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: { 137: 'https://polygon-rpc.com' }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
    theme: 'dark'
});

let provider, signer, account;

async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();
        account = await signer.getAddress();
        document.getElementById('connectButton').innerText = `Connected: ${account}`;

        const network = await provider.getNetwork();
        console.log("Connected to network:", network.name, "Chain ID:", network.chainId);

        loadBalances();
    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
}

async function loadBalances() {
    try {
        const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN.address, CONFIG.LQX_TOKEN.abi, provider);
        const lpContract = new ethers.Contract(CONFIG.LP_TOKEN.address, CONFIG.LP_TOKEN.abi, provider);
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, provider);

        const lqxBalance = await lqxContract.balanceOf(account);
        const lpBalance = await lpContract.balanceOf(account);
        const stakedAmount = await stakingContract.getUserStake(account);
        const pendingReward = await stakingContract.getPendingReward(account);

        document.getElementById('lqxBalance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)} LQX`;
        document.getElementById('lpBalance').innerText = `LP Balance: ${ethers.utils.formatUnits(lpBalance, 18)} LP`;
        document.getElementById('stakedAmount').innerText = `Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)} LP`;
        document.getElementById('pendingReward').innerText = `Pending Reward: ${ethers.utils.formatUnits(pendingReward, 18)} LQX`;
    } catch (error) {
        console.error("Error loading balances:", error);
    }
}

async function stake() {
    try {
        const amount = document.getElementById('stakeAmount').value;
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);

        const tx = await stakingContract.stake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert('Stake successful!');
        loadBalances();
    } catch (error) {
        console.error("Error during staking:", error);
    }
}

async function unstake() {
    try {
        const amount = document.getElementById('unstakeAmount').value;
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);

        const tx = await stakingContract.unstake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert('Unstake successful!');
        loadBalances();
    } catch (error) {
        console.error("Error during unstaking:", error);
    }
}

async function claimReward() {
    try {
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);

        const tx = await stakingContract.claimReward();
        await tx.wait();
        alert('Reward claimed successfully!');
        loadBalances();
    } catch (error) {
        console.error("Error during reward claim:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeButton').addEventListener('click', stake);
document.getElementById('unstakeButton').addEventListener('click', unstake);
document.getElementById('claimButton').addEventListener('click', claimReward);
