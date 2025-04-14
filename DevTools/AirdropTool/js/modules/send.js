// js/modules/send.js

window.sendModule = (function () {
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      uiModule.addLog(`🔄 Approving ${symbol} token for batch airdrop...`);
      const token = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, signer);

      const approveTx = await token.approve(CONFIG.AIRDROP_CONTRACT_PROXY, amountPerUser.mul(recipients.length));
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`);
      await approveTx.wait();
      uiModule.addLog(`✅ Approved successfully.`);

      const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);

      uiModule.addLog(`🚀 Sending batchTransferSameAmount to ${recipients.length} recipients...`);
      const batchTx = await airdrop.batchTransferSameAmount(tokenAddress, recipients, amountPerUser);
      uiModule.addLog(`⛽ Airdrop TX sent: ${batchTx.hash}`);
      const receipt = await batchTx.wait();
      uiModule.addLog(`✅ Airdrop executed successfully.`);

      // Προσπάθεια λήψης failedRecipients (αν εκπέμπεται στο event)
      try {
        const failed = await airdrop.getFailedRecipients(tokenAddress, await signer.getAddress());
        if (failed.length > 0) {
          uiModule.addLog(`⚠️ ${failed.length} recipients failed. You can retry or recover them.`);

          uiModule.enableDownloadFailed(failed, (arr) => {
            const blob = new Blob([arr.join("\n")], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "failed_recipients.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });

          document.getElementById("retryFailedButton").style.display = "inline-block";
          document.getElementById("recoverTokensButton").style.display = "inline-block";
        } else {
          uiModule.addLog(`🎉 No failed recipients.`);
        }
      } catch (e) {
        uiModule.addLog(`ℹ️ Could not fetch failed recipients`, "warn");
        console.warn(e);
      }
    } catch (err) {
      console.error("[sendAirdrop] ❌ Error:", err);
      uiModule.addLog("❌ Airdrop failed: " + (err.message || "Unknown error"), "error");
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

  return {
    sendAirdrop,
    checkMyRecord,
    retryFailed,
    recoverTokens
  };
})();
