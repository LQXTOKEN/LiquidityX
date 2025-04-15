console.log('[recover.js] Loaded');

async function recoverFailedRecipients() {
  if (!window.airdrop || !window.token || !window.walletAddress) {
    console.log('[recover.js] Missing airdrop/token/wallet context');
    return;
  }

  const airdrop = window.airdrop;
  const token = window.token;
  const sender = window.walletAddress;

  try {
    // 🔄 Fetch failed recipients
    const failedRecipients = await airdrop.getFailedRecipients();
    console.log('[recover.js] Failed recipients:', failedRecipients);

    if (failedRecipients.length === 0) {
      alert('✅ No failed recipients to recover.');
      return;
    }

    const confirmRecovery = confirm(
      `There are ${failedRecipients.length} failed recipients.\nDo you want to retry sending ${window.lastAmountFormatted} tokens to each?`
    );

    if (!confirmRecovery) return;

    // 🚀 Resend transaction
    const tx = await airdrop.batchTransferSameAmount(
      token.contract.address,
      failedRecipients,
      window.lastAmount
    );

    console.log(`[recover.js] ⛽ TX sent: ${tx.hash}`);
    alert(`✅ Recovery sent. TX Hash:\n${tx.hash}`);
    await tx.wait();
    alert('✅ Recovery complete.');

  } catch (error) {
    console.error('[recover.js] ❌ Error during recovery:', error);
    alert('❌ Recovery failed.\nCheck console for details.');
  }
}
