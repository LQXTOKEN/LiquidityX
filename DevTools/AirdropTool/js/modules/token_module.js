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

      window.selectedToken = selectedToken;

      // 🔍 Δυναμική επικοινωνία με το συμβόλαιο Airdrop
      const signer = provider.getSigner();
      const airdropContract = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, window.AIRDROP_ABI, signer);
      const userAddress = await signer.getAddress();

      // 📌 Get required LQX fee from contract
      const requiredFee = await airdropContract.requiredFee();
      window.requiredLQXFee = requiredFee;

      // 🛡️ Check if user is fee-exempt
      const isExempt = await airdropContract.isFeeExempt(userAddress);
      window.isFeeExempt = isExempt;

      // 🆔 Get recordId για αυτό το token/user
      const recordId = await airdropContract.getRecordId(userAddress, address);
      const hasClaimed = await airdropContract.hasClaimed(recordId);

      window.airdropStatus = {
        requiredFee,
        isExempt,
        recordId,
        hasClaimed
      };

      // ✅ Log για έλεγχο
      console.log("[tokenModule] ✅ Token loaded:", selectedToken);
      console.log("[tokenModule] 🆔 Record ID:", recordId);
      console.log("[tokenModule] 🧾 Required LQX fee:", requiredFee.toString());
      console.log("[tokenModule] 🔒 Is fee-exempt:", isExempt);
      console.log("[tokenModule] ✔️ Has claimed before:", hasClaimed);

      // ✅ Ενημέρωση UI
      uiModule.updateTokenStatus(
        `✅ ${symbol} token loaded (${decimals} decimals)
        ${isExempt ? "🛡️ Fee exempt" : `💰 Fee: ${ethers.utils.formatUnits(requiredFee, 18)} LQX`}
        ${hasClaimed ? "⚠️ Already claimed" : "🆕 Eligible for airdrop"}`,
        true
      );

    } catch (error) {
      console.error("[tokenModule] ❌ Token check failed:", error);
      selectedToken = null;
      window.selectedToken = null;
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
