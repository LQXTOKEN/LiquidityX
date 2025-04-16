// js/modules/token_module.js

const tokenModule = {
  async loadToken(tokenAddress) {
    if (!window.ethereum || !ethers) throw new Error("Ethereum provider not found");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, provider);

    try {
      const [symbol, decimals] = await Promise.all([
        contract.symbol(),
        contract.decimals()
      ]);

      const tokenData = {
        contractAddress: tokenAddress,
        contract,
        symbol,
        decimals
      };

      window.selectedToken = tokenData;
      return tokenData;

    } catch (err) {
      console.error("[tokenModule] ❌ Failed to load token", err);
      throw new Error("Token load failed");
    }
  }
};
