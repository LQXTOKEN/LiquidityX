// js/modules/last_airdrop_module.js

window.lastAirdropModule = (function () {
  async function fetchLastAirdrop(address) {
    try {
      const res = await fetch(
        `https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops?address=${address}`
      );
      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      if (!data || !data.token) {
        uiModule.addLog("ℹ️ No airdrop records found.", "warn");
        return;
      }

      // ✅ Format timestamp
      const date = new Date(data.timestamp);
      const formattedTime = date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // ✅ Render στο UI
      const summaryHTML = `
        <div class="card" style="margin-top: 1rem;">
          <h2>📦 Last Airdrop Summary</h2>
          <p><strong>Token:</strong> ${data.symbol} (${data.token})</p>
          <p><strong>Recipients:</strong> ${data.count}</p>
          <p><strong>Amount per User:</strong> ${data.amountPerUser}</p>
          <p><strong>Timestamp:</strong> ${formattedTime}</p>
          <p><strong>Transaction:</strong> <a href="https://polygonscan.com/tx/${data.tx}" target="_blank">${data.tx.slice(0, 10)}...</a></p>
        </div>
      `;

      const container = document.getElementById("recoveryCard");
      container.insertAdjacentHTML("beforebegin", summaryHTML);
    } catch (err) {
      console.warn("[lastAirdropModule] ❌", err);
      uiModule.addLog("❌ Failed to load last airdrop summary.", "error");
    }
  }

  return {
    fetchLastAirdrop,
  };
})();
