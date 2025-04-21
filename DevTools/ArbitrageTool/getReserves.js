window.getReserves = async function (provider, tokenA, tokenB) {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase()
    ? [tokenA, tokenB]
    : [tokenB, tokenA];

  const factory = new ethers.Contract(
    CONFIG.FACTORY_ADDRESS,
    ["function getPair(address, address) external view returns (address)"],
    provider
  );

  const pairAddress = await factory.getPair(token0, token1);
  if (pairAddress === ethers.constants.AddressZero) return null;

  const pair = new ethers.Contract(
    pairAddress,
    ["function getReserves() external view returns (uint112, uint112, uint32)"],
    provider
  );

  const [reserve0, reserve1] = await pair.getReserves();
  return {
    tokenA,
    tokenB,
    reserveA: tokenA.toLowerCase() === token0.toLowerCase() ? reserve0 : reserve1,
    reserveB: tokenA.toLowerCase() === token0.toLowerCase() ? reserve1 : reserve0,
    pairAddress
  };
};
