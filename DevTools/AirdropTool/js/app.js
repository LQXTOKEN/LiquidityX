// 📄 app.js
// Δομή: Συνδέει wallet, ενημερώνει το UI, fetch balance, fetch last airdrop μία φορά

let lastAirdropFetched = false;

window.handleWalletConnected = async function () {
  const wallet = await walletModule.connectWallet();
  if (!wallet) return;

  const { provider, signer, userAddress } = wallet;
  uiModule.updateWalletUI(userAddress);

  try {
    const lqxContract = new ethers.Contract(
      CONFIG.LQX_TOKEN_ADDRESS,
      CONFIG.ERC20_ABI,
      provider
    );
    const rawBalance = await lqxContract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(rawBalance, 18);
    uiModule.updateLQXBalance({ formatted, symbol: "LQX" });
  } catch (err) {
    console.error("[app.js] ❌ Failed to fetch LQX balance:", err);
  }

  if (!lastAirdropFetched) {
    lastAirdropModule.fetchLastAirdrop(userAddress);
    lastAirdropFetched = true;
  }
};

window.appSend = async function () {
  const signer = walletModule.getProvider()?.getSigner();
  const token = tokenModule.getSelectedToken();
  const recipients = uiModule.getDisplayedAddresses();
  const rawAmount = document.getElementById("tokenAmountPerUser").value;

  if (!signer || !token || recipients.length === 0 || !rawAmount) {
    uiModule.showError("❌ Missing data for airdrop.");
    return;
  }

  const amount = ethers.utils.parseUnits(rawAmount, token.decimals);
  await sendModule.sendAirdrop(
    token.contractAddress,
    token.symbol,
    amount,
    recipients,
    signer
  );
};

window.appRetry = async function () {
  const signer = walletModule.getProvider()?.getSigner();
  const token = tokenModule.getSelectedToken();
  if (!signer || !token) return;

  await sendModule.retryFailed(signer, token.contractAddress);
};

window.appRecover = async function () {
  const signer = walletModule.getProvider()?.getSigner();
  const token = tokenModule.getSelectedToken();
  if (!signer || !token) return;

  await sendModule.recoverTokens(signer, token.contractAddress);
};

window.appCheckRecord = async function () {
  const signer = walletModule.getProvider()?.getSigner();
  if (!signer) return;

  await sendModule.checkMyRecord(signer);
};
