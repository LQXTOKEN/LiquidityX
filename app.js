// Configuration (EVM + Cosmos)
const CONFIG = {
  EVM: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    currency: "MATIC",
    nativeDecimals: 18
  },
  COSMOS: {
    'osmosis-1': {
      chainId: 'osmosis-1',
      chainName: 'Osmosis',
      rpcUrl: 'https://rpc-osmosis.blockapsis.com',
      restUrl: 'https://lcd-osmosis.blockapsis.com',
      currencies: [
        {
          coinDenom: 'OSMO',
          coinMinimalDenom: 'uosmo',
          coinDecimals: 6
        }
      ]
    }
  }
};

let provider, signer, account;
let walletType = null;

async function connectWallet(type) {
  walletType = type;

  if (type === 'metamask' || type === 'trust') {
    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      account = await signer.getAddress();
      
      document.getElementById('connectButton').innerText = `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`;
      console.log(`Connected to ${type}: ${account}`);
    } else {
      alert("Please install MetaMask or Trust Wallet!");
    }
  } 
  else if (type === 'keplr' || type === 'leap') {
    if (window.keplr || window.leap) {
      const wallet = window.keplr || window.leap;

      try {
        await wallet.enable(CONFIG.COSMOS['osmosis-1'].chainId);
        
        const offlineSigner = wallet.getOfflineSigner(CONFIG.COSMOS['osmosis-1'].chainId);
        const accounts = await offlineSigner.getAccounts();

        account = accounts[0].address;
        document.getElementById('connectButton').innerText = `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`;
        console.log(`Connected to ${type}: ${account}`);
      } catch (error) {
        alert(`Failed to connect ${type}: ${error.message}`);
      }
    } else {
      alert(`Please install ${type === 'keplr' ? 'Keplr' : 'Leap'} Wallet!`);
    }
  }
}

document.getElementById('connectMetamask').addEventListener('click', () => connectWallet('metamask'));
document.getElementById('connectTrust').addEventListener('click', () => connectWallet('trust'));
document.getElementById('connectKeplr').addEventListener('click', () => connectWallet('keplr'));
document.getElementById('connectLeap').addEventListener('click', () => connectWallet('leap'));

