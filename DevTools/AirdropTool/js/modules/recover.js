// js/modules/recover.js

async function recoverFailedTransfers() {
  try {
    const signer = await window.provider.getSigner();
    const airdrop = new ethers.Contract(CONFIG.airdropContract, window.AIRDROP_ABI, signer);

    console.log("[recover.js] 🔄 Calling recoverFailedTransfer()...");

    const tx = await airdrop.recoverFailedTransfer();
    console.log(`[recover.js] ⛽ TX sent: ${tx.hash}`);
    ui.log("⛽ Recovery TX sent: " + tx.hash);

    const receipt = await tx.wait();
    console.log(`[recover.js] ✅ Recovery TX confirmed: ${receipt.transactionHash}`);
    ui.log("✅ Recovery completed: " + receipt.transactionHash);
  } catch (err) {
    console.error("[recover.js] ❌ Error during recovery:", err);
    ui.log("❌ Recovery failed: " + (err.message || err));
  }
}
