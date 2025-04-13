// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop(token, amountPerUser, addresses) {
    console.log("[airdropExecutor] Starting airdrop process...");

    if (!token || !token.address || !token.decimals || !token.contract) {
      console.error("[airdropExecutor] Token info invalid:", { token, amountPerUser, addresses });
      alert("Token not selected or invalid.");
      return;
    }

    if (!CONFIG.ERC20_ABI || !CONFIG.AIRDROP_ABI) {
      console.error("[airdropExecutor] ABIs not loaded");
      alert("Internal error: ABI not loaded. Please refresh.");
      return;
    }

    const provider = walletModule.getProvider();
    const signer = provider.getSigner();
    const userAddress = walletModule.getUserAddress();

    if (!provider || !signer || !userAddress) {
      alert("Please connect your wallet.");
      return;
    }

    const tokenAmount = ethers.utils.parseUnits(amountPerUser.trim(), token.decimals);
    const totalAmount = tokenAmount.mul(addresses.length);

    try {
      const tokenContract = new ethers.Contract(token.address, CONFIG.ERC20_ABI, signer);

      // Approve tokens
      console.log(`[airdropExecutor] Approving ${totalAmount.toString()} tokens...`);
      const approveTx = await tokenContract.approve(CONFIG.AIRDROP_CONTRACT_ADDRESS, totalAmount);
      await approveTx.wait();
      console.log("[airdropExecutor] ✅ Approve successful:", approveTx.hash);

      // Call batchTransfer
      const airdropContract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_ADDRESS,
        CONFIG.AIRDROP_ABI,
        signer
      );

      console.log(`[airdropExecutor] Executing batchTransferSameAmount to ${addresses.length} addresses...`);
      const tx = await airdropContract.batchTransferSameAmount(
        token.address,
        addresses,
        tokenAmount
      );
      await tx.wait();

      console.log("[airdropExecutor] ✅ Airdrop successful:", tx.hash);
      alert("✅ Airdrop completed successfully!");

    } catch (err) {
      console.error("[airdropExecutor] ❌ Airdrop failed:", err);
      alert("❌ Airdrop failed. Check console for details.");
    }
  }

  return {
    executeAirdrop
  };
})();
