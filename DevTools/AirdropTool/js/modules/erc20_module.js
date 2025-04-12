// js/erc20_module.js

import { CONFIG } from './config.js';

export async function getTokenContract(address, provider) {
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];
  return new ethers.Contract(address, abi, provider);
}

export async function getERC20Balance(tokenAddress, userAddress, provider) {
  try {
    const contract = await getTokenContract(tokenAddress, provider);
    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const formatted = ethers.utils.formatUnits(rawBalance, decimals);
    return {
      raw: rawBalance,
      formatted,
      decimals,
      symbol: await contract.symbol()
    };
  } catch (error) {
    console.error("Error fetching ERC-20 balance:", error);
    return null;
  }
}
