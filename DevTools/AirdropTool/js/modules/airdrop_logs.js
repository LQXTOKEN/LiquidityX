async function updateLastAirdrops() {
  const container = document.getElementById('lastAirdropsContainer');
  try {
    const response = await fetch('https://proxy-git-main-lqxtokens-projects.vercel.app/api/last-airdrops');
    const data = await response.json();

    if (data.length === 0) {
      container.innerHTML = '<p>No airdrops found yet.</p>';
      return;
    }

    const html = data
      .map(drop => {
        return `
          <div class="airdrop-entry">
            <p><strong>Sender:</strong> ${drop.sender}</p>
            <p><strong>Token:</strong> ${drop.token}</p>
            <p><strong>Amount:</strong> ${drop.amountFormatted}</p>
            <p><strong>Recipients:</strong> ${drop.recipients.length}</p>
            <hr />
          </div>
        `;
      })
      .join('');
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p style="color:red;">Failed to load airdrops.</p>';
    console.error('[Last Airdrops] ❌ Error loading:', err);
  }
}
