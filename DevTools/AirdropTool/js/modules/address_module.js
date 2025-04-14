// js/modules/address_module.js

window.addressModule = (function () {
  const PROXY_BASE = "https://proxy-git-main-lqxtokens-projects.vercel.app"; // ✅ Σωστό proxy

  async function fetchAddresses(mode) {
    console.log("[addressModule] Fetching addresses for mode:", mode);

    if (mode === "random") {
      const response = await fetch(`${PROXY_BASE}/abis/active_polygon_wallets.json`);
      if (!response.ok) throw new Error("Failed to load random addresses");
      const data = await response.json();
      return data.addresses?.slice(0, 1000) || [];
    }

    if (mode === "create") {
      const contractAddress = document.getElementById("contractInput").value.trim();
      const max = parseInt(document.getElementById("maxCreateAddresses").value.trim());

      if (!contractAddress || isNaN(max) || max < 1) {
        throw new Error("Invalid input for create mode");
      }

      const res = await fetch(`${PROXY_BASE}/api/polygon?contract=${contractAddress}&max=${max}`);
      const json = await res.json();
      return json.addresses || [];
    }

    if (mode === "paste") {
      const input = document.getElementById("polygonScanInput").value.trim();
      return input.split("\n").map(addr => addr.trim()).filter(addr => addr);
    }

    throw new Error("Invalid mode");
  }

  return {
    fetchAddresses
  };
})();
