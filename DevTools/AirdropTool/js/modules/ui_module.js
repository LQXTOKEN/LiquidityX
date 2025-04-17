// 📄 js/modules/ui_module.js
// Περιλαμβάνει: ενημέρωση UI, logs, recovery results, balance, κλπ.

window.uiModule = (function () {
  // ✅ Ενημέρωση UI με διεύθυνση wallet
  function updateWalletUI(address) {
    const walletAddressEl = document.getElementById("walletAddress");
    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");

    if (walletAddressEl) walletAddressEl.textContent = `Wallet: ${address}`;
    if (connectBtn) connectBtn.style.display = "none";
    if (disconnectBtn) disconnectBtn.style.display = "inline-block";
  }

  // ✅ Επαναφορά UI μετά από αποσύνδεση
  function resetUI() {
    const walletAddressEl = document.getElementById("walletAddress");
    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const lqxBalanceEl = document.getElementById("lqxBalance");

    if (walletAddressEl) walletAddressEl.textContent = "";
    if (connectBtn) connectBtn.style.display = "inline-block";
    if (disconnectBtn) disconnectBtn.style.display = "none";
    if (lqxBalanceEl) lqxBalanceEl.textContent = "";
  }

  // ✅ Ενημέρωση υπολοίπου LQX
  function updateLQXBalance({ formatted, symbol }) {
    const lqxBalanceEl = document.getElementById("lqxBalance");
    if (lqxBalanceEl) lqxBalanceEl.textContent = `Balance: ${formatted} ${symbol}`;
  }

  // ✅ Εμφάνιση σφαλμάτων
  function showError(msg) {
    alert(msg);
  }

  // ✅ Εμφάνιση logs σε real-time
  function log(message) {
    const output = document.getElementById("logOutput");
    if (!output) return;

    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.textContent = `[${timestamp}] ${message}`;
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight;
  }

  // ✅ Καθαρισμός logs
  function clearLogs() {
    const output = document.getElementById("logOutput");
    if (output) output.innerHTML = "";
  }

  // ✅ Ενημέρωση recovery αποτελεσμάτων
  function updateRecoveryResults(text) {
    const container = document.getElementById("recoveryResults");
    if (container) container.textContent = text;
  }

  // ✅ Ενημέρωση των τελευταίων airdrops (placeholder προς αντικατάσταση με fetch)
  function updateLastAirdrops() {
    console.warn("[uiModule] Placeholder: updateLastAirdrops");
  }

  // ✅ Εμφάνιση διευθύνσεων
  function displayAddresses(addresses) {
    const resultBox = document.getElementById("results");
    if (!resultBox) return;
    resultBox.textContent = addresses.join("\n");
  }

  // ✅ Καθαρισμός διευθύνσεων
  function clearResults() {
    const resultBox = document.getElementById("results");
    if (resultBox) resultBox.textContent = "";
  }

  // ✅ Εναλλαγή μεταξύ modes (paste/create/random)
  function showModeSection(mode) {
    const sections = ["pasteSection", "createSection", "randomSection"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = id.includes(mode) ? "block" : "none";
    });
  }

  return {
    updateWalletUI,
    resetUI,
    updateLQXBalance,
    showError,
    log,
    clearLogs,
    updateRecoveryResults,
    updateLastAirdrops,
    displayAddresses,
    clearResults,
    showModeSection
  };
})();
