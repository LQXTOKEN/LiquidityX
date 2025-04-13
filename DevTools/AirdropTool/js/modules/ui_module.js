// js/modules/ui_module.js

export function showSectionByMode(mode) {
  const sections = {
    paste: document.getElementById("pasteSection"),
    create: document.getElementById("createSection"),
    random: document.getElementById("randomSection"),
  };

  Object.values(sections).forEach(section => {
    section.style.display = "none";
  });

  if (sections[mode]) {
    sections[mode].style.display = "block";
  }

  // Εμφάνιση ή απόκρυψη κουμπιού Proceed μόνο για paste mode
  const proceedBtn = document.getElementById("proceedButton");
  if (mode === "paste") {
    proceedBtn.style.display = "none";
  } else {
    proceedBtn.style.display = "inline-block";
  }
}

export function setWalletInfo(address, balance, symbol) {
  document.getElementById("walletAddress").textContent = `Wallet: ${address}`;
  document.getElementById("lqxBalance").textContent = `LQX Balance: ${balance} ${symbol}`;
}

export function setAccessDenied(denied) {
  document.getElementById("airdropTool").style.display = denied ? "none" : "block";
  document.getElementById("accessDenied").style.display = denied ? "block" : "none";
}

export function displayResults(addressList) {
  document.getElementById("results").textContent = addressList.join("\n");
  document.getElementById("downloadButton").style.display = "inline-block";
}

export function downloadAddressesAsTxt(addressList) {
  const blob = new Blob([addressList.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "airdrop_addresses.txt";
  link.click();
  URL.revokeObjectURL(url);
}
