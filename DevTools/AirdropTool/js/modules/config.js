import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.2.umd.min.js';

// ======================
// Token Configuration
// ======================
export const TOKEN_CONFIG = {
  LQX: {
    ADDRESS: "0x9e27f48659b1005b1abc0f58465137e531430d4b",
    ABI: [
      "function balanceOf(address account) external view returns (uint256)",
      // Consider adding other frequently used functions:
      // "function decimals() external view returns (uint8)",
      // "function symbol() external view returns (string)"
    ],
    REQUIRED_BALANCE: ethers.utils.parseUnits("1000", 18)
  }
};

// ======================
// Network Configuration
// ======================
export const NETWORKS = {
  POLYGON: {
    MAINNET: {
      RPC_URL: "https://polygon-rpc.com/",
      CHAIN_ID: "0x89",     // 137 in decimal
      CHAIN_ID_DECIMAL: 137,
      NAME: "Polygon Mainnet",
      CURRENCY: "MATIC",
      BLOCK_EXPLORER: "https://polygonscan.com"
    },
    TESTNET: {
      RPC_URL: "https://rpc-mumbai.maticvigil.com/",
      CHAIN_ID: "0x13881",  // 80001 in decimal
      CHAIN_ID_DECIMAL: 80001,
      NAME: "Polygon Mumbai Testnet",
      CURRENCY: "MATIC",
      BLOCK_EXPLORER: "https://mumbai.polygonscan.com"
    }
  }
};

// ======================
// API Configuration
// ======================
export const API_CONFIG = {
  PROXY: {
    BASE_URL: "https://proxy-git-main-lqxtokens-projects.vercel.app",
    ENDPOINTS: {
      WALLETS: "/abis/active_polygon_wallets.json",
      // Add other potential endpoints here
    }
  }
};

// ======================
// Legacy Exports (for backward compatibility)
// ======================
export const LQX_ADDRESS = TOKEN_CONFIG.LQX.ADDRESS;
export const LQX_ABI = TOKEN_CONFIG.LQX.ABI;
export const LQX_REQUIRED = TOKEN_CONFIG.LQX.REQUIRED_BALANCE;
export const POLYGON_RPC_URL = NETWORKS.POLYGON.MAINNET.RPC_URL;
export const POLYGON_MAINNET_CHAIN_ID = NETWORKS.POLYGON.MAINNET.CHAIN_ID;
export const POLYGON_TESTNET_CHAIN_ID = NETWORKS.POLYGON.TESTNET.CHAIN_ID;
export const PROXY_URL = API_CONFIG.PROXY.BASE_URL;
