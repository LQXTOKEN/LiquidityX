// js/modules/airdrop_executor.js
window.airdropExecutor = (function () {
  return {
    async executeAirdrop({ token, amountPerUser, addresses }) {
      console.log("[airdropExecutor] Starting airdrop process...");

      if (!token || !token.contract || !amountPerUser || !addresses || addresses.length === 0) {
        console.error("[airdropExecutor] Token info invalid:", { token, amountPerUser, addresses });
        alert("Missing or invalid input for airdrop.");
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const decimals = token.decimals || 18;
        const amountBN = ethers.utils.parseUnits(amountPerUser, decimals);
        const totalAmountBN = amountBN.mul(addresses.length);

        const contractWithSigner = token.contract.connect(signer);

        console.log(`[airdropExecutor] Approving ${ethers.utils.formatUnits(totalAmountBN, decimals)} tokens...`);
        const approveTx = await contractWithSigner.approve(CONFIG.AIRDROP_CONTRACT_ADDRESS, totalAmountBN);
        await approveTx.wait();

        const airdropContract = new ethers.Contract(
          CONFIG.AIRDROP_CONTRACT_ADDRESS,
          CONFIG.AIRDROP_ABI,
          signer
        );

        console.log("[airdropExecutor] Sending airdrop...");
        const tx = await airdropContract.batchTransferSameAmount(
          token.address,
          addresses,
          amountBN
        );
        await tx.wait();

        alert("✅ Airdrop completed successfully!");
        console.log("[airdropExecutor] Airdrop transaction hash:", tx.hash);
      } catch (err) {
        console.error("[airdropExecutor] ❌ Airdrop failed:", err);
        alert("Airdrop failed. Please check the console for details.");
      }
    }
  };
})();
