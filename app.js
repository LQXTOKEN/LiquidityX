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
        const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN.address, CONFIG.LQX_TOKEN.abi, signer);
        const lpContract = new ethers.Contract(CONFIG.LP_TOKEN.address, CONFIG.LP_TOKEN.abi, signer);

        let lqxBalance = await lqxContract.balanceOf(account).catch(error => {
            console.error('Error fetching LQX Balance:', error);
            alert('Error fetching LQX Balance. Make sure you are on the correct network (Polygon Mainnet).');
            return 0;
        });

        let lpBalance = await lpContract.balanceOf(account).catch(error => {
            console.error('Error fetching LP Balance:', error);
            alert('Error fetching LP Balance. Make sure you are on the correct network (Polygon Mainnet).');
            return 0;
        });

        document.getElementById('lqxBalance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)}`;
        document.getElementById('lpBalance').innerText = `LP Balance: ${ethers.utils.formatUnits(lpBalance, 18)}`;

    } catch (error) {
        console.error("General Error loading balances:", error);
        alert('An unexpected error occurred. Please try again.');
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
