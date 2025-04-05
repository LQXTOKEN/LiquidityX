// Configuration (EVM + Cosmos)
const CONFIG = {
  // Polygon Mainnet
  EVM: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    currency: "MATIC",
    nativeDecimals: 18
  },
  // Cosmos Chains (Osmosis + Custom wLQX)
  COSMOS: {
    'osmosis-1': {
      chainId: 'osmosis-1',
      chainName: 'Osmosis',
      rpcUrl: 'https://rpc.osmosis.zone',
      restUrl: 'https://lcd.osmosis.zone',
      currencies: [
        {
          coinDenom: 'OSMO',
          coinMinimalDenom: 'uosmo',
          coinDecimals: 6
        },
        {
          coinDenom: 'wLQX',
          coinMinimalDenom: 'ibc/...', // Add actual IBC denom
          coinDecimals: 18
        }
      ]
    }
  }
};

// Wallet Selection Logic
function openWalletModal() {
  const modal = document.getElementById('walletModal');
  modal.style.display = 'block';
}

function closeWalletModal() {
  const modal = document.getElementById('walletModal');
  modal.style.display = 'none';
}

async function connectWallet(walletType) {
  if (walletType === 'metamask') {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const address = accounts[0];
        document.getElementById('connectButton').innerText = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      } catch (error) {
        console.error('Failed to connect MetaMask', error);
      }
    } else {
      alert('MetaMask is not installed');
    }
  } else if (walletType === 'keplr') {
    if (window.keplr) {
      await window.keplr.enable('osmosis-1');
      const offlineSigner = window.getOfflineSigner('osmosis-1');
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;
      document.getElementById('connectButton').innerText = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } else {
      alert('Keplr is not installed');
    }
  } else if (walletType === 'leap') {
    if (window.leap) {
      await window.leap.enable('osmosis-1');
      const offlineSigner = window.leap.getOfflineSigner('osmosis-1');
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;
      document.getElementById('connectButton').innerText = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } else {
      alert('Leap Wallet is not installed');
    }
  } else if (walletType === 'trust') {
    alert('Trust Wallet support coming soon!');
  }
  closeWalletModal();
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectButton').addEventListener('click', openWalletModal);
  document.getElementById('connectMetaMask').addEventListener('click', () => connectWallet('metamask'));
  document.getElementById('connectKeplr').addEventListener('click', () => connectWallet('keplr'));
  document.getElementById('connectLeap').addEventListener('click', () => connectWallet('leap'));
  document.getElementById('connectTrust').addEventListener('click', () => connectWallet('trust'));
});
