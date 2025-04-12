import { ethers } from "ethers";

// Token state management
const tokenState = {
  contract: null,
  symbol: "",
  decimals: 18,
  balance: "0"
};

// Provider references
let provider, signer, userAddress;

// Standard ERC-20 ABI for common functions
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

export function setProviderData(_provider, _signer, _userAddress) {
  provider = _provider;
  signer = _signer;
  userAddress = _userAddress;
}

export async function checkTokenInfo(tokenAddress) {
  const infoEl = document.getElementById("token-info");
  
  try {
    // Validate input
    if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
      throw new Error("Invalid ERC-20 contract address");
    }

    // Initialize contract
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Parallelize token info fetching
    const [symbol, decimals, balanceRaw] = await Promise.all([
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(userAddress)
    ]);

    // Format balance
    const balanceFormatted = ethers.utils.formatUnits(balanceRaw, decimals);

    // Update state
    tokenState.contract = contract;
    tokenState.symbol = symbol;
    tokenState.decimals = decimals;
    tokenState.balance = balanceFormatted;

    // Update UI
    infoEl.innerHTML = `
      <span class="success">✅ Token Verified</span><br>
      <strong>${symbol}</strong> | 
      Decimals: ${decimals} | 
      Balance: <strong>${balanceFormatted} ${symbol}</strong>
    `;

    return true;
    
  } catch (err) {
    console.error("Token check error:", err);
    resetTokenState();
    infoEl.innerHTML = `<span class="error">❌ ${err.message || "Failed to fetch token info"}</span>`;
    return false;
  }
}

export function getSelectedTokenDetails() {
  return {
    contract: tokenState.contract,
    symbol: tokenState.symbol,
    decimals: tokenState.decimals,
    balance: tokenState.balance
  };
}

// Helper functions
function resetTokenState() {
  tokenState.contract = null;
  tokenState.symbol = "";
  tokenState.decimals = 18;
  tokenState.balance = "0";
}
