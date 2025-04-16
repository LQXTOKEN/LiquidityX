// js/modules/address_module.js

window.addressModule = (function () {
  async function fetchAddresses(mode) {
    console.log("[addressModule] Fetching addresses for mode:", mode);
    if (mode === "paste") {
      return getAddressesFromPaste();
    } else if (mode === "create") {
      return await getAddressesFromHolders();
    } else if (mode === "random") {
      return generateRandomAddresses();
    } else {
      throw new Error("Invalid mode");
    }
  }

  function getAddressesFromPaste() {
    const raw = document.getElementById("polygonScanInput").value;
    const lines = raw.split("\n").map((line) => line.trim());
    const addresses = [...new Set(lines.filter((line) => ethers.utils.isAddress(line)))];
    console.log("[addressModule] Paste mode - found valid:", addresses.length);
    return addresses;
  }

  async function getAddressesFromHolders() {
    const contractAddress = document.getElementById("contractInput").value.trim();
    const max = parseInt(document.getElementById("maxCreateAddresses").value || "100");

    if (!ethers.utils.isAddress(contractAddress)) {
      throw new Error("Invalid token address");
    }

    const url = `${CONFIG.PROXY_API}/api/polygon?contract=${contractAddress}&max=${max}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch holders");
    const json = await res.json();
    console.log("[addressModule] Create mode - fetched:", json.length);
    return json;
  }

  function generateRandomAddresses(count = 100) {
    const max = parseInt(document.getElementById("maxAddresses").value || "100");
    const addresses = [];
    for (let i = 0; i < max; i++) {
      const bytes = ethers.utils.randomBytes(20);
      const address = ethers.utils.getAddress(ethers.utils.hexlify(bytes));
      addresses.push(address);
    }
    console.log("[addressModule] Random mode - generated:", addresses.length);
    return addresses;
  }

  return {
    fetchAddresses
  };
})();
