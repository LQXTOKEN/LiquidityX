// js/modules/last_airdrops.js

window.lastAirdropModule = (function () {
  // 🔄 Fetch last airdrops from API
  async function fetchLastAirdrops() {
    try {
      const response = await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops");
      if (!response.ok) {
        throw new Error("Failed to fetch last airdrops");
      }

      const data = await response.json();
      updateUI(data);
    } catch (error) {
      console.error("[lastAirdropModule] ❌ Failed to load last airdrops:", error);
    }
  }

  // 🖥️ Render in UI
  function updateUI(airdrops) {
    const container = document.getElementById("lastAirdropsContainer");
    if (!container) return;

    container.innerHTML = "<h2>📦 Recent Airdrops</h2>";

    if (!airdrops || airdrops.length === 0) {
      container.innerHTML += "<p>No recent airdrops found.</p>";
      return;
    }

    const list = document.createElement("ul");
    list.style.padding = "0";
    list.style.listStyle = "none";

    airdrops.forEach((item) => {
      const li = document.createElement("li");
      li.style.marginBottom = "1rem";

      const amount = parseFloat(item.amountPerUser).toFixed(2);
      const link = `https://polygonscan.com/tx/${item.tx}`;
      const date = new Date(item.timestamp).toLocaleString();

      li.innerHTML = `
        <strong>${item.symbol}</strong> ➝ 
        ${item.count} addresses × ${amount} 
        <br/>
        <a href="${link}" target="_blank">${link}</a> 
        <br/>
        <small>${date}</small>
      `;

      list.appendChild(li);
    });

    container.appendChild(list);
  }

  return {
    fetchLastAirdrops
  };
})();
