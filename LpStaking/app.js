document.addEventListener('DOMContentLoaded', function () {
    const { ethers } = window;

    let provider;
    let signer;
    let connectedAddress = '';

    const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
    const LQX_TOKEN = '0x9e27f48659b1005b1abc0f58465137e531430d4b';
    const LP_TOKEN = '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E';

    const STAKING_CONTRACT_ABI = [
        'function claimRewards() public',
        'function getAPR() public view returns (uint256)',
        'function earned(address account) public view returns (uint256)',
        'function userStake(address account) public view returns (uint256)',
        'function stake(uint256 amount) public',
        'function unstake(uint256 amount) public'
    ];

    const LQX_ABI = [
        'function balanceOf(address account) public view returns (uint256)'
    ];

    const LP_ABI = [
        'function balanceOf(address account) public view returns (uint256)',
        'function approve(address spender, uint256 amount) public returns (bool)',
        'function allowance(address owner, address spender) public view returns (uint256)'
    ];

    let stakingContract;
    let lqxContract;
    let lpContract;

    function detectProvider() {
        if (window.ethereum) {
            if (window.ethereum.isMetaMask) {
                return window.ethereum;
            } else {
                alert("No MetaMask detected.");
                return window.ethereum;
            }
        } else {
            alert("Please install MetaMask.");
            return null;
        }
    }

    async function connectWallet() {
        const detectedProvider = detectProvider();
        if (!detectedProvider) return;

        try {
            provider = new ethers.providers.Web3Provider(detectedProvider, "any");
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            connectedAddress = await signer.getAddress();

            document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;
            document.getElementById('connect-btn').style.display = 'none';
            document.getElementById('disconnect-btn').style.display = 'inline';

            stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
            lqxContract = new ethers.Contract(LQX_TOKEN, LQX_ABI, signer);
            lpContract = new ethers.Contract(LP_TOKEN, LP_ABI, signer);

            await fetchAllData();
        } catch (error) {
            alert("Error connecting to MetaMask.");
        }
    }

    function disconnectWallet() {
        connectedAddress = '';
        document.getElementById('wallet-address').textContent = 'Not connected';
        document.getElementById('connect-btn').style.display = 'inline';
        document.getElementById('disconnect-btn').style.display = 'none';
    }

    async function fetchAllData() {
        const apr = await stakingContract.getAPR();
        document.getElementById('apr').innerText = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;

        const lqxBalance = await lqxContract.balanceOf(connectedAddress);
        document.getElementById('lqx-balance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)}`;

        const lpBalance = await lpContract.balanceOf(connectedAddress);
        document.getElementById('lp-balance').innerText = `LP Token Balance: ${ethers.utils.formatUnits(lpBalance, 18)}`;

        const stakedAmount = await stakingContract.userStake(connectedAddress);
        document.getElementById('staked-amount').innerText = `Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)}`;

        const earned = await stakingContract.earned(connectedAddress);
        document.getElementById('earned-rewards').innerText = `Earned Rewards: ${ethers.utils.formatUnits(earned, 18)}`;
    }

    async function stakeTokens() {
        const amount = document.getElementById('stake-amount').value;
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount to stake.");
            return;
        }

        const parsedAmount = ethers.utils.parseUnits(amount, 18);

        const allowance = await lpContract.allowance(connectedAddress, STAKING_CONTRACT_ADDRESS);
        if (allowance.lt(parsedAmount)) {
            const approveTx = await lpContract.approve(STAKING_CONTRACT_ADDRESS, parsedAmount);
            await approveTx.wait();
        }

        const tx = await stakingContract.stake(parsedAmount);
        await tx.wait();
        alert("✅ Successfully Staked Tokens!");
        await fetchAllData();
    }

    async function unstakeTokens() {
        const amount = document.getElementById('unstake-amount').value;
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount to unstake.");
            return;
        }

        const parsedAmount = ethers.utils.parseUnits(amount, 18);
        const tx = await stakingContract.unstake(parsedAmount);
        await tx.wait();
        alert("✅ Successfully Unstaked Tokens!");
        await fetchAllData();
    }

    async function claimRewards() {
        const tx = await stakingContract.claimRewards();
        await tx.wait();
        alert("✅ Rewards Claimed Successfully!");
        await fetchAllData();
    }

    document.getElementById('connect-btn').addEventListener('click', connectWallet);
    document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
    document.getElementById('stake-btn').addEventListener('click', stakeTokens);
    document.getElementById('unstake-btn').addEventListener('click', unstakeTokens);
    document.getElementById('claim-rewards-btn').addEventListener('click', claimRewards);
});
