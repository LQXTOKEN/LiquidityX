// app.js
//
// 📦 Περιγραφή: Entry point για smart contract interactions του LiquidityX Airdrop Tool.
// Περιλαμβάνει:
// - Συνάρτηση `appSend` για εκτέλεση batchTransferSameAmount (delegate από send.js)
// - Συνάρτηση `handleWalletConnected` για φόρτωση τελευταίου airdrop info

window.addEventListener("load", () => {
  // Αν έχει ήδη wallet συνδεδεμένο κατά το load
  if (window.ethereum && window.ethereum.selectedAddress) {
    handleWalletConnected(window.ethereum.selectedAddress);
  }

  // Trigger σε αλλαγή account
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        handleWalletConnected(accounts[0]);
      }
    });
  }
});

// ✅ Καταχωρείται global ώστε να μπορεί να καλείται από wallet_module.js
window.handleWalletConnected = function (walletAddress) {
  if (!walletAddress) return;

  if (window.lastAirdropModule && typeof lastAirdropModule.fetchLastAirdrop === "function") {
    lastAirdropModule.fetchLastAirdrop(walletAddress);
  }
};

// ✅ Εκτέλεση Airdrop — καλείται από send.js
window.appSend = async function ({ signer, tokenAddress, recipients, amountPerUser }) {
  try {
    const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);

    uiModule.logMessage(`🚀 Sending airdrop to ${recipients.length} recipients...`);
    const tx = await airdrop.batchTransferSameAmount(tokenAddress, recipients, amountPerUser);
    uiModule.logMessage(`⛽ Airdrop TX sent: ${tx.hash}`);

    await tx.wait();
    uiModule.logMessage(`✅ Airdrop completed successfully.`);
  } catch (err) {
    console.error("[appSend] ❌", err);
    uiModule.logMessage("❌ Airdrop failed: " + (err.reason || err.message || "Unknown error"), "error");
    throw err;
  }
};
