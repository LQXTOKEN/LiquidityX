// js/modules/send.js

console.log("[send.js] Loaded");

window.sendModule = (function () {
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      if (!CONFIG.BATCH_AIRDROP_ABI) throw new Error("ABI not loaded");

      const airdrop = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        signer
      );

      const totalRequired = amountPerUser.mul(recipients.length);
      console.log("[send.js] amountPerUser (wei):", amountPerUser.toString());
      console.log("[send.js] recipients.length:", recipients.length);
      console.log("[send.js] totalRequired (wei):", totalRequired.toString());

      uiModule.addLog(`🔄 Approving ${symbol} for ${recipients.length} recipients...`);
      const tokenContract = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, signer);
      const approveTx = await tokenContract.approve(CONFIG.AIRDROP_CONTRACT_PROXY, totalRequired);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`);
      await approveTx.wait();
      uiModule.addLog(`✅ Approved successfully.`, "success");

      uiModule.addLog(`🔐 Approving 500 LQX as fee...`);
      const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, CONFIG.ERC20_ABI, signer);
      const feeAmount = ethers.BigNumber.from("500000000000000000000"); // 500 LQX in wei
      const approveFeeTx = await lqxContract.approve(CONFIG.AIRDROP_CONTRACT_PROXY, feeAmount);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${approveFeeTx.hash}`);
      await approveFeeTx.wait();
      uiModule.addLog(`✅ LQX Fee approved.`, "success");

      uiModule.addLog(`🚀 Sending airdrop to ${recipients.length} recipients...`);
      const tx = await airdrop.batchTransferSameAmount(tokenAddress, recipients, amountPerUser);
      uiModule.addLog(`⛽ Airdrop TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.addLog(`✅ Airdrop completed.`, "success");

      // Try to fetch failed recipients from contract (if supported)
      try {
        const failed = await airdrop.getFailedRecipients();
        if (Array.isArray(failed) && failed.length > 0) {
          uiModule.addLog(`⚠️ ${failed.length} failed transfers`, "warn");
          uiModule.enableDownloadFailed(failed, failedList => {
            const content = failedList.join("\n");
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "failed_recipients.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
        }
      } catch (error) {
        uiModule.addLog(`ℹ️ Could not verify failed recipients.`, "warn");
      }
    } catch (error) {
      console.error("[sendAirdrop] ❌ Error:", error);
      uiModule.addLog(`❌ Airdrop failed: ${error.message}`, "error");
    }
  }

  async function checkMyRecord(signer) {
    uiModule.addLog("ℹ️ Fetching your last airdrop record...");
    // Will implement in next step
  }

  async function retryFailed(signer, tokenAddress) {
    uiModule.addLog("🔁 Retrying failed transfers...");
    // Will implement in next step
  }

  async function recoverTokens(signer, tokenAddress) {
    uiModule.addLog("🛡️ Recovering failed tokens...");
    // Will implement in next step
  }

  return {
    sendAirdrop,
    checkMyRecord,
    retryFailed,
    recoverTokens
  };
})();
