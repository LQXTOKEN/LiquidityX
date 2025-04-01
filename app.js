const CONFIG = {
    STAKING_CONTRACT: {
        address: '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9', // Proxy Address
        abi: [
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
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            account = (await provider.listAccounts())[0];
            document.getElementById('connectButton').innerText = `Connected: ${account}`;
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    } else {
        alert('Please install MetaMask.');
    }
}

async function fetchUserStake() {
    try {
        const stakingContract = new ethers.Contract(
            CONFIG.STAKING_CONTRACT.address,
            CONFIG.STAKING_CONTRACT.abi,
            provider
        );

        const stakedAmount = await stakingContract.getUserStake(account);
        document.getElementById('stakeDisplay').innerText = `Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)} LP Tokens`;
    } catch (error) {
        console.error("Error fetching user stake:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('fetchStakeButton').addEventListener('click', fetchUserStake);
