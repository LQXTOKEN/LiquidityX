// 📁 app.js

window.handleWalletConnected = async function () {
  const connection = await walletModule.connectWallet();

  if (!connection) {
    uiModule.showError("❌ Wallet connection failed.");
    return;
  }

  const { provider, signer, userAddress } = connection;

  uiModule.updateWalletUI(userAddress);

  // ✅ Φόρτωση LQX Balance
  const lqxToken = new ethers.Contract(CONFIG.LQX_TOKEN_ADDRESS, CONFIG.ERC20_ABI, provider);
  const balanceRaw = await lqxToken.balanceOf(userAddress);
  const decimals = await lqxToken.decimals();
  const formatted = ethers.utils.formatUnits(balanceRaw, decimals);

  uiModule.updateLQXBalance({ formatted, symbol: "LQX" });

  // ✅ Φόρτωση τελευταίων Airdrops
  if (window.lastAirdropModule?.fetchLastAirdrop) {
    await lastAirdropModule.fetchLastAirdrop(userAddress);
  }
};

// ✅ Επαναφορά Wallet
window.handleWalletDisconnect = function () {
  walletModule.disconnectWallet();
  uiModule.resetUI();
};

// ✅ Send
window.appSend = async function () {
  const signer = walletModule.getProvider()?.getSigner();
  const selectedToken = tokenModule.getSelectedToken();
  const addresses = uiModule.getDisplayedAddresses();

  if (!signer || !selectedToken || addresses.length === 0) {
    uiModule.showError("❌ Missing token, signer or recipients.");
    return;
  }

  const input = document.getElementById("tokenAmountPerUser").value;
  const amount = ethers.utils.parseUnits(input, selectedToken.decimals);

  console.log("[appSend] Parsed amount in wei:", amount.toString());

  await sendModule.sendAirdrop(
    selectedToken.contractAddress,
    selectedToken.symbol,
    amount,
    addresses,
    signer
  );
};

// ✅ Retry
window.appRetry = async function () {
  const signer = walletModule.getProvider()?.getSigner();
  const selectedToken = tokenModule.getSelectedToken();

  if (!signer || !selectedToken) {
    uiModule.showError("❌ Missing signer or token.");
    return;
  }

  await sendModule.retryFailed(signer, selectedToken.contractAddress);
};

// ✅ Recover
window.appRecover = async function () {
  const signer = walletModule.getProvider()?.getSigner();
  const selectedToken = tokenModule.getSelectedToken();

  if (!signer || !selectedToken) {
    uiModule.showError("❌ Missing signer or token.");
    return;
  }

  await sendModule.recoverTokens(signer, selectedToken.contractAddress);
};
