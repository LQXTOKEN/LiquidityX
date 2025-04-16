// app.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[app.js] DOM loaded");

  await CONFIG.loadAbis();
  console.log("[app.js] ✅ ABIs loaded and verified");

  const sendButton = document.getElementById("sendButton");
  if (sendButton) {
    sendButton.addEventListener("click", async () => {
      console.log("[app.js] Send button clicked");

      const selectedToken = window.selectedToken;
      const tokenAmountPerUser = window.tokenAmountPerUser;
      const addresses = window.selectedAddresses;

      if (!selectedToken || !tokenAmountPerUser || !addresses?.length) {
        console.warn("[app.js] ⚠️ Missing token, amount, or addresses!");
        uiModule.addLog("❌ Cannot proceed: missing token, amount, or addresses.", "error");
        return;
      }

      console.log("[app.js] Executing airdrop with", {
        token: selectedToken,
        amountPerUser: tokenAmountPerUser.toString(),
        addresses
      });

      try {
        await window.airdropExecutor.executeAirdrop({
          token: selectedToken,
          amountPerUser: tokenAmountPerUser,
          addresses
        });
      } catch (err) {
        console.error("[app.js] ❌ Airdrop execution error:", err);
        uiModule.addLog(`❌ Airdrop failed: ${err.message}`, "error");
      }
    });
  } else {
    console.error("[app.js] ❌ sendButton not found in DOM!");
  }

  // Έλεγχος για failed recipients (getFailedRecipients) & εμφάνιση retry/recover κουμπιών
  const checkRecordButton = document.getElementById("checkRecordButton");
  const retryButton = document.getElementById("retryFailedButton");
  const recoverButton = document.getElementById("recoverTokensButton");
  const recoveryResults = document.getElementById("recoveryResults");

  if (checkRecordButton) {
    checkRecordButton.addEventListener("click", async () => {
      console.log("[app.js] Checking for failed recipients...");

      try {
        const signer = await walletModule.getSigner();
        const userAddress = await signer.getAddress();
        const airdropContract = new ethers.Contract(CONFIG.airdropContract, CONFIG.airdropAbi, signer);

        const failedRecipients = await airdropContract.getFailedRecipients(window.selectedToken.contractAddress, userAddress);
        if (failedRecipients.length > 0) {
          recoveryResults.innerHTML = `<p>❗ Found ${failedRecipients.length} failed transfers.</p>`;
          retryButton.style.display = "inline-block";
          recoverButton.style.display = "inline-block";
        } else {
          recoveryResults.innerHTML = "<p>✅ No failed transfers found.</p>";
          retryButton.style.display = "none";
          recoverButton.style.display = "none";
        }
      } catch (err) {
        console.error("[app.js] Failed to fetch failed recipients:", err);
        recoveryResults.innerHTML = `<p style="color: red;">❌ Failed to check: ${err.message}</p>`;
      }
    });
  }

  if (retryButton) {
    retryButton.addEventListener("click", async () => {
      console.log("[app.js] Retrying failed recipients...");
      try {
        const signer = await walletModule.getSigner();
        await window.airdropExecutor.retryFailed(window.selectedToken, signer);
      } catch (err) {
        console.error("[app.js] ❌ Retry failed:", err);
        uiModule.addLog(`❌ Retry failed: ${err.message}`, "error");
      }
    });
  }

  if (recoverButton) {
    recoverButton.addEventListener("click", async () => {
      console.log("[app.js] Recovering tokens...");
      try {
        const signer = await walletModule.getSigner();
        await window.airdropExecutor.recoverFailed(window.selectedToken, signer);
      } catch (err) {
        console.error("[app.js] ❌ Recovery failed:", err);
        uiModule.addLog(`❌ Recovery failed: ${err.message}`, "error");
      }
    });
  }

});
