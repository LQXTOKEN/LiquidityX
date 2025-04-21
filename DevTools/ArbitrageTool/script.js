// Σύνδεση με EventSource στο backend (SSE)
const logEl = document.getElementById("log");
const pairInput = document.getElementById("pairInput");
const startBtn = document.getElementById("startBtn");

let currentSource = null;

function startMonitoring() {
  const pair = pairInput.value.trim();
  if (!pair) {
    alert("Παρακαλώ εισάγετε LP διεύθυνση");
    return;
  }

  // Αν υπάρχει ήδη ενεργό connection, το κλείνουμε
  if (currentSource) {
    currentSource.close();
  }

  // Καθαρισμός log
  logEl.innerText = `⏳ Monitoring LP Pair: ${pair}\n`;

  // Δημιουργία νέου EventSource connection
  currentSource = new EventSource(
    `https://proxy-git-main-lqxtokens-projects.vercel.app/api/monitor?pair=${pair}`
  );

  currentSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const timestamp = new Date().toLocaleTimeString();
    logEl.innerText += `\n[${timestamp}] ${data.txType} | ${data.token0} → ${data.token1} | ${data.amountIn} → ${data.amountOut}`;
    logEl.scrollTop = logEl.scrollHeight;
  };

  currentSource.onerror = (error) => {
    console.error("SSE Error:", error);
    logEl.innerText += "\n⚠️ Error in connection. Check backend or pair address.";
    currentSource.close();
  };
}

// Συνδέουμε το κουμπί
startBtn.addEventListener("click", startMonitoring);
