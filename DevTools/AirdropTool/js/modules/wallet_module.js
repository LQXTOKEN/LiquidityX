// js/modules/wallet_module.js

window.walletModule = (function () {
  let provider = null;
  let signer = null;
  let userAddress = null;

  async function connectWallet() {
    console.log("[walletModule] Trying to connect wallet...");

    if (window.ethereum) {
      try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("[walletModule] Provider created:", provider);

        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        console.log("[walletModule] Connected:", userAddress);
        return { provider, signer, userAddress };
      } catch (error) {
        console.error("[walletModule] User rejected connection or error occurred:", error);
        return null;
      }
    } else {
      alert("MetaMask is not installed.");
      console.warn("[walletModule] No window.ethereum found");
      return null;
    }
  }

  function disconnectWallet() {
    console.log("[walletModule] Disconnecting wallet");
    provider = null;
    signer = null;
    userAddress = null;
  }

  function isWalletConnected() {
    return !!userAddress;
  }

  function getSigner() {
    return signer;
  }

  function getProvider() {
    return provider;
  }

  function getUserAddress() {
    return userAddress;
  }

  return {
    connectWallet,
    disconnectWallet,
    isWalletConnected,
    getSigner,
    getProvider,
    getUserAddress
  };
})();
