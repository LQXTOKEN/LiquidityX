// js/modules/send.js

console.log("[send.js] Loaded");

window.sendModule = (function () {
  async function sendAirdrop(token, recipients, amountPerUser) {
    try {
      const { AIRDROP_CONTRACT_PROXY, BATCH_AIRDROP_ABI, LQX_TOKEN_ADDRESS, ERC20_ABI } = window.CONFIG;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const airdropContract = new ethers.Contract(AIRDROP_CONTRACT_PROXY, BATCH_AIRDROP_ABI, signer);
      const tokenContract = new ethers.Contract(token.contractAddress, ERC20_ABI, signer);
      const lqxContract = new ethers.Contract(LQX_TOKEN_ADDRESS, ERC20_ABI, signer);

      const decimals = token.decimals;
      const symbol = token.symbol;
      const amount = ethers.utils.parseUnits(amountPerUser, decimals);
      const totalAmount = amount.mul(recipients.length);

      console.log("[send.js] amountPerUser (wei):", amount.toString());
      console.log("[send.js] recipients.length:", recipients.length);
      console.log("[send.js] totalRequired (wei):", totalAmount.toString());

      // Approve token transfer for airdrop
      uiModule.addLog(`🔄 Approving ${symbol} for ${recipients.length} recipients...`);
      const approveTx = await tokenContract.approve(AIRDROP_CONTRACT_PROXY, totalAmount);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`, "info");
      await approveTx.wait();
      uiModule.addLog("✅ Approved successfully.", "success");

      // Approve LQX fee
      const fee = await airdropContract.requiredFee();
      uiModule.addLog(`🔐 Approving ${ethers.utils.formatUnits(fee, 18)} LQX as fee...`);
      const feeApproveTx = await lqxContract.approve(AIRDROP_CONTRACT_PROXY, fee);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${feeApproveTx.hash}`, "info");
      await feeApproveTx.wait();
      uiModule.addLog("✅ LQX Fee approved.", "success");

      // Execute airdrop
      uiModule.addLog(`🚀 Sending airdrop to ${recipients.length} recipients...`);
      const tx = await airdropContract.batchTransferSameAmount(token.contractAddress, recipients, amount);
      uiModule.addLog(`⛽ TX sent: ${tx.hash}`, "info");
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        uiModule.addLog("✅ Airdrop completed successfully!", "success");
      } else {
        uiModule.addLog("⚠️ Airdrop transaction failed", "error");
      }
    } catch (err) {
      console.error("[sendAirdrop] ❌ Error:", err);
      uiModule.addLog(`❌ Airdrop failed: ${err.message}`, "error");
    }
  }

  return {
    sendAirdrop
  };
})();
