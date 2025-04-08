document.addEventListener('DOMContentLoaded', function () {
    const { ethers } = window;

    let provider;
    let signer;
    let connectedAddress = '';

    const STAKING_CONTRACT_ADDRESS = '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3';
    const LQX_TOKEN = '0x9e27f48659b1005b1abc0f58465137e531430d4b';
    const LP_TOKEN = '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E';

    const STAKING_CONTRACT_ABI = [
        'function claimRewards() public',
        'function getAPR() public view returns (uint256)',
        'function earned(address account) public view returns (uint256)',
        'function userStake(address account) public view returns (uint256)',
        'function stake(uint256 amount) public',
        'function unstake(uint256 amount) public'
    ];

    const LQX_ABI = [
        'function balanceOf(address account) public view returns (uint256)'
    ];

    const LP_ABI = [
        'function balanceOf(address account) public view returns (uint256)',
        'function approve(address spender, uint256 amount) public returns (bool)',
        'function allowance(address owner, address spender) public view returns (uint256)'
    ];

    let stakingContract;
    let lqxContract;
    let lpContract;

    // Διάγνωση του πορτοφολιού που χρησιμοποιείται (MetaMask ή άλλο).
    function detectProvider() {
        console.log("🔍 Detecting provider...");
        if (window.ethereum) {
            if (window.ethereum.isMetaMask) {
                console.log("🦊 MetaMask detected");
                return window.ethereum;
            } else {
                console.log("No MetaMask detected, but Ethereum provider is present");
                return window.ethereum;
            }
        } else {
            alert("No compatible wallet detected! Please install MetaMask.");
            return null;
        }
    }

    // Σύνδεση με το πορτοφόλι του χρήστη
    async function connectWallet() {
        console.log("🔗 Connecting wallet...");
        const detectedProvider = detectProvider();

        if (!detectedProvider) {
            alert("No provider detected. Please install MetaMask.");
            return;
        }

        try {
            document.getElementById('loading-spinner').style.display = 'block'; // Show loading spinner

            provider = new ethers.providers.Web3Provider(detectedProvider, "any");

            // Ζητάμε από το MetaMask να επιλέξει τον λογαριασμό
            console.log("Requesting accounts...");
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            connectedAddress = await signer.getAddress();

            console.log(`Connected to MetaMask address: ${connectedAddress}`);

            // Ενημέρωση του UI
            document.getElementById('wallet-address').textContent = `Connected: ${connectedAddress}`;
            document.getElementById('connect-btn').style.display = 'none';
            document.getElementById('disconnect-btn').style.display = 'inline';

            // Φόρτωση των συμβολαίων
            stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
            lqxContract = new ethers.Contract(LQX_TOKEN, LQX_ABI, signer);
            lpContract = new ethers.Contract(LP_TOKEN, LP_ABI, signer);

            await fetchAllData(); // Φόρτωση όλων των δεδομένων

        } catch (error) {
            console.error("❌ Connection error:", error);
            alert("Error connecting to MetaMask.");
        } finally {
            document.getElementById('loading-spinner').style.display = 'none'; // Hide loading spinner
        }
    }

    // Αποσύνδεση από το πορτοφόλι
    function disconnectWallet() {
        console.log("🔴 Disconnecting wallet...");
        connectedAddress = '';
        document.getElementById('wallet-address').textContent = 'Not connected';
        document.getElementById('connect-btn').style.display = 'inline';
        document.getElementById('disconnect-btn').style.display = 'none';
    }

    // Φόρτωση των δεδομένων από το συμβόλαιο
    async function fetchAllData() {
        try {
            console.log("📊 Fetching all data...");

            const apr = await stakingContract.getAPR();
            document.getElementById('apr').innerText = `APR: ${ethers.utils.formatUnits(apr, 2)}%`;

            const lqxBalance = await lqxContract.balanceOf(connectedAddress);
            document.getElementById('lqx-balance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)}`;

            const lpBalance = await lpContract.balanceOf(connectedAddress);
            document.getElementById('lp-balance').innerText = `LP Token Balance: ${ethers.utils.formatUnits(lpBalance, 18)}`;

            const stakedAmount = await stakingContract.userStake(connectedAddress);
            document.getElementById('staked-amount').innerText = `Staked Amount: ${ethers.utils.formatUnits(stakedAmount, 18)}`;

            const earned = await stakingContract.earned(connectedAddress);
            document.getElementById('earned-rewards').innerText = `Earned Rewards: ${ethers.utils.formatUnits(earned, 18)}`;
        } catch (error) {
            console.error("❌ Error Fetching Data:", error);
        }
    }

    // Συναρτήσεις για τις συναλλαγές Stake, Unstake, Claim Rewards

    async function stakeTokens() {
        try {
            const amount = document.getElementById('stake-amount').value;
            if (!amount || amount <= 0) {
                alert("Please enter a valid amount to stake.");
                return;
            }

            const parsedAmount = ethers.utils.parseUnits(amount, 18);
            console.log(`Attempting to stake ${amount} tokens...`);

            document.getElementById('loading-spinner').style.display = 'block'; // Show loading spinner

            // Έλεγχος allowance για να επιβεβαιώσουμε ότι τα LP tokens είναι εγκριμένα
            const allowance = await lpContract.allowance(connectedAddress, STAKING_CONTRACT_ADDRESS);
            console.log(`Allowance for staking: ${allowance.toString()}`);

            if (allowance.lt(parsedAmount)) {
                console.log("🔑 Tokens not approved for staking, requesting approval...");
                // Αν δεν έχει γίνει approve, το κάνουμε
                const approveTx = await lpContract.approve(STAKING_CONTRACT_ADDRESS, parsedAmount);
                await approveTx.wait();  // Περιμένουμε να ολοκληρωθεί η έγκριση
                console.log("✅ Tokens Approved Successfully!");
            } else {
                console.log("✅ Tokens already approved for staking.");
            }

            // Βήμα 2: Κάνουμε staking
            console.log("📥 Staking Tokens...");
            const tx = await stakingContract.stake(parsedAmount);
            console.log(`Transaction hash: ${tx.hash}`); // Καταγράφουμε το transaction hash

            const receipt = await tx.wait();  // Περιμένουμε να ολοκληρωθεί η συναλλαγή
            console.log(`Transaction confirmed in block: ${receipt.blockNumber}`); // Εμφανίζουμε το block της συναλλαγής

            alert("✅ Successfully Staked Tokens!");
            await fetchAllData();  // Φορτώνουμε ξανά τα δεδομένα

        } catch (error) {
            console.error("❌ Error Staking Tokens:", error);
            alert("An error occurred while staking tokens.");
        } finally {
            document.getElementById('loading-spinner').style.display = 'none'; // Hide loading spinner
        }
    }

    async function unstakeTokens() {
        try {
            const amount = document.getElementById('unstake-amount').value;
            if (!amount || amount <= 0) {
                alert("Please enter a valid amount to unstake.");
                return;
            }

            const parsedAmount = ethers.utils.parseUnits(amount, 18);
            console.log(`Attempting to unstake ${amount} tokens...`);

            document.getElementById('loading-spinner').style.display = 'block'; // Show loading spinner

            // Έλεγχος allowance πριν την αποδέσμευση των LP tokens
            const allowance = await lpContract.allowance(connectedAddress, STAKING_CONTRACT_ADDRESS);
            console.log(`Allowance for unstake: ${allowance.toString()}`);

            if (allowance.lt(parsedAmount)) {
                console.log("🔑 Approving tokens for unstaking...");
                const approveTx = await lpContract.approve(STAKING_CONTRACT_ADDRESS, parsedAmount);
                await approveTx.wait();  // Περιμένουμε να ολοκληρωθεί η έγκριση
                console.log("✅ Tokens Approved Successfully for Unstaking!");
            } else {
                console.log("✅ Tokens already approved for unstaking.");
            }

            // Εκτέλεση της αποδέσμευσης (unstake)
            console.log("📤 Unstaking Tokens...");
            const tx = await stakingContract.unstake(parsedAmount);
            console.log(`Transaction hash: ${tx.hash}`); // Καταγράφουμε το transaction hash

            const receipt = await tx.wait();  // Περιμένουμε να ολοκληρωθεί η συναλλαγή
            console.log(`Transaction confirmed in block: ${receipt.blockNumber}`); // Εμφανίζουμε το block της συναλλαγής

            alert("✅ Successfully Unstaked Tokens!");
            await fetchAllData();  // Φορτώνουμε ξανά τα δεδομένα

        } catch (error) {
            console.error("❌ Error Unstaking Tokens:", error);
            alert("An error occurred while unstaking tokens.");
        } finally {
            document.getElementById('loading-spinner').style.display = 'none'; // Hide loading spinner
        }
    }

    async function claimRewards() {
        try {
            console.log("💰 Attempting to claim rewards...");

            document.getElementById('loading-spinner').style.display = 'block'; // Show loading spinner

            // Ελέγχουμε αν ο χρήστης έχει έγκριση για να κάνουμε claim
            const allowance = await lpContract.allowance(connectedAddress, STAKING_CONTRACT_ADDRESS);
            console.log(`Allowance for claiming rewards: ${allowance.toString()}`);

            // Κάνουμε claim τα rewards
            const tx = await stakingContract.claimRewards();
            console.log(`Transaction hash: ${tx.hash}`); // Καταγράφουμε το transaction hash

            const receipt = await tx.wait();  // Περιμένουμε να ολοκληρωθεί η συναλλαγή
            console.log(`Transaction confirmed in block: ${receipt.blockNumber}`); // Εμφανίζουμε το block της συναλλαγής

            alert("✅ Rewards Claimed Successfully!");
            await fetchAllData();  // Φορτώνουμε ξανά τα δεδομένα

        } catch (error) {
            console.error("❌ Error Claiming Rewards:", error);
            alert("An error occurred while claiming rewards.");
        } finally {
            document.getElementById('loading-spinner').style.display = 'none'; // Hide loading spinner
        }
    }

    // Προσθήκη listeners για τα κουμπιά στον τομέα Actions
    document.getElementById('stake-btn').addEventListener('click', function () {
        console.log("🚪 Button 'Stake Tokens' clicked");
        stakeTokens();
    });

    document.getElementById('unstake-btn').addEventListener('click', function () {
        console.log("🚪 Button 'Unstake Tokens' clicked");
        unstakeTokens();
    });

    document.getElementById('claim-rewards-btn').addEventListener('click', function () {
        console.log("🚪 Button 'Claim Rewards' clicked");
        claimRewards();
    });

    // Προσθήκη listeners για τα κουμπιά σύνδεσης και αποσύνδεσης
    document.getElementById('connect-btn').addEventListener('click', function () {
        console.log("🚪 Button 'Connect Wallet' clicked");
        connectWallet();
    });

    document.getElementById('disconnect-btn').addEventListener('click', function () {
        console.log("🚪 Button 'Disconnect' clicked");
        disconnectWallet();
    });
});
