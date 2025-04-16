// js/modules/recover.js

window.recoverModule = (function () {
  async function fetchUserRecords(signer) {
    try {
      const user = await signer.getAddress();
      const contract = erc20Module.getBatchAirdropContract(signer);
      const records = await contract.getUserRecords(user);

      if (!records || records.length === 0) {
        uiModule.addLog("ℹ️ No airdrop records found.");
        return;
      }

      const container = document.getElementById("recoveryResults");
      container.innerHTML = `<p><strong>Total Records:</strong> ${records.length}</p>`;

      records.forEach((record, index) => {
        const token = record.token;
        const failedCount = record.failedRecipients.length;
        const isClaimed = record.claimed;

        const row = document.createElement("div");
        row.classList.add("recovery-row");

        row.innerHTML = `
          <p>#${index + 1} ➝ Token: ${token}<br/>Failed: ${failedCount}<br/>Claimed: ${isClaimed ? "✅" : "❌"}</p>
          <button class="btn" data-token="${token}" data-claimed="${isClaimed}" ${failedCount === 0 || isClaimed ? "disabled" : ""}>
            Recover
          </button>
        `;

        const button = row.querySelector("button");
        button.addEventListener("click", async () => {
          await performRecovery(token, signer);
        });

        container.appendChild(row);
      });
    } catch (err) {
      console.error("[recover.js] Error fetching user records:", err);
      uiModule.addLog("❌ Failed to load recovery records", "error");
    }
  }

  async function performRecovery(tokenAddress, signer) {
    try {
      uiModule.addLog(`💸 Recovering tokens for token: ${tokenAddress}`);
      const contract = erc20Module.getBatchAirdropContract(signer);
      const tx = await contract.recoverFailedTransfer(tokenAddress);
      uiModule.addLog(`⛽ Recovery TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.addLog(`✅ Recovery complete.`);
    } catch (err) {
      console.error("[recover.js] Recovery failed:", err);
      uiModule.addLog("❌ Recovery failed: " + (err.message || "Unknown error"), "error");
    }
  }

  return {
    fetchUserRecords,
    performRecovery
  };
})();
