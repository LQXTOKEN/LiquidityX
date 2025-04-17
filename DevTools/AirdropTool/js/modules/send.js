// 📄 js/modules/send.js
// 📦 Περιλαμβάνει: sendAirdrop, retryFailed, recoverTokens, checkMyRecord
// ✅ Υποστηρίζει αυτόματο fee check & value όταν απαιτείται

window.sendModule = (function () {
  // ✅ Αποστολή Airdrop με fee check
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      const contract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        signer
      );

      const sender = await signer.getAddress();

      // ✅ Έλεγχος αν είναι exempt από fees
      const isExempt = await contract.feeExemptAddresses(sender);
      let overrides = {};

      if (!isExempt) {
        const requiredFee = await contract.requiredFee();
        overrides = { value: requiredFee };
        uiModule.log(`💸 Required fee: ${ethers.utils.formatEther(requiredFee)} MATIC`);
      } else {
        uiModule.log("✅ You are exempt from protocol fee.");
      }

      uiModule.log("🚀 Sending airdrop transaction...");
      const tx = await contract.batchTransferSameAmount(tokenAddress, recipients, amountPerUser, overrides);
      uiModule.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      uiModule.log(`✅ Airdrop confirmed in block ${receipt.blockNumber}`);
    } catch (err) {
      console.error("[send.js] ❌ sendAirdrop failed:", err);
      uiModule.log("❌ Airdrop failed. Check console for details.");
    }
  }

  // 🔁 Retry αποτυχημένων αποδεκτών
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

  // ♻️ Recovery stuck tokens
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

  // 📜 Προβολή ιστορικού χρήστη (airdrops)
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

  // 🔁 Επιστρέφει όλα τα public functions του module
  return {
    sendAirdrop,
    retryFailed,
    recoverTokens,
    checkMyRecord
  };
})();
