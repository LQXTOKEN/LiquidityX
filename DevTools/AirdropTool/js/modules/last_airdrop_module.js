// js/modules/last_airdrop_module.js
//
// 📦 Περιγραφή: Φέρνει τα δεδομένα του τελευταίου airdrop του χρήστη από το proxy API και τα εμφανίζει στο UI.
// 📍 Ενσωματώνεται στην κάρτα `#lastAirdropCard` στο index.html

window.lastAirdropModule = (function () {
  // 🔄 Κύρια λειτουργία: Φόρτωση τελευταίου airdrop
  async function fetchLastAirdrop(userAddress) {
    try {
      const url = `https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops?address=${userAddress}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch last airdrop");
      }

      const data = await res.json();
      renderLastAirdrop(data);
    } catch (err) {
      console.error("[lastAirdropModule] ❌ Error:", err);
      const el = document.getElementById("lastAirdropContent");
      if (el) {
        el.innerHTML = `<p style="color: var(--accent-red);">❌ Failed to load last airdrop info.</p>`;
      }
    }
  }

  // 🧱 Απόδοση των δεδομένων στο UI
  function renderLastAirdrop(data) {
    const container = document.getElementById("lastAirdropContent");

    if (!data || !data.token || !data.amount || !data.totalRecipients) {
      container.innerHTML = `<p>No previous airdrop found for this wallet.</p>`;
      return;
    }

    const html = `
      <p><strong>Token:</strong> ${data.token}</p>
      <p><strong>Amount per user:</strong> ${data.amount}</p>
      <p><strong>Total recipients:</strong> ${data.totalRecipients}</p>
      <p><strong>Date:</strong> ${formatDate(data.timestamp)}</p>
      <p><strong>TX Hash:</strong> <a href="https://polygonscan.com/tx/${data.txHash}" target="_blank">${shortHash(data.txHash)}</a></p>
    `;

    container.innerHTML = html;
    document.getElementById("lastAirdropCard").style.display = "block";
  }

  // 🧩 Συντόμευση tx hash
  function shortHash(hash) {
    return hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : "-";
  }

  // 📅 Format ημερομηνίας
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return {
    fetchLastAirdrop
  };
})();
