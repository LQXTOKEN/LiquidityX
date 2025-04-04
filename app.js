// Configuration
const CONFIG = {
    NETWORK: {
        chainId: 137, // Polygon Mainnet
        name: "Polygon Mainnet",
        rpcUrl: "https://polygon-rpc.com",
        explorerUrl: "https://polygonscan.com",
        currency: "MATIC"
    },
    CONTRACTS: {
        LQX_TOKEN: {
            address: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
            abi: ["function balanceOf(address account) view returns (uint256)"]
        },
        LP_TOKEN: {
            address: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
            abi: [
                "function balanceOf(address account) view returns (uint256)",
                "function approve(address spender, uint256 amount) public returns (bool)"
            ]
        },
        STAKING_CONTRACT: {
            address: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
            abi: [
                "function stake(uint256 amount) external",
                "function unstake(uint256 amount) external",
                "function claimRewards() external",
                "function userStake(address account) external view returns (uint256)",
                "function earned(address account) external view returns (uint256)",
                "function getAPR() public view returns (uint256)"
            ]
        }
    }
};

// Αντικατάσταση WalletConnect v1 με v2.19.2
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import Web3Modal from "@web3modal/standalone";

// Πολλαπλά πορτοφόλια
const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            projectId: "YOUR_PROJECT_ID", // Χρησιμοποίησε ένα έγκυρο project ID από WalletConnect
            rpc: {
                137: CONFIG.NETWORK.rpcUrl
            }
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: 'dark'
});

let provider, signer, account;
let contracts = {};

function initContracts() {
    contracts = {
        lqx: new ethers.Contract(CONFIG.CONTRACTS.LQX_TOKEN.address, CONFIG.CONTRACTS.LQX_TOKEN.abi, signer),
        lp: new ethers.Contract(CONFIG.CONTRACTS.LP_TOKEN.address, CONFIG.CONTRACTS.LP_TOKEN.abi, signer),
        staking: new ethers.Contract(CONFIG.CONTRACTS.STAKING_CONTRACT.address, CONFIG.CONTRACTS.STAKING_CONTRACT.abi, signer)
    };
}

async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();
        account = await signer.getAddress();
        initContracts();
        await loadBalances();
        document.getElementById('connectButton').innerText = `Connected: ${account}`;
    } catch (error) {
        console.error("Connection error:", error);
    }
}

function disconnectWallet() {
    if (web3Modal.cachedProvider) {
        web3Modal.clearCachedProvider();
    }
    provider = null;
    signer = null;
    account = null;
    document.getElementById('connectButton').innerText = "Connect Wallet";
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('disconnectButton').addEventListener('click', disconnectWallet);

if (web3Modal.cachedProvider) {
    connectWallet();
}
