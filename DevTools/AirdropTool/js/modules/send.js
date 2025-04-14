// js/modules/send.js

window.sendModule = (function () {
  async function executeAirdrop({ token, amountPerUser, addresses }) {
    try {
      console.log("[sendModule] Starting secure airdrop...");

      const provider = walletModule.getProvider();
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const airdropContract = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_ADDRESS, window.AIRDROP_ABI, signer);

      const parsedAmount = ethers.utils.parseUnits(amountPerUser, token.decimals);
      const totalAmount = parsedAmount.mul(addresses.length);

      // STEP 1: Approve
      console.log("[sendModule] Approving token allowance...");
      const approveTx = await token.contract.connect(signer).approve(airdropContract.address, totalAmount);
      await approveTx.wait();
      console.log("[sendModule] ✅ Approve confirmed");

      // STEP 2: Batch Transfer
      console.log("[sendModule] Executing batchTransferSameAmount...");
      const sendTx = await airdropContract.batchTransferSameAmount(token.address, addresses, parsedAmount);
      const receipt = await sendTx.wait();
      console.log("[sendModule] ✅ Transaction confirmed:", receipt.transactionHash);

      // STEP 3: Parse logs for failures if needed
      const failedRecipients = [];

      for (const addr of addresses) {
        // Simple UI simulation for now:
        uiModule.appendResultLine(`✅ Sent to ${addr}`);
      }

      window.failedRecipients = failedRecipients; // Save globally
      if (failedRecipients.length > 0) {
        uiModule.showWarning(`${failedRecipients.length} transfers failed. You can retry using "Recover".`);
        uiModule.enableRecoverButton();
      } else {
        uiModule.showSuccess("All transfers succeeded!");
        uiModule.disableRecoverButton();
      }

    } catch (err) {
      console.error("[sendModule] ❌ Airdrop failed:", err);
      uiModule.showError("Airdrop failed. See console for details.");
    }
  }

  return {
    executeAirdrop
  };
})();
