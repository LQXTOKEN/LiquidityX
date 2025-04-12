// modules/config.js

// LQX Token Configuration
export const LQX_ADDRESS = "0x9e27f48659b1005b1abc0f58465137e531430d4b";
export const LQX_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];
export const LQX_REQUIRED = ethers.utils.parseUnits("1000", 18);

// Network Info
export const POLYGON_RPC_URL = "https://polygon-rpc.com/";
export const POLYGON_MAINNET_CHAIN_ID = "0x89";     // 137
export const POLYGON_TESTNET_CHAIN_ID = "0x13881";  // 80001

// Proxy API URL
export const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";
