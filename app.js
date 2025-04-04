const { ethers } = window;

const CONFIG = {
    NETWORK: { chainId: 137 },
    LQX_TOKEN: '0x9e27f48659b1005b1abc0f58465137e531430d4b',
    LP_TOKEN: '0xB2a9D1e702550BF3Ac1Db105eABc888dB64Be24E',
    STAKING_CONTRACT: '0x8e47D0a54Cb3E4eAf3011928FcF5Fab5Cf0A07c3',
    PROJECT_ID: '48ddc1bb02b267108628eb924a3cb567'
};

let provider, signer, account;

async function connectWallet() {
    const instance = await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    account = await signer.getAddress();

    document.getElementById('connectButton').innerText = `Connected: ${account}`;
    await loadBalances();
}

async function loadBalances() {
    const lqxContract = new ethers.Contract(CONFIG.LQX_TOKEN, ['function balanceOf(address) view returns (uint256)'], provider);
    const lpContract = new ethers.Contract(CONFIG.LP_TOKEN, ['function balanceOf(address) view returns (uint256)'], provider);

    const lqxBalance = await lqxContract.balanceOf(account);
    const lpBalance = await lpContract.balanceOf(account);

    document.getElementById('lqxBalance').innerText = `LQX Balance: ${ethers.utils.formatUnits(lqxBalance, 18)}`;
    document.getElementById('lpBalance').innerText = `LP Balance: ${ethers.utils.formatUnits(lpBalance, 18)}`;
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('disconnectButton').addEventListener('click', () => window.location.reload());
