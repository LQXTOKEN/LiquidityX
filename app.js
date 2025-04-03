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
        address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
        abi: [
            "function stake(uint256 amount) external",
            "function unstake(uint256 amount) external",
            "function claimRewards() external",
            "function userStake(address account) external view returns (uint256)",
            "function earned(address account) external view returns (uint256)",
            "function getAPR() public view returns (uint256)",
            "function rewardPerToken() public view returns (uint256)",
            "function emergencyPause(bool _paused) external",
            "function setAPR(uint256 apr) public"
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
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance, "any");
    signer = provider.getSigner();
    account = await signer.getAddress();
    document.getElementById('connectButton').innerText = `Connected: ${account}`;
    loadBalances();
}

async function loadBalances() {
    try {
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);
        const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN.address, CONFIG.LQX_TOKEN.abi, signer);
        const lpContract = new ethers.Contract(CONFIG.LP_TOKEN.address, CONFIG.LP_TOKEN.abi, signer);

        let stakedAmount = 0;
        let pendingReward = 0;
        let lqxBalance = 0;
        let lpBalance = 0;

        try {
            lqxBalance = await lqxContract.balanceOf(account);
            document.getElementById('lqxBalance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)}`;
        } catch (error) {
            console.log('Error fetching LQX Balance', error);
        }

        try {
            lpBalance = await lpContract.balanceOf(account);
            document.getElementById('lpBalance').innerText = `LP Balance: ${ethers.utils.formatUnits(lpBalance, 18)}`;
        } catch (error) {
            console.log('Error fetching LP Balance', error);
        }

        try {
            stakedAmount = await stakingContract.userStake(account);
            document.getElementById('stakedAmount').innerText = `Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)}`;
        } catch (error) {
            console.log('User has no stake, returning 0');
            stakedAmount = 0;
        }

        try {
            pendingReward = await stakingContract.earned(account);
            document.getElementById('pendingReward').innerText = `Pending Reward: ${ethers.utils.formatUnits(pendingReward, 18)}`;
        } catch (error) {
            console.log('User has no pending rewards, returning 0');
            pendingReward = 0;
        }

    } catch (error) {
        console.error("Error loading balances:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
