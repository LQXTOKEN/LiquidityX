document.addEventListener("DOMContentLoaded", async () => {
  console.log("[app.js] DOM loaded");

  // Περιμένουμε πρώτα να φορτωθούν τα ABIs
  await CONFIG.loadAbis();
  console.log("[app.js] ✅ ABIs loaded and verified");

  // Συνδέουμε το Send button
  const sendButton = document.getElementById("sendButton");
  if (sendButton) {
    sendButton.addEventListener("click", async () => {
      console.log("[app.js] Send button clicked");

      // Παίρνουμε τις παραμέτρους από την global κατάσταση (που έχει οριστεί στο main.js)
      const selectedToken = window.selectedToken;
      const tokenAmountPerUser = window.tokenAmountPerUser;
      const addresses = window.selectedAddresses;

      console.log("[app.js] Executing airdrop with", {
        token: selectedToken,
        amountPerUser: tokenAmountPerUser,
        addresses: addresses
      });

      // Εφόσον έχουμε τα απαραίτητα στοιχεία, καλούμε το executor
      if (selectedToken && tokenAmountPerUser && addresses?.length > 0) {
        await window.airdropExecutor.executeAirdrop({
          token: selectedToken,
          amountPerUser: tokenAmountPerUser,
          addresses: addresses
        });
      } else {
        console.warn("[app.js] ⚠️ Missing token, amount, or addresses!");
      }
    });
  } else {
    console.error("[app.js] ❌ sendButton not found in DOM!");
  }
});
