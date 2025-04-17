// 📄 js/modules/send.js
// 📦 Περιλαμβάνει: sendAirdrop, retryFailed, recoverTokens, checkMyRecord

window.sendModule = (function () {
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      const airdropContract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        signer
      );

      const tx = await airdropContract.batchTransferSameAmount(
        tokenAddress,
        recipients,
        amountPerUser
      );

      uiModule.log("⏳ Airdrop transaction sent. Waiting for confirmation...");
      const receipt = await tx.wait();
      uiModule.log(`✅ Airdrop confirmed in block ${receipt.blockNumber}`);
    } catch (err) {
      console.error("[send.js] ❌ sendAirdrop failed:", err);
      uiModule.log("❌ Airdrop failed. Check console for details.");
    }
  }

  async function retryFailed(signer, tokenAddress) {
    try {
      const contract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        signer
      );

      uiModule.log("🔁 Retrying failed recipients...");
      const tx = await contract.retryFailed(tokenAddress);
      const receipt = await tx.wait();

      uiModule.log(`✅ Retry completed in tx ${receipt.transactionHash}`);
    } catch (err) {
      console.error("[send.js] ❌ retryFailed error:", err);
      uiModule.log("❌ Retry failed. See console for details.");
    }
  }

  async function recoverTokens(signer, tokenAddress) {
    try {
      const contract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        signer
      );

      uiModule.log("♻️ Recovering stuck tokens...");
      const tx = await contract.recoverFailedTransfer(tokenAddress);
      const receipt = await tx.wait();

      uiModule.log(`✅ Recovery complete in tx ${receipt.transactionHash}`);
    } catch (err) {
      console.error("[send.js] ❌ recoverTokens error:", err);
      uiModule.log("❌ Recovery failed. Check console for details.");
    }
  }

  async function checkMyRecord(signer) {
    try {
      const address = await signer.getAddress();
      const contract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        signer
      );

      uiModule.log("🔍 Fetching airdrop history...");
      const records = await contract.getUserRecords(address);

      if (!records || records.length === 0) {
        uiModule.updateRecoveryResults("ℹ️ No airdrop records found.");
        return;
      }

      const output = records
        .map((r, i) => {
          return `#${i + 1}
Token: ${r.token}
Total Sent: ${ethers.utils.formatUnits(r.totalAmount)}
Failed: ${r.failedRecipients.length} addresses
Claimed: ${r.claimed ? "✅" : "❌"}\n`;
        })
        .join("\n");

      uiModule.updateRecoveryResults(output);
    } catch (err) {
      console.error("[send.js] ❌ checkMyRecord error:", err);
      uiModule.updateRecoveryResults("❌ Failed to fetch airdrop record.");
    }
  }

  return {
    sendAirdrop,
    retryFailed,
    recoverTokens,
    checkMyRecord
  };
})();
