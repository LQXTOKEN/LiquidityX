// js/ui_module.js

export function setWalletInfo(address, balanceFormatted, symbol) {
  document.getElementById("walletAddress").textContent = `Wallet: ${address}`;
  document.getElementById("lqxBalance").textContent = `LQX Balance: ${balanceFormatted} ${symbol}`;
}

export function setAccessDenied(denied) {
  document.getElementById("accessDenied").style.display = denied ? "block" : "none";
  document.getElementById("airdropTool").style.display = denied ? "none" : "block";
}

export function showSectionByMode(mode) {
  const sections = ["pasteSection", "createSection", "randomSection"];
  sections.forEach(id => {
    document.getElementById(id).style.display = (id.startsWith(mode)) ? "block" : "none";
  });
}

export function setProceedButtonEnabled(enabled) {
  const btn = document.getElementById("proceedButton");
  btn.disabled = !enabled;
}

export function displayResults(addresses) {
  const resultsEl = document.getElementById("results");
  resultsEl.textContent = addresses.join(\"\\n\");
  document.getElementById(\"downloadButton\").style.display = \"block\";
}

export function downloadAddressesAsTxt(addresses) {
  const blob = new Blob([addresses.join(\"\\n\")], { type: \"text/plain\" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement(\"a\");
  link.href = url;
  link.download = \"airdrop_addresses.txt\";
  link.click();
  URL.revokeObjectURL(url);
}
