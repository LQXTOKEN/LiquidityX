// app.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  // 🔁 Load ABIs first
  await CONFIG.loadAbis();
  if (!CONFIG.ERC20_ABI || !CONFIG.AIRDROP_ABI) {
    alert("Failed to load ABIs. Please refresh and try again.");
    return;
  }
  console.log("[main.js] ABIs loaded and verified");

  const sendButton = document.getElementById("sendButton");
  if (sendButton) {
    sendButton.addEventListener("click", async () => {
      console.log("[main.js] Send button clicked");

      const resultsText = document.getElementById("results").textContent.trim();
      const addresses = resultsText
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.startsWith("0x") && line.length === 42);

      const tokenAmountPerUser = document.getElementById("tokenAmountPerUser")?.value || "0";

      console.log("[main.js] Executing airdrop with", {
        token: window.selectedToken,
        amountPerUser: tokenAmountPerUser,
        addresses
      });

      await airdropExecutor.executeAirdrop(
        window.selectedToken,
        tokenAmountPerUser,
        addresses
      );
    });
  } else {
    console.warn("[main.js] Send button not found in DOM.");
  }
});
