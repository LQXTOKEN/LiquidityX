// js/modules/send.js

console.log("[send.js] Loaded");

window.sendModule = (function () {
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      const airdrop = new ethers.Contract(CONFIG.airdropAddress, CONFIG.airdropAbi, signer);

      const totalRequired = amountPerUser.mul(recipients.length);
      console.log("[send.js] amountPerUser (wei):", amountPerUser.toString());
      console.log("[send.js] recipients.length:", recipients.length);
      console.log("[send.js] totalRequired (wei):", totalRequired.toString());

      // ✅ Step 1: Approve Token Transfer
      uiModule.addLog(`🔄 Approving ${symbol} for ${recipients.length} recipients...`);
      const token = new ethers.Contract(tokenAddress, CONFIG.erc20Abi, signer);
      const approveTx = await token.approve(CONFIG.airdropAddress, totalRequired);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`);
      await approveTx.wait();
      uiModule.addLog(`✅ Approved successfully.`);

      // ✅ Step 2: Approve LQX Fee
      const lqx = new ethers.Contract(CONFIG.lqxToken, CONFIG.erc20Abi, signer);
      uiModule.addLog(`🔐 Approving ${ethers.utils.formatUnits(CONFIG.lqxFee, 18)} LQX as fee...`);
      const feeTx = await lqx.approve(CONFIG.airdropAddress, CONFIG.lqxFee);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${feeTx.hash}`);
      await feeTx.wait();
      uiModule.addLog(`✅ LQX Fee approved.`);

      // ✅ Step 3: Send Airdrop
      uiModule.addLog(`🚀 Sending airdrop to ${recipients.length} recipients...`);
      const tx = await airdrop.batchTransferSameAmount(tokenAddress, recipients, amountPerUser);
      uiModule.addLog(`⛽ Airdrop TX sent: ${tx.hash}`);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        uiModule.addLog(`✅ Airdrop completed.`, "success");

        // ✅ Record Airdrop Off-chain
        fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/airdrops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: symbol,
            count: recipients.length,
            timestamp: Date.now(),
          }),
        }).catch(() => {
          console.warn("[send.js] Failed to record airdrop to backend.");
        });

        // ✅ Try to fetch failed recipients
        try {
          const failed = await airdrop.getFailedRecipients();
          if (failed.length > 0) {
            uiModule.addLog(`⚠️ ${failed.length} transfers failed`, "warn");
            uiModule.enableDownloadFailed(failed, (array) => {
              const blob = new Blob([array.join("\n")], { type: "text/plain" });
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
        } catch (e) {
          uiModule.addLog(`ℹ️ Could not verify failed recipients.`, "warn");
        }
      } else {
        uiModule.addLog(`❌ Airdrop failed`, "error");
      }
    } catch (err) {
      console.error("[sendAirdrop] ❌ Error:", err);
      uiModule.addLog(`❌ Airdrop failed: ${err.message}`, "error");
    }
  }

  async function checkMyRecord(signer) {
    try {
      const airdrop = new ethers.Contract(CONFIG.airdropAddress, CONFIG.airdropAbi, signer);
      const address = await signer.getAddress();
      const result = await airdrop.getAirdropRecord(address);
      uiModule.addLog(`📦 Record: ${JSON.stringify(result)}`);
    } catch (err) {
      console.error("[checkMyRecord] ❌", err);
      uiModule.addLog(`❌ Could not fetch record.`, "error");
    }
  }

  async function retryFailed(signer, tokenAddress) {
    try {
      const airdrop = new ethers.Contract(CONFIG.airdropAddress, CONFIG.airdropAbi, signer);
      const tx = await airdrop.retryFailedTransfer(tokenAddress);
      uiModule.addLog(`🔁 Retry TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.addLog(`✅ Retry completed.`, "success");
    } catch (err) {
      console.error("[retryFailed] ❌", err);
      uiModule.addLog(`❌ Retry failed: ${err.message}`, "error");
    }
  }

  async function recoverTokens(signer, tokenAddress) {
    try {
      const airdrop = new ethers.Contract(CONFIG.airdropAddress, CONFIG.airdropAbi, signer);
      const tx = await airdrop.recoverFailedTransfer(tokenAddress);
      uiModule.addLog(`♻️ Recover TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.addLog(`✅ Tokens recovered.`, "success");
    } catch (err) {
      console.error("[recoverTokens] ❌", err);
      uiModule.addLog(`❌ Recover failed: ${err.message}`, "error");
    }
  }

  return {
    sendAirdrop,
    checkMyRecord,
    retryFailed,
    recoverTokens,
  };
})();
