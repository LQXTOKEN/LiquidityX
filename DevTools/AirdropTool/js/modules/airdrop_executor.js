// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop({ token, amountPerUser, addresses }) {
    console.log("[airdropExecutor] Starting airdrop process...");

    if (!token || !token.address || !token.contract || !Array.isArray(addresses) || addresses.length === 0) {
      console.error("[airdropExecutor] Token info invalid:", { token, amountPerUser, addresses });
      alert("Missing token information or no recipients.");
      return;
    }

    const provider = walletModule.getProvider();
    const userAddress = walletModule.getUserAddress();

    if (!provider || !userAddress) {
      alert("Wallet not connected.");
      return;
    }

    const signer = provider.getSigner(userAddress);

    const airdropContract = new ethers.Contract(
      CONFIG.AIRDROP_CONTRACT_PROXY,
      CONFIG.AIRDROP_ABI,
      signer
    );

    const tokenContract = new ethers.Contract(
      token.address,
      CONFIG.ERC20_ABI,
      signer
    );

    try {
      const decimals = token.decimals;
      const amount = ethers.utils.parseUnits(amountPerUser.trim(), decimals);
      const totalAmount = amount.mul(addresses.length);

      console.log(`[airdropExecutor] Approving ${totalAmount.toString()} tokens for airdrop...`);

      const approveTx = await tokenContract.approve(CONFIG.AIRDROP_CONTRACT_PROXY, totalAmount);
      console.log("[airdropExecutor] Approve TX sent:", approveTx.hash);
      await approveTx.wait();
      console.log("[airdropExecutor] Approve TX confirmed.");

      console.log("[airdropExecutor] Sending batchTransferSameAmount...");
      const airdropTx = await airdropContract.batchTransferSameAmount(token.address, addresses, amount);
      console.log("[airdropExecutor] Airdrop TX sent:", airdropTx.hash);

      await airdropTx.wait();
      console.log("[airdropExecutor] Airdrop completed!");

      alert("✅ Airdrop completed successfully!");
    } catch (err) {
      console.error("[airdropExecutor] Error during airdrop:", err);
      alert("❌ Airdrop failed: " + (err.message || "Unknown error"));
    }
  }

  return {
    executeAirdrop
  };
})();
