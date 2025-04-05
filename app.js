<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>LiquidityX | Staking Portal</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="https://lqxtoken.github.io/LiquidityX/logo.png" type="image/png">
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <div class="logo-container">
                <img src="https://lqxtoken.github.io/LiquidityX/logo.png" alt="LiquidityX Logo" class="logo">
                <h1>LiquidityX <span class="mobile-hidden">Staking</span></h1>
            </div>
            <button id="connectButton" class="connect-btn">
                <i class="fas fa-wallet"></i>
                <span class="btn-text">Connect</span>
            </button>
        </header>

        <div id="walletModal" class="wallet-modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Connect Wallet</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="wallet-options">
                    <div class="wallet-option" data-wallet="metamask">
                        <i class="fab fa-ethereum"></i>
                        <span>MetaMask</span>
                    </div>
                    <div class="wallet-option" data-wallet="trustwallet">
                        <i class="fas fa-wallet"></i>
                        <span>Trust Wallet</span>
                    </div>
                    <div class="wallet-option" data-wallet="keplr">
                        <i class="fas fa-atom"></i>
                        <span>Keplr</span>
                    </div>
                </div>
            </div>
        </div>

        <div id="networkIndicator" class="network-indicator hidden">
            <span id="networkStatusText"></span>
            <button id="switchNetworkBtn" class="switch-network-btn">Switch Network</button>
            <button id="disconnectBtn" class="disconnect-btn">Disconnect</button>
        </div>

        <div id="loadingOverlay" class="loading-overlay hidden">
            <div class="loading-spinner"></div>
            <span id="loadingText">Processing...</span>
        </div>

        <main class="app-content">
            <section class="balance-section">
                <div class="balance-card">
                    <div class="balance-row">
                        <span>LP Balance:</span>
                        <span id="lpBalance">0.00</span>
                    </div>
                    <div class="balance-row">
                        <span>LQX Balance:</span>
                        <span id="lqxBalance">0.00</span>
                    </div>
                    <div class="balance-row highlight">
                        <span>Staked:</span>
                        <span id="stakedBalance">0.00</span>
                    </div>
                    <div class="balance-row highlight">
                        <span>Rewards:</span>
                        <span id="rewardsBalance">0.00</span>
                    </div>
                </div>

                <div class="info-card">
                    <div class="info-row">
                        <span>APR:</span>
                        <span id="aprValue">0.00%</span>
                    </div>
                    <div class="info-row">
                        <span>Total Staked:</span>
                        <span id="totalStaked">0.00 LP</span>
                    </div>
                    <div class="info-row">
                        <span>Your Share:</span>
                        <span id="userShare">0.00%</span>
                    </div>
                </div>
            </section>

            <section class="action-section">
                <div class="action-card">
                    <h3><i class="fas fa-coins"></i> Stake</h3>
                    <div class="input-group">
                        <input type="number" id="stakeAmount" placeholder="0.00" min="0" step="0.01">
                        <button id="maxStakeBtn" class="max-btn">MAX</button>
                    </div>
                    <button id="stakeBtn" class="action-btn primary" disabled>Stake LP</button>
                </div>

                <div class="action-card">
                    <h3><i class="fas fa-unlock"></i> Unstake</h3>
                    <div class="input-group">
                        <input type="number" id="unstakeAmount" placeholder="0.00" min="0" step="0.01">
                        <button id="maxUnstakeBtn" class="max-btn">MAX</button>
                    </div>
                    <button id="unstakeBtn" class="action-btn secondary" disabled>Unstake LP</button>
                </div>

                <div class="action-card">
                    <h3><i class="fas fa-gift"></i> Rewards</h3>
                    <button id="claimBtn" class="action-btn accent" disabled>Claim</button>
                    <div id="claimableInfo" class="info-text">Next reward in: <span id="nextRewardTime">--</span></div>
                </div>
            </section>

            <section class="history-section">
                <h2>Recent Transactions</h2>
                <div id="transactionHistory" class="transaction-list">
                    <div class="empty-state">No transactions yet</div>
                </div>
            </section>

            <div id="walletStatus" class="wallet-status"></div>
        </main>

        <div id="transactionToast" class="toast hidden"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
    <script src="https://unpkg.com/@keplr-wallet/provider@0.1.1/dist/provider.js"></script>
    <script src="app.js"></script>
</body>
</html>
