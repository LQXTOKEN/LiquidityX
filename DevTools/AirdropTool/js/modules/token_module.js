// js/modules/token_module.js

window.tokenModule = (function () {
  let selectedToken = null;

  async function checkToken(address) {
    try {
      const provider = walletModule.getProvider();
      if (!provider) {
        uiModule.updateTokenStatus("❌ Wallet not connected", false);
        return;
      }

      const contract = new ethers.Contract(address, window.ERC20_ABI, provider);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      selectedToken = {
        contractAddress: address,   // ✅ για χρήση στο send
        contract,
        symbol,
        decimals
      };

      // ✅ Log για έλεγχο
      console.log("[tokenModule] ✅ Token loaded:", selectedToken);

      // ✅ Ενημέρωση UI
      uiModule.updateTokenStatus(`✅ Token loaded: ${symbol} (${decimals} decimals)`, true);
    } catch (error) {
      console.error("[tokenModule] ❌ Token check failed:", error);
      selectedToken = null;
      uiModule.updateTokenStatus("❌ Invalid token address", false);
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
