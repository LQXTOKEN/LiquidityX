// Connect Wallet
async function connectWallet() {
    try {
        showLoading("Connecting wallet...");
        console.log("Attempting to connect wallet...");

        // Σύνδεση μέσω web3Modal
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance, "any");

        // Έλεγχος δικτύου
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);

        if (network.chainId !== CONFIG.NETWORK.chainId) {
            try {
                await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(CONFIG.NETWORK.chainId) }]);
            } catch (switchError) {
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
                        blockExplorerUrls: [CONFIG.NETWORK.explorerUrl]
                    }]);
                } else {
                    throw new Error(`Failed to switch to ${CONFIG.NETWORK.name}: ${switchError.message}`);
                }
            }
        }

        signer = provider.getSigner();
        account = await signer.getAddress();
        console.log("Connected wallet address:", account);

        document.getElementById('connectButton').innerText = `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`;

        if (instance.on) {
            instance.on("accountsChanged", () => window.location.reload());
            instance.on("chainChanged", () => window.location.reload());
        }

        await loadBalances();
        hideLoading();
    } catch (error) {
        console.error("Connection error:", error);
        alert(`Connection failed: ${error.message}`);
        hideLoading();
    }
}
