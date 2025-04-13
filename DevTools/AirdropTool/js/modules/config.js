// config.js

const CONFIG = {
  ABI_PATHS: {
    ERC20: "https://liquidityx.io/DevTools/AirdropTool/abis/erc20_abi.json",
    AIRDROP: "https://liquidityx.io/DevTools/AirdropTool/abis/airdrop_abi.json"
  },
  AirdropContract: {
    address: "0x2012508a1dbE6BE9c1B666eBD86431b326ef6EF6"
  },
  LQX: {
    address: "0x9E27F48659B1005b1aBc0F58465137E531430d4b",
    minimumRequired: "1000"
  },
  ProxyAPI: "https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon",
  RandomWalletList: "https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json"
};

async function loadAbis() {
  try {
    const [erc20Abi, airdropAbi] = await Promise.all([
      fetch(CONFIG.ABI_PATHS.ERC20).then(res => res.json()),
      fetch(CONFIG.ABI_PATHS.AIRDROP).then(res => res.json())
    ]);

    window.ERC20_ABI = erc20Abi;
    window.AIRDROP_ABI = airdropAbi;

    console.log("[config.js] ✅ ABIs loaded successfully");

    // Start app only if main.js loaded and defined initializeApp
    if (typeof window.initializeApp === "function") {
      window.initializeApp();
    } else {
      console.warn("[config.js] ⚠️ initializeApp not yet defined");
    }
  } catch (error) {
    console.error("[config.js] ❌ ABI loading error:", error);
  }
}

// Start loading ABIs immediately
loadAbis();
