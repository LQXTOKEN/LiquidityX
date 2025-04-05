// Configuration
const CONFIG = {
    network: {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        currency: 'MATIC'
    },
    contracts: {
        lqxtoken: {
            address: '0x9e27f48659b1005b1abc0f58465137e531430d4b'
        },
        lptoken: {
            address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E'
        },
        staking: {
            address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3'
        }
    }
};

let provider, signer, account, contracts = {};

// Load ABIs
async function loadABIs() {
    const abis = {};
    const files = ['LQXToken.json', 'LPToken.json', 'LPStaking.json'];
    for (const file of files) {
        const response = await fetch(`./abis/${file}`);
        abis[file.replace('.json', '')] = await response.json();
    }
    return abis;
}

async function init() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        await connectWallet();
        const abis = await loadABIs();

        contracts.lqxtoken = new ethers.Contract(CONFIG.contracts.lqxtoken.address, abis.LQXToken, signer);
        contracts.lptoken = new ethers.Contract(CONFIG.contracts.lptoken.address, abis.LPToken, signer);
        contracts.staking = new ethers.Contract(CONFIG.contracts.staking.address, abis.LPStaking, signer);

        loadBalances();
    } else {
        alert('Please install MetaMask!');
    }
}

async function connectWallet() {
    await provider.send("eth_requestAccounts", []);
    account = await signer.getAddress();
    document.getElementById('connectButton').innerText = `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
}

async function loadBalances() {
    const lqxBalance = await contracts.lqxtoken.balanceOf(account);
    const lpBalance = await contracts.lptoken.balanceOf(account);
    const stakedAmount = await contracts.staking.userStake(account);
    const pendingReward = await contracts.staking.earned(account);
    const apr = await contracts.staking.getAPR();

    document.getElementById('lqxBalance').textContent = ethers.utils.formatUnits(lqxBalance, 18);
    document.getElementById('lpBalance').textContent = ethers.utils.formatUnits(lpBalance, 18);
    document.getElementById('stakedAmount').textContent = ethers.utils.formatUnits(stakedAmount, 18);
    document.getElementById('pendingReward').textContent = ethers.utils.formatUnits(pendingReward, 18);
    document.getElementById('aprValue').textContent = `${ethers.utils.formatUnits(apr, 2)}%`;
}

async function stake(amount) {
    const tx = await contracts.staking.stake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    loadBalances();
}

async function unstake(amount) {
    const tx = await contracts.staking.unstake(ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    loadBalances();
}

async function claimRewards() {
    const tx = await contracts.staking.claimRewards();
    await tx.wait();
    loadBalances();
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeBtn').addEventListener('click', () => {
    const amount = document.getElementById('stakeAmount').value;
    stake(amount);
});
document.getElementById('unstakeBtn').addEventListener('click', () => {
    const amount = document.getElementById('unstakeAmount').value;
    unstake(amount);
});
document.getElementById('claimBtn').addEventListener('click', claimRewards);

init();
