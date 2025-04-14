import { ethers } from "./ethers-5.6.esm.min.js";
import { LQX_TOKEN_ADDRESS, BATCH_AIRDROP_ADDRESS, PROXY_API } from "./config.js";
import { getERC20Contract, getBatchAirdropContract } from "./erc20_module.js";
import { addLog, updateLastAirdrops, enableDownloadFailed } from "./ui_module.js";

// Βοηθητική για download .txt αρχείου
function downloadFailedRecipients(failed) {
  const blob = new Blob([failed.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'failed_recipients.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// POST log στο backend
async function logAirdropToServer(data) {
  try {
    await fetch(`${PROXY_API}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    addLog("📡 Airdrop logged successfully", "success");
  } catch (err) {
    addLog("⚠️ Failed to log airdrop", "error");
  }
}

// Κύρια συνάρτηση για αποστολή
export async function sendAirdrop(tokenAddress, tokenSymbol, amountPerRecipient, recipients, signer) {
  const token = getERC20Contract(tokenAddress, signer);
  const contract = getBatchAirdropContract(signer);

  const sender = await signer.getAddress();
  const totalAmount = ethers.BigNumber.from(amountPerRecipient).mul(recipients.length);

  try {
    addLog("⏳ Approving token transfer...", "info");
    const approveTx = await token.approve(BATCH_AIRDROP_ADDRESS, totalAmount);
    await approveTx.wait();
    addLog(`✅ Token approved`, "success");
  } catch (err) {
    addLog("❌ Approve failed: " + err.message, "error");
    return;
  }

  try {
    addLog("🚀 Sending airdrop transaction...", "info");
    const tx = await contract.batchTransferSameAmount(recipients, amountPerRecipient, tokenAddress);
    const receipt = await tx.wait();
    addLog(`✅ Airdrop confirmed! TX: ${tx.hash}`, "success");

    // Λήψη RecordId
    const recordId = await contract.getRecordId();

    // Logging
    const logData = {
      sender,
      token: tokenAddress,
      symbol: tokenSymbol,
      amountPerRecipient: amountPerRecipient.toString(),
      recipients,
      txHash: tx.hash
    };
    await logAirdropToServer(logData);
    updateLastAirdrops(); // ανανέωση UI

    // Έλεγχος για αποτυχημένους
    const failed = await contract.getFailedRecipients(recordId);
    if (failed.length > 0) {
      addLog(`⚠️ ${failed.length} failed recipients`, "warn");
      enableDownloadFailed(failed, () => downloadFailedRecipients(failed));

      // Προσθήκη κουμπιού retry
      const retryBtn = document.getElementById("retryButton");
      retryBtn.style.display = "inline-block";
      retryBtn.onclick = async () => {
        try {
          addLog("🔁 Retrying failed transfers...", "info");
          const retryTx = await contract.recoverFailedTransfers(recordId, tokenAddress);
          await retryTx.wait();
          addLog("✅ Retry successful", "success");
        } catch (e) {
          addLog("❌ Retry failed: " + e.message, "error");
        }
      };
    } else {
      addLog("🎉 No failed recipients!", "success");
    }

  } catch (err) {
    addLog("❌ Airdrop failed: " + err.message, "error");
  }
}
import { getBatchAirdropContract } from "./erc20_module.js";
import { addLog } from "./ui_module.js";
import { LQX_TOKEN_ADDRESS } from "./config.js";

// Εύρεση και εμφάνιση αποτυχημένων
export async function checkMyRecord(signer) {
  try {
    const contract = getBatchAirdropContract(signer);
    const recordId = await contract.getRecordId();
    const failed = await contract.getFailedRecipients(recordId);

    const recoveryResults = document.getElementById("recoveryResults");
    recoveryResults.innerHTML = "";

    if (failed.length === 0) {
      recoveryResults.innerHTML = "<p>✅ No failed recipients found for your last airdrop.</p>";
      return;
    }

    const list = document.createElement("ul");
    failed.forEach(addr => {
      const li = document.createElement("li");
      li.textContent = addr;
      list.appendChild(li);
    });
    recoveryResults.appendChild(list);

    document.getElementById("retryFailedButton").style.display = "inline-block";
    document.getElementById("recoverTokensButton").style.display = "inline-block";

    // Αποθηκεύουμε το recordId για χρήση στα buttons
    window.lastRecordId = recordId;

  } catch (err) {
    addLog("❌ Failed to fetch airdrop record: " + err.message, "error");
  }
}

// Retry για αποτυχημένους
export async function retryFailed(signer, tokenAddress) {
  try {
    const contract = getBatchAirdropContract(signer);
    const tx = await contract.recoverFailedTransfers(window.lastRecordId, tokenAddress);
    await tx.wait();
    addLog("✅ Retry successful", "success");
  } catch (err) {
    addLog("❌ Retry failed: " + err.message, "error");
  }
}

// Επιστροφή tokens στον χρήστη
export async function recoverTokens(signer, tokenAddress) {
  try {
    const contract = getBatchAirdropContract(signer);
    const tx = await contract.recoverFailedTransfers(window.lastRecordId, tokenAddress);
    await tx.wait();
    addLog("✅ Recovery complete. Tokens returned.", "success");
  } catch (err) {
    addLog("❌ Recovery failed: " + err.message, "error");
  }
}

