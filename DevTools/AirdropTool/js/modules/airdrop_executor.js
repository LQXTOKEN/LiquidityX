// js/modules/airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop(selectedToken, tokenAmountPerUser, resultsSelector = "#results") {
    console.log("[airdropExecutor] Starting airdrop process...");

    // 🧱 Validate token
    if (!selectedToken || !selectedToken.contract || !selectedToken.decimals) {
      alert("Invalid or missing token information. Please check your selection.");
      console.error("[airdropExecutor] Token info invalid:", selectedToken);
      return;
    }

    // 📦 Validate amount per user
    const amountPerUser = tokenAmountPerUser.trim();
    if (!amountPerUser || isNaN(amountPerUser) || parseFloat(amountPerUser) <= 0) {
      alert("Please enter a valid amount per recipient.");
      return;
    }

    // 📋 Parse address list
    const rawText = document.querySelector(resultsSelector)?.textContent || "";
    const recipients = rawText
      .split("\n")
      .map(line => line.trim())
      .filter(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));

    if (recipients.length === 0) {
      alert("No valid addresses found in the list.");
      return;
    }

    if (recipients.length > 1000) {
      alert("Cannot send to more than 1000 addresses per airdrop.");
      return;
    }

    console.log(`[airdropExecutor] Preparing to send ${amountPerUser} ${selectedToken.symbol} to ${recipients.length} addresses`);

    // 📡 Blockchain access
    const provider = walletModule.getProvider();
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    const erc20Contract = new ethers.Contract(
      selectedToken.address,
      CONFIG.ERC20_ABI,
      signer
    );

    const airdropContract = new ethers.Contract(
      CONFIG.AIRDROP_PROXY_ADDRESS,
      CONFIG.AIRDROP_ABI,
      signer
    );

    const decimals = selectedToken.decimals;
    const amountWei = ethers.utils.parseUnits(amountPerUser, decimals);
    const totalAmount = amountWei.mul(recipients.length);

    try {
      // ✅ Check & approve if needed
      const allowance = await erc20Contract.allowance(userAddress, CONFIG.AIRDROP_PROXY_ADDRESS);
      if (allowance.lt(totalAmount)) {
        console.log("[airdropExecutor] Not enough allowance. Sending approve transaction...");
        const approveTx = await erc20Contract.approve(CONFIG.AIRDROP_PROXY_ADDRESS, totalAmount);
        await approveTx.wait();
        console.log("[airdropExecutor] Approve transaction confirmed.");
      } else {
        console.log("[airdropExecutor] Existing allowance sufficient. Skipping approve.");
      }

      // 🚀 Send airdrop
      console.log("[airdropExecutor] Sending airdrop transaction...");
      const tx = await airdropContract.batchTransferSameAmount(
        selectedToken.address,
        recipients,
        amountWei
      );

      console.log("[airdropExecutor] Airdrop tx sent:", tx.hash);
      alert(`Airdrop sent! Tx Hash: ${tx.hash}`);

    } catch (err) {
      console.error("[airdropExecutor] Airdrop failed:", err);
      alert("Airdrop failed: " + (err?.message || "Unknown error"));
    }
  }

  return {
    executeAirdrop
  };
})();
