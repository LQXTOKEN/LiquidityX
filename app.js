document.addEventListener('DOMContentLoaded', function() {
    // Έλεγχος για πορτοφόλια
    checkWallets();
    
    // Προσθήκη event listeners στα κουμπιά
    document.querySelectorAll('.wallet-btn').forEach(button => {
        button.addEventListener('click', function() {
            const walletType = this.getAttribute('data-wallet');
            connectWallet(walletType);
        });
    });
    
    // Κουμπί αποσύνδεσης
    document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
});

// Έλεγχος αν υπάρχει κάποιο πορτοφόλι
function checkWallets() {
    const hasAnyWallet = 
        typeof window.ethereum !== 'undefined' || 
        typeof window.phantom !== 'undefined' ||
        typeof window.coinbaseWalletExtension !== 'undefined';
    
    if (!hasAnyWallet) {
        document.getElementById('no-wallet-alert').style.display = 'block';
    }
}

// Συνάρτηση σύνδεσης
async function connectWallet(walletType) {
    try {
        let provider;
        
        // Ανίχνευση πορτοφολιού
        switch(walletType) {
            case 'metamask':
            case 'trust':
            case 'coinbase':
                if (!window.ethereum) {
                    throw new Error('Το πορτοφόλι δεν βρέθηκε!');
                }
                provider = new ethers.providers.Web3Provider(window.ethereum);
                break;
                
            case 'phantom':
                if (!window.phantom?.solana) {
                    throw new Error('Το Phantom δεν βρέθηκε!');
                }
                // Phantom χρησιμοποιεί Solana, οπότε χρειαζόμαστε διαφορετικό provider
                // (Εδώ θα μπορούσαμε να χρησιμοποιήσουμε την Solana Web3.js βιβλιοθήκη)
                throw new Error('Το Phantom απαιτεί Solana integration');
                
            default:
                throw new Error('Μη υποστηριζόμενο πορτοφόλι');
        }
        
        // Αίτημα πρόσβασης
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        // Ενημέρωση UI
        document.getElementById('wallet-address').textContent = address;
        document.getElementById('wallet-chain').textContent = `${network.name} (ID: ${network.chainId})`;
        document.getElementById('wallet-info').style.display = 'block';
        document.getElementById('no-wallet-alert').style.display = 'none';
        
        // Event listeners για αλλαγές
        window.ethereum?.on('accountsChanged', handleAccountsChanged);
        window.ethereum?.on('chainChanged', handleChainChanged);
        
    } catch (error) {
        console.error('Σφάλμα σύνδεσης:', error);
        alert(`Σφάλμα σύνδεσης: ${error.message}`);
    }
}

// Χειρισμός αλλαγών λογαριασμού
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        alert('Αποσυνδεθήκατε από το πορτοφόλι');
        disconnectWallet();
    } else {
        document.getElementById('wallet-address').textContent = accounts[0];
    }
}

// Χειρισμός αλλαγών δικτύου
function handleChainChanged(chainId) {
    window.location.reload();
}

// Συνάρτηση αποσύνδεσης
function disconnectWallet() {
    // Καθαρισμός event listeners
    window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum?.removeListener('chainChanged', handleChainChanged);
    
    // Επαναφορά UI
    document.getElementById('wallet-info').style.display = 'none';
    document.getElementById('wallet-address').textContent = '';
    document.getElementById('wallet-chain').textContent = '';
    
    alert('Αποσυνδεθήκατε επιτυχώς');
}
