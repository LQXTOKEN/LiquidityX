import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

const providerOptions = {
    walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
            rpc: { 137: 'https://polygon-rpc.com' }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
    theme: 'dark'
});

let provider, signer, account;

async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();
        account = await signer.getAddress();
        document.getElementById('connectButton').innerText = `Connected: ${account}`;

        const network = await provider.getNetwork();
        console.log("Connected to network:", network.name, "Chain ID:", network.chainId);

        loadBalances();
    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
}

async function loadBalances() {
    try {
        document.getElementById('lqxBalance').innerText = 'Loading...';
        document.getElementById('lpBalance').innerText = 'Loading...';
        document.getElementById('stakedAmount').innerText = 'Loading...';
        document.getElementById('pendingReward').innerText = 'Loading...';
        
        // Εδώ πρέπει να προσθέσουμε τις κλήσεις προς τα smart contracts
        console.log("Loading balances...");

    } catch (error) {
        console.error("Error loading balances:", error);
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
