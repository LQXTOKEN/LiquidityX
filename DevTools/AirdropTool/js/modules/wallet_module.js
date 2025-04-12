// js/wallet_module.js

import { CONFIG } from './config.js';

let provider;
let signer;
let userAddress;

export async function connectWallet() {
  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      return { provider, signer, userAddress };
    } catch (error) {
      console.error("User rejected wallet connection:", error);
      return null;
    }
  } else {
    alert("MetaMask is not installed.");
    return null;
  }
}

export function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
}

export function isWalletConnected() {
  return !!userAddress;
}

export function getSigner() {
  return signer;
}

export function getProvider() {
  return provider;
}

export function getUserAddress() {
  return userAddress;
}
