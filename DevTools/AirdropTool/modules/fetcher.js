import { PROXY_URL } from "./config.js";

// 📦 Fetch airdrop addresses from PolygonScan via proxy
export async function fetchFromPolygonScan(tokenAddress) {
  const apiURL = `${PROXY_URL}/api/polygon?token=${tokenAddress}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiURL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.addresses)) {
      return data.addresses;
    }

    if (data.status === "1" && Array.isArray(data.result)) {
      return [...new Set(data.result.map(tx => tx.to.toLowerCase()))];
    }

    throw new Error(data.message || "Invalid format");

  } catch (error) {
    console.error("🛑 fetchFromPolygonScan error:", error);
    throw new Error("Failed to fetch addresses from proxy.");
  }
}

// 🎲 Load random addresses from JSON
export async function loadRandomAddresses(count = 100) {
  try {
    const res = await fetch(`${PROXY_URL}/abis/active_polygon_wallets.json`);
    const all = await res.json();
    const shuffled = all.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (err) {
    console.error("🛑 Failed to load random wallets:", err);
    throw new Error("Failed to load random wallets.");
  }
}
