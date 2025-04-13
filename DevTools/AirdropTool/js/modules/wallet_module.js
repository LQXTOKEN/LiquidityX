window.walletModule = (function () {
  let provider;
  let signer;
  let userAddress;

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return null;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();

      console.log("[walletModule] Connected:", userAddress);
      return { provider, signer, userAddress };
    } catch (error) {
      console.error("[walletModule] Connection error:", error);
      return null;
    }
  }

  function getProvider() {
    return provider;
  }

  function getUserAddress() {
    return userAddress;
  }

  function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
  }

  return {
    connectWallet,
    getProvider,
    getUserAddress,
    disconnectWallet
  };
})();
