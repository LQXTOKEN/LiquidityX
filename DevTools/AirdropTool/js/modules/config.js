window.CONFIG = {
  // 🔐 Τρέχον Proxy Contract & Token
  LQX_TOKEN_ADDRESS: "0x9E27F48659B1005b1aBc0F58465137E531430d4b",
  AIRDROP_CONTRACT_PROXY: "0x2012508a1dbE6BE9c1B666eBD86431b326ef6EF6",

  // 🌐 RPC & API URLs
  RPC_URL: "https://polygon-rpc.com",
  PROXY_API_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon",
  ACTIVE_WALLETS_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json",

  // ✅ Οι ABIs αποθηκεύονται εδώ και στο global scope
  ERC20_ABI: null,
  BATCH_AIRDROP_ABI: null,

  async loadAbis() {
    try {
      const [erc20Res, airdropRes] = await Promise.all([
        fetch("https://liquidityx.io/DevTools/AirdropTool/abis/erc20_abi.json"),
        fetch("https://liquidityx.io/DevTools/AirdropTool/abis/airdrop_abi.json")
      ]);

      if (!erc20Res.ok || !airdropRes.ok) {
        throw new Error("ABI fetch failed");
      }

      const erc20Abi = await erc20Res.json();
      const airdropAbi = await airdropRes.json();

      this.ERC20_ABI = erc20Abi;
      this.BATCH_AIRDROP_ABI = airdropAbi;

      // 🌐 Αποθήκευση σε global scope για modules που δεν βλέπουν CONFIG
      window.ERC20_ABI = erc20Abi;
      window.AIRDROP_ABI = airdropAbi;

      console.log("[config.js] ✅ ABIs loaded successfully");
    } catch (err) {
      console.error("[config.js] ❌ Failed to load ABIs", err);
      throw err;
    }
  }
};
