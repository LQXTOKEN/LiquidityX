document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  // === Load ABIs ===
  await CONFIG.loadAbis();
  if (!CONFIG.ERC20_ABI || !CONFIG.AIRDROP_ABI) {
    console.error("[main.js] ❌ ABIs not loaded, stopping.");
    return;
  }
  console.log("[main.js] ✅ ABIs loaded and verified");

  // === Elements ===
  const connectButton = document.getElementById("connectWallet");
  const sendButton = document.getElementById("sendButton");
  const proceedButton = document.getElementById("proceedButton");
  const modeSelector = document.getElementById("mode");
  const tokenInput = document.getElementById("tokenInput");
  const amountInput = document.getElementById("tokenAmount");
  const randomCountInput = document.getElementById("randomCount");

  let selectedToken = null;
  let selectedAddresses = [];

  // === Handle Wallet Connect ===
  connectButton.addEventListener("click", async () => {
    console.log("[main.js] Connect button clicked");
    const account = await walletModule.connectWallet();
    if (!account) return;
    console.log("[main.js] Wallet connected:", account);

    const lqxBalance = await erc20Module.getTokenBalance(CONFIG.LQX_TOKEN_ADDRESS, account);
    console.log("[main.js] LQX balance info:", lqxBalance);

    const isEligible = parseFloat(lqxBalance.formatted) >= CONFIG.MIN_LQX_REQUIRED;
    uiModule.updateLQXBalanceDisplay(lqxBalance.formatted);
    uiModule.toggleEligibilityUI(isEligible);
    uiModule.toggleMainUI(isEligible);
  });

  // === Handle Token Input ===
  tokenInput.addEventListener("change", async () => {
    const tokenAddress = tokenInput.value.trim();
    if (!ethers.utils.isAddress(tokenAddress)) return;
    console.log("[main.js] Token check initiated for:", tokenAddress);
    selectedToken = await erc20Module.loadTokenInfo(tokenAddress);
    console.log("[main.js] Token selected:", selectedToken);
  });

  // === Handle Mode Change ===
  modeSelector.addEventListener("change", (e) => {
    const mode = e.target.value;
    console.log("[main.js] Mode changed:", mode);
    uiModule.clearResults();
    uiModule.toggleProceedButton(mode !== "paste");
    if (mode === "paste") {
      uiModule.clearPasteTextarea();
    }
  });

  // === Proceed Button ===
  proceedButton.addEventListener("click", async () => {
    const mode = modeSelector.value;
    console.log("[main.js] Proceed button clicked");
    uiModule.clearResults();

    let addresses = [];
    console.log("[main.js] Fetching addresses for mode:", mode);

    if (mode === "random") {
      const count = parseInt(randomCountInput.value);
      const response = await fetch(CONFIG.ACTIVE_WALLETS_JSON);
      const allWallets = await response.json();
      const shuffled = allWallets.sort(() => 0.5 - Math.random());
      addresses = shuffled.slice(0, count);
      console.log("[main.js] Loaded random wallets:", allWallets.length);
    }

    if (mode === "paste") {
      const raw = document.getElementById("pasteInput").value;
      addresses = raw.split("\n").map(line => line.trim()).filter(addr => ethers.utils.isAddress(addr));
    }

    if (mode === "create") {
      const url = document.getElementById("createUrl").value.trim();
      const res = await fetch(`${CONFIG.PROXY_API_URL}?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.success && data.addresses) {
        addresses = data.addresses.slice(0, 1000);
        console.log("[main.js] Proxy API response (create):", data);
      } else {
        console.error("[main.js] Invalid response from API.");
        return;
      }
    }

    console.log("[main.js] Fetched addresses:", addresses);
    selectedAddresses = addresses;
    uiModule.showResults(addresses);
  });

  // === Send Button ===
  sendButton.addEventListener("click", async () => {
    console.log("[main.js] Send button clicked");

    const token = selectedToken;
    const amountPerUser = amountInput.value.trim();

    console.log("[main.js] Executing airdrop with", {
      token,
      amountPerUser,
      addresses: selectedAddresses
    });

    await airdropExecutor.executeAirdrop({
      token,
      amountPerUser,
      addresses: selectedAddresses
    });
  });
});
