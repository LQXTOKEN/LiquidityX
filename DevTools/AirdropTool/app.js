const LQX_ADDRESS = "0x9e27f48659b1005b1abc0f58465137e531430d4b";
const LQX_ABI = ["function balanceOf(address account) external view returns (uint256)"];
const LQX_REQUIRED = ethers.utils.parseUnits("1000", 18);
const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";

let provider, signer, userAddress;
let lqxContract;
let selectedMode = "";
let addressList = [];

document.getElementById("connect-btn").addEventListener("click", connectWallet);
document.getElementById("disconnect-btn").addEventListener("click", disconnectWallet);
document.getElementById("mode").addEventListener("change", handleModeChange);
document.getElementById("proceed-btn").addEventListener("click", handleProceed);
document.getElementById("download-btn").addEventListener("click", downloadAddresses);
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "https://liquidityx.io";
});

async function fetchData(tokenAddress) {
  const PROXY_URL = "https://proxy-git-main-lqxtokens-projects.vercel.app";
  const apiURL = `${PROXY_URL}/api/polygon?token=${tokenAddress}`;
  
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Proxy server error");
    }
    
    return data.addresses;
  } catch (error) {
    console.error("Failed to fetch via proxy:", error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask tο continue.");
      return;
    }

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
      document.getElementById("requirement-warning").innerText =
        "⚠️ You must hold at least 1000 LQX tokens to use this tool.";
      disableInputs();
    } else {
      document.getElementById("requirement-warning").innerText = "";
      enableInputs();
    }
  } catch (err) {
    console.error("Connect error:", err);
    alert("Failed to connect wallet.");
  }
}

function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  document.getElementById("wallet-info").innerText = "";
  document.getElementById("lqx-info").innerText = "";
  document.getElementById("requirement-warning").innerText = "🔌 Wallet disconnected.";
  disableInputs();
  clearUI();
}

function disableInputs() {
  document.getElementById("mode").disabled = true;
  document.getElementById("proceed-btn").disabled = true;
}

function enableInputs() {
  document.getElementById("mode").disabled = false;
  document.getElementById("proceed-btn").disabled = false;
}

function handleModeChange() {
  const mode = document.getElementById("mode").value;
  if (addressList.length > 0) {
    const confirmClear = confirm("Switching modes will clear your current address list. Proceed?");
    if (!confirmClear) {
      document.getElementById("mode").value = selectedMode;
      return;
    }
    addressList = [];
    clearUI();
  }

  selectedMode = mode;
  toggleInputFields(mode);
}

function toggleInputFields(mode) {
  document.getElementById("paste-box").style.display = mode === "paste" ? "block" : "none";
  document.getElementById("scan-box").style.display = mode === "create" ? "block" : "none";
  document.getElementById("random-box").style.display = mode === "random" ? "block" : "none";
  document.getElementById("download-btn").style.display = (mode === "random" || mode === "create") ? "inline-block" : "none";
}

function clearUI() {
  document.getElementById("address-list").innerHTML = "";
  document.getElementById("address-count").innerText = "";
}

async function handleProceed() {
  clearUI();

  if (selectedMode === "paste") {
    const raw = document.getElementById("paste-input").value.trim();
    const lines = raw.split(/\s+/).filter(line => ethers.utils.isAddress(line));
    addressList = lines;
    populateAddressList();
  }

  if (selectedMode === "create") {
    const scanLink = document.getElementById("scan-link").value.trim();
    const max = parseInt(document.getElementById("max-addresses").value) || 100;

    const regex = /token\/(0x[a-fA-F0-9]{40})/;
    const match = scanLink.match(regex);
    if (!match) {
      alert("❌ Invalid PolygonScan token link.");
      return;
    }

    const tokenAddress = match[1];
    
    try {
      const data = await fetchData(tokenAddress);
      addressList = data.slice(0, max);
      populateAddressList();
    } catch (err) {
      console.error("❌ PolygonScan fetch failed:", err);
      alert("⚠️ Failed to fetch PolygonScan data. Please try 'Paste' or 'Random' mode.");
    }
  }

  if (selectedMode === "random") {
    const count = parseInt(document.getElementById("random-count").value) || 100;
    try {
      const res = await fetch(`${PROXY_URL}/abis/active_polygon_wallets.json`);
      const all = await res.json();
      const shuffled = all.sort(() => 0.5 - Math.random());
      addressList = shuffled.slice(0, count);
      populateAddressList();
    } catch (err) {
      console.error("❌ Failed to load random wallets:", err);
      alert("⚠️ Failed to load random wallets. Try another mode.");
    }
  }
}

function populateAddressList() {
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

function downloadAddresses() {
  if (addressList.length === 0) {
    alert("No addresses to download.");
    return;
  }

  const blob = new Blob([addressList.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "airdrop_addresses.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
