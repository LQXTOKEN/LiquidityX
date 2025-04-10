const API_KEY = "5QG8Q2D9XS88QE76WVCTVI75UUHBDMMWUG";
const LQX_ADDRESS = "0x9e27f48659b1005b1abc0f58465137e531430d4b";
const LQX_ABI = ["function balanceOf(address account) external view returns (uint256)"];
const LQX_REQUIRED = ethers.utils.parseUnits("1000", 18);

let provider, signer, userAddress;
let lqxContract;
let selectedTokenContract;
let selectedTokenSymbol = "";
let selectedTokenDecimals = 18;
let currentMethod = "";

document.getElementById("connect-btn").addEventListener("click", connectWallet);
document.getElementById("extract-btn").addEventListener("click", handleAddressExtraction);
document.getElementById("check-token-btn").addEventListener("click", checkToken);
document.getElementById("method-select").addEventListener("change", (e) => handleMethodChange(e.target.value));

async function connectWallet() {
  if (!window.ethereum) return alert("Please install MetaMask to continue.");
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  document.getElementById("wallet-info").innerText = `🧾 Connected: ${userAddress}`;
  lqxContract = new ethers.Contract(LQX_ADDRESS, LQX_ABI, provider);
  const balance = await lqxContract.balanceOf(userAddress);
  const formatted = ethers.utils.formatUnits(balance, 18);
  document.getElementById("lqx-info").innerText = `💰 LQX Balance: ${formatted}`;

  if (balance.lt(LQX_REQUIRED)) {
    document.getElementById("requirement-warning").innerText = "⚠️ You must hold at least 1000 LQX tokens to use this tool.";
    disableTool();
  } else {
    document.getElementById("requirement-warning").innerText = "";
    enableTool();
  }
}

function disableTool() {
  document.getElementById("extract-btn").disabled = true;
  document.getElementById("method-select").disabled = true;
}

function enableTool() {
  document.getElementById("extract-btn").disabled = false;
  document.getElementById("method-select").disabled = false;
}

function handleMethodChange(method) {
  const addressList = document.getElementById("address-list").children;
  if (addressList.length > 0 && method !== currentMethod) {
    const confirmClear = confirm("⚠️ This will clear the current address list. Do you want to continue?");
    if (!confirmClear) {
      document.getElementById("method-select").value = currentMethod;
      return;
    }
    document.getElementById("address-list").innerHTML = "";
    document.getElementById("address-count").innerText = "";
    document.getElementById("scan-link").value = "";
    document.getElementById("max-addresses").value = "";
    document.getElementById("manual-addresses").value = "";
    document.getElementById("random-count").value = "";
  }

  currentMethod = method;
  document.getElementById("paste-inputs").style.display = "none";
  document.getElementById("create-inputs").style.display = "none";
  document.getElementById("random-inputs").style.display = "none";

  if (method === "paste") document.getElementById("paste-inputs").style.display = "block";
  else if (method === "create") document.getElementById("create-inputs").style.display = "block";
  else if (method === "random") document.getElementById("random-inputs").style.display = "block";
}

async function handleAddressExtraction() {
  const method = currentMethod;
  const listEl = document.getElementById("address-list");
  const statusEl = document.getElementById("address-count");
  listEl.innerHTML = "";
  statusEl.innerText = "";

  if (method === "paste") {
    const input = document.getElementById("manual-addresses").value.trim();
    const addresses = input.split("\n").map(a => a.trim()).filter(a => ethers.utils.isAddress(a));
    addresses.forEach(addr => {
      const li = document.createElement("li");
      li.textContent = addr;
      listEl.appendChild(li);
    });
    statusEl.innerText = `✅ Loaded ${addresses.length} addresses`;
  }

  else if (method === "create") {
    const link = document.getElementById("scan-link").value.trim();
    const max = parseInt(document.getElementById("max-addresses").value) || 0;
    const regex = /token\/(0x[a-fA-F0-9]{40})/;
    const match = link.match(regex);
    if (!match) return alert("❌ Invalid PolygonScan token link.");
    const tokenAddress = match[1];
    statusEl.innerText = `⏳ Fetching holders of ${tokenAddress}...`;

    try {
      const apiURL = `https://api.polygonscan.com/api?module=account&action=tokentx&contractaddress=${tokenAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${API_KEY}`;
      const response = await fetch(apiURL);
      const data = await response.json();
      if (data.status !== "1") throw new Error(data.message || "API error");

      const txs = data.result;
      const unique = new Set(txs.map(tx => tx.to.toLowerCase()));
      const addresses = Array.from(unique).slice(0, max);
      addresses.forEach(addr => {
        const li = document.createElement("li");
        li.textContent = addr;
        listEl.appendChild(li);
      });
      statusEl.innerText = `✅ Found ${addresses.length} addresses`;
    } catch (err) {
      console.error(err);
      statusEl.innerText = "⚠️ Failed to fetch data.";
    }
  }

  else if (method === "random") {
    const count = parseInt(document.getElementById("random-count").value);
    if (!count || count < 1 || count > 500) return alert("❌ Invalid count (1-500)");
    const addresses = [];
    for (let i = 0; i < count; i++) {
      const wallet = ethers.Wallet.createRandom();
      addresses.push(wallet.address);
    }
    addresses.forEach(addr => {
      const li = document.createElement("li");
      li.textContent = addr;
      listEl.appendChild(li);
    });
    statusEl.innerText = `✅ Generated ${addresses.length} random addresses`;
  }
}

async function checkToken() {
  const tokenAddress = document.getElementById("token-address").value.trim();
  const infoEl = document.getElementById("token-info");
  if (!ethers.utils.isAddress(tokenAddress)) return alert("❌ Invalid address");

  try {
    const abi = [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function balanceOf(address) view returns (uint256)"
    ];
    selectedTokenContract = new ethers.Contract(tokenAddress, abi, provider);
    const symbol = await selectedTokenContract.symbol();
    const decimals = await selectedTokenContract.decimals();
    const balance = await selectedTokenContract.balanceOf(userAddress);
    selectedTokenSymbol = symbol;
    selectedTokenDecimals = decimals;
    const formatted = ethers.utils.formatUnits(balance, decimals);
    infoEl.innerText = `✅ ${symbol} | Decimals: ${decimals} | Balance: ${formatted}`;
  } catch (err) {
    console.error(err);
    infoEl.innerText = "❌ Error fetching token data.";
  }
}
