// js/modules/send.js

window.sendModule = (function () {
  async function sendAirdrop(recipients, amountPerUser) {
    try {
      const { AIRDROP_CONTRACT_PROXY, LQX_TOKEN_ADDRESS, BATCH_AIRDROP_ABI, ERC20_ABI } = window.CONFIG;

      if (!window.token || !window.token.contract) {
        uiModule.addLog("❌ Token is missing or invalid.", "error");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = window.token.contract.connect(signer);
      const lqxToken = new ethers.Contract(LQX_TOKEN_ADDRESS, ERC20_ABI, signer);
      const airdropContract = new ethers.Contract(AIRDROP_CONTRACT_PROXY, BATCH_AIRDROP_ABI, signer);

      const amountInWei = ethers.utils.parseUnits(amountPerUser.toString(), window.token.decimals);
      const totalAmount = amountInWei.mul(recipients.length);

      console.log("[send.js] amountPerUser (wei):", amountInWei.toString());
      console.log("[send.js] recipients.length:", recipients.length);
      console.log("[send.js] totalRequired (wei):", totalAmount.toString());

      uiModule.addLog(`🔄 Approving ${window.token.symbol} for ${recipients.length} recipients...`, "info");
      const approveTx = await tokenContract.approve(AIRDROP_CONTRACT_PROXY, totalAmount);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`, "info");
      await approveTx.wait();
      uiModule.addLog("✅ Approved successfully.", "success");

      const feeAmount = await airdropContract.requiredFee();
      uiModule.addLog(`🔐 Approving ${ethers.utils.formatUnits(feeAmount, 18)} LQX as fee...`, "info");
      const feeTx = await lqxToken.approve(AIRDROP_CONTRACT_PROXY, feeAmount);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${feeTx.hash}`, "info");
      await feeTx.wait();
      uiModule.addLog("✅ LQX Fee approved.", "success");

      uiModule.addLog(`🚀 Sending airdrop to ${recipients.length} recipients...`, "info");
      const tx = await airdropContract.batchTransferSameAmount(
        window.token.contractAddress,
        recipients,
        amountInWei
      );
      uiModule.addLog(`⛽ TX sent: ${tx.hash}`, "info");
      await tx.wait();
      uiModule.addLog("✅ Airdrop completed successfully!", "success");
    } catch (error) {
      console.error("[sendAirdrop] ❌ Error:", error);
      uiModule.addLog(`❌ Airdrop failed: ${error.message}`, "error");
    }
  }

  return {
    sendAirdrop
  };
})();
