// js/modules/last_airdrop_module.js
//
// ✅ Module που εμφανίζει την πιο πρόσφατη εγγραφή airdrop για τον χρήστη.

window.lastAirdropModule = (function () {
  async function fetchLastAirdrop(address) {
    const url = `${CONFIG.PROXY_API_URL.replace("/api/polygon", "")}/api/last-airdrops?address=${address}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Airdrop not found");

      const data = await res.json();
      renderLastAirdrop(data);
    } catch (err) {
      console.warn("[lastAirdropModule] No previous airdrop found or error fetching.");
      hideLastAirdrop();
    }
  }

  function renderLastAirdrop(data) {
    const container = document.getElementById("lastAirdropCard");
    if (!container) return;

    const date = new Date(data.timestamp);
    const formatted = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    container.innerHTML = `
      <h2>📦 Last Airdrop Summary</h2>
      <p><strong>Token:</strong> ${data.symbol || "Unknown"} (${shortenAddress(data.token)})</p>
      <p><strong>Recipients:</strong> ${data.count}</p>
      <p><strong>Amount per User:</strong> ${data.amountPerUser}</p>
      <p><strong>Timestamp:</strong> ${formatted}</p>
      <p><strong>Transaction:</strong> <a href="https://polygonscan.com/tx/${data.tx}" target="_blank">${shortenAddress(data.tx)}</a></p>
    `;

    container.style.display = "block";
  }

  function hideLastAirdrop() {
    const container = document.getElementById("lastAirdropCard");
    if (container) container.style.display = "none";
  }

  function shortenAddress(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return {
    fetchLastAirdrop
  };
})();
