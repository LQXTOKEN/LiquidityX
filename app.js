const CONFIG = {
    LQX_TOKEN: {
        address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
        abi: [
            "function balanceOf(address account) public view returns (uint256)",
            "function approve(address spender, uint256 amount) public returns (bool)"
        ]
    },
    STAKING_CONTRACT: {
        address: '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9',
        abi: [
            "function stake(uint256 amount) public",
            "function getStakedAmount(address user) public view returns (uint256)"
        ]
    }
};

let provider, signer, account;

const providerOptions = {};

const web3Modal = new Web3Modal.default({
    cacheProvider: false,
    providerOptions
});

async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();

        const accounts = await provider.listAccounts();
        account = accounts[0];
        
        document.getElementById('connectButton').innerText = `Connected: ${account}`;
        loadBalance();
    } catch (error) {
        console.error("Could not connect wallet:", error);
    }
}

async function loadBalance() {
    try {
        const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN.address, CONFIG.LQX_TOKEN.abi, signer);
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);

        const lqxBalance = await lqxContract.balanceOf(account);
        const stakedAmount = await stakingContract.getStakedAmount(account);

        document.getElementById('balanceDisplay').innerHTML = `
            <p>LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)} LQX</p>
            <p>Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)} LP</p>
        `;
    } catch (error) {
        console.error("Could not load balance:", error);
    }
}

async function stakeTokens() {
    const amountToStake = document.getElementById('stakeAmount').value;
    if (!amountToStake || isNaN(amountToStake) || amountToStake <= 0) {
        alert("Enter a valid amount to stake.");
        return;
    }

    try {
        const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN.address, CONFIG.LQX_TOKEN.abi, signer);

        const amount = ethers.utils.parseUnits(amountToStake, 18);

        // Approve staking contract to spend your tokens
        const approveTx = await lqxContract.approve(CONFIG.STAKING_CONTRACT.address, amount);
        await approveTx.wait();

        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);
        const tx = await stakingContract.stake(amount);
        await tx.wait();

        alert('Stake successful!');
        loadBalance();
    } catch (error) {
        console.error("Stake failed:", error);
        alert('Stake failed. Check console for details.');
    }
}

async function unstakeTokens() {
    try {
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);
        const tx = await stakingContract.unstake(); // Θα φτιάξουμε αυτή τη συνάρτηση αργότερα
        await tx.wait();

        alert('Unstake successful!');
        loadBalance();
    } catch (error) {
        console.error("Unstake failed:", error);
        alert('Unstake failed. Check console for details.');
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeButton').addEventListener('click', stakeTokens);
document.getElementById('unstakeButton').addEventListener('click', unstakeTokens);
