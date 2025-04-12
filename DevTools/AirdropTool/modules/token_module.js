import { ethers } from "../libs/ethers.min.js";

let selectedToken = {
  address: null,
  contract: null,
  symbol: "",
  decimals: 18,
  balance: "0"
};

export async function checkERC20Token(provider, userAddress, tokenAddress) {
  if (!ethers.utils.isAddress(tokenAddress)) {
    throw new Error("Invalid ERC-20 address.");
  }

  const abi = [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)"
  ];

  const contract = new ethers.Contract(tokenAddress, abi, provider);
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const rawBalance = await contract.balanceOf(userAddress);
  const formatted = ethers.utils.formatUnits(rawBalance, decimals);

  selectedToken = {
    address: tokenAddress,
    contract,
    symbol,
    decimals,
    balance: formatted
  };

  return selectedToken;
}

export function getSelectedToken() {
  return selectedToken;
}
