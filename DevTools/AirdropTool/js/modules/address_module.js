// js/modules/address_module.js

window.addressModule = (function () {
  async function fetchAddresses(mode) {
    console.log("[addressModule] Fetching addresses for mode:", mode);

    if (mode === "paste") {
      const textarea = document.getElementById("polygonScanInput");
      const input = textarea.value.trim();

      if (!input) {
        uiModule.showError("❌ Please paste some addresses or a PolygonScan link.");
        return [];
      }

      // Αν είναι PolygonScan link
      if (input.includes("polygonscan.com")) {
        return await fetchFromPolygonscan(input);
      }

      // Εναλλακτικά: χειροκίνητα επικολλημένες διευθύνσεις
      const lines = input.split(/\r?\n/);
      const addresses = lines.map(l => l.trim()).filter(a => ethers.utils.isAddress(a));
      return [...new Set(addresses)].slice(0, 1000); // max 1000
    }

    if (mode === "create") {
      const contractInput = document.getElementById("contractInput").value.trim();
      const max = parseInt(document.getElementById("maxCreateAddresses").value);
      if (!ethers.utils.isAddress(contractInput)) {
        uiModule.showError("❌ Invalid token address.");
        return [];
      }

      const url = `${CONFIG.PROXY_API}/api/polygon?contract=${contractInput}&limit=${max}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        return data.addresses?.slice(0, 1000) || [];
      } catch (err) {
        console.error("[addressModule] Create fetch failed:", err);
        uiModule.showError("❌ Failed to fetch from backend.");
        return [];
      }
    }

    if (mode === "random") {
      const count = parseInt(document.getElementById("maxAddresses").value);
      return generateRandomAddresses(count);
    }

    uiModule.showError("❌ Invalid input mode");
    return [];
  }

  async function fetchFromPolygonscan(link) {
    try {
      const match = link.match(/token\/(0x[a-fA-F0-9]{40})/);
      if (!match) {
        uiModule.showError("❌ Could not extract contract address from URL.");
        return [];
      }

      const tokenAddress = match[1];
      const url = `${CONFIG.PROXY_API}/api/polygon?contract=${tokenAddress}&limit=1000`;

      const res = await fetch(url);
      const data = await res.json();
      return data.addresses?.slice(0, 1000) || [];
    } catch (err) {
      console.error("[addressModule] Polygonscan parsing error:", err);
      uiModule.showError("❌ Failed to parse or fetch from link.");
      return [];
    }
  }

  function generateRandomAddresses(count = 100) {
    const addresses = [];
    for (let i = 0; i < count; i++) {
      const randomBytes = ethers.utils.randomBytes(20);
      const address = ethers.utils.getAddress("0x" + Buffer.from(randomBytes).toString("hex"));
      addresses.push(address);
    }
    return addresses;
  }

  return {
    fetchAddresses
  };
})();
