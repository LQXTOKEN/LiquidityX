// js/modules/token_module.js
//
// 📦 Περιγραφή: Ελέγχει και φορτώνει token δεδομένα (symbol, decimals) από ERC-20 συμβόλαια.
// Χρησιμοποιείται για το validation πριν την αποστολή του airdrop.

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
        contractAddress: address,
        contract,
        symbol,
        decimals,
        isValid: true
      };

      console.log("[tokenModule] ✅ Token loaded:", selectedToken);
      uiModule.updateTokenStatus(`✅ Token loaded: ${symbol} (${decimals} decimals)`, true);
    } catch (error) {
      console.error("[tokenModule] ❌ Token check failed:", error);
      selectedToken = {
        contractAddress: address,
        contract: null,
        symbol: null,
        decimals: null,
        isValid: false
      };
      uiModule.updateTokenStatus("❌ Invalid token address or contract error", false);
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
