// config.js

window.CONFIG = {
  // Basic Settings
  POLYGON_RPC: "https://polygon-rpc.com",
  LQX_TOKEN_ADDRESS: "0x9E27F48659B1005b1aBc0F58465137E531430d4b",
  AIRDROP_CONTRACT_ADDRESS: "0x2012508a1dbE6BE9c1B666eBD86431b326ef6EF6",
  PROXY_API_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon",
  ACTIVE_WALLETS_JSON: "https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json",
  MIN_LQX_REQUIRED: 1000,

  // ABI Paths
  ERC20_ABI_PATH: "abis/erc20_abi.json",
  AIRDROP_ABI_PATH: "abis/airdrop_abi.json",

  // ABI Holders
  ERC20_ABI: null,
  AIRDROP_ABI: null,

  // Load ABIs
  async loadAbis() {
    try {
      const [erc20Response, airdropResponse] = await Promise.all([
        fetch(this.ERC20_ABI_PATH),
        fetch(this.AIRDROP_ABI_PATH)
      ]);

      this.ERC20_ABI = await erc20Response.json();
      this.AIRDROP_ABI = await airdropResponse.json();

      console.log("[config.js] ✅ ABIs loaded successfully");
    } catch (err) {
      console.error("[config.js] ❌ Failed to load ABIs:", err);
    }
  }
};

// main.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("[main.js] DOM loaded");

  document.getElementById("sendButton").addEventListener("click", async () => {
    console.log("[main.js] Send button clicked");

    const addresses = document.getElementById("results").textContent
      .split("\n")
      .map(a => a.trim())
      .filter(a => a);

    const amount = document.getElementById("tokenAmountPerUser").value.trim();

    // ✅ Save token to global scope for use in app.js
    window.selectedToken = selectedToken;

    console.log("[main.js] Executing airdrop with", {
      token: window.selectedToken,
      amountPerUser: amount,
      addresses: addresses
    });

    // ✅ Call external executor
    window.airdropExecutor.executeAirdrop({
      token: window.selectedToken,
      amountPerUser: amount,
      addresses
    });
  });
});

// app.js

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[main.js] DOM loaded");

  // ✅ Load ABIs before anything else
  await CONFIG.loadAbis();
  if (!CONFIG.ERC20_ABI || !CONFIG.AIRDROP_ABI) {
    console.error("[app.js] ❌ ABI loading failed. Aborting.");
    alert("Error loading ABIs. Please refresh the page.");
    return;
  }

  console.log("[app.js] ✅ ABIs loaded and verified");
});

// airdrop_executor.js

window.airdropExecutor = (function () {
  async function executeAirdrop({ token, amountPerUser, addresses }) {
    console.log("[airdropExecutor] Starting airdrop process...");

    if (!token || !token.contract || !token.address || !amountPerUser || !addresses?.length) {
      console.error("[airdropExecutor] Token info invalid:", { token, amountPerUser, addresses });
      alert("Invalid airdrop configuration.");
      return;
    }

    try {
      const provider = walletModule.getProvider();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONFIG.AIRDROP_CONTRACT_ADDRESS,
        CONFIG.AIRDROP_ABI,
        signer
      );

      const tokenContract = new ethers.Contract(
        token.address,
        CONFIG.ERC20_ABI,
        signer
      );

      const decimals = token.decimals;
      const parsedAmount = ethers.utils.parseUnits(amountPerUser, decimals);
      const totalAmount = parsedAmount.mul(addresses.length);

      console.log(`[airdropExecutor] Approving ${totalAmount.toString()}...`);
      const approveTx = await tokenContract.approve(CONFIG.AIRDROP_CONTRACT_ADDRESS, totalAmount);
      await approveTx.wait();
      console.log("[airdropExecutor] ✅ Approve successful");

      const tx = await contract.batchTransferSameAmount(
        token.address,
        addresses,
        parsedAmount
      );

      console.log("[airdropExecutor] 🚀 Transaction sent:", tx.hash);
      alert(`Airdrop transaction sent!\n\nTx Hash: ${tx.hash}`);
    } catch (err) {
      console.error("[airdropExecutor] ❌ Airdrop failed:", err);
      alert("Airdrop failed. See console for details.");
    }
  }

  return {
    executeAirdrop
  };
})();
