// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop(selectedToken, provider, amountPerUser) {
    console.log("[airdrop_executor] Starting airdrop execution...");

    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    const recipientListRaw = document.getElementById("results").textContent.trim();

    if (!recipientListRaw) {
      alert("Address list is empty.");
      return;
    }

    const recipients = recipientListRaw.split("\n").map(addr => addr.trim()).filter(addr => addr);
    console.log("[airdrop_executor] Recipients count:", recipients.length);

    if (recipients.length === 0 || recipients.length > 1000) {
      alert("Recipient list must contain between 1 and 1000 addresses.");
      return;
    }

    if (!selectedToken?.contract || !selectedToken.decimals) {
      alert("Token contract not properly selected.");
      return;
    }

    const amountRaw = ethers.utils.parseUnits(amountPerUser, selectedToken.decimals);
    const totalAmount = amountRaw.mul(recipients.length);
    console.log("[airdrop_executor] Amount per user:", amountRaw.toString());
    console.log("[airdrop_executor] Total amount to approve and send:", totalAmount.toString());

    // Approve the airdrop contract to spend tokens
    const erc20 = new ethers.Contract(selectedToken.address, CONFIG.ERC20_ABI, signer);
    const allowance = await erc20.allowance(userAddress, CONFIG.AIRDROP_PROXY_ADDRESS);

    if (allowance.lt(totalAmount)) {
      console.log("[airdrop_executor] Approving contract for total amount...");
      const approveTx = await erc20.approve(CONFIG.AIRDROP_PROXY_ADDRESS, totalAmount);
      await approveTx.wait();
      console.log("[airdrop_executor] Approval successful");
    } else {
      console.log("[airdrop_executor] Sufficient allowance already exists");
    }

    // Execute the airdrop
    const airdropContract = new ethers.Contract(CONFIG.AIRDROP_PROXY_ADDRESS, CONFIG.AIRDROP_ABI, signer);

    try {
      const tx = await airdropContract.batchTransferSameAmount(
        selectedToken.address,
        recipients,
        amountRaw
      );

      console.log("[airdrop_executor] Airdrop transaction sent:", tx.hash);
      alert("Airdrop transaction sent! Tx hash: " + tx.hash);
    } catch (err) {
      console.error("[airdrop_executor] Airdrop failed:", err);
      alert("Airdrop failed: " + err.message);
    }
  }

  return {
    executeAirdrop
  };
})();
