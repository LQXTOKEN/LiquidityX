// js/main.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");

    // ✅ Φόρτωσε τα τελευταία airdrops κατά το load
    uiModule.updateLastAirdrops();
  } catch (err) {
    console.error("[main.js] ❌ Initialization failed: ABI loading error");
    return;
  }

  initializeApp();
});

async function initializeApp() {
  try {
    console.log("[main.js] Starting initialization...");

    // UI Elements
    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const backBtn = document.getElementById("backToMain");
    const checkTokenButton = document.getElementById("checkToken");
    const tokenAddressInput = document.getElementById("tokenAddressInput");
    const tokenAmountInput = document.getElementById("tokenAmountPerUser");
    const modeSelect = document.getElementById("modeSelect");
    const proceedButton = document.getElementById("proceedButton");
    const sendButton = document.getElementById("sendButton");
    const downloadButton = document.getElementById("downloadButton");
    const checkRecordButton = document.getElementById("checkRecordButton");
    const retryFailedButton = document.getElementById("retryFailedButton");
    const recoverTokensButton = document.getElementById("recoverTokensButton");

    // ✅ Connect Wallet
    connectBtn.addEventListener("click", async () => {
      const result = await walletModule.connectWallet();
      if (result) {
        window.signer = result.signer;
        uiModule.updateWalletUI(result.userAddress);

        const lqx = await erc20Module.getLQXBalance(result.userAddress);
        if (lqx) {
          uiModule.updateLQXBalance(lqx);
        } else {
          uiModule.showError("Could not fetch LQX balance.");
        }

        document.getElementById("recoveryCard").style.display = "block";
      }
    });

    // ✅ Disconnect Wallet
    disconnectBtn.addEventListener("click", () => {
      walletModule.disconnectWallet();
      uiModule.resetUI();
      document.getElementById("recoveryCard").style.display = "none";
    });

    // ✅ Go back button
    backBtn.addEventListener("click", () => {
      window.location.href = "https://liquidityx.io";
    });

    // ✅ Token Check
    checkTokenButton.addEventListener("click", async () => {
      const tokenAddress = tokenAddressInput.value.trim();
      if (!tokenAddress) {
        uiModule.showError("Please enter a token address");
        return;
      }
      await tokenModule.checkToken(tokenAddress);
      const selected = tokenModule.getSelectedToken();
      if (selected) {
        window.selectedToken = selected;
        window.currentTokenAddress = selected.contractAddress;
      }
    });

    // ✅ Change Input Mode
    modeSelect.addEventListener("change", (event) => {
      const mode = event.target.value;
      uiModule.clearResults();
      uiModule.showModeSection(mode);
    });

    // ✅ Fetch Addresses & Parse Token Amount
    proceedButton.addEventListener("click", async () => {
      const mode = modeSelect.value;
      try {
        const addresses = await addressModule.fetchAddresses(mode);
        if (addresses?.length > 0) {
          window.selectedAddresses = addresses;
          uiModule.displayAddresses(addresses);
          downloadButton.style.display = "inline-block";
        } else {
          uiModule.showError("No addresses found");
          downloadButton.style.display = "none";
        }
      } catch (error) {
        uiModule.showError("Failed to fetch addresses");
        downloadButton.style.display = "none";
      }

      const amount = tokenAmountInput.value;
      if (!amount || isNaN(amount)) {
        uiModule.showError("Invalid amount per user");
        return;
      }

      try {
        const parsedAmount = ethers.utils.parseUnits(amount, window.selectedToken.decimals);
        window.tokenAmountPerUser = parsedAmount;
      } catch (err) {
        uiModule.showError("Failed to convert amount to token decimals");
        return;
      }
    });

    // ✅ Send Airdrop
    sendButton.addEventListener("click", () => {
      if (!window.selectedToken) {
        uiModule.showError("Token not selected.");
        return;
      }
      if (!window.tokenAmountPerUser || !ethers.BigNumber.isBigNumber(window.tokenAmountPerUser)) {
        uiModule.showError("Invalid amount per address.");
        return;
      }
      if (!window.selectedAddresses || window.selectedAddresses.length === 0) {
        uiModule.showError("No recipient addresses.");
        return;
      }

      sendModule.sendAirdrop(
        window.selectedToken.contractAddress,
        window.selectedToken.symbol,
        window.tokenAmountPerUser,
        window.selectedAddresses,
        window.signer
      );
    });

    // ✅ Download Addresses
    downloadButton.addEventListener("click", () => {
      if (!window.selectedAddresses || window.selectedAddresses.length === 0) {
        uiModule.showError("No addresses to download.");
        return;
      }

      const content = window.selectedAddresses.join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "airdrop_addresses.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // ✅ Check User Record
    checkRecordButton.addEventListener("click", () => 
      sendModule.checkMyRecord(window.signer)
    );

    // ✅ Retry Failed Transactions
    retryFailedButton.addEventListener("click", () => 
      sendModule.retryFailed(window.signer, window.currentTokenAddress)
    );

    // ✅ Recover Tokens
    recoverTokensButton.addEventListener("click", () => 
      sendModule.recoverTokens(window.signer, window.currentTokenAddress)
    );

    // ✅ Subscribe to Live Logs (if contract supports events)
    try {
      const airdropContract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_PROXY,
        CONFIG.BATCH_AIRDROP_ABI,
        window.signer
      );

      airdropContract.on("AirdropSent", (token, recipients, amountPerUser) => {
        uiModule.addLog(`🔔 AirdropSent event: ${recipients.length} addresses received ${ethers.utils.formatUnits(amountPerUser)} tokens each.`);
      });

      console.log("[main.js] ✅ Subscribed to live logs");
    } catch (error) {
      console.warn("[main.js] ❌ No event AirdropSent detected or subscription failed", error);
    }

    console.log("[main.js] Initialization complete ✅");
  } catch (err) {
    console.error("[main.js] ❌ Unexpected error:", err);
  }
}
