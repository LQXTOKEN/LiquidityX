// app.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("[app.js] Loaded and ready.");

  const sendButton = document.getElementById("sendButton");

  if (!sendButton) {
    console.error("[app.js] Send button not found!");
    return;
  }

  sendButton.addEventListener("click", async () => {
    console.log("[app.js] Send button clicked");

    const provider = walletModule.getProvider();
    const selectedToken = window.selectedToken;

    if (!provider) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!selectedToken) {
      alert("Please check and select a valid token before sending.");
      return;
    }

    const amountInput = document.getElementById("tokenAmountPerUser");
    const amountStr = amountInput?.value?.trim();

    if (!amountStr || isNaN(amountStr) || parseFloat(amountStr) <= 0) {
      alert("Please enter a valid token amount per user.");
      return;
    }

    const amountPerUser = amountStr;

    await airdropExecutor.executeAirdrop(selectedToken, provider, amountPerUser);
  });
});
