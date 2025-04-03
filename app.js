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

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                137: CONFIG.NETWORK.rpcUrl
            },
            qrcodeModalOptions: {
                mobileLinks: ["metamask", "trust"]
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

// Initialize Contracts
function initContracts() {
    if (!signer) {
        signer = provider.getSigner();
    }

    contracts = {
        lqx: new ethers.Contract(
            CONFIG.CONTRACTS.LQX_TOKEN.address, 
            CONFIG.CONTRACTS.LQX_TOKEN.abi, 
            signer
        ),
        lp: new ethers.Contract(
            CONFIG.CONTRACTS.LP_TOKEN.address, 
            CONFIG.CONTRACTS.LP_TOKEN.abi, 
            signer
        ),
        staking: new ethers.Contract(
            CONFIG.CONTRACTS.STAKING_CONTRACT.address, 
            CONFIG.CONTRACTS.STAKING_CONTRACT.abi, 
            signer
        )
    };
}

// Check if LQX Tokens are available for staking
async function checkStakingBalance() {
    try {
        const balance = await contracts.lqx.balanceOf(CONFIG.CONTRACTS.STAKING_CONTRACT.address);
        const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, 18));
        console.log(`Staking Contract Balance: ${formattedBalance} LQX`);
        return formattedBalance;
    } catch (error) {
        console.error("Error checking staking balance:", error);
        return 0;
    }
}

// Connect Wallet
async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance, "any");
        signer = provider.getSigner();
        account = await signer.getAddress();
        initContracts();
    } catch (error) {
        console.error("Error connecting wallet:", error);
    }
}

// Stake Tokens
async function stakeTokens(amount) {
    try {
        const availableLQX = await checkStakingBalance();
        if (availableLQX <= 0) {
            alert("No LQX tokens available for rewards in the staking contract.");
            return;
        }

        const parsedAmount = ethers.utils.parseUnits(amount, 18);
        const approveTx = await contracts.lp.approve(CONFIG.CONTRACTS.STAKING_CONTRACT.address, parsedAmount);
        await approveTx.wait();

        const tx = await contracts.staking.stake(parsedAmount);
        await tx.wait();
        alert("Stake successful!");
    } catch (error) {
        console.error("Error staking tokens:", error);
    }
}

// Unstake Tokens
async function unstakeTokens(amount) {
    try {
        const parsedAmount = ethers.utils.parseUnits(amount, 18);
        const tx = await contracts.staking.unstake(parsedAmount);
        await tx.wait();
        alert("Unstake successful!");
    } catch (error) {
        console.error("Error unstaking tokens:", error);
    }
}

// Claim Rewards
async function claimRewards() {
    try {
        const tx = await contracts.staking.claimRewards();
        await tx.wait();
        alert("Rewards claimed successfully!");
    } catch (error) {
        console.error("Error claiming rewards:", error);
    }
}

// Event Listeners
document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("stakeButton").addEventListener("click", () => {
    const amount = document.getElementById("stakeAmount").value;
    if (amount) stakeTokens(amount);
});
document.getElementById("unstakeButton").addEventListener("click", () => {
    const amount = document.getElementById("unstakeAmount").value;
    if (amount) unstakeTokens(amount);
});
document.getElementById("claimButton").addEventListener("click", claimRewards);
