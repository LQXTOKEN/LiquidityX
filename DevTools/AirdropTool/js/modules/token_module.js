// js/token_module.js

export async function getTokenDetails(tokenAddress, provider) {
  const abi = [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)"
  ];

  try {
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    return { contract, symbol, decimals };
  } catch (error) {
    console.error("Token metadata fetch failed:", error);
    return null;
  }
}

export async function getFormattedBalance(contract, userAddress, decimals) {
  try {
    const raw = await contract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(raw, decimals);
    return formatted;
  } catch (error) {
    console.error("Balance read failed:", error);
    return "0";
  }
}
