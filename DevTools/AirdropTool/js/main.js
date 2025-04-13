// main.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  await CONFIG.loadAbis();
  console.log("[main.js] ✅ ABIs loaded and verified");

  const connectButton = document.getElementById("connectButton");
  const proceedButton = document.getElementById("proceedButton");
  const sendButton = document.getElementById("sendButton");
  const disconnectButton = document.getElementById("disconnectButton");
  const modeSelector = document.getElementById("modeSelector");
  const tokenAddressInput = document.getElementById("tokenAddress");
  const amountPerUserInput = document.getElementById("tokenAmountPerUser");

  let selectedToken = null;
  let fetchedAddresses = [];
  let currentMode = null;

  connectButton.addEventListener("click", async () => {
    console.log("[main.js] Connect button clicked");
    const address = await walletModule.connectWallet();
    if (address) {
      console.log("[main.js] Wallet connected:", address);
      const balanceInfo = await erc20Module.checkLQXBalance(address);
      console.log("[main.js] LQX balance info:", balanceInfo);
      uiModule.updateBalance(balanceInfo.formatted);
      uiModule.setEligibility(balanceInfo.raw);
      uiModule.enableUI(balanceInfo.raw);
    }
  });

  disconnectButton.addEventListener("click", () => {
    walletModule.disconnectWallet();
    uiModule.disableUI();
  });

  tokenAddressInput.addEventListener("change", async (e) => {
    const address = e.target.value.trim();
    if (address && ethers.utils.isAddress(address)) {
      console.log("[main.js] Token check initiated for:", address);
      selectedToken = await erc20Module.loadToken(address);
      console.log("[main.js] Token selected:", selectedToken);
      uiModule.updateTokenInfo(selectedToken.symbol, selectedToken.decimals);
    } else {
      selectedToken = null;
      uiModule.updateTokenInfo("Invalid", 18);
    }
  });

  modeSelector.addEventListener("change", async (e) => {
    const newMode = e.target.value;
    console.log("[main.js] Mode changed:", newMode);

    if (fetchedAddresses.length > 0 && newMode !== currentMode) {
      const confirmChange = confirm("Switching mode will clear current addresses. Continue?");
      if (!confirmChange) {
        modeSelector.value = currentMode;
        return;
      }
    }

    currentMode = newMode;
    uiModule.clearResults();
    uiModule.clearAllInputs();
    uiModule.toggleInputSections(newMode);
  });

  proceedButton.addEventListener("click", async () => {
    const mode = modeSelector.value;
    console.log("[main.js] Proceed button clicked");

    try {
      const addresses = await uiModule.fetchAddresses(mode);
      console.log("[main.js] Fetched addresses:", addresses);
      fetchedAddresses = addresses;
      uiModule.displayAddresses(addresses);
    } catch (err) {
      console.error("[main.js] Failed to fetch addresses:", err);
    }
  });

  sendButton.addEventListener("click", async () => {
    console.log("[main.js] Send button clicked");

    const amountPerUser = amountPerUserInput.value.trim();

    if (!selectedToken || !amountPerUser || fetchedAddresses.length === 0) {
      console.warn("[main.js] Missing input for airdrop");
      alert("Token, amount or addresses missing.");
      return;
    }

    const payload = {
      token: selectedToken,
      amountPerUser,
      addresses: fetchedAddresses,
    };

    console.log("[main.js] Executing airdrop with", payload);
    await airdropExecutor.executeAirdrop(payload);
  });
});
