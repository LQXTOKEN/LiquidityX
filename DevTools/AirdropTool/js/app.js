// app.js
//
// ✅ Περιλαμβάνει όλες τις smart contract αλληλεπιδράσεις
// ✅ Εκχωρεί global functions σε κουμπιά του UI
// ✅ Χειρίζεται connect/send/retry/recover
// ✅ Κάνει trigger για fetch των τελευταίων airdrop logs

window.handleWalletConnected = async function (userAddress) {
  uiModule.updateWalletUI(userAddress);

  const provider = walletModule.getProvider();
  const signer = provider.getSigner();

  // ✅ Fetch LQX balance & eligibility
  const token = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, CONFIG.ERC20_ABI, provider);
  const balance = await token.balanceOf(userAddress);
  const decimals = await token.decimals();
  const symbol = await token.symbol();
  const formatted = ethers.utils.formatUnits(balance, decimals);
  uiModule.updateLQXBalance({ formatted, symbol });

  // ✅ Fetch & render last airdrop summary
  lastAirdropModule.fetchLastAirdrop(userAddress);

  // ✅ Assign to global for later reuse
  window.connectedSigner = signer;
  window.connectedAddress = userAddress;
};

window.appSend = async function () {
  try {
    const tokenInfo = tokenModule.getSelectedToken();
    if (!tokenInfo) {
      uiModule.showError("❌ Token not selected");
      return;
    }

    const recipients = uiModule.getDisplayedAddresses();
    if (recipients.length === 0) {
      uiModule.showError("❌ No recipients loaded");
      return;
    }

    const amountInput = document.getElementById("tokenAmountPerUser").value.trim();
    if (!amountInput || isNaN(amountInput)) {
      uiModule.showError("❌ Invalid amount per user");
      return;
    }

    const amountPerUser = ethers.utils.parseUnits(amountInput, tokenInfo.decimals);

    console.log("[app.js] Sending:", {
      symbol: tokenInfo.symbol,
      amount: amountPerUser.toString(),
      recipients
    });

    await sendModule.sendAirdrop(
      tokenInfo.contractAddress,
      tokenInfo.symbol,
      amountPerUser,
      recipients,
      connectedSigner
    );
  } catch (err) {
    console.error("[appSend] ❌ Error:", err);
    uiModule.addLog("❌ Send error: " + (err.message || "Unknown error"), "error");
  }
};

window.appRetryFailed = async function () {
  try {
    const tokenInfo = tokenModule.getSelectedToken();
    if (!tokenInfo) {
      uiModule.showError("❌ Token not selected");
      return;
    }

    await sendModule.retryFailed(connectedSigner, tokenInfo.contractAddress);
  } catch (err) {
    console.error("[appRetryFailed] ❌", err);
    uiModule.addLog("❌ Retry failed", "error");
  }
};

window.appRecoverTokens = async function () {
  try {
    const tokenInfo = tokenModule.getSelectedToken();
    if (!tokenInfo) {
      uiModule.showError("❌ Token not selected");
      return;
    }

    await sendModule.recoverTokens(connectedSigner, tokenInfo.contractAddress);
  } catch (err) {
    console.error("[appRecoverTokens] ❌", err);
    uiModule.addLog("❌ Recovery failed", "error");
  }
};

window.appCheckMyRecord = async function () {
  try {
    await sendModule.checkMyRecord(connectedSigner);
  } catch (err) {
    console.error("[appCheckMyRecord] ❌", err);
    uiModule.addLog("❌ Could not fetch your record", "error");
  }
};
