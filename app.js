const providerOptions = {
    walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
            infuraId: "YOUR_INFURA_ID" // Βάλε το Infura ID σου εδώ
        }
    }
};

const web3Modal = new window.Web3Modal.default({
    cacheProvider: true,
    providerOptions
});

let provider, signer, account;

async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();
        account = await signer.getAddress();

        document.getElementById('connectButton').innerText = `Connected: ${account}`;
        loadBalances();
    } catch (error) {
        console.error('Could not connect to wallet:', error);
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
            <p>LP Balance: ${ethers.utils.formatUnits(lpBalance, 18)} LP</p>
            <p>Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)} LP</p>
        `;
    } catch (error) {
        console.error('Error loading balances:', error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
