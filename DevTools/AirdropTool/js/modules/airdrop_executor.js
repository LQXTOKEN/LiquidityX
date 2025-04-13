window.airdropExecutor = (function () {
  return {
    async executeAirdrop({ token, amountPerUser, addresses }) {
      console.log("[airdropExecutor] Starting airdrop process...");

      // Check validity
      if (
        !token ||
        !token.contract ||
        !ethers.utils.isAddress(token.address) ||
        !amountPerUser ||
        !addresses ||
        !Array.isArray(addresses) ||
        addresses.length === 0
      ) {
        console.error("[airdropExecutor] Token info invalid:", {
          token,
          amountPerUser,
          addresses,
        });
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const parsedAmount = ethers.utils.parseUnits(amountPerUser.toString(), token.decimals);
        const totalAmount = parsedAmount.mul(addresses.length);
        console.log(`[airdropExecutor] Approving ${ethers.utils.formatUnits(totalAmount, token.decimals)} tokens...`);

        // Approve the airdrop contract to spend tokens
        const approveTx = await token.contract.connect(signer).approve(CONFIG.AIRDROP_CONTRACT_ADDRESS, totalAmount);
        await approveTx.wait();
        console.log("[airdropExecutor] ✅ Approval confirmed");

        // Create instance of airdrop contract
        const airdropContract = new ethers.Contract(
          CONFIG.AIRDROP_CONTRACT_ADDRESS,
          CONFIG.AIRDROP_ABI,
          signer
        );

        console.log("[airdropExecutor] Sending airdrop transaction...");
        const tx = await airdropContract.batchTransferSameAmount(token.address, addresses, parsedAmount);
        console.log("[airdropExecutor] ⏳ Transaction sent. Waiting for confirmation...");
        await tx.wait();
        console.log("[airdropExecutor] ✅ Airdrop complete! Transaction hash:", tx.hash);
      } catch (err) {
        console.error("[airdropExecutor] ❌ Airdrop failed:", err);
      }
    },
  };
})();
