// js/modules/config.js
//
// 📦 Περιγραφή: Κεντρικό configuration object για διευθύνσεις, ABIs και URLs του εργαλείου.

window.CONFIG = {
  LQX_TOKEN_ADDRESS: "0x9E27F48659B1005b1aBc0F58465137E531430d4b",
  AIRDROP_CONTRACT_PROXY: "0x2012508a1dbE6BE9c1B666eBD86431b326ef6EF6",
  RPC_URL: "https://polygon-rpc.com",
  PROXY_API_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon",
  ACTIVE_WALLETS_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json",

  // ✅ Οι ABIs αποθηκεύονται στο CONFIG και στο window
  ERC20_ABI: null,
  BATCH_AIRDROP_ABI: null,

  async loadAbis() {
    try {
      const [erc20Res, airdropRes] = await Promise.all([
        fetch("/DevTools/AirdropTool/abis/erc20_abi.json"),
        fetch("/DevTools/AirdropTool/abis/airdrop_abi.json"),
      ]);

      if (!erc20Res.ok || !airdropRes.ok) throw new Error("ABI fetch failed");

      const erc20Abi = await erc20Res.json();
      const airdropAbi = await airdropRes.json();

      this.ERC20_ABI = erc20Abi;
      this.BATCH_AIRDROP_ABI = airdropAbi;

      window.ERC20_ABI = erc20Abi;
      window.AIRDROP_ABI = airdropAbi;

      console.log("[config.js] ✅ ABIs loaded successfully");
    } catch (err) {
      console.error("[config.js] ❌ Failed to load ABIs", err);
      throw err;
    }
  }
};

// ✅ Ορίζουμε τη βάση URL του proxy API ώστε να την χρησιμοποιούν όλα τα modules
window.API_BASE_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";
