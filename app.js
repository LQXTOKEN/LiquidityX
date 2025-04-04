const CONFIG = {
    NETWORK: {
        chainId: 137,
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
                "function getAPR() external view returns (uint256)"
            ]
        }
    }
};

let provider, signer, account, contracts = {};

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            projectId: "48ddc1bb02b267108628eb924a3cb567",
            rpc: { 137: CONFIG.NETWORK.rpcUrl },
            qrcodeModalOptions: {
                mobileLinks: ["metamask", "trust", "keplr", "leap"]
            }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: 'dark'
});

// Initialize Contracts
function initContracts() {
    contracts = {
        lqx: new ethers.Contract(CONFIG.CONTRACTS.LQX_TOKEN.address, CONFIG.CONTRACTS.LQX_TOKEN.abi, signer),
        lp: new ethers.Contract(CONFIG.CONTRACTS.LP_TOKEN.address, CONFIG.CONTRACTS.LP_TOKEN.abi, signer),
        staking: new ethers.Contract(CONFIG.CONTRACTS.STAKING_CONTRACT.address, CONFIG.CONTRACTS.STAKING_CONTRACT.abi, signer)
    };
}

async function connectWallet() {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    account = await signer.getAddress();
    initContracts();
    loadBalances();
    document.getElementById('connectButton').innerText = `Connected: ${account}`;
}

async function loadBalances() {
    const [lqxBalance, lpBalance, stakedAmount, pendingReward, apr] = await Promise.all([
        contracts.lqx.balanceOf(account),
        contracts.lp.balanceOf(account),
        contracts.staking.userStake(account),
        contracts.staking.earned(account),
        contracts.staking.getAPR()
    ]);

    document.getElementById('lqxBalance').textContent = ethers.utils.formatUnits(lqxBalance, 18);
    document.getElementById('lpBalance').textContent = ethers.utils.formatUnits(lpBalance, 18);
    document.getElementById('stakedAmount').textContent = ethers.utils.formatUnits(stakedAmount, 18);
    document.getElementById('pendingReward').textContent = ethers.utils.formatUnits(pendingReward, 18);
    document.getElementById('aprValue').textContent = `${ethers.utils.formatUnits(apr, 18)}%`;
}

// Stake Tokens
async function stakeTokens() {
    const amount = document.getElementById('stakeAmount').value;
    const tx1 = await contracts.lp.approve(CONFIG.CONTRACTS.STAKING_CONTRACT.address, ethers.utils.parseUnits(amount, 18));
    await tx1.wait();

    const tx2 = await contracts.staking.stake(ethers.utils.parseUnits(amount, 18));
    await tx2.wait();

    loadBalances();
}

// Unstake Tokens
async function unstakeTokens() {
    const amount = document.getElementById('unstakeAmount').value;
    const tx = await contracts.staking.unstake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    loadBalances();
}

// Claim Rewards
async function claimRewards() {
    const tx = await contracts.staking.claimRewards();
    await tx.wait();
    loadBalances();
}

// Disconnect Wallet
function disconnectWallet() {
    web3Modal.clearCachedProvider();
    provider = null;
    signer = null;
    account = null;
    document.getElementById('connectButton').innerText = `Connect Wallet`;
}

// Event Listeners
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeButton').addEventListener('click', stakeTokens);
document.getElementById('unstakeButton').addEventListener('click', unstakeTokens);
document.getElementById('claimButton').addEventListener('click', claimRewards);

if (web3Modal.cachedProvider) {
    connectWallet();
}
