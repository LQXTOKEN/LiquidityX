// js/modules/address_module.js

window.addressModule = (function () {
  const MAX_LIMIT = 1000;

  async function fetchAddresses(mode) {
    try {
      console.log("[addressModule] Fetching addresses with mode:", mode);

      if (mode === "paste") {
        const raw = document.getElementById("polygonScanInput").value.trim();
        const lines = raw.split("\n").map(addr => addr.trim()).filter(Boolean);
        const unique = [...new Set(lines)].slice(0, MAX_LIMIT);
        console.log("[addressModule] Paste mode: ", unique.length, "addresses");
        return unique;
      }

      if (mode === "random") {
        const limit = parseInt(document.getElementById("maxAddresses").value, 10) || 100;
        const response = await fetch("https://proxy-git-main-lqxtokens-projects.vercel.app/abis/active_polygon_wallets.json");
        const data = await response.json();
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(limit, MAX_LIMIT));
        console.log("[addressModule] Random mode:", selected.length, "addresses");
        return selected;
      }

      if (mode === "create") {
        const contract = document.getElementById("contractInput").value.trim();
        const limit = parseInt(document.getElementById("maxCreateAddresses").value, 10) || 100;

        const proxyUrl = "https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon";
        const urlWithParams = proxyUrl + "?contract=" + encodeURIComponent(contract);

        const response = await fetch(urlWithParams, {
          method: "GET",
          headers: { "Accept": "application/json" }
        });

        const result = await response.json();
        const addresses = [...new Set(result.addresses || [])].slice(0, Math.min(limit, MAX_LIMIT));
        console.log("[addressModule] Create mode:", addresses.length, "addresses");
        return addresses;
      }

      return [];
    } catch (error) {
      console.error("[addressModule] Fetch error:", error);
      throw error;
    }
  }

  return {
    fetchAddresses
  };
})();
