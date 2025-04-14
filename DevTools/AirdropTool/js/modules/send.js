// js/modules/send.js

window.sendModule = (function () {
  async function executeAirdrop({ token, amountPerUser, addresses }) {
    try {
      console.log("[sendModule] Starting secure airdrop...");

      const provider = walletModule.getProvider();
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_ADDRESS, window.AIRDROP_ABI, signer);
      const totalAmount = ethers.utils.parseUnits(amountPerUser, token.decimals).mul(addresses.length);

      // Step 1: Approve the airdrop contract to spend user's tokens
      console.log("[sendModule] Approving token allowance...");
      const approveTx = await token.contract.connect(signer).approve(contract.address, totalAmount);
      await approveTx.wait();
      console.log("[sendModule] ✅ Approve confirmed");

      // Step 2: Execute the batch transfer
      console.log("[sendModule] Executing batch transfer...");
      const sendTx = await contract.batchTransferSameAmount(token.address, addresses, ethers.utils.parseUnits(amountPerUser, token.decimals));
      const receipt = await sendTx.wait();
      console.log("[sendModule] ✅ Airdrop transaction confirmed:", receipt.transactionHash);

      // Step 3: Inform the UI (can be expanded later)
      uiModule.showSuccess("Airdrop sent successfully!");
    } catch (error) {
      console.error("[sendModule] ❌ Airdrop failed:", error);
      uiModule.showError("Airdrop failed. Check console for details.");
    }
  }

  return {
    executeAirdrop
  };
})();
