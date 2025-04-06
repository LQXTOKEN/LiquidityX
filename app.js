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
});

let provider;
let signer;
let connectedAddress = '';

// Load ABI files
const LQXTokenABI = require('./abis/LQXToken.json');
const LPTokenABI = require('./abis/LPToken.json');
const StakingContractABI = require('./abis/StakingContract.json');

const LQX_TOKEN_ADDRESS = '0x9e27f48659b1005b1abc0f58465137e531430d4b';
const LP_TOKEN_ADDRESS = '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E';
const STAKING_CONTRACT_ADDRESS = '0xCD95Ccc0bE64f84E0A12BFe3CC50DBc0f0748ad9';

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
  const web3Provider = new ethers.providers.Web3Provider(provider);
  const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingContractABI, web3Provider);
  const apr = await stakingContract.getAPR();
  document.getElementById('apr').innerText = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;
}

document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('disconnect-btn').addEventListener('click', disconnectWallet);
document.getElementById('refresh-apr-btn').addEventListener('click', getAPR);

if (provider) {
  getAPR();
}
