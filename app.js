const CONFIG = {
    LQX_TOKEN: {
        address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
        abi: [
            "function balanceOf(address account) public view returns (uint256)",
            "function approve(address spender, uint256 amount) public returns (bool)"
        ]
    },
    LP_TOKEN: {
        address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
        abi: [
            "function balanceOf(address account) public view returns (uint256)",
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
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
        loadBalances();
    } catch (error) {
        console.error("Could not connect wallet:", error);
    }
}

async function loadBalances() {
    try {
        const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN.address, CONFIG.LQX_TOKEN.abi, signer);
        const lpContract = new ethers.Contract(CONFIG.LP_TOKEN.address, CONFIG.LP_TOKEN.abi, signer);
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);

        const lqxBalance = await lqxContract.balanceOf(account);
        const lpBalance = await lpContract.balanceOf(account);
        const stakedAmount = await stakingContract.getStakedAmount(account);

        document.getElementById('balanceDisplay').innerHTML = `
            <p>LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)} LQX</p>
            <p>LP Token Balance: ${ethers.utils.formatUnits(lpBalance, 18)} LP</p>
            <p>Staked LP Tokens: ${ethers.utils.formatUnits(stakedAmount, 18)} LP</p>
        `;
    } catch (error) {
        console.error("Could not load balances:", error);
    }
}

async function stakeTokens() {
    const amountToStake = document.getElementById('stakeAmount').value;
    if (!amountToStake || isNaN(amountToStake) || amountToStake <= 0) {
        alert("Enter a valid amount to stake.");
        return;
    }

    try {
        const lpContract = new ethers.Contract(CONFIG.LP_TOKEN.address, CONFIG.LP_TOKEN.abi, signer);
        const stakingContract = new ethers.Contract(CONFIG.STAKING_CONTRACT.address, CONFIG.STAKING_CONTRACT.abi, signer);

        const amount = ethers.utils.parseUnits(amountToStake, 18);

        const approveTx = await lpContract.approve(CONFIG.STAKING_CONTRACT.address, amount);
        await approveTx.wait();

        const tx = await stakingContract.stake(amount);
        await tx.wait();

        alert('Stake successful!');
        loadBalances();
    } catch (error) {
        console.error("Stake failed:", error);
        alert('Stake failed. Check console for details.');
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeButton').addEventListener('click', stakeTokens);
