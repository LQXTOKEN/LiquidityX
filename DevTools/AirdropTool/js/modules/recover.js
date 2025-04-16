window.recoverModule = (function () {
  async function recoverTokens(signer, tokenAddress) {
    try {
      uiModule.addLog("💸 Recovering tokens from failed recipients...");
      const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);
      const tx = await airdrop.recoverFailedTransfer(tokenAddress);
      uiModule.addLog(`⛽ Recover TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.addLog("✅ Recovery completed.");
    } catch (err) {
      console.error("[recoverTokens] ❌", err);
      uiModule.addLog("❌ Recovery failed: " + (err.message || "Unknown error"), "error");
    }
  }

  async function retryFailed(signer, tokenAddress) {
    try {
      uiModule.addLog("🔁 Retrying failed recipients...");
      const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);
      const tx = await airdrop.retryFailed(tokenAddress);
      uiModule.addLog(`⛽ Retry TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.addLog("✅ Retry completed.");
    } catch (err) {
      console.error("[retryFailed] ❌", err);
      uiModule.addLog("❌ Retry failed: " + (err.message || "Unknown error"), "error");
    }
  }

  async function checkMyRecord(signer) {
    try {
      const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);
      const user = await signer.getAddress();
      const records = await airdrop.getUserRecords(user);

      const out = document.getElementById("recoveryResults");
      out.innerHTML = `<p><strong>Total Records:</strong> ${records.length}</p>`;
      records.forEach((r, i) => {
        out.innerHTML += `<p>#${i + 1} ➝ token: ${r.token}, failed: ${r.failedRecipients.length}</p>`;
      });

      uiModule.addLog(`📦 Found ${records.length} past airdrop(s).`);
    } catch (err) {
      console.error("[checkMyRecord] ❌", err);
      uiModule.addLog("❌ Failed to fetch your records.", "error");
    }
  }

  return {
    recoverTokens,
    retryFailed,
    checkMyRecord
  };
})();
