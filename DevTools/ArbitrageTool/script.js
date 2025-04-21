window.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startMonitoring");
  const output = document.getElementById("output");
  const pairSelect = document.getElementById("pairSelect");

  startBtn.addEventListener("click", () => {
    const selectedPair = pairSelect.value;

    output.textContent += `\n▶️ Monitoring started for LP: ${selectedPair}\n`;

    const eventSource = new EventSource(
      `https://proxy-git-main-lqxtokens-projects.vercel.app/api/monitor?pair=${selectedPair}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const logLine = `[${data.txType}] ${data.amountIn} ➜ ${data.amountOut} (${data.token0}/${data.token1})\n`;
      output.textContent += logLine;
      output.scrollTop = output.scrollHeight;
    };

    eventSource.onerror = (error) => {
      output.textContent += "❌ Error connecting to stream.\n";
      console.error(error);
      eventSource.close();
    };
  });
});
