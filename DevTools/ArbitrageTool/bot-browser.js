// Ρυθμίσεις (επεξεργαστείτε αυτά)
const CONFIG = {
  CONTRACT_ADDRESS: "0x...", // Your deployed contract
  RPC_URL: "https://your-vercel-proxy.vercel.app/api", // Vercel proxy
  MIN_PROFITABILITY: 0.2, // 0.2%
  TOKENS: {
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    QUICK: "0x831753DD7087CaC61aB5644b308642cc1c33Dc13"
  }
};

class SafeArbitrageBot {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
    this.logElement = document.getElementById('logs');
    this.statusElement = document.getElementById('status');
  }

  async run() {
    this._log("🔄 Scanning for arbitrage opportunities...");
    
    // Σύνδεση με Metamask
    await this._connectWallet();
    
    setInterval(async () => {
      try {
        const opportunity = await this._findOpportunity();
        if (opportunity) {
          await this._executeTrade(opportunity);
        }
      } catch (error) {
        this._log(`🔴 Error: ${error.message}`);
      }
    }, 15000); // Έλεγχος κάθε 15 δευτερόλεπτα
  }

  async _connectWallet() {
    if (!window.ethereum) throw new Error("Metamask not installed");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
    this.contract = new ethers.Contract(
      CONFIG.CONTRACT_ADDRESS,
      [
        "function executeArbitrage(address[] path, uint256 amountIn, uint256 minOut) external",
        "event ArbitrageExecuted(address indexed token, uint256 profit)"
      ],
      this.signer
    );
    this._log("🔗 Connected to Metamask");
  }

  async _findOpportunity() {
    // Χρήση DexScreener API μέσω Vercel proxy
    const response = await fetch(`https://your-vercel-proxy.vercel.app/dex-api/latest/dex/pairs/polygon`);
    const data = await response.json();
    
    // Απλοποιημένη λογική arbitrage (WMATIC → USDC → QUICK → WMATIC)
    const path = [
      CONFIG.TOKENS.WMATIC,
      CONFIG.TOKENS.USDC,
      CONFIG.TOKENS.QUICK,
      CONFIG.TOKENS.WMATIC
    ];
    
    // Προσομοίωση υπολογισμού κέρδους (πραγματική υλοποίηση χρειάζεται oracle)
    const simulatedProfit = 0.25; // 0.25%
    
    if (simulatedProfit >= CONFIG.MIN_PROFITABILITY) {
      return {
        path,
        amountIn: ethers.utils.parseUnits("10", 18), // 10 MATIC
        minOut: ethers.utils.parseUnits("10.02", 18) // 0.2% κέρδος
      };
    }
    return null;
  }

  async _executeTrade(opportunity) {
    this._log("⚡ Executing trade...");
    const tx = await this.contract.executeArbitrage(
      opportunity.path,
      opportunity.amountIn,
      opportunity.minOut
    );
    
    this._log(`✅ TX submitted: <a href="https://polygonscan.com/tx/${tx.hash}" target="_blank">${tx.hash}</a>`);
    const receipt = await tx.wait();
    this._log(`🎉 Confirmed in block ${receipt.blockNumber}`);
  }

  _log(message) {
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
    this.logElement.prepend(logEntry);
    this.statusElement.textContent = `Status: ${message.substring(0, 30)}...`;
  }
}
