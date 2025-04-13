window.airdropExecutor = (function () {
  const { ethers } = window;

  async function executeAirdrop({ token, amountPerUser, addresses }) {
    console.log("[airdropExecutor] Starting airdrop process...");

    if (!token || !amountPerUser || !addresses || !Array.isArray(addresses)) {
      console.error("[airdropExecutor] Token info invalid:", { token, amountPerUser, addresses });
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const amountBN = ethers.utils.parseUnits(amountPerUser.trim(), token.decimals);
      const totalAmount = amountBN.mul(addresses.length);

      console.log(`[airdropExecutor] Approving ${ethers.utils.formatUnits(totalAmount, token.decimals)} tokens...`);

      const approveTx = await token.contract.connect(signer).approve(
        CONFIG.AIRDROP_CONTRACT_ADDRESS,
        totalAmount
      );
      await approveTx.wait();

      const airdropContract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_ADDRESS,
        CONFIG.AIRDROP_ABI,
        signer
      );

      console.log("[airdropExecutor] Executing batchTransferSameAmount...");
      const tx = await airdropContract.batchTransferSameAmount(
        token.address,
        addresses,
        amountBN
      );

      console.log("[airdropExecutor] Transaction submitted:", tx.hash);
      await tx.wait();
      console.log("[airdropExecutor] ✅ Airdrop successful");
    } catch (err) {
      console.error("[airdropExecutor] ❌ Airdrop failed:", err);
    }
  }

  return {
    executeAirdrop
  };
})();
