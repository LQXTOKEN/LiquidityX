const CONFIG = {
    LQX_TOKEN: {
        address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
        abi: [
            "function balanceOf(address) view returns (uint256)",
            "function approve(address spender, uint256 amount) public returns (bool)"
        ]
    },
    LP_TOKEN: {
        address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
        abi: [
            "function balanceOf(address) view returns (uint256)",
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
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

let provider, signer, account;

async function connectWallet() {
    if (window.ethereum) {
        try {
            const instance = await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            signer = provider.getSigner();
            account = (await provider.listAccounts())[0];
            document.getElementById('connectButton').innerText = `Connected: ${account}`;

            const network = await provider.getNetwork();
            console.log("Connected to network:", network.name, "Chain ID:", network.chainId);

            loadBalances();
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    } else {
        alert('Please install MetaMask.');
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

        console.log("Balances loaded successfully.");
    } catch (error) {
        console.error("Error loading balances:", error);
    }
}

async function stake() {
    try {
        const amount = document.getElementById('stakeAmount').value;
        if (!amount) return alert('Enter an amount to stake.');

        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);
        const tx = await stakingContract.stake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();

        alert('Stake successful!');
        loadBalances();
    } catch (error) {
        console.error("Error during stake:", error);
    }
}

async function unstake() {
    try {
        const amount = document.getElementById('unstakeAmount').value;
        if (!amount) return alert('Enter an amount to unstake.');

        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);
        const tx = await stakingContract.unstake(ethers.utils.parseUnits(amount, 18));
        await tx.wait();

        alert('Unstake successful!');
        loadBalances();
    } catch (error) {
        console.error("Error during unstake:", error);
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
        console.error("Error during claim reward:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeButton').addEventListener('click', stake);
document.getElementById('unstakeButton').addEventListener('click', unstake);
document.getElementById('claimButton').addEventListener('click', claimReward);
