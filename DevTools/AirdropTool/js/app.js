// app.js
//
// 📦 Περιγραφή: Entry point για όλα τα smart contract interactions του LiquidityX Airdrop Tool.
// Περιλαμβάνει:
// - handleWalletConnected: φορτώνει last airdrop summary
// - appSend: εκτελεί batchTransferSameAmount (delegate από send.js)
// - appRetry: εκτελεί retryFailed (delegate από send.js)

window.addEventListener("load", () => {
  // Αν υπάρχει ήδη συνδεδεμένο wallet κατά το load
  if (window.ethereum && window.ethereum.selectedAddress) {
    handleWalletConnected(window.ethereum.selectedAddress);
  }

  // Trigger σε αλλαγή λογαριασμού
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        handleWalletConnected(accounts[0]);
      }
    });
  }
});

// ✅ Συνάρτηση που καλείται από wallet_module.js όταν γίνει connect
window.handleWalletConnected = function (walletAddress) {
  if (!walletAddress) return;

  if (window.lastAirdropModule && typeof lastAirdropModule.fetchLastAirdrop === "function") {
    lastAirdropModule.fetchLastAirdrop(walletAddress);
  }
};

// ✅ Εκτέλεση Airdrop (χρησιμοποιείται από send.js)
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

// ✅ Retry αποτυχημένων αποδεκτών (χρησιμοποιείται από send.js)
window.appRetry = async function ({ signer, tokenAddress }) {
  try {
    uiModule.logMessage("🔁 Retrying failed recipients...");
    const airdrop = new ethers.Contract(CONFIG.AIRDROP_CONTRACT_PROXY, CONFIG.BATCH_AIRDROP_ABI, signer);
    const tx = await airdrop.retryFailed(tokenAddress);
    uiModule.logMessage(`⛽ Retry TX sent: ${tx.hash}`);
    await tx.wait();
    uiModule.logMessage("✅ Retry completed.");
  } catch (err) {
    console.error("[appRetry] ❌", err);
    uiModule.logMessage("❌ Retry failed: " + (err.message || "Unknown error"), "error");
    throw err;
  }
};
