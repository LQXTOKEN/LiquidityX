// js/modules/last_airdrops.js
//
// 📦 Περιγραφή: Φορτώνει και εμφανίζει τους τελευταίους airdrops όλων των χρηστών.
// Δεν επηρεάζει άλλα modules ή τη βασική λειτουργικότητα.

window.lastAirdropModule = (function () {
  const API_URL = `${window.API_BASE_URL}/api/last-airdrops`;

  async function fetchAllLastAirdrops() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch last airdrops");

      const data = await res.json();
      displayLastAirdrops(data);
    } catch (err) {
      console.error("[last_airdrops.js] ❌ Fetch error:", err);
      document.getElementById("lastAirdrops").innerHTML = "<p>⚠️ Could not load airdrop history.</p>";
    }
  }

  function displayLastAirdrops(data) {
    const container = document.getElementById("lastAirdrops");
    container.innerHTML = "<h4>📦 Last Airdrops:</h4>";

    if (!data || data.length === 0) {
      container.innerHTML += "<p>No recent airdrops found.</p>";
      return;
    }

    data.forEach((item, index) => {
      const formattedAmount = parseFloat(item.amountPerUser).toFixed(2);
      const formattedDate = new Date(item.timestamp).toLocaleString();
      const txLink = `https://polygonscan.com/tx/${item.tx}`;

      container.innerHTML += `
        <div class="airdrop-entry">
          <strong>#${index + 1}</strong> | Token: <code>${item.symbol}</code> | 
          Amount/User: <code>${formattedAmount}</code> | 
          Total: <code>${item.count} users</code><br>
          Date: ${formattedDate}<br>
          <a href="${txLink}" target="_blank">🔗 View TX</a>
          <hr>
        </div>
      `;
    });
  }

  return {
    fetchAllLastAirdrops
  };
})();
