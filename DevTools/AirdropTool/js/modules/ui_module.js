window.uiModule = (function () {
  return {
    clearResults: function () {
      const resultsBox = document.getElementById("results");
      if (resultsBox) resultsBox.innerHTML = "";
    },

    clearPasteInput: function () {
      const pasteArea = document.getElementById("pasteArea");
      if (pasteArea) pasteArea.value = "";
    },

    clearHowManyInput: function () {
      const input = document.getElementById("randomCount");
      if (input) input.value = "";
    },

    displayAddresses: function (addresses) {
      const resultsBox = document.getElementById("results");
      if (!resultsBox) return;
      resultsBox.innerHTML = "";
      addresses.forEach((addr) => {
        const div = document.createElement("div");
        div.className = "address-item";
        div.textContent = addr;
        resultsBox.appendChild(div);
      });
    },

    showLQXBalance: function (balanceFormatted) {
      const balanceElement = document.getElementById("lqxBalance");
      if (balanceElement) balanceElement.textContent = balanceFormatted + " LQX";
    },

    showError: function (message) {
      alert("Error: " + message);
    },

    showSuccess: function (message) {
      alert("Success: " + message);
    },
  };
})();
