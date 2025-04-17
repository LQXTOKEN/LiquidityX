// 📄 js/modules/wallet_module.js
// ✅ Wallet connect module με safety, logging & disconnect

window.walletModule = (function () {
  let provider;
  let signer;
  let userAddress;
  let isConnecting = false; // ⛔ για αποτροπή loop

  async function connectWallet() {
    try {
      if (isConnecting) return; // ⛔ prevent re-entry
      isConnecting = true;

      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        isConnecting = false;
        return null;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();

      if (!userAddress || !ethers.utils.isAddress(userAddress)) {
        console.error("[walletModule] ❌ Invalid or missing user address");
        isConnecting = false;
        return null;
      }

      console.log("[walletModule] ✅ Connected:", userAddress);
      isConnecting = false;
      return { provider, signer, userAddress };
    } catch (error) {
      console.error("[walletModule] ❌ Connection error:", error);
      isConnecting = false;
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
    isConnecting = false;
    console.log("[walletModule] 🔌 Wallet disconnected");
  }

  return {
    connectWallet,
    getProvider,
    getUserAddress,
    disconnectWallet
  };
})();
