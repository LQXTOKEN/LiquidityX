// js/modules/send.js

console.log("[send.js] Loaded");

window.sendModule = (function () {
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      console.log("[sendAirdrop] amountPerUser (wei):", amountPerUser.toString());
      console.log("[sendAirdrop] recipients.length:", recipients.length);

      const totalRequired = amountPerUser.mul(recipients.length);
      console.log("[sendAirdrop] totalRequired (wei):", totalRequired.toString());

      uiModule.addLog(`🔄 Approving ${symbol} for ${recipients.length} recipients...`, "info");
      const token = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, signer);
      const tx = await token.approve(CONFIG.AIRDROP_CONTRACT_PROXY, totalRequired);
      uiModule.addLog(`⛽ Approve TX sent: ${tx.hash}`, "info");
      await tx.wait();
      uiModule.addLog(`✅ Approved successfully.`, "success");

      // Approve LQX fee
      uiModule.addLog(`🔐 Approving ${CONFIG.lqxFeeAmount / 1e18} LQX as fee...`, "info");
      const lqxToken = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, CONFIG.ERC20_ABI, signer);
      const feeTx = await lqxToken.approve(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.lqxFeeAmount.toString());
      uiModule.addLog(`⛽ Fee Approve TX sent: ${feeTx.hash}`, "info");
      await feeTx.wait();
      uiModule.addLog(`✅ LQX Fee approved.`, "success");

      // ✅ Send airdrop
      uiModule.addLog(`🚀 Sending airdrop to ${recipients.length} recipients...`, "info");
      const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);

      const airdropTx = await airdrop.batchTransferSameAmount(tokenAddress, recipients, amountPerUser);
      uiModule.addLog(`⛽ TX sent: ${airdropTx.hash}`, "info");
      await airdropTx.wait();

      uiModule.addLog(`🎉 Airdrop complete!`, "success");

      // ✅ POST στο backend για logging
      await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/airdrops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenAddress,
          symbol,
          count: recipients.length,
          timestamp: Date.now()
        })
      });
    } catch (err) {
      console.error("[sendAirdrop] ❌ Error:", err);
      uiModule.addLog(`❌ Airdrop failed: ${err.message || err}`, "error");
    }
  }

  async function checkMyRecord(signer) {
    // implementation...
  }

  async function retryFailed(signer, token) {
    // implementation...
  }

  async function recoverTokens(signer, token) {
    // implementation...
  }

  return {
    sendAirdrop,
    checkMyRecord,
    retryFailed,
    recoverTokens
  };
})();
