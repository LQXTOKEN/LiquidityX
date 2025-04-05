// Configuration
const CONFIG = {
    network: {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        currency: 'MATIC'
    }
};

let provider, signer, userAddress;

// Notification System
function showNotification(message) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize Ethers.js
function initEthers() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
    }
}

// Connect Wallet (EVM - MetaMask / Trust Wallet)
async function connectEVM(walletType) {
    try {
        if (walletType === 'metamask' && window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else if (walletType === 'trust' && window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else {
            showNotification('Wallet not supported or not installed.');
            return;
        }
        
        const accounts = await provider.listAccounts();
        userAddress = accounts[0];
        document.getElementById('connectedAccount').textContent = `Connected: ${userAddress}`;
        showNotification(`Connected with ${walletType}!`);
    } catch (error) {
        console.error(error);
        showNotification('Failed to connect wallet.');
    }
}

// Connect Keplr Wallet (Cosmos)
async function connectKeplr() {
    try {
        if (!window.keplr) {
            showNotification('Keplr Wallet not installed!');
            return;
        }

        await window.keplr.enable("osmosis-1");
        const offlineSigner = window.getOfflineSigner("osmosis-1");
        const accounts = await offlineSigner.getAccounts();
        userAddress = accounts[0].address;
        document.getElementById('connectedAccount').textContent = `Connected: ${userAddress}`;
        showNotification('Connected with Keplr!');
    } catch (error) {
        console.error(error);
        showNotification('Failed to connect Keplr.');
    }
}

// Connect Leap Wallet (Cosmos)
async function connectLeap() {
    try {
        if (!window.leap) {
            showNotification('Leap Wallet not installed!');
            return;
        }

        await window.leap.enable("osmosis-1");
        const offlineSigner = window.getOfflineSigner("osmosis-1");
        const accounts = await offlineSigner.getAccounts();
        userAddress = accounts[0].address;
        document.getElementById('connectedAccount').textContent = `Connected: ${userAddress}`;
        showNotification('Connected with Leap!');
    } catch (error) {
        console.error(error);
        showNotification('Failed to connect Leap.');
    }
}

// Event Listeners for Wallet Buttons
document.getElementById('connectMetamask').addEventListener('click', () => connectEVM('metamask'));
document.getElementById('connectTrust').addEventListener('click', () => connectEVM('trust'));
document.getElementById('connectKeplr').addEventListener('click', connectKeplr);
document.getElementById('connectLeap').addEventListener('click', connectLeap);

// Initialize Ethers.js
initEthers();
