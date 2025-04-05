let selectedNetwork = null;

document.getElementById('connectButton').onclick = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('walletStatus').innerText = 'Connected with MetaMask';
        } catch (error) {
            console.error(error);
        }
    } else {
        alert('MetaMask not detected!');
    }
};

document.getElementById('trustButton').onclick = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('walletStatus').innerText = 'Connected with Trust Wallet';
        } catch (error) {
            console.error(error);
        }
    } else {
        alert('Trust Wallet not detected!');
    }
};

document.getElementById('keplrButton').onclick = () => {
    document.getElementById('networkSelection').classList.remove('hidden');
    selectedNetwork = 'keplr';
};

document.getElementById('leapButton').onclick = () => {
    document.getElementById('networkSelection').classList.remove('hidden');
    selectedNetwork = 'leap';
};

document.getElementById('polygonNetwork').onclick = async () => {
    if (selectedNetwork === 'keplr' || selectedNetwork === 'leap') {
        alert('Connecting to Polygon via ' + selectedNetwork);
        document.getElementById('walletStatus').innerText = 'Connected with ' + selectedNetwork + ' (Polygon)';
    }
};

document.getElementById('osmosisNetwork').onclick = async () => {
    if (selectedNetwork === 'keplr' || selectedNetwork === 'leap') {
        alert('Connecting to Osmosis via ' + selectedNetwork);
        document.getElementById('walletStatus').innerText = 'Connected with ' + selectedNetwork + ' (Osmosis)';
    }
};
