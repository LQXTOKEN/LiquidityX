import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/+esm";

const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";

export async function extractAddressesFromPolygonScan(scanLink, maxCount = 100) {
  const regex = /token\/(0x[a-fA-F0-9]{40})/;
  const match = scanLink.match(regex);

  if (!match) {
    throw new Error("❌ Invalid PolygonScan token link.");
  }

  const tokenAddress = match[1];
  const apiURL = `${PROXY_URL}/api/polygon?token=${tokenAddress}`;

  const res = await fetch(apiURL);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "❌ Failed to fetch from proxy.");
  }

  return data.addresses.slice(0, maxCount);
}

export async function loadRandomAddresses(count = 100) {
  const res = await fetch(`${PROXY_URL}/abis/active_polygon_wallets.json`);
  const data = await res.json();
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function parsePastedAddresses(inputText) {
  return inputText
    .trim()
    .split(/\s+/)
    .filter(addr => ethers.utils.isAddress(addr));
}

export function downloadAddressList(addressList) {
  const blob = new Blob([addressList.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "airdrop_addresses.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
