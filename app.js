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
            "function stake(uint256 amount) public",
            "function unstake(uint256 amount) external",
            "function claimRewards() external",
            "function getStakedAmount(address user) external view returns (uint256)",
            "function earned(address user) external view returns (uint256)",
            "function getAPR() public view returns (uint256)"
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
    const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);
    const stakedAmount = await stakingContract.getStakedAmount(account);
    const pendingReward = await stakingContract.earned(account);
    document.getElementById('stakedAmount').innerText = `Staked: ${ethers.utils.formatUnits(stakedAmount, 18)}`;
    document.getElementById('pendingReward').innerText = `Pending Reward: ${ethers.utils.formatUnits(pendingReward, 18)}`;
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
