import { ethers } from "ethers";

// 🎯 Βασικά Στοιχεία LQX Token
export const LQX_ADDRESS = "0x9e27f48659b1005b1abc0f58465137e531430d4b";
export const LQX_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];
export const LQX_REQUIRED = ethers.utils.parseUnits("1000", 18); // 1000 LQX

// 🌐 Polygon RPC & Chain Info
export const POLYGON_MAINNET_CHAIN_ID = "0x89"; // Decimal: 137
export const POLYGON_RPC_URL = "https://polygon-rpc.com/";
export const POLYGON_BLOCK_EXPLORER = "https://polygonscan.com";

// 🧩 Proxy Server (secured via Vercel)
export const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";

// 📦 Διαδρομές API και JSON
export const RANDOM_WALLETS_JSON_URL = `${PROXY_URL}/abis/active_polygon_wallets.json`;
export const POLYGONSCAN_PROXY_ENDPOINT = `${PROXY_URL}/api/polygon`;

// 🧾 UI Labels / Tokens
export const MAX_ADDRESS_LIMIT = 1000;
