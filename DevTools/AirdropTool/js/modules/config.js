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

  // ABI Holders (to be loaded dynamically)
  ERC20_ABI: null,
  AIRDROP_ABI: null,

  // Utility to load ABI files
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
