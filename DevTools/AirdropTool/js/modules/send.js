// js/modules/send.js

window.sendModule = (function () {
  // ✅ Υποθέτουμε ότι ethers, erc20Module, uiModule, CONFIG έχουν φορτωθεί global

  const BATCH_AIRDROP_ADDRESS = CONFIG.BATCH_AIRDROP_ADDRESS;
  const LQX_TOKEN_ADDRESS = CONFIG.LQX_TOKEN_ADDRESS;

  // ⛏ Helper για download .txt αρχείου
  function downloadFailedRecipients(failed) {
    const blob = new Blob([failed.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "failed_recipients.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ⛏ POST log στο backend
  async function logAirdropToServer(data) {
    try {
      await fetch(`${CONFIG.PROXY_API}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      uiModule.addLog("📡 Airdrop logged successfully", "success");
    } catch (err) {
      uiModule.addLog("⚠️ Failed to log airdrop", "error");
    }
  }

  // ✅ Εκτέλεση Airdrop
  async function sendAirdrop(tokenAddress, tokenSymbol, amountPerRecipient, recipients, signer) {
    const token = erc20Module.getERC20Contract(tokenAddress, signer);
    const contract = erc20Module.getBatchAirdropContract(signer);
    const sender = await signer.getAddress();
    const totalAmount = ethers.BigNumber.from(amountPerRecipient).mul(recipients.length);

    try {
      uiModule.addLog("⏳ Approving token transfer...", "info");
      const approveTx = await token.approve(BATCH_AIRDROP_ADDRESS, totalAmount);
      await approveTx.wait();
      uiModule.addLog("✅ Token approved", "success");
    } catch (err) {
      uiModule.addLog("❌ Approve failed: " + err.message, "error");
      return;
    }

    try {
      uiModule.addLog("🚀 Sending airdrop transaction...", "info");
      const tx = await contract.batchTransferSameAmount(recipients, amountPerRecipient, tokenAddress);
      const receipt = await tx.wait();
      uiModule.addLog(`✅ Airdrop confirmed! TX: ${tx.hash}`, "success");

      const recordId = await contract.getRecordId();

      const logData = {
        sender,
        token: tokenAddress,
        symbol: tokenSymbol,
        amountPerRecipient: amountPerRecipient.toString(),
        recipients,
        txHash: tx.hash
      };
      await logAirdropToServer(logData);
      uiModule.updateLastAirdrops();

      const failed = await contract.getFailedRecipients(recordId);
      if (failed.length > 0) {
        uiModule.addLog(`⚠️ ${failed.length} failed recipients`, "warn");
        uiModule.enableDownloadFailed(failed, () => downloadFailedRecipients(failed));

        const retryBtn = document.getElementById("retryButton");
        retryBtn.style.display = "inline-block";
        retryBtn.onclick = async () => {
          try {
            uiModule.addLog("🔁 Retrying failed transfers...", "info");
            const retryTx = await contract.recoverFailedTransfers(recordId, tokenAddress);
            await retryTx.wait();
            uiModule.addLog("✅ Retry successful", "success");
          } catch (e) {
            uiModule.addLog("❌ Retry failed: " + e.message, "error");
          }
        };
      } else {
        uiModule.addLog("🎉 No failed recipients!", "success");
      }

    } catch (err) {
      uiModule.addLog("❌ Airdrop failed: " + err.message, "error");
    }
  }

  // ✅ Έλεγχος υπάρχοντος Record και εμφάνιση
  async function checkMyRecord(signer) {
    try {
      const contract = erc20Module.getBatchAirdropContract(signer);
      const recordId = await contract.getRecordId();
      const failed = await contract.getFailedRecipients(recordId);

      const recoveryResults = document.getElementById("recoveryResults");
      recoveryResults.innerHTML = "";

      if (failed.length === 0) {
        recoveryResults.innerHTML = "<p>✅ No failed recipients found for your last airdrop.</p>";
        return;
      }

      const list = document.createElement("ul");
      failed.forEach(addr => {
        const li = document.createElement("li");
        li.textContent = addr;
        list.appendChild(li);
      });
      recoveryResults.appendChild(list);

      document.getElementById("retryFailedButton").style.display = "inline-block";
      document.getElementById("recoverTokensButton").style.display = "inline-block";

      window.lastRecordId = recordId;

    } catch (err) {
      uiModule.addLog("❌ Failed to fetch airdrop record: " + err.message, "error");
    }
  }

  // ✅ Retry failed
  async function retryFailed(signer, tokenAddress) {
    try {
      const contract = erc20Module.getBatchAirdropContract(signer);
      const tx = await contract.recoverFailedTransfers(window.lastRecordId, tokenAddress);
      await tx.wait();
      uiModule.addLog("✅ Retry successful", "success");
    } catch (err) {
      uiModule.addLog("❌ Retry failed: " + err.message, "error");
    }
  }

  // ✅ Recover Tokens
  async function recoverTokens(signer, tokenAddress) {
    try {
      const contract = erc20Module.getBatchAirdropContract(signer);
      const tx = await contract.recoverFailedTransfers(window.lastRecordId, tokenAddress);
      await tx.wait();
      uiModule.addLog("✅ Recovery complete. Tokens returned.", "success");
    } catch (err) {
      uiModule.addLog("❌ Recovery failed: " + err.message, "error");
    }
  }

  // ✅ Public API
  return {
    sendAirdrop,
    checkMyRecord,
    retryFailed,
    recoverTokens
  };
})();
