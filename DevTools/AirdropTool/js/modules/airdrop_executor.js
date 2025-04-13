window.airdropExecutor = (function () {
  const { ethers } = window;

  return {
    async executeAirdrop({ token, amountPerUser, addresses }) {
      console.log("[airdropExecutor] Starting airdrop process...");

      if (!token || !token.contract || !token.address || !token.decimals) {
        console.error("[airdropExecutor] Token info invalid:", { token, amountPerUser, addresses });
        return;
      }

      if (!Array.isArray(addresses) || addresses.length === 0) {
        console.error("[airdropExecutor] No recipient addresses provided.");
        return;
      }

      if (!amountPerUser || isNaN(amountPerUser)) {
        console.error("[airdropExecutor] Invalid amount per user:", amountPerUser);
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Υπολογισμός ποσού με βάση decimals
        const amountPerUserFormatted = ethers.utils.parseUnits(amountPerUser.toString(), token.decimals);
        const totalAmount = amountPerUserFormatted.mul(addresses.length);

        console.log(`[airdropExecutor] Approving ${ethers.utils.formatUnits(totalAmount, token.decimals)} tokens...`);

        // Approve tokens στο Airdrop Contract
        const approveTx = await token.contract.connect(signer).approve(
          CONFIG.AIRDROP_CONTRACT_ADDRESS,
          totalAmount
        );
        await approveTx.wait();
        console.log("[airdropExecutor] ✅ Approval transaction confirmed");

        // Δημιουργία instance του Airdrop Contract
        const airdropContract = new ethers.Contract(
          CONFIG.AIRDROP_CONTRACT_ADDRESS,
          CONFIG.AIRDROP_ABI,
          signer
        );

        // Κλήση batchTransferSameAmount
        console.log(`[airdropExecutor] Sending airdrop to ${addresses.length} recipients...`);
        const tx = await airdropContract.batchTransferSameAmount(
          token.address,
          addresses,
          amountPerUserFormatted
        );
        await tx.wait();
        console.log("[airdropExecutor] ✅ Airdrop transaction confirmed");
        alert("✅ Airdrop completed successfully!");

      } catch (err) {
        console.error("[airdropExecutor] ❌ Airdrop failed:", err);
        alert("❌ Airdrop failed. See console for details.");
      }
    }
  };
})();
