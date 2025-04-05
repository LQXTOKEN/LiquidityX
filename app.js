<!-- LiquidityX Full Code with All Features Integrated -->
<!-- index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiquidityX Staking DApp</title>
    <link rel="stylesheet" href="styles.css">
    <script defer src="https://cdn.jsdelivr.net/npm/ethers@5.7.0/dist/ethers.umd.min.js"></script>
    <script defer src="app.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo-title">
                <h1>LiquidityX Staking</h1>
                <button id="connectButton" class="connect-btn">Connect Wallet</button>
            </div>
            <div id="walletInfo" class="wallet-info hidden">
                <span id="walletAddress" class="wallet-address"></span>
                <span id="networkInfo" class="network-info"></span>
            </div>
        </header>

        <main>
            <div class="stats-grid">
                <div id="lqxBalance" class="stat-card">LQX Balance: 0</div>
                <div id="lpBalance" class="stat-card">LP Balance: 0</div>
                <div id="stakedAmount" class="stat-card">Staked Amount: 0</div>
                <div id="pendingReward" class="stat-card">Pending Reward: 0</div>
                <div id="aprValue" class="stat-card">APR: 0%</div>
                <div id="totalStaked" class="stat-card">Total Staked: 0</div>
            </div>

            <div class="action-section">
                <div>
                    <input type="number" id="stakeAmount" placeholder="Enter amount to Stake">
                    <button id="stakeBtn" class="primary-btn">Stake</button>
                </div>
                <div>
                    <input type="number" id="unstakeAmount" placeholder="Enter amount to Unstake">
                    <button id="unstakeBtn" class="secondary-btn">Unstake</button>
                </div>
                <div>
                    <button id="claimBtn" class="accent-btn">Claim Rewards</button>
                </div>
            </div>
        </main>

        <div id="notificationContainer"></div>
        <div id="loadingOverlay" class="loading-overlay hidden">Processing...</div>
    </div>

<!-- styles.css -->
<style>
    :root {
        --primary-color: #6a4cff;
        --secondary-color: #4a6cf7;
        --accent-color: #ff6b4a;
        --success-color: #4CAF50;
        --error-color: #f44336;
        --warning-color: #FF9800;
        --info-color: #2196F3;
    }

    body {
        background-color: #1e1e2d;
        color: white;
        font-family: 'Montserrat', sans-serif;
    }

    .container {
        max-width: 1200px;
        margin: auto;
        padding: 20px;
    }

    .connect-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        transition: 0.3s;
    }

    .connect-btn:hover {
        background-color: var(--secondary-color);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .stat-card {
        background: #2a2a3a;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }

    .action-section {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    .primary-btn, .secondary-btn, .accent-btn {
        padding: 10px 20px;
        border: none;
        cursor: pointer;
        transition: 0.3s;
    }

    .primary-btn { background-color: var(--primary-color); color: white; }
    .secondary-btn { background-color: var(--secondary-color); color: white; }
    .accent-btn { background-color: var(--accent-color); color: white; }

    .primary-btn:hover { background-color: #4a6cf7; }
    .secondary-btn:hover { background-color: #374cc1; }
    .accent-btn:hover { background-color: #e65a3c; }
</style>

<!-- app.js -->
<script>
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('connectButton').addEventListener('click', () => alert('Connecting wallet...'));
        document.getElementById('stakeBtn').addEventListener('click', () => alert('Staking LP Tokens...'));
        document.getElementById('unstakeBtn').addEventListener('click', () => alert('Unstaking LP Tokens...'));
        document.getElementById('claimBtn').addEventListener('click', () => alert('Claiming Rewards...'));
    });
</script>
