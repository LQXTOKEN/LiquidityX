// js/modules/ui_module.js

export function updateWalletInfo(address) {
  const infoEl = document.getElementById("wallet-info");
  infoEl.innerText = address ? `🧾 Connected: ${address}` : "";
}

export function updateLQXInfo(balance) {
  const el = document.getElementById("lqx-info");
  el.innerText = `💰 LQX Balance: ${balance}`;
}

export function showWarning(message) {
  const warningEl = document.getElementById("requirement-warning");
  warningEl.innerText = message || "";
}

export function enableUIInputs() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
  document.getElementById("disconnect-btn").disabled = false;
}

export function disableUIInputs() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
  document.getElementById("disconnect-btn").disabled = true;
}

export function clearAddressListUI() {
  document.getElementById("address-list").innerHTML = "";
  document.getElementById("address-count").innerText = "";
}

export function showAddressList(addresses) {
  const ul = document.getElementById("address-list");
  const countEl = document.getElementById("address-count");

  ul.innerHTML = "";
  addresses.forEach(addr => {
    const li = document.createElement("li");
    li.textContent = addr;
    ul.appendChild(li);
  });

  countEl.innerText = `✅ ${addresses.length} addresses loaded.`;
}

export function toggleModeSections(mode) {
  document.getElementById("paste-box").style.display = mode === "paste" ? "block" : "none";
  document.getElementById("scan-box").style.display = mode === "create" ? "block" : "none";
  document.getElementById("random-box").style.display = mode === "random" ? "block" : "none";
  document.getElementById("download-btn").style.display =
    mode === "create" || mode === "random" ? "inline-block" : "none";
}
