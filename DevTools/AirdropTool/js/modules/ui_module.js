window.uiModule = (function () {
  function toggleElementsBasedOnEligibility(isEligible) {
    const elements = document.querySelectorAll(".requires-eligibility");
    elements.forEach((el) => {
      el.disabled = !isEligible;
      el.style.opacity = isEligible ? "1" : "0.5";
    });
  }

  function setEligibilityMessage(isEligible) {
    const el = document.getElementById("eligibilityMessage");
    if (!el) return;

    if (isEligible) {
      el.textContent = "✅ You are eligible to use the tool.";
      el.style.color = "#00ff7f"; // Πράσινο
    } else {
      el.textContent = "❌ You need at least 1000 LQX tokens.";
      el.style.color = "#ff5555"; // Κόκκινο
    }
  }

  function updateAddressResults(addresses) {
    const resultsContainer = document.getElementById("results");
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "";
    addresses.forEach((addr) => {
      const div = document.createElement("div");
      div.className = "address-entry";
      div.textContent = addr;
      resultsContainer.appendChild(div);
    });
  }

  function toggleProceedButton(show) {
    const btn = document.getElementById("proceedButton");
    if (btn) {
      btn.style.display = show ? "inline-block" : "none";
    }
  }

  function clearResults() {
    const resultsContainer = document.getElementById("results");
    if (resultsContainer) resultsContainer.innerHTML = "";
  }

  function clearPasteArea() {
    const textarea = document.getElementById("pasteTextarea");
    if (textarea) textarea.value = "";
  }

  function clearRandomInput() {
    const input = document.getElementById("randomCountInput");
    if (input) input.value = "";
  }

  return {
    toggleElementsBasedOnEligibility,
    setEligibilityMessage,
    updateAddressResults,
    toggleProceedButton,
    clearResults,
    clearPasteArea,
    clearRandomInput,
  };
})();
