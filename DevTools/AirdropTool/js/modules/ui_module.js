export function updateWalletInfo(address, balanceFormatted) {
  document.getElementById("wallet-info").innerText = `🧾 Connected: ${address}`;
  document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${balanceFormatted}`;
}

export function showWarning(message) {
  document.getElementById("requirement-warning").innerText = `⚠️ ${message}`;
}

export function clearWarning() {
  document.getElementById("requirement-warning").innerText = "";
}

export function clearUI() {
  document.getElementById("address-list").innerHTML = "";
  document.getElementById("address-count").innerText = "";
  document.getElementById("paste-input").value = "";
  document.getElementById("scan-link").value = "";
  document.getElementById("max-addresses").value = "";
  document.getElementById("random-count").value = "";
}

export function disableInputs() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

export function enableInputs() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = true;
}

export function toggleInputFields(mode) {
  document.getElementById("paste-box").style.display = mode === "paste" ? "block" : "none";
  document.getElementById("scan-box").style.display = mode === "create" ? "block" : "none";
  document.getElementById("random-box").style.display = mode === "random" ? "block" : "none";
  document.getElementById("download-btn").style.display = (mode === "random" || mode === "create") ? "inline-block" : "none";
}
