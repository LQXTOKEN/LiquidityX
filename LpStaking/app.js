const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';
const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
const NETWORK_ID = '137'; // Polygon Network

// Load ABI Files
async function loadABI(abiFileName) {
    const response = await fetch(`abis/${abiFileName}`);
    return await response.json();
}

async function connectWallet() {
    if (!window.ethereum && !window.BinanceChain) {
        alert('Please install a Web3 wallet.');
        return;
    }

    try {
        if (window.BinanceChain) {
            provider = new ethers.providers.Web3Provider(window.BinanceChain, "any");
            await window.BinanceChain.enable();
        } else {
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
        }

        signer = provider.getSigner();
        connectedAddress = await signer.getAddress();

        document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;
        localStorage.setItem('walletConnected', 'true');
        fetchAllData();
    } catch (error) {
        console.error("Connection error:", error);
    }
}

async function fetchAllData() {
    try {
        const stakingABI = await loadABI('StakingContract.json');
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingABI, signer);

        const apr = await stakingContract.getAPR();
        document.getElementById('apr').textContent = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;

        console.log("Data Fetched Successfully");
    } catch (error) {
        console.error("Error Fetching Data:", error);
    }
}

function disconnectWallet() {
    provider = null;
    signer = null;
    connectedAddress = '';
    document.getElementById('wallet-address').textContent = 'Disconnected';
    localStorage.removeItem('walletConnected');
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);

if (localStorage.getItem('walletConnected') === 'true') {
    connectWallet();
}
