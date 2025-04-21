function analyzeReserves(pairs) {
  const tokenIndex = {};
  const prices = {};
  const opportunities = [];

  // Δημιουργία index για εύκολη πρόσβαση
  for (const pair of pairs) {
    const key = `${pair.tokenA}_${pair.tokenB}`;
    const reverseKey = `${pair.tokenB}_${pair.tokenA}`;
    
    tokenIndex[key] = pair;
    tokenIndex[reverseKey] = {
      tokenA: pair.tokenB,
      tokenB: pair.tokenA,
      reserveA: pair.reserveB,
      reserveB: pair.reserveA,
      pairAddress: pair.pairAddress
    };

    // Υπολογισμός τιμής A/B
    const price = parseFloat(pair.reserveB) / parseFloat(pair.reserveA);
    prices[key] = price;
    prices[reverseKey] = 1 / price;
  }

  // Κυκλική διαδρομή WMATIC → USDC → QUICK → WMATIC
  const route = ["WMATIC", "USDC", "QUICK", "WMATIC"];
  const key1 = `${route[0]}_${route[1]}`;
  const key2 = `${route[1]}_${route[2]}`;
  const key3 = `${route[2]}_${route[3]}`;

  if (prices[key1] && prices[key2] && prices[key3]) {
    const totalRate = prices[key1] * prices[key2] * prices[key3];
    const profitPercent = (totalRate - 1) * 100;

    if (profitPercent > 0.2) {
      opportunities.push({
        path: route,
        profitPercent: profitPercent.toFixed(2),
        details: {
          price1: prices[key1],
          price2: prices[key2],
          price3: prices[key3],
          totalRate: totalRate.toFixed(6)
        }
      });
    }
  }

  return opportunities;
}

module.exports = analyzeReserves;
