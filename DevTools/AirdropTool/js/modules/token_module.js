// js/modules/token_module.js

window.tokenModule = (function () {
  let selectedToken = null;

  async function checkToken(address) {
    try {
      const provider = walletModule.getProvider();
      if (!provider) {
        uiModule.updateTokenStatus("❌ Wallet not connected", "error");
        return;
      }

      const contract = new ethers.Contract(address, window.ERC20_ABI, provider);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      selectedToken = {
        contractAddress: address, // ✅ προσθήκη
        contract,
        symbol,
        decimals
      };

      console.log("[tokenModule] ✅ Token loaded:", symbol);
      uiModule.updateTokenStatus(`✅ Token loaded: ${symbol}`, "success");
    } catch (error) {
      console.error("[tokenModule] ❌ Token check failed:", error);
      selectedToken = null;
      uiModule.updateTokenStatus("❌ Invalid token address", "error");
    }
  }

  function getSelectedToken() {
    return selectedToken;
  }

  return {
    checkToken,
    getSelectedToken
  };
})();
