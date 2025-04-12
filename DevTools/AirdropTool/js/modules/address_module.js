// js/address_module.js

export function extractTokenAddress(url) {
  const regex = /address\\/(0x[a-fA-F0-9]{40})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function isValidAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}
