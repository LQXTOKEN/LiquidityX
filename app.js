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
            "function getUserStake(address account) external view returns (uint256)",
            "function getPendingReward(address account) external view returns (uint256)"
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
        
        const network = await provider.getNetwork();
        if (network.chainId !== 137) {
            alert("Please connect to the Polygon Network.");
            return;
        }

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
        
        const stakedAmount = await stakingContract.getUserStake(account);
        const pendingReward = await stakingContract.getPendingReward(account);

        document.getElementById('balanceDisplay').innerHTML = `
            <p>LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)} LQX</p>
            <p>LP Token Balance: ${ethers.utils.formatUnits(lpBalance, 18)} LP</p>
            <p>Staked LP Tokens: ${ethers.utils.formatUnits(stakedAmount, 18)} LP</p>
            <p>Pending Rewards: ${ethers.utils.formatUnits(pendingReward, 18)} LQX</p>
        `;
    } catch (error) {
        console.error("Error during Proxy call:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
