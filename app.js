const CONFIG = {
  // Οι ρυθμίσεις σου (όπως τις έχεις ήδη)
};

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('stakeButton').addEventListener('click', () => stakeLPTokens(10));

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      if (network.chainId !== 137) {
        alert("Please switch to Polygon Mainnet!");
        return;
      }

      document.getElementById('accountAddress').textContent = accounts[0];
      document.getElementById('walletInfo').style.display = 'block';
      document.getElementById('connectButton').style.display = 'none';
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  } else {
    alert("MetaMask not detected!");
  }
}

async function stakeLPTokens(amount) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const stakingContract = new ethers.Contract(
    CONFIG.STAKING_CONTRACT.address,
    CONFIG.STAKING_CONTRACT.abi,
    signer
  );

  try {
    const tx = await stakingContract.stake(ethers.utils.parseEther(amount.toString()));
    await tx.wait();
    alert("Staked successfully!");
  } catch (error) {
    console.error("Staking error:", error);
    alert("Staking failed: " + error.message);
  }
}
