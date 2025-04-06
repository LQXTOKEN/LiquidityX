async function fetchAllData() {
    try {
        console.log("📊 Fetching all data...");

        // Εμφανίζουμε πάντα το Loading αρχικά
        document.getElementById('apr').innerText = `APR: Loading...`;

        // **Βεβαιωνόμαστε ότι ο signer είναι ενεργός και συνδεδεμένος**
        if (!signer || !provider) {
            console.log("🔄 Reinitializing provider and signer...");
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
        }

        // Ανανεώνουμε τον stakingContract για να μην χάσει σύνδεση
        stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);

        console.log("📈 Fetching APR from contract...");
        const apr = await stakingContract.getAPR();

        if (!apr) {
            console.error("❌ APR returned undefined or null.");
            document.getElementById('apr').innerText = `APR: Error fetching`;
            return;
        }

        const aprFormatted = ethers.utils.formatUnits(apr, 2);
        console.log("✅ APR Fetched Successfully:", aprFormatted);
        document.getElementById('apr').innerText = `APR: ${aprFormatted}%`;

    } catch (error) {
        console.error("❌ Error Fetching Data:", error);
        document.getElementById('apr').innerText = `APR: Error fetching`;
    }
}
