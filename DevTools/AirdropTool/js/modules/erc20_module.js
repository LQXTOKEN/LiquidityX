// js/modules/erc20_module.js

const erc20Module = (function () {
  async function getERC20Balance(provider, tokenAddress, userAddress) {
    try {
      const contract = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      return balance;
    } catch (error) {
      console.error("[erc20_module.js] Error fetching ERC-20 balance:", error);
      throw error;
    }
  }

  async function approveERC20(token, spenderAddress, amount, signer) {
    try {
      const contract = token.contract.connect(signer);
      const tx = await contract.approve(spenderAddress, amount);
      uiModule.log("info", `⛽ Approve TX sent: ${tx.hash}`);
      await tx.wait();
      uiModule.log("info", `✅ Approved successfully.`);
      return tx;
    } catch (error) {
      console.error("[erc20_module.js] Approval failed:", error);
      uiModule.log("error", "❌ Approval failed: " + error.message);
      throw error;
    }
  }

  async function getERC20Decimals(provider, tokenAddress) {
    try {
      const contract = new ethers.Contract(tokenAddress, CONFIG.ERC20_ABI, provider);
      const decimals = await contract.decimals();
      return decimals;
    } catch (error) {
      console.error("[erc20_module.js] Error getting token decimals:", error);
      throw error;
    }
  }

  async function getLQXBalance(provider, userAddress) {
    return await getERC20Balance(provider, CONFIG.LQX_TOKEN_ADDRESS, userAddress);
  }

  return {
    getERC20Balance,
    approveERC20,
    getERC20Decimals,
    getLQXBalance
  };
})();

window.erc20Module = erc20Module;
