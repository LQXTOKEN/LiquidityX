window.uiModule = (function () {
  function updateLQXBalanceDisplay(balanceFormatted) {
    const balanceDiv = document.getElementById("lqxBalance");
    if (balanceDiv) {
      balanceDiv.textContent = `${balanceFormatted} LQX`;
    }
  }

  function toggleEligibilityUI(isEligible) {
    const eligibilityDiv = document.getElementById("eligibilityMessage");
    if (eligibilityDiv) {
      if (isEligible) {
        eligibilityDiv.textContent = "✅ You are eligible to use this tool.";
        eligibilityDiv.style.color = "#00ff88";
      } else {
        eligibilityDiv.textContent = "❌ Minimum 1000 LQX tokens required to use this tool.";
        eligibilityDiv.style.color = "#ff5c5c";
      }
    }
  }

  function toggleMainUI(isEnabled) {
    const elementsToToggle = document.querySelectorAll(".main-ui input, .main-ui select, .main-ui button, .main-ui textarea");
    elementsToToggle.forEach(el => {
      el.disabled = !isEnabled;
      el.classList.toggle("disabled", !isEnabled);
    });
  }

  function showResults(addresses) {
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) {
      resultsDiv.innerHTML = "";
      const ul = document.createElement("ul");
      addresses.forEach(addr => {
        const li = document.createElement("li");
        li.textContent = addr;
        ul.appendChild(li);
      });
      resultsDiv.appendChild(ul);
    }
  }

  function clearResults() {
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) {
      resultsDiv.innerHTML = "";
    }
  }

  function toggleProceedButton(show) {
    const proceedButton = document.getElementById("proceedButton");
    if (proceedButton) {
      proceedButton.style.display = show ? "inline-block" : "none";
    }
  }

  function clearPasteTextarea() {
    const textarea = document.getElementById("pasteInput");
    if (textarea) {
      textarea.value = "";
    }
  }

  return {
    updateLQXBalanceDisplay,
    toggleEligibilityUI,
    toggleMainUI,
    showResults,
    clearResults,
    toggleProceedButton,
    clearPasteTextarea
  };
})();
