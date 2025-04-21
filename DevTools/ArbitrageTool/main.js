async function startAnalysis() {
  const provider = new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
  const output = document.getElementById("output");

  const pairs = [
    [CONFIG.TOKENS.WMATIC, CONFIG.TOKENS.USDC],
    [CONFIG.TOKENS.USDC, CONFIG.TOKENS.QUICK],
    [CONFIG.TOKENS.QUICK, CONFIG.TOKENS.WMATIC]
  ];

  const reserves = [];
  for (const [a, b] of pairs) {
    const result = await getReserves(provider, a, b);
    if (result) reserves.push(result);
  }

  const opps = analyzeOpportunities(reserves);
  output.innerHTML = opps.length
    ? `<pre>${JSON.stringify(opps, null, 2)}</pre>`
    : "❌ No arbitrage opportunities found.";
}
