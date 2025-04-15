console.log("[send.js] Loaded");

async function sendAirdrop(token, recipients, amountPerUserWei) {
  try {
    console.log("[send.js] amountPerUser (wei):", amountPerUserWei.toString());
    console.log("[send.js] recipients.length:", recipients.length);

    const totalRequired = amountPerUserWei.mul(recipients.length);
    console.log("[send.js] totalRequired (wei):", totalRequired.toString());

    const signer = window.provider.getSigner();
    const airdrop = window.contracts.airdrop;
    const lqx = window.contracts.lqx;

    // 1. Approve token (user token)
    uiModule.logInfo(`🔄 Approving ${token.symbol} for ${recipients.length} recipients...`);
    const approveTx = await token.contract.connect(signer).approve(airdrop.address, totalRequired);
    uiModule.logInfo(`⛽ Approve TX sent: ${approveTx.hash}`);
    await approveTx.wait();
    uiModule.logInfo(`✅ Approved successfully.`);

    // 2. Approve LQX fee
    uiModule.logInfo(`🔐 Approving ${window.CONFIG.FEE_LQX_AMOUNT / 1e18} LQX as fee...`);
    const feeApproveTx = await lqx.contract.connect(signer).approve(airdrop.address, window.CONFIG.FEE_LQX_AMOUNT);
    uiModule.logInfo(`⛽ Fee Approve TX sent: ${feeApproveTx.hash}`);
    await feeApproveTx.wait();
    uiModule.logInfo(`✅ LQX Fee approved.`);

    // 3. Send airdrop
    uiModule.logInfo(`🚀 Sending airdrop to ${recipients.length} recipients...`);
    const tx = await airdrop.connect(signer).batchTransferSameAmount(
      token.contract.address,
      recipients,
      amountPerUserWei
    );
    uiModule.logInfo(`⛽ Airdrop TX sent: ${tx.hash}`);
    await tx.wait();
    uiModule.logInfo(`✅ Airdrop completed.`);

    // 4. Try to fetch failed recipients (optional logging)
    if (typeof airdrop.getFailedRecipients === "function") {
      try {
        const failed = await airdrop.getFailedRecipients();
        if (failed.length > 0) {
          uiModule.logWarn(`⚠️ ${failed.length} failed transfers. Exporting list...`);
          downloadFailedRecipients(failed);
        } else {
          uiModule.logSuccess("🎉 No failed recipients.");
        }
      } catch (err) {
        console.warn("[getFailedRecipients] Error:", err);
        uiModule.logWarn("ℹ️ Could not verify failed recipients.");
      }
    }

  } catch (error) {
    console.error("[sendAirdrop] ❌ Error:", error);
    uiModule.logError(`❌ Airdrop failed: ${error.message}`);
  }
}

// Optional helper for failed recipient download
function downloadFailedRecipients(addresses) {
  const blob = new Blob([addresses.join("\n")], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "failed_recipients.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
