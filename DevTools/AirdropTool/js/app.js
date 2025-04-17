// app.js
//
// 📦 Κύριο app controller για blockchain ενέργειες του εργαλείου.
// ✅ Modular σύνδεση με walletModule, uiModule, sendModule, lastAirdropModule
// ✅ Όλες οι smart contract interactions γίνονται από εδώ.

window.handleWalletConnected = async function () {
  const wallet = await walletModule.connectWallet();
  if (!wallet) return;

  const { signer, userAddress } = wallet;

  uiModule.updateWalletUI(userAddress);

  // ➕ Fetch LQX Balance
  const token = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, CONFIG.ERC20_ABI, signer);
  const balance = await token.balanceOf(userAddress);
  const decimals = await token.decimals();
  const symbol = await token.symbol();

  const formatted = ethers.utils.formatUnits(balance, decimals);
  uiModule.updateLQXBalance({ formatted, symbol });

  // ➕ Last airdrop summary section
  lastAirdropModule.fetchLastAirdrop(userAddress);
};

window.appSend = async function (amountPerUser, recipients) {
  try {
    const signer = walletModule.getProvider().getSigner();
    const token = tokenModule.getSelectedToken();

    if (!token) {
      uiModule.showError("❌ No token selected");
      return;
    }

    await sendModule.sendAirdrop(
      token.contractAddress,
      token.symbol,
      amountPerUser,
      recipients,
      signer
    );
  } catch (err) {
    console.error("[appSend] ❌ Error:", err);
    uiModule.addLog(`❌ Airdrop failed: ${err.message || err}`, "error");
  }
};

window.appRetry = async function () {
  try {
    const signer = walletModule.getProvider().getSigner();
    const token = tokenModule.getSelectedToken();

    if (!token) {
      uiModule.showError("❌ No token selected");
      return;
    }

    await sendModule.retryFailed(signer, token.contractAddress);
  } catch (err) {
    console.error("[appRetry] ❌ Error:", err);
    uiModule.addLog(`❌ Retry failed: ${err.message || err}`, "error");
  }
};

window.appRecover = async function () {
  try {
    const signer = walletModule.getProvider().getSigner();
    const token = tokenModule.getSelectedToken();

    if (!token) {
      uiModule.showError("❌ No token selected");
      return;
    }

    await sendModule.recoverTokens(signer, token.contractAddress);
  } catch (err) {
    console.error("[appRecover] ❌ Error:", err);
    uiModule.addLog(`❌ Recovery failed: ${err.message || err}`, "error");
  }
};
