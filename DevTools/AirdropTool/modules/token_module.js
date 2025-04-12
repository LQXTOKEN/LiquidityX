// js/modules/token_module.js

export let selectedToken = null;
export let selectedTokenSymbol = "";
export let selectedTokenDecimals = 18;

export async function checkSelectedToken(tokenAddress, userAddress, provider) {
  const infoEl = document.getElementById("token-info");

  if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
    infoEl.innerText = "❌ Please enter a valid ERC-20 contract address.";
    return false;
  }

  try {
    const abi = [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address account) view returns (uint256)"
    ];

    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(userAddress);
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    selectedToken = contract;
    selectedTokenSymbol = symbol;
    selectedTokenDecimals = decimals;

    infoEl.innerText = `✅ Token: ${symbol} | Decimals: ${decimals} | 💰 Balance: ${formattedBalance} ${symbol}`;
    return true;
  } catch (err) {
    console.error("Token check failed:", err);
    infoEl.innerText = "❌ Failed to fetch token info.";
    return false;
  }
}
