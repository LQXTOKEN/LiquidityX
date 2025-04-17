// 📄 js/main.js
// ✅ Πλήρης main.js με:
// - ασφαλή σύνδεση wallet
// - σωστό disconnect/reset
// - αυτόματο reconnect αν είναι ήδη συνδεδεμένος
// - dynamic UI updates με βάση wallet state

document.addEventListener("DOMContentLoaded", async function () {
  const connectBtn = document.getElementById("connectWallet");
  const disconnectBtn = document.getElementById("disconnectWallet");

  let walletAlreadyConnecting = false;

  // 🔁 Auto-connect αν υπάρχει ενεργό session
  if (window.ethereum && window.ethereum.selectedAddress) {
    await tryConnectWallet();
  }

  // 👆 Click handler για σύνδεση
  connectBtn.addEventListener("click", async () => {
    if (walletAlreadyConnecting) return;
    await tryConnectWallet();
  });

  // 🔌 Disconnect button
  disconnectBtn.addEventListener("click", () => {
    walletModule.disconnectWallet();
    location.reload(); // ✅ καθαρισμός UI, state και memory
  });

  async function tryConnectWallet() {
    walletAlreadyConnecting = true;

    const wallet = await walletModule.connectWallet();

    if (!wallet) {
      walletAlreadyConnecting = false;
      return;
    }

    // ✅ Αν όλα πήγαν καλά, συνέχισε
    await window.handleWalletConnected();

    // 🔁 Εμφάνιση κουμπιού disconnect, απόκρυψη connect
    connectBtn.style.display = "none";
    disconnectBtn.style.display = "inline-block";
  }
});
