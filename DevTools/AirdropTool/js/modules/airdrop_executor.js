// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  const BATCH_AIRDROP_PROXY_ADDRESS = "0x2012508a1dbE6BE9c1B666eBD86431b326ef6EF6"; // Proxy smart contract
  const ABI = [
    "function batchTransferSameAmount(address[] calldata recipients, uint256 amountPerUser) external"
  ];

  async function executeAirdrop(recipients, amount, tokenInfo, provider, sender) {
    try {
      console.log("[airdropExecutor] Preparing airdrop with", recipients.length, "recipients");

      const signer = provider.getSigner();
      const contract = new ethers.Contract(BATCH_AIRDROP_PROXY_ADDRESS, ABI, signer);

      const decimals = tokenInfo.decimals;
      const amountInWei = ethers.utils.parseUnits(amount, decimals);

      const tx = await contract.batchTransferSameAmount(recipients, amountInWei);
      console.log("[airdropExecutor] Transaction sent:", tx.hash);

      await tx.wait();
      console.log("[airdropExecutor] Transaction confirmed!");

      return {
        success: true,
        message: "✅ Airdrop successful!",
        txHash: tx.hash
      };
    } catch (err) {
      console.error("[airdropExecutor] Airdrop failed:", err);
      return {
        success: false,
        message: "❌ Airdrop failed: " + (err.message || "Unknown error")
      };
    }
  }

  return {
    executeAirdrop
  };
})();
