// Connect Wallet (Optimized Version)
async function connectWallet() {
    try {
        showLoading("Connecting wallet...");
        console.log("Initializing wallet connection...");

        // 1. Web3Modal Connection
        const instance = await web3Modal.connect().catch(err => {
            throw new Error(`Wallet selection canceled: ${err.message}`);
        });
        
        // 2. Initialize Provider with Fallback
        provider = new ethers.providers.Web3Provider(instance, {
            name: CONFIG.NETWORK.name,
            chainId: CONFIG.NETWORK.chainId,
            ensAddress: null
        });

        // 3. Network Handling with Enhanced UX
        const network = await provider.getNetwork();
        console.log("Detected network:", network);
        
        if (network.chainId !== CONFIG.NETWORK.chainId) {
            showLoading(`Switching to ${CONFIG.NETWORK.name}...`);
            
            try {
                // Attempt chain switch
                await provider.send("wallet_switchEthereumChain", [{
                    chainId: ethers.utils.hexValue(CONFIG.NETWORK.chainId)
                }]);
                
                // Double verification
                const newNetwork = await provider.getNetwork();
                if (newNetwork.chainId !== CONFIG.NETWORK.chainId) {
                    throw new Error("Failed to switch network");
                }
            } catch (switchError) {
                // Chain addition handling
                if (switchError.code === 4902) {
                    await provider.send("wallet_addEthereumChain", [{
                        chainId: ethers.utils.hexValue(CONFIG.NETWORK.chainId),
                        chainName: CONFIG.NETWORK.name,
                        rpcUrls: [CONFIG.NETWORK.rpcUrl],
                        nativeCurrency: {
                            name: CONFIG.NETWORK.currency,
                            symbol: CONFIG.NETWORK.currency,
                            decimals: 18
                        },
                        blockExplorerUrls: [CONFIG.NETWORK.explorerUrl],
                        iconUrls: ["https://lqxtoken.github.io/LiquidityX/logo.png"]
                    }]);
                } else {
                    throw new Error(`Network switch rejected: ${switchError.message}`);
                }
            }
        }

        // 4. Account Handling
        signer = provider.getSigner();
        account = await signer.getAddress();
        console.log("Connected account:", account);
        
        // 5. UI Updates
        updateWalletUI(account);
        
        // 6. Event Listeners with Cleanup
        setupWalletEventListeners(instance);
        
        // 7. Initialize Contracts
        initContracts();
        await loadBalances();
        
        showNotification(`Connected to ${account.slice(0, 6)}...${account.slice(-4)}`, "success");
    } catch (error) {
        console.error("Wallet connection failed:", error);
        showNotification(
            error.message.includes("rejected") 
                ? "Connection canceled by user" 
                : `Connection failed: ${error.message.split("(")[0]}`,
            "error"
        );
        
        // Reset state if connection fails
        if (provider && typeof provider.disconnect === "function") {
            await provider.disconnect();
        }
        resetWalletState();
    } finally {
        hideLoading();
    }
}

// Helper Functions
function updateWalletUI(address) {
    const connectBtn = document.getElementById('connectButton');
    connectBtn.innerHTML = `
        <span class="wallet-icon">🟢</span>
        ${address.slice(0, 6)}...${address.slice(-4)}
        <span class="disconnect-icon">✕</span>
    `;
    connectBtn.onclick = disconnectWallet;
}

function setupWalletEventListeners(providerInstance) {
    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            showNotification("Wallet disconnected", "warning");
            resetWalletState();
        } else if (accounts[0] !== account) {
            showNotification("Account changed", "info");
            window.location.reload();
        }
    };

    const handleChainChanged = (chainId) => {
        if (parseInt(chainId) !== CONFIG.NETWORK.chainId) {
            showNotification(`Please switch to ${CONFIG.NETWORK.name}`, "warning");
        }
    };

    providerInstance.on("accountsChanged", handleAccountsChanged);
    providerInstance.on("chainChanged", handleChainChanged);
    
    // Cleanup function
    return () => {
        providerInstance.removeListener("accountsChanged", handleAccountsChanged);
        providerInstance.removeListener("chainChanged", handleChainChanged);
    };
}

function resetWalletState() {
    account = null;
    signer = null;
    provider = null;
    document.getElementById('connectButton').innerHTML = `
        <span class="wallet-icon">🔴</span>
        Connect Wallet
    `;
    document.getElementById('connectButton').onclick = connectWallet;
}
