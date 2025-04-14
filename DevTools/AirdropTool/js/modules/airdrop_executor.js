// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop({ token, amountPerUser, addresses }) {
    console.log("[airdropExecutor] Starting airdrop process...");

    if (!token || !token.contract || !token.address || !token.symbol || !token.decimals) {
      console.error("[airdropExecutor] Token info invalid:", { token, amountPerUser, addresses });
      return;
    }

    if (!amountPerUser || isNaN(amountPerUser) || addresses.length === 0) {
      console.error("[airdropExecutor] Missing amount or addresses");
      return;
    }

    const signer = walletModule.getProvider().getSigner();
    const contractWithSigner = token.contract.connect(signer);
    const recipientCount = addresses.length;
    const totalAmount = ethers.utils.parseUnits(amountPerUser, token.decimals).mul(recipientCount);

    try {
      console.log(`[airdropExecutor] Approving ${recipientCount} addresses with total amount:`, totalAmount.toString());

      const approveTx = await contractWithSigner.approve(
        CONFIG.AIRDROP_CONTRACT_ADDRESS,
        totalAmount
      );
      await approveTx.wait();
      console.log("[airdropExecutor] ✅ Approval complete");

      const airdropContract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_ADDRESS,
        window.AIRDROP_ABI,
        signer
      );

      const tx = await airdropContract.batchTransferSameAmount(
        token.address,
        addresses,
        ethers.utils.parseUnits(amountPerUser, token.decimals)
      );
      console.log("[airdropExecutor] ⏳ Sending airdrop...");
      await tx.wait();

      console.log("[airdropExecutor] ✅ Airdrop successful!");
      alert("✅ Airdrop completed successfully!");
    } catch (error) {
      console.error("[airdropExecutor] ❌ Airdrop failed:", error);
      alert("❌ Airdrop failed. See console for details.");
    }
  }

  return {
    executeAirdrop
  };
})();
