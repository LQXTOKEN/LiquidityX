// js/modules/address_module.js

window.addressModule = (function () {
  function extractTokenAddress(url) {
    const regex = /address\/(0x[a-fA-F0-9]{40})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  function isValidAddress(addr) {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }

  return {
    extractTokenAddress,
    isValidAddress
  };
})();
