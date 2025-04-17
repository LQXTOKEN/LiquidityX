// app.js
//
// 📦 Περιγραφή: Entry-point αρχείο για smart contract interactions του εργαλείου LiquidityX Airdrop Tool.
// Περιλαμβάνει:
// - Trigger για φόρτωση τελευταίου airdrop όταν γίνει wallet connect (μέσω fetch από το backend)

window.addEventListener("load", () => {
  // Περιμένουμε σύνδεση wallet
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        handleWalletConnected(accounts[0]);
      }
    });
  }

  // Αν έχει ήδη wallet συνδεδεμένο κατά το load
  if (window.ethereum && window.ethereum.selectedAddress) {
    handleWalletConnected(window.ethereum.selectedAddress);
  }
});

function handleWalletConnected(walletAddress) {
  if (!walletAddress) return;

  // ✅ Φόρτωση τελευταίου airdrop από backend
  if (window.lastAirdropModule && typeof lastAirdropModule.fetchLastAirdrop === "function") {
    lastAirdropModule.fetchLastAirdrop(walletAddress);
  }
}
