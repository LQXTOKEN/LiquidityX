const CONFIG = {
    LQX_TOKEN: {
        address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
        abi: [
            "function balanceOf(address account) public view returns (uint256)"
        ]
    }
};

let provider, signer, account;

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider.default,
        options: {
            infuraId: "YOUR_INFURA_ID" // Προαιρετικό, δε χρειάζεται αν χρησιμοποιείς μόνο Metamask
        }
    }
};

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
        const balance = await lqxContract.balanceOf(account);
        document.getElementById('balanceDisplay').innerText = `LQX Balance: ${ethers.utils.formatUnits(balance, 18)} LQX`;
    } catch (error) {
        console.error("Could not load balance:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
