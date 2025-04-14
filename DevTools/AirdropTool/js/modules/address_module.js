// js/modules/address_module.js

window.addressModule = (function () {
  async function fetchAddresses(mode) {
    if (mode === "paste") {
      const input = document.getElementById("polygonScanInput").value.trim();
      const lines = input.split("\n").map(line => line.trim());
      const addresses = lines.filter(line => /^0x[a-fA-F0-9]{40}$/.test(line));
      return addresses;
    }

    if (mode === "create") {
      const tokenAddress = document.getElementById("contractInput").value.trim();
      const max = parseInt(document.getElementById("maxCreateAddresses").value, 10);
      const url = `https://proxy-git-main-lqxtokens-projects.vercel.app/api/polygon?contract=${tokenAddress}&limit=${max}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      return data?.addresses || [];
    }

    if (mode === "random") {
      const max = parseInt(document.getElementById("maxAddresses").value, 10);
      const res = await fetch("/abis/active_polygon_wallets.json");
      const data = await res.json();
      return data?.slice(0, max) || [];
    }

    return [];
  }

  return {
    fetchAddresses
  };
})();
