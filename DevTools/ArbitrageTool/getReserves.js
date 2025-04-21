const { ethers } = require('ethers');
const config = require('./config');

async function getReserves(pairAddress) {
  const abi = ["function getReserves() external view returns (uint112, uint112, uint32)"];
  const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
  const pair = new ethers.Contract(pairAddress, abi, provider);
  const [r0, r1] = await pair.getReserves();
  return { reserve0: r0.toString(), reserve1: r1.toString() };
}

module.exports = getReserves;
