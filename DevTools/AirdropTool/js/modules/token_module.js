import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/+esm";

// Token state management
const tokenState = {
    contract: null,
    symbol: "",
    decimals: 18,
    balance: "0",
    address: ""
};

// Standard ERC-20 ABI for common functions
const ERC20_ABI = [
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address account) view returns (uint256)",
    "function totalSupply() view returns (uint256)"
];

export async function checkERC20Token(tokenAddress, provider, userAddress) {
    const infoEl = document.getElementById("token-info");
    
    try {
        // Validate input
        if (!ethers.utils.isAddress(tokenAddress)) {
            throw new Error("Invalid ERC-20 token address");
        }

        // Initialize contract
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        // Parallelize token info fetching
        const [symbol, decimals, balanceRaw] = await Promise.all([
            contract.symbol(),
            contract.decimals(),
            contract.balanceOf(userAddress)
        ]);

        // Format balance
        const balanceFormatted = ethers.utils.formatUnits(balanceRaw, decimals);

        // Update state
        tokenState.contract = contract;
        tokenState.symbol = symbol;
        tokenState.decimals = decimals;
        tokenState.balance = balanceFormatted;
        tokenState.address = tokenAddress;

        // Update UI
        infoEl.innerHTML = `
            <span class="success">✅ Token Verified</span><br>
            <strong>${symbol}</strong> | 
            Decimals: ${decimals} | 
            Balance: <strong>${balanceFormatted} ${symbol}</strong>
        `;

        return {
            success: true,
            ...tokenState
        };
        
    } catch (err) {
        console.error("Token check error:", err);
        resetTokenState();
        infoEl.innerHTML = `
            <span class="error">❌ ${err.message || "Failed to fetch token info"}</span>
            ${infoEl.innerHTML.includes("Previously verified") ? 
              "<br><small>Previously verified token data cleared</small>" : ""}
        `;
        return {
            success: false,
            error: err.message
        };
    }
}

export function getSelectedTokenDetails() {
    return {
        ...tokenState,
        hasToken: !!tokenState.contract
    };
}

// Helper function to reset token state
function resetTokenState() {
    tokenState.contract = null;
    tokenState.symbol = "";
    tokenState.decimals = 18;
    tokenState.balance = "0";
    tokenState.address = "";
}
