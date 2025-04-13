// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop(selectedToken, provider) {
    try {
      if (!selectedToken || !selectedToken.address || !selectedToken.decimals) {
        alert("Token not properly selected.");
        return;
      }

      const addressesRaw = document.getElementById("results").textContent.trim();
      const recipients = addressesRaw
        .split("\n")
        .map(addr => addr.trim())
        .filter(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));

      if (recipients.length === 0) {
        alert("No valid recipient addresses found.");
        return;
      }

      const amountPerUserRaw = document.getElementById("tokenAmountPerUser").value.trim();
      if (!amountPerUserRaw || isNaN(amountPerUserRaw) || parseFloat(amountPerUserRaw) <= 0) {
        alert("Invalid token amount per user.");
        return;
      }

      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      // Convert to correct units
      const amountPerUser = ethers.utils.parseUnits(amountPerUserRaw, selectedToken.decimals);
      const totalAmount = amountPerUser.mul(recipients.length);

      // Approve tokens to the airdrop contract
      const tokenContract = new ethers.Contract(
        selectedToken.address,
        CONFIG.ERC20_ABI,
        signer
      );

      const currentAllowance = await tokenContract.allowance(userAddress, CONFIG.AIRDROP_CONTRACT);
      if (currentAllowance.lt(totalAmount)) {
        const approveTx = await tokenContract.approve(CONFIG.AIRDROP_CONTRACT, totalAmount);
        await approveTx.wait();
        console.log("[airdropExecutor] Tokens approved");
      } else {
        console.log("[airdropExecutor] Sufficient allowance exists");
      }

      // Execute airdrop
      const airdropContract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT,
        CONFIG.AIRDROP_ABI,
        signer
      );

      const tx = await airdropContract.batchTransferSameAmount(
        selectedToken.address,
        recipients,
        amountPerUser
      );

      console.log("[airdropExecutor] Airdrop TX sent:", tx.hash);
      alert(`✅ Airdrop transaction sent! TX Hash: ${tx.hash}`);

    } catch (err) {
      console.error("[airdropExecutor] Error executing airdrop:", err);
      alert(`❌ Error during airdrop: ${err.message}`);
    }
  }

  return {
    executeAirdrop
  };
})();
