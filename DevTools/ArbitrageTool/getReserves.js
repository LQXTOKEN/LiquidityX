// 📁 getreserves.js
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { CONFIG } from "./config.js";

export async function fetchReserves(provider) {
  const abi = ["function getReserves() external view returns (uint112, uint112, uint32)"];
  const results = [];

  for (const pair of CONFIG.PAIRS) {
    const contract = new ethers.Contract(pair.address, abi, provider);
    const [reserve0, reserve1] = await contract.getReserves();
    results.push({
      tokenA: pair.tokenA,
      tokenB: pair.tokenB,
      reserveA: reserve0.toString(),
      reserveB: reserve1.toString(),
      address: pair.address
    });
  }
  return results;
}
