const lpPairs = [
  { address: "0xD672907706F993E9b52dDB258Da85ad77929f18C", label: "LP 1" },
  { address: "0xC3266f3ce2433E0FB83d3aE8Be49a155F6230a6F", label: "LP 2" },
  { address: "0x5B1fD9Fa139353C5D9eaf459E4BD2f7A6B4812Bb", label: "LP 3" },
  { address: "0x316f76ac99020FEe6B2C99E7125f24bb987BCA54", label: "LP 4" },
  { address: "0x6a4f915bBd034359Bd1203649c793E95cf80d6De", label: "LP 5" },
  { address: "0xCC12Cf92AeC95eEe41f6C238ACf366cE6d1d5652", label: "LP 6" },
  { address: "0x7622804bA94940A9EFdDD1546D12d8D0d6a16e53", label: "LP 7" },
  { address: "0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE", label: "LP 8" },
  { address: "0xfAa75b0e4f6b3A27083B39D4062622b3ee6031D3", label: "LP 9" },
  { address: "0x5D0aCfa39A0FCA603147f1c14e53f46BE76984BC", label: "LP 10" }
];

const container = document.getElementById("monitor-container");

lpPairs.forEach(({ address, label }) => {
  // Create card element
  const card = document.createElement("div");
  card.className = "monitor-card";
  card.id = `card-${address}`;
  card.innerHTML = `<h2>${label}</h2><div class="log-list" id="logs-${address}">Listening...</div>`;
  container.appendChild(card);

  // Create SSE connection
  const source = new EventSource(
    `https://proxy-git-main-lqxtokens-projects.vercel.app/api/monitor?pair=${address}`
  );

  source.onmessage = (event) => {
    const logList = document.getElementById(`logs-${address}`);
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${event.data}`;
    logList.prepend(entry);
  };

  source.onerror = (err) => {
    const logList = document.getElementById(`logs-${address}`);
    const errorMsg = document.createElement("div");
    errorMsg.className = "log-entry";
    errorMsg.style.color = "red";
    errorMsg.textContent = `Error connecting to LP ${label}`;
    logList.appendChild(errorMsg);
    source.close();
  };
});
