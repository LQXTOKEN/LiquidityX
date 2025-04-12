export function toggleInputFields(mode) {
  document.getElementById("paste-box").style.display = mode === "paste" ? "block" : "none";
  document.getElementById("scan-box").style.display = mode === "create" ? "block" : "none";
  document.getElementById("random-box").style.display = mode === "random" ? "block" : "none";
  document.getElementById("download-btn").style.display = (mode === "random" || mode === "create") ? "inline-block" : "none";
}

export function populateAddressList(addressList) {
  const ul = document.getElementById("address-list");
  const countEl = document.getElementById("address-count");

  ul.innerHTML = "";
  addressList.forEach(addr => {
    const li = document.createElement("li");
    li.textContent = addr;
    ul.appendChild(li);
  });

  countEl.innerText = `✅ ${addressList.length} addresses loaded.`;
}

export function clearUI() {
  document.getElementById("address-list").innerHTML = "";
  document.getElementById("address-count").innerText = "";
}

export function disableInputs() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

export function enableInputs() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}

export function showLQXRequirementWarning(show) {
  const warningEl = document.getElementById("requirement-warning");
  if (show) {
    warningEl.innerText = "⚠️ You must hold at least 1000 LQX tokens to use this tool.";
  } else {
    warningEl.innerText = "";
  }
}

export function updateWalletUI({ address, lqxBalance }) {
  document.getElementById("wallet-info").innerText = `🧾 Connected: ${address}`;
  document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${lqxBalance}`;
}

export function resetWalletUI() {
  document.getElementById("wallet-info").innerText = "";
  document.getElementById("lqx-info").innerText = "";
  document.getElementById("requirement-warning").innerText = "🔌 Wallet disconnected.";
}
