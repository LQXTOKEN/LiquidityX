// js/modules/config.js

window.CONFIG = {
  POLYGON_RPC: "https://polygon-rpc.com",

  // ✅ LQX ERC-20 token (χρησιμοποιείται για balance έλεγχο)
  LQX_TOKEN_ADDRESS: "0x9E27F48659B1005b1aBc0F58465137E531430d4b",

  // ✅ BatchAirdropUUPS Proxy Contract (ή Implementation, αν θέλεις να ελέγξεις κάτι αργότερα)
  STAKING_CONTRACT: "0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3",

  LQX_DECIMALS: 18,
  MIN_LQX_REQUIRED: 1000,
  PROXY_API_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon",
  ACTIVE_WALLETS_JSON: "https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json"
};
