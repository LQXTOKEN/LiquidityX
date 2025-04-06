const { ethers } = window;

let provider;
let signer;
let connectedAddress = '';

// Ανίχνευση διαθέσιμων wallets
async function detectWallets() {
    const wallets = [];
    
    if (window.ethereum) {
        wallets.push('MetaMask');
        
        if (window.ethereum.isCoinbaseWallet) wallets.push('Coinbase Wallet');
        if (window.ethereum.isTrust) wallets.push('Trust Wallet');
        if (window.ethereum.isTokenPocket) wallets.push('TokenPocket');
        if (window.ethereum.isMetaMask) {
            if (window.ethereum.isBraveWallet) wallets.push('Brave Wallet');
        }
    }
    
    if (window.BinanceChain) wallets.push('Binance Chain Wallet');
    
    console.log("💡 Available Wallets Detected:", wallets);
    return wallets;
}

// Συνάρτηση σύνδεσης wallet
async function connectWallet() {
    if (!window.ethereum && !window.BinanceChain) {
        alert('Please install a Web3 wallet like MetaMask, Trust Wallet, Coinbase Wallet, etc.');
        return;
    }

    try {
        console.log("🔌 Attempting to connect wallet...");

        if (window.BinanceChain) {
            provider = new ethers.providers.Web3Provider(window.BinanceChain, "any");
            await window.BinanceChain.enable();
        } else {
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
        }

        signer = provider.getSigner();
        connectedAddress = await signer.getAddress();
        
        console.log("✅ Wallet Connected Successfully:", connectedAddress);
        document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;

    } catch (error) {
        console.error("❌ Connection error:", error);
    }
}

// Συνάρτηση αποσύνδεσης wallet
function disconnectWallet() {
    console.log("🔌 Disconnecting Wallet...");
    provider = null;
    signer = null;
    connectedAddress = '';
    document.getElementById('wallet-address').textContent = 'Disconnected';
    console.log("✅ Wallet Disconnected Successfully");
}

// Event Listeners
document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);

// Ανίχνευση wallets κατά την φόρτωση της σελίδας
detectWallets();
