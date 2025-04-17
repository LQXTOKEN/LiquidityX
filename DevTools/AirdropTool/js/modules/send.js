// js/modules/send.js
//
// 📦 Περιγραφή: Εκτελεί approve και validation logic για το airdrop εργαλείο.
// Τα smart contract interactions γίνονται μέσω app.js (appSend, appRetry, appRecover)

window.sendModule = (function () {
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      const userAddress = await signer.getAddress();

      console.log("[send.js] amountPerUser (wei):", amountPerUser.toString());
      console.log("[send.js] recipients.length:", recipients.length);

      // ✅ Έλεγχος για invalid διευθύνσεις
      const invalids = recipients.filter(addr => !ethers.utils.isAddress(addr) || addr === ethers.constants.AddressZero);
      if (invalids.length > 0) {
        uiModule.showError(`❌ Invalid address found: ${invalids[0]}`);
        return;
      }

      const token = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, signer);
      const userBalance = await token.balanceOf(userAddress);
      const totalRequired = amountPerUser.mul(recipients.length);

      console.log("[send.js] totalRequired (wei):", totalRequired.toString());

      if (userBalance.lt(totalRequired)) {
        const userFormatted = ethers.utils.formatUnits(userBalance);
        const requiredFormatted = ethers.utils.formatUnits(totalRequired);
        uiModule.showError(`❌ Insufficient balance: You need ${requiredFormatted} ${symbol}, but only have ${userFormatted}`);
        return;
      }

      // ✅ Approve για token
      uiModule.addLog(`🔄 Approving ${symbol} for ${recipients.length} recipients...`);
      const approveTx = await token.approve(CONFIG.AIRDROP_CONTRACT_PROXY, totalRequired);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`);
      await approveTx.wait();
      uiModule.addLog(`✅ Approved successfully.`);

      // ✅ Approve για LQX Fee
      const feeToken = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, CONFIG.ERC20_ABI, signer);
      const feeAmount = ethers.utils.parseUnits("1000", 18); // 1000 LQX
      uiModule.addLog(`🔐 Approving ${ethers.utils.formatUnits(feeAmount)} LQX as fee...`);
      const approveFeeTx = await feeToken.approve(CONFIG.AIRDROP_CONTRACT_PROXY, feeAmount);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${approveFeeTx.hash}`);
      await approveFeeTx.wait();
      uiModule.addLog(`✅ LQX Fee approved.`);

      // ✅ Κλήση προς app.js για εκτέλεση airdrop
      if (typeof window.appSend === "function") {
        await window.appSend({ signer, tokenAddress, recipients, amountPerUser });
      } else {
        throw new Error("appSend is not defined in app.js");
      }

      // ✅ Έλεγχος για αποτυχημένους
      try {
        const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);
        const failed = await airdrop.getFailedRecipients(tokenAddress, userAddress);
        if (failed.length > 0) {
          uiModule.addLog(`⚠️ ${failed.length} failed recipients. Retry or recover available.`);

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
          uiModule.addLog(`🎉 All recipients succeeded!`);
        }
      } catch (e) {
        console.warn("[getFailedRecipients]", e);
        uiModule.addLog(`ℹ️ Could not verify failed recipients.`, "warn");
      }

    } catch (err) {
      console.error("[sendAirdrop] ❌ Error:", err);
      uiModule.addLog("❌ Airdrop failed: " + (err.reason || err.message || "Unknown error"), "error");
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
      if (typeof window.appRetry === "function") {
        await window.appRetry({ signer, tokenAddress });
      } else {
        throw new Error("appRetry is not defined in app.js");
      }
    } catch (err) {
      console.error("[retryFailed] ❌", err);
      uiModule.addLog("❌ Retry failed: " + (err.message || "Unknown error"), "error");
    }
  }

  async function recoverTokens(signer, tokenAddress) {
    try {
      if (typeof window.appRecover === "function") {
        await window.appRecover({ signer, tokenAddress });
      } else {
        throw new Error("appRecover is not defined in app.js");
      }
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
