window.analyzeOpportunities = function (reserves) {
  const opportunities = [];

  // Παράδειγμα: απλός υπολογισμός πιθανής arbitrage διαδρομής
  const price1 = reserves[0].reserveB / reserves[0].reserveA;
  const price2 = reserves[1].reserveB / reserves[1].reserveA;
  const price3 = reserves[2].reserveA / reserves[2].reserveB;

  const cycle = price1 * price2 * price3;
  const profit = cycle - 1;

  if (profit > 0.002) {
    opportunities.push({
      path: [reserves[0].tokenA, reserves[1].tokenB, reserves[2].tokenA],
      profit: profit * 100
    });
  }

  return opportunities;
};
