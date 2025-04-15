// js/modules/send.js

window.sendModule = (function () {
  async function sendAirdrop(token, recipients, amountPerUser, signer) {
    try {
      const contract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        signer
      );

      const amountWei = ethers.utils.parseUnits(amountPerUser.toString(), token.decimals);
      const totalRequired = amountWei.mul(recipients.length);

      console.log("[send.js] amountPerUser (wei):", amountWei.toString());
      console.log("[send.js] recipients.length:", recipients.length);
      console.log("[send.js] totalRequired (wei):", totalRequired.toString());

      uiModule.addLog(`🔄 Approving ${token.symbol} for ${recipients.length} recipients...`, "info");
      const approveTx = await token.contract.approve(CONFIG.AIRDROP_CONTRACT_PROXY, totalRequired);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`, "info");
      await approveTx.wait();
      uiModule.addLog(`✅ Approved successfully.`, "success");

      // Get LQX Fee from contract dynamically
      const lqxContract = new ethers.Contract(
        CONFIG.LQX_TOKEN_ADDRESS,
        CONFIG.ERC20_ABI,
        signer
      );
      const requiredFee = await contract.requiredFee();

      uiModule.addLog(`🔐 Approving ${ethers.utils.formatUnits(requiredFee, 18)} LQX as fee...`, "info");
      const feeApproveTx = await lqxContract.approve(CONFIG.AIRDROP_CONTRACT_PROXY, requiredFee);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${feeApproveTx.hash}`, "info");
      await feeApproveTx.wait();
      uiModule.addLog(`✅ LQX Fee approved.`, "success");

      uiModule.addLog(`🚀 Sending airdrop to ${recipients.length} recipients...`, "info");

      const tx = await contract.batchTransferSameAmount(
        token.contract.address,
        recipients,
        amountWei
      );

      uiModule.addLog(`⛽ TX sent: ${tx.hash}`, "info");
      await tx.wait();

      uiModule.addLog(`✅ Airdrop successful!`, "success");
    } catch (err) {
      console.error("[sendAirdrop] ❌ Error:", err);
      uiModule.addLog(`❌ Airdrop failed: ${err.message}`, "error");
    }
  }

  return {
    sendAirdrop
  };
})();
