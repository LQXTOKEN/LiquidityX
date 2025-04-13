// app.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("[app.js] Loaded");

  const sendButton = document.createElement("button");
  sendButton.id = "sendAirdropButton";
  sendButton.textContent = "Send Airdrop";
  sendButton.className = "btn";
  document.getElementById("airdropTool").appendChild(sendButton);

  sendButton.addEventListener("click", async () => {
    console.log("[app.js] Send Airdrop clicked");

    const tokenAmount = document.getElementById("tokenAmountPerUser")?.value?.trim();
    const resultsText = document.getElementById("results")?.textContent?.trim();

    if (!tokenAmount || isNaN(tokenAmount) || parseFloat(tokenAmount) <= 0) {
      alert("Please enter a valid token amount per user.");
      return;
    }

    if (!resultsText) {
      alert("No addresses found to airdrop.");
      return;
    }

    const recipients = resultsText.split("\n").map(addr => addr.trim()).filter(addr => addr !== "");

    if (recipients.length === 0) {
      alert("No valid addresses found.");
      return;
    }

    const provider = walletModule.getProvider();
    const userAddress = walletModule.getUserAddress();
    const tokenInfo = window.selectedToken;

    if (!provider || !userAddress || !tokenInfo) {
      alert("Missing wallet or token info. Please connect wallet and check token first.");
      return;
    }

    const result = await airdropExecutor.executeAirdrop(recipients, tokenAmount, tokenInfo, provider, userAddress);

    if (result.success) {
      alert(result.message + `\nTx: https://polygonscan.com/tx/${result.txHash}`);
    } else {
      alert(result.message);
    }
  });
});
