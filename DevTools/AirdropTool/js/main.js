// js/modules/main.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  try {
    await CONFIG.loadAbis();
    console.log("[main.js] ✅ ABIs loaded and verified");
  } catch (err) {
    uiModule.showError("Failed to load ABI files.");
    return;
  }

  uiModule.updateLastAirdrops();

  const onClick = (id, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
    else console.warn(`[main.js] ⚠️ Element with id '${id}' not found`);
  };

  const onChange = (id, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", handler);
    else console.warn(`[main.js] ⚠️ Element with id '${id}' not found`);
  };

  // ✅ Event listeners with safety
  onClick("connectWallet", async () => {
    console.log("[main.js] Connect button clicked");
    await walletModule.connectWallet();
  });

  onClick("disconnectWallet", () => {
    walletModule.disconnectWallet();
  });

  onClick("backToMain", () => {
    window.location.href = "https://liquidityx.io";
  });

  onClick("checkToken", async () => {
    console.log("[main.js] Check Token button clicked");
    const input = document.getElementById("tokenAddress")?.value.trim();
    if (!input) return uiModule.showError("Please enter a token contract address.");

    try {
      const token = await tokenModule.loadToken(input);
      uiModule.updateTokenStatus(`✅ Token loaded: ${token.symbol}`, true);
      window.selectedToken = token;
    } catch (err) {
      uiModule.updateTokenStatus(`❌ ${err.message}`, false);
    }
  });

  onChange("mode", e => {
    const mode = e.target.value;
    console.log("[main.js] Mode changed:", mode);
    uiModule.showModeSection(mode);
  });

  onClick("proceedButton", async () => {
    console.log("[main.js] Proceed button clicked");
    const mode = document.getElementById("mode")?.value;
    try {
      const addresses = await addressModule.fetchAddresses(mode);
      uiModule.displayAddresses(addresses);
    } catch (err) {
      uiModule.showError(`❌ Failed to load addresses: ${err.message}`);
    }
  });

  onClick("sendButton", async () => {
    console.log("[main.js] Send button clicked");

    const recipients = uiModule.getDisplayedAddresses();
    const amountInput = document.getElementById("tokenAmount")?.value;
    const amountPerUser = ethers.utils.parseUnits(amountInput, window.selectedToken?.decimals || 18);
    console.log("[main.js] Parsed amount in wei:", amountPerUser.toString());

    if (!window.selectedToken || !window.selectedToken.contractAddress) {
      uiModule.addLog("❌ Token is missing or invalid.", "error");
      return;
    }

    try {
      const signer = await walletModule.getSigner();
      await sendModule.sendAirdrop(window.selectedToken, recipients, amountPerUser, signer);
    } catch (err) {
      uiModule.addLog(`❌ Airdrop failed: ${err.message}`, "error");
    }
  });

  onClick("recoverButton", async () => {
    console.log("[main.js] Recover button clicked");

    if (!window.selectedToken || !window.selectedToken.contractAddress) {
      uiModule.addLog("❌ Token is missing or invalid.", "error");
      return;
    }

    try {
      const signer = await walletModule.getSigner();
      await recoverModule.recoverFailed(window.selectedToken, signer);
    } catch (err) {
      uiModule.addLog(`❌ Recovery failed: ${err.message}`, "error");
    }
  });

  onClick("downloadButton", () => {
    const addresses = uiModule.getDisplayedAddresses();
    const blob = new Blob([addresses.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "airdrop_addresses.txt";
    link.click();

    URL.revokeObjectURL(url);
  });

  onClick("downloadFailedButton", () => {
    // Αντικαθίσταται δυναμικά από enableDownloadFailed
  });

  console.log("[main.js] Initialization complete ✅");
});
