// modules/erc20_module.js

import { ethers } from "ethers";

let selectedTokenContract;
let selectedTokenSymbol = "";
let selectedTokenDecimals = 18;
let provider, signer, userAddress;

export function setProviderData(_provider, _signer, _userAddress) {
  provider = _provider;
  signer = _signer;
  userAddress = _userAddress;
}

export async function checkTokenInfo(tokenAddress) {
  const infoEl = document.getElementById("token-info");

  if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
    alert("❌ Please enter a valid ERC-20 contract address.");
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
