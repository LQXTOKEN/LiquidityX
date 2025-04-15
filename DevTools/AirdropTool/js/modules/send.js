// js/modules/send.js

window.sendModule = (function () {
  async function sendAirdrop(token, recipients, amountPerUser, signer) {
    try {
      console.log("[send.js] amountPerUser (wei):", amountPerUser.toString());
      console.log("[send.js] recipients.length:", recipients.length);

      const totalRequired = amountPerUser.mul(recipients.length);
      console.log("[send.js] totalRequired (wei):", totalRequired.toString());

      if (!token || !token.contractAddress) {
        uiModule.addLog("❌ Token is missing or invalid.", "error");
        return;
      }

      const tokenContract = new ethers.Contract(token.contractAddress, ERC20_ABI, signer);

      uiModule.addLog(`🔄 Approving LQX for ${recipients.length} recipients...`, "info");
      const approveTx = await tokenContract.approve(CONFIG.AIRDROP_CONTRACT_PROXY, totalRequired);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`, "info");
      await approveTx.wait();
      uiModule.addLog("✅ Approved successfully.", "success");

      const feeAmount = await getRequiredFee(signer);
      uiModule.addLog(`🔐 Approving ${ethers.utils.formatUnits(feeAmount, 18)} LQX as fee...`, "info");

      const feeContract = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, ERC20_ABI, signer);
      const feeApproveTx = await feeContract.approve(CONFIG.AIRDROP_CONTRACT_PROXY, feeAmount);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${feeApproveTx.hash}`, "info");
      await feeApproveTx.wait();
      uiModule.addLog("✅ LQX Fee approved.", "success");

      const contract = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, AIRDROP_ABI, signer);

      uiModule.addLog(`🚀 Sending airdrop to ${recipients.length} recipients...`, "info");

      const tx = await contract.batchTransferSameAmount(
        token.contractAddress,
        recipients,
        amountPerUser
      );

      uiModule.addLog(`⛽ TX sent: ${tx.hash}`, "info");
      await tx.wait();

      uiModule.addLog("✅ Airdrop completed successfully!", "success");
    } catch (err) {
      console.error("[sendAirdrop] ❌ Error:", err);
      uiModule.addLog(`❌ Airdrop failed: ${err.message}`, "error");
    }
  }

  async function getRequiredFee(signer) {
    try {
      const contract = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, AIRDROP_ABI, signer);
      return await contract.requiredFee();
    } catch (err) {
      console.warn("[send.js] Could not fetch requiredFee, using default:", CONFIG.LQX_FEE_AMOUNT);
      return ethers.BigNumber.from(CONFIG.LQX_FEE_AMOUNT); // fallback
    }
  }

  return {
    sendAirdrop
  };
})();
