// js/modules/token_module.js

window.tokenModule = (function () {
  function getTokenContract(tokenAddress, provider) {
    const abi = [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address owner) view returns (uint256)"
    ];
    return new ethers.Contract(tokenAddress, abi, provider);
  }

  async function getTokenDetails(tokenAddress, provider) {
    try {
      const contract = getTokenContract(tokenAddress, provider);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      return { contract, symbol, decimals };
    } catch (error) {
      console.error("Token metadata fetch failed:", error);
      return null;
    }
  }

  async function getFormattedBalance(contract, userAddress, decimals) {
    try {
      const raw = await contract.balanceOf(userAddress);
      return ethers.utils.formatUnits(raw, decimals);
    } catch (error) {
      console.error("Balance read failed:", error);
      return "0";
    }
  }

  return {
    getTokenContract,
    getTokenDetails,
    getFormattedBalance
  };
})();
