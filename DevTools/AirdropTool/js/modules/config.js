// js/modules/config.js

// ✅ LQX token settings
export const LQX_ADDRESS = "0x9e27f48659b1005b1abc0f58465137e531430d4b";
export const LQX_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];
export const LQX_REQUIRED = ethers.utils.parseUnits("1000", 18);

// ✅ Proxy API & Random JSON wallet source
export const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";
export const RANDOM_WALLETS_JSON = `${PROXY_URL}/abis/active_polygon_wallets.json`;

// ✅ Polygon RPC fallback (σε περίπτωση που χρειαστεί custom provider)
export const POLYGON_RPC_URL = "https://polygon-rpc.com";

// ✅ Polygon chain IDs
export const POLYGON_MAINNET_CHAIN_ID = "0x89";      // Decimal 137
export const POLYGON_TESTNET_CHAIN_ID = "0x13881";   // Decimal 80001

// ✅ Regex για εξαγωγή token address από PolygonScan links
export const POLYGONSCAN_TOKEN_REGEX = /token\/(0x[a-fA-F0-9]{40})/;
