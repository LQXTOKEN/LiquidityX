// js/modules/config.js

window.CONFIG = {
  // 🛠 Proxy URLs
  PROXY_API_BASE: "https://proxy-git-main-lqxtokens-projects.vercel.app",
  POLYGON_API_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon",
  AIRDROP_LOGS_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/api/airdrops",

  // ✅ Contract addresses
  AIRDROP_CONTRACT_PROXY: "0x2012508a1dbE6BE9c1B666eBD86431b326ef6EF6",
  LQX_TOKEN_ADDRESS: "0x9E27F48659B1005b1aBc0F58465137E531430d4b",
  STAKING_CONTRACT_ADDRESS: "0x9C021bC12c95fe8f020C180D8022593d3cbB02b8",

  // 💸 Static LQX fee in wei (500 LQX)
  REQUIRED_LQX_FEE: "500000000000000000000",

  // 📂 ABI URLs
  ERC20_ABI_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/abis/erc20_abi.json",
  AIRDROP_ABI_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/abis/airdrop_abi.json",

  // 📦 ABIs (θα φορτωθούν δυναμικά)
  ERC20_ABI: null,
  BATCH_AIRDROP_ABI: null,

  // ✅ Load ABIs and assign to CONFIG
  loadAbis: async function () {
    try {
      const [erc20Res, airdropRes] = await Promise.all([
        fetch(this.ERC20_ABI_URL),
        fetch(this.AIRDROP_ABI_URL)
      ]);

      if (!erc20Res.ok || !airdropRes.ok) {
        throw new Error("Failed to fetch ABI files.");
      }

      this.ERC20_ABI = await erc20Res.json();
      this.BATCH_AIRDROP_ABI = await airdropRes.json();

      // ✅ Store globally too (για legacy αρχεία όπως app.js)
      window.ERC20_ABI = this.ERC20_ABI;
      window.BATCH_AIRDROP_ABI = this.BATCH_AIRDROP_ABI;

      console.log("[config.js] ✅ ABIs loaded successfully");
    } catch (err) {
      console.error("[config.js] ❌ ABI loading failed:", err);
      throw err;
    }
  }
};
