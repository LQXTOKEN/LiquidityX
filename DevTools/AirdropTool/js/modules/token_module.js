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
        contractAddress: address,
        contract,
        symbol,
        decimals
      };

      console.log("[tokenModule] ✅ Token loaded:", selectedToken);

      uiModule.updateTokenStatus(`✅ Token loaded: ${symbol} (${decimals} decimals)`, true);

      // ✅ Επιπλέον λειτουργίες με το νέο συμβόλαιο
      const signer = window.signer;
      if (signer) {
        const userAddress = await signer.getAddress();
        const airdropContract = new ethers.Contract(
          CONFIG.AIRDROP_CONTRACT_PROXY,
          CONFIG.BATCH_AIRDROP_ABI,
          provider
        );

        // ➕ Ελέγχουμε αν ο χρήστης είναι exempt από fee
        const isExempt = await airdropContract.feeExemptAddresses(userAddress);
        if (isExempt) {
          uiModule.addLog(`🟢 You are exempt from LQX fee.`);
        } else {
          // Δείχνει το required fee αν υπάρχει
          try {
            const requiredFee = await airdropContract.requiredFee();
            const formattedFee = ethers.utils.formatUnits(requiredFee, 18);
            uiModule.addLog(`💸 Protocol fee: ${formattedFee} LQX`);
          } catch (e) {
            console.warn("[tokenModule] Could not fetch required fee:", e);
          }
        }
      }

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
