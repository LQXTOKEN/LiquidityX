// app.js

import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const providerOptions = {
  walletconnect: {
    package: () => import('@walletconnect/web3-provider'),
    options: {
      rpc: {
        137: 'https://polygon-rpc.com',
      },
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
  disableInjectedProvider: false,
});

let provider;
let signer;
let connectedAddress = '';

async function loadABI(abiFileName) {
  const response = await fetch(`abis/${abiFileName}`);
  if (!response.ok) {
    throw new Error(`Failed to load ABI: ${abiFileName}`);
  }
  return await response.json();
}

async function connectWallet() {
  provider = await web3Modal.connect();
  const web3Provider = new ethers.providers.Web3Provider(provider);
  signer = web3Provider.getSigner();
  connectedAddress = await signer.getAddress();
  document.getElementById('wallet-address').innerText = `Connected: ${connectedAddress}`;
}

async function disconnectWallet() {
  web3Modal.clearCachedProvider();
  provider = null;
  signer = null;
  connectedAddress = '';
  document.getElementById('wallet-address').innerText = 'Disconnected';
}

async function getAPR() {
  const web3Provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
  const StakingContractABI = await loadABI('StakingContract.json');
  const stakingContract = new ethers.Contract('0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9', StakingContractABI, web3Provider);
  const apr = await stakingContract.getAPR();
  document.getElementById('apr').innerText = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
document.getElementById('refresh-apr-btn').addEventListener('click', getAPR);

if (provider) {
  getAPR();
}
