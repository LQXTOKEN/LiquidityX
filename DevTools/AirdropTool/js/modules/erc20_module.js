// js/modules/erc20_module.js

window.erc20Module = (function () {
  function getTokenContract(address, provider) {
    return new ethers.Contract(address, window.ERC20_ABI, provider);
  }

  async function getERC20Balance(tokenAddress, userAddress, provider) {
    try {
      const contract = getTokenContract(tokenAddress, provider);
      const rawBalance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      const formatted = ethers.utils.formatUnits(rawBalance, decimals);
      const symbol = await contract.symbol();
      return { raw: rawBalance, formatted, decimals, symbol };
    } catch (error) {
      console.error("Error fetching ERC-20 balance:", error);
      return null;
    }
  }

  async function getLQXBalance(userAddress) {
    const provider = new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
    return await getERC20Balance(CONFIG.LQX_TOKEN_ADDRESS, userAddress, provider);
  }

  // ✅ ΝΕΑ: ERC-20 contract με signer για send.js
  function getERC20Contract(tokenAddress, signer) {
    return new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, signer);
  }

  // ✅ ΝΕΑ: Batch Airdrop Contract με signer
  function getBatchAirdropContract(signer) {
    return new ethers.Contract(CONFIG.BATCH_AIRDROP_ADDRESS, CONFIG.BATCH_AIRDROP_ABI, signer);
  }

  return {
    getTokenContract,
    getERC20Balance,
    getLQXBalance,
    getERC20Contract,         // ✅ required by send.js
    getBatchAirdropContract   // ✅ required by send.js & recovery
  };
})();
