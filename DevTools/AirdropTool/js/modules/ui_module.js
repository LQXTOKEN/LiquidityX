// js/modules/ui_module.js

export function updateWalletInfo(address, balance) {
  document.getElementById("wallet-info").innerText = `🧾 Connected: ${address}`;
  document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${balance}`;
}

export function showRequirementWarning(message) {
  document.getElementById("requirement-warning").innerText = message;
}

export function clearWalletInfo() {
  document.getElementById("wallet-info").innerText = "";
  document.getElementById("lqx-info").innerText = "";
  document.getElementById("requirement-warning").innerText = "";
}

export function enableInputs() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}

export function disableInputs() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

export function toggleInputFields(mode) {
  document.getElementById("paste-box").style.display = mode === "paste" ? "block" : "none";
  document.getElementById("scan-box").style.display = mode === "create" ? "block" : "none";
  document.getElementById("random-box").style.display = mode === "random" ? "block" : "none";
  document.getElementById("download-btn").style.display =
    mode === "random" || mode === "create" ? "inline-block" : "none";
}

export function clearAddressListUI() {
  document.getElementById("address-list").innerHTML = "";
  document.getElementById("address-count").innerText = "";
}

export function populateAddressListUI(addresses) {
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

export function confirmModeChange(prevMode, newMode) {
  const confirmed = confirm("Switching modes will clear your current address list. Proceed?");
  if (!confirmed) {
    document.getElementById("mode").value = prevMode;
  }
  return confirmed;
}
