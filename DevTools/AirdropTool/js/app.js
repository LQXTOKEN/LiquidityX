// app.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("[app.js] Loaded");

  const sendButton = document.getElementById("sendButton");

  if (sendButton) {
    sendButton.addEventListener("click", async () => {
      console.log("[app.js] Send button clicked");

      const tokenAmountInput = document.getElementById("tokenAmountPerUser");
      const amount = tokenAmountInput?.value.trim();

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Please enter a valid token amount per user.");
        return;
      }

      // Validate that token is selected
      if (!window.selectedToken || !window.selectedToken.address) {
        alert("Please check and confirm your token before sending.");
        console.warn("[app.js] selectedToken is undefined or invalid:", window.selectedToken);
        return;
      }

      // Execute airdrop through executor module
      try {
        await airdropExecutor.executeAirdrop(window.selectedToken, amount);
      } catch (error) {
        console.error("[app.js] Airdrop execution error:", error);
        alert("Airdrop failed. Check console for details.");
      }
    });
  } else {
    console.warn("[app.js] Send button not found");
  }
});
