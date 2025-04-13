// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop(selectedToken, recipients, amountPerUser, signer) {
    try {
      if (!selectedToken || !recipients || recipients.length === 0 || !signer) {
        console.error("[airdropExecutor] Missing required inputs");
        alert("Missing token, recipients, or signer");
        return;
      }

      const totalAmount = BigInt(amountPerUser) * BigInt(recipients.length);
      const contractAddress = CONFIG.AIRDROP_CONTRACT_ADDRESS;
      const contractAbi = CONFIG.AIRDROP_ABI;

      console.log("[airdropExecutor] Preparing to airdrop", {
        token: selectedToken.address,
        recipients: recipients.length,
        amountPerUser,
        totalAmount: totalAmount.toString(),
      });

      const tokenContract = new ethers.Contract(
        selectedToken.address,
        CONFIG.ERC20_ABI,
        signer
      );

      const airdropContract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      // Step 1: Approve
      const allowance = await tokenContract.allowance(await signer.getAddress(), contractAddress);
      if (allowance.lt(totalAmount)) {
        console.log("[airdropExecutor] Approving", totalAmount.toString());
        const approveTx = await tokenContract.approve(contractAddress, totalAmount);
        await approveTx.wait();
        console.log("[airdropExecutor] Approval complete");
      } else {
        console.log("[airdropExecutor] Sufficient allowance exists, skipping approval");
      }

      // Step 2: Call batchTransferSameAmount
      console.log("[airdropExecutor] Calling batchTransferSameAmount");
      const tx = await airdropContract.batchTransferSameAmount(
        selectedToken.address,
        recipients,
        amountPerUser
      );
      const receipt = await tx.wait();

      console.log("[airdropExecutor] Airdrop transaction complete", receipt.transactionHash);
      alert("Airdrop sent successfully!");

    } catch (err) {
      console.error("[airdropExecutor] Airdrop failed:", err);
      alert("Airdrop failed. See console for details.");
    }
  }

  return {
    executeAirdrop
  };
})();
