// js/modules/address_module.js
//
// 📦 Περιγραφή: Παράγει ή φορτώνει wallet addresses για το airdrop εργαλείο, ανά mode (paste, create, random).
// ✅ Περιλαμβάνει: filtering null, empty, μη έγκυρων διευθύνσεων.

window.addressModule = (function () {
  async function fetchAddresses(mode) {
    console.log("[addressModule] Fetching addresses for mode:", mode);

    if (mode === "paste") {
      const raw = document.getElementById("polygonScanInput").value;
      return cleanAddresses(raw.split("\n"));
    }

    if (mode === "create") {
      const contract = document.getElementById("contractInput").value.trim();
      const max = parseInt(document.getElementById("maxCreateAddresses").value, 10);
      const fetched = await getAddressesFromHolders(contract, max);
      return cleanAddresses(fetched);
    }

    if (mode === "random") {
      const max = parseInt(document.getElementById("maxAddresses").value, 10);
      return generateRandomAddresses(max);
    }

    return [];
  }

  async function getAddressesFromHolders(contract, max = 1000) {
    try {
      if (!CONFIG.PROXY_API_URL) throw new Error("PROXY_API_URL is not defined");

      const url = `${CONFIG.PROXY_API_URL}?contract=${contract}&max=${max}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch holders");
      }

      const data = await res.json();
      const addresses = data.addresses || [];
      const limited = addresses.slice(0, max);

      console.log(`[addressModule] Create mode - fetched: ${limited.length}`);
      return limited;
    } catch (err) {
      console.error("[getAddressesFromHolders] ❌", err);
      throw err;
    }
  }

  function generateRandomAddresses(count) {
    const addresses = [];
    for (let i = 0; i < count; i++) {
      const rand = ethers.Wallet.createRandom().address;
      addresses.push(rand);
    }

    console.log("[addressModule] Random mode - generated:", addresses.length);
    return addresses;
  }

  function cleanAddresses(inputArray) {
    const cleaned = inputArray
      .map(addr => addr.trim())
      .filter(addr =>
        addr &&
        addr !== ethers.constants.AddressZero &&
        ethers.utils.isAddress(addr)
      );

    console.log(`[addressModule] Cleaned addresses: ${cleaned.length}`);
    return cleaned;
  }

  return {
    fetchAddresses
  };
})();
