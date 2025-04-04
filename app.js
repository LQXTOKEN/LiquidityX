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

// Initialize Web3Modal with proper defaults
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                137: CONFIG.NETWORK.rpcUrl
            },
            qrcode: true
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: 'dark'
});


// Connect Wallet 
async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();

        const address = await signer.getAddress();
        document.getElementById('connectButton').innerText = `Connected: ${address}`;

    } catch (error) {
        console.error("Connection failed", error);
    }
}


document.getElementById('connectButton').addEventListener('click', connectWallet);
