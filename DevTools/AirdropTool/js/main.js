// main.js

// 🔁 Περιμένει μέχρι να φορτωθούν τα ABIs
const waitForAbis = async () => {
  while (!window.ERC20_ABI || !window.AIRDROP_ABI) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  await waitForAbis();
  console.log("[main.js] ✅ ABIs loaded and verified");

  const connectButton = document.getElementById("connectWallet");
  const disconnectButton = document.getElementById("disconnectWallet");
  const backToMainButton = document.getElementById("backToMain");
  const checkTokenButton = document.getElementById("checkToken");
  const proceedButton = document.getElementById("proceedButton");
  const modeSelect = document.getElementById("modeSelect");
  const sendButton = document.getElementById("sendButton");

  connectButton.addEventListener("click", async () => {
    console.log("[main.js] Connect button clicked");
    const result = await walletModule.connectWallet();
    if (result) {
      uiModule.updateWalletUI(result.userAddress);
      const balance = await erc20Module.getLQXBalance(result.userAddress);
      uiModule.updateLQXBalance(balance);
    }
  });

  disconnectButton.addEventListener("click", () => {
    walletModule.disconnectWallet();
    uiModule.resetUI();
  });

  backToMainButton.addEventListener("click", () => {
    window.location.href = "https://liquidityx.io";
  });

  checkTokenButton.addEventListener("click", async () => {
    const tokenAddress = document.getElementById("tokenAddressInput").value;
    if (tokenAddress) {
      await tokenModule.checkToken(tokenAddress);
    }
  });

  modeSelect.addEventListener("change", (event) => {
    const mode = event.target.value;
    console.log("[main.js] Mode changed:", mode);
    uiModule.clearResults();
    uiModule.showModeSection(mode);
  });

  proceedButton.addEventListener("click", async () => {
    const mode = document.getElementById("modeSelect").value;
    console.log("[main.js] Proceed button clicked");
    const addresses = await addressModule.fetchAddresses(mode);
    if (addresses && addresses.length > 0) {
      uiModule.displayAddresses(addresses);
    }
  });

  sendButton.addEventListener("click", async () => {
    console.log("[main.js] Send button clicked");
    const token = tokenModule.getSelectedToken();
    const amountPerUser = document.getElementById("tokenAmountPerUser").value;
    const addresses = uiModule.getDisplayedAddresses();
    if (token && amountPerUser && addresses.length > 0) {
      await airdropExecutor.executeAirdrop(token, amountPerUser, addresses);
    }
  });
});
