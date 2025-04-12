import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/+esm";

let selectedTokenContract;
let selectedTokenSymbol = "";
let selectedTokenDecimals = 18;

export async function checkERC20Token(tokenAddress, provider, userAddress) {
  const infoEl = document.getElementById("token-info");

  if (!ethers.utils.isAddress(tokenAddress)) {
    alert("❌ Please enter a valid ERC-20 token address.");
    return;
  }

  try {
    const abi = [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address account) view returns (uint256)"
    ];

    selectedTokenContract = new ethers.Contract(tokenAddress, abi, provider);

    const symbol = await selectedTokenContract.symbol();
    const decimals = await selectedTokenContract.decimals();
    const balanceRaw = await selectedTokenContract.balanceOf(userAddress);
    const balanceFormatted = ethers.utils.formatUnits(balanceRaw, decimals);

    selectedTokenSymbol = symbol;
    selectedTokenDecimals = decimals;

    infoEl.innerText = `✅ Token: ${symbol} | Decimals: ${decimals} | 💰 Balance: ${balanceFormatted} ${symbol}`;
  } catch (err) {
    console.error("Token check error:", err);
    infoEl.innerText = "❌ Failed to fetch token info.";
  }
}

export function getSelectedTokenDetails() {
  return {
    contract: selectedTokenContract,
    symbol: selectedTokenSymbol,
    decimals: selectedTokenDecimals
  };
}
