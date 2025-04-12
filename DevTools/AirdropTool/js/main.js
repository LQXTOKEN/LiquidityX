document.getElementById("connectWallet").addEventListener("click", async () => {
  console.log("[main.js] Connect button clicked");

  const result = await walletModule.connectWallet();
  if (!result) {
    console.warn("[main.js] Wallet connection failed or cancelled");
    return;
  }

  const { provider, userAddress } = result;
  console.log("[main.js] Wallet connected:", userAddress);

  const balanceInfo = await erc20Module.getERC20Balance(CONFIG.LQX_TOKEN_ADDRESS, userAddress, provider);
  if (!balanceInfo) {
    console.error("[main.js] Could not fetch LQX balance");
    return;
  }

  const meetsRequirement = parseFloat(balanceInfo.formatted) >= CONFIG.MIN_LQX_REQUIRED;
  uiModule.setWalletInfo(userAddress, balanceInfo.formatted, balanceInfo.symbol);
  uiModule.setAccessDenied(!meetsRequirement);

  document.getElementById("connectWallet").style.display = "none";
  document.getElementById("disconnectWallet").style.display = "inline-block";
});
