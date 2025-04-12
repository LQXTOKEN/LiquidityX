// js/config.js

// ✅ Addresses
const LQX_ADDRESS = "0x9e27f48659b1005b1abc0f58465137e531430d4b";
const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";

// ✅ ABI
const LQX_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];

// ✅ Requirements
const LQX_REQUIRED = ethers.utils.parseUnits("1000", 18);

// ✅ Regex
const POLYGONSCAN_REGEX = /token\/(0x[a-fA-F0-9]{40})/;

// ✅ Export
export { LQX_ADDRESS, PROXY_URL, LQX_ABI, LQX_REQUIRED, POLYGONSCAN_REGEX };
