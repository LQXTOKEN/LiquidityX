// js/modules/address_module.js

window.addressModule = {
  async getAddresses(mode) {
    console.log(`[addressModule] Fetching addresses with mode: ${mode}`);

    if (mode === "paste") {
      const input = document.getElementById("polygonScanInput");
      if (!input || !input.value) return [];
      const raw = input.value.trim();
      let addresses = [];

      // Regex για διευθύνσεις
      const regex = /0x[a-fA-F0-9]{40}/g;
      const matches = raw.match(regex);
      if (matches) {
        addresses = [...new Set(matches.map(a => a.toLowerCase()))];
      }

      return addresses;

    } else if (mode === "random") {
      const count = parseInt(document.getElementById("maxAddresses").value || "0");
      const res = await fetch(window.CONFIG.ACTIVE_WALLETS_URL);
      const json = await res.json();
      let all = json.addresses || [];
      if (count > 0 && count < all.length) {
        all = all.sort(() => 0.5 - Math.random()).slice(0, count);
      }
      console.log(`[addressModule] Random mode: ${all.length} addresses`);
      return all;

    } else if (mode === "create") {
      const contract = document.getElementById("contractInput").value.trim();
      const max = parseInt(document.getElementById("maxCreateAddresses").value || "0");

      if (!/^0x[a-fA-F0-9]{40}$/.test(contract)) {
        console.error("[addressModule] Invalid contract address");
        return [];
      }

      const url = `${window.CONFIG.PROXY_API_URL}?contract=${contract}&max=${max}`;
      try {
        const res = await fetch(url, { method: "POST" });
        const json = await res.json();
        if (json && Array.isArray(json.addresses)) {
          const unique = [...new Set(json.addresses.map(a => a.toLowerCase()))];
          console.log(`[addressModule] Create mode: ${unique.length} addresses`);
          return unique;
        } else {
          console.warn("[addressModule] Invalid response from proxy");
          return [];
        }
      } catch (err) {
        console.error("[addressModule] Failed to fetch holders:", err);
        return [];
      }
    }

    return [];
  }
};
