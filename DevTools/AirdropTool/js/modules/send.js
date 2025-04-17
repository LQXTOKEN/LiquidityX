window.sendModule = (function () {
  async function sendAirdrop(tokenAddress, symbol, amountPerUser, recipients, signer) {
    try {
      const userAddress = await signer.getAddress();

      // ✅ Μετατροπή σε BigNumber
      amountPerUser = ethers.BigNumber.from(amountPerUser);

      console.log("[send.js] amountPerUser (wei):", amountPerUser.toString());
      console.log("[send.js] recipients.length:", recipients.length);

      // ✅ Έλεγχος για μη έγκυρες διευθύνσεις
      const invalids = recipients.filter(addr => !ethers.utils.isAddress(addr) || addr === ethers.constants.AddressZero);
      if (invalids.length > 0) {
        uiModule.showError(`❌ Invalid address found: ${invalids[0]}`);
        return;
      }

      const token = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, signer);
      const userBalance = await token.balanceOf(userAddress);
      const totalRequired = amountPerUser.mul(recipients.length);

      console.log("[send.js] totalRequired (wei):", totalRequired.toString());
      console.log("[send.js] userBalance (wei):", userBalance.toString());

      if (userBalance.lt(totalRequired)) {
        const userFormatted = ethers.utils.formatUnits(userBalance);
        const requiredFormatted = ethers.utils.formatUnits(totalRequired);
        uiModule.showError(`❌ Insufficient balance: You need ${requiredFormatted} ${symbol}, but only have ${userFormatted}`);
        return;
      }

      // ✅ Approve του χρήστη για το token
      uiModule.addLog(`🔄 Approving ${symbol} for ${recipients.length} recipients...`);
      const approveTx = await token.approve(CONFIG.AIRDROP_CONTRACT_PROXY, totalRequired);
      uiModule.addLog(`⛽ Approve TX sent: ${approveTx.hash}`);
      await approveTx.wait();
      uiModule.addLog(`✅ Approved ${symbol} successfully.`);

      // ✅ Approve του LQX για fee
      const feeToken = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, CONFIG.ERC20_ABI, signer);
      let feeAmount;

      try {
        const airdropContract = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);
        feeAmount = await airdropContract.requiredFee();
      } catch (e) {
        console.warn("[send.js] ⚠️ requiredFee() not available, using fallback.");
        feeAmount = ethers.utils.parseUnits("500", 18); // fallback: 500 LQX
      }

      console.log("[send.js] requiredFee (wei):", feeAmount.toString());

      uiModule.addLog(`🔐 Approving ${ethers.utils.formatUnits(feeAmount)} LQX as fee...`);
      const approveFeeTx = await feeToken.approve(CONFIG.AIRDROP_CONTRACT_PROXY, feeAmount);
      uiModule.addLog(`⛽ Fee Approve TX sent: ${approveFeeTx.hash}`);
      await approveFeeTx.wait();
      uiModule.addLog(`✅ LQX Fee approved.`);

      // ✅ Εκτέλεση του airdrop
      const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);
      uiModule.addLog(`🚀 Sending airdrop of ${ethers.utils.formatUnits(amountPerUser)} ${symbol} to ${recipients.length} users...`);

      const tx = await airdrop.batchTransferSameAmount(tokenAddress, recipients, amountPerUser);
      uiModule.addLog(`⛽ Airdrop TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.addLog(`✅ Airdrop completed.`);

      // ✅ Έλεγχος για αποτυχημένες διευθύνσεις
      try {
        const failed = await airdrop.getFailedRecipients(tokenAddress, userAddress);
        if (failed.length > 0) {
          uiModule.addLog(`⚠️ ${failed.length} failed recipients. Retry or recover available.`);

          // enable download
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

          // enable buttons
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

  return {
    sendAirdrop
  };
})();
