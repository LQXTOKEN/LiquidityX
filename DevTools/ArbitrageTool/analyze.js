const getReserves = require('./getReserves');

async function analyzePairs(pairs) {
  const results = [];
  for (const pair of pairs) {
    const reserves = await getReserves(pair.address);
    results.push({
      tokenA: pair.tokenA,
      tokenB: pair.tokenB,
      reservesA: reserves.reserve0,
      reservesB: reserves.reserve1,
      address: pair.address
    });
  }
  return results;
}

module.exports = analyzePairs;
