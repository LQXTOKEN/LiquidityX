// js/modules/last_airdrop_module.js
//
// 📦 Περιγραφή: Φορτώνει το τελευταίο airdrop του χρήστη από το backend proxy (Vercel API)
// και ενημερώνει το UI με τη λειτουργία uiModule.showLastAirdrop(...)

window.lastAirdropModule = (function () {
  async function fetchLastAirdrop(walletAddress) {
    if (!walletAddress) return;

    try {
      // ✅ Χρησιμοποιούμε δυναμικά το σωστό backend URL (Vercel)
      const baseUrl = window.API_BASE_URL || "https://proxy-git-main-lqxtokens-projects.vercel.app";
      const response = await fetch(`${baseUrl}/api/last-airdrops?address=${walletAddress}`);

      if (!response.ok) {
        uiModule.logMessage("⚠️ Failed to fetch last airdrop info", "warn");
        return;
      }

      const data = await response.json();

      // Αν βρεθεί airdrop, δείξε το στο UI
      if (data && data.token && data.totalAmount) {
        uiModule.showLastAirdrop({
          token: data.token,
          totalAmount: data.totalAmount,
          totalRecipients: data.totalRecipients || 0,
          failedCount: data.failedRecipients ? data.failedRecipients.length : 0
        });
        uiModule.logMessage("✅ Last airdrop info loaded.");
      } else {
        uiModule.logMessage("ℹ️ No airdrop record found.");
      }
    } catch (err) {
      console.error("[lastAirdropModule] Error:", err);
      uiModule.logMessage("❌ Error loading last airdrop", "error");
    }
  }

  return {
    fetchLastAirdrop
  };
})();
