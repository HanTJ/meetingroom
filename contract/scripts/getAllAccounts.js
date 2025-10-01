const hre = require("hardhat");

async function main() {
  console.log("Checking for all possible accounts on the network...\n");

  try {
    // Method 1: Check predefined accounts (from geth/ganache)
    console.log("=== Method 1: Predefined Accounts ===");
    const signers = await hre.ethers.getSigners();
    console.log(`Found ${signers.length} signers from configuration:\n`);

    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const address = await signer.getAddress();
      const balance = await signer.getBalance();
      const balanceInEth = hre.ethers.utils.formatEther(balance);

      console.log(`Signer ${i + 1}:`);
      console.log(`  Address: ${address}`);
      console.log(`  Balance: ${balanceInEth} ETH`);
      console.log("");
    }

    // Method 2: Try to get accounts via web3 style
    console.log("=== Method 2: Web3 Style Accounts ===");
    try {
      const web3Accounts = await hre.ethers.provider.send("eth_accounts", []);
      console.log(`Found ${web3Accounts.length} accounts via eth_accounts:\n`);

      for (let i = 0; i < web3Accounts.length; i++) {
        const account = web3Accounts[i];
        const balance = await hre.ethers.provider.getBalance(account);
        const balanceInEth = hre.ethers.utils.formatEther(balance);

        console.log(`Account ${i + 1}:`);
        console.log(`  Address: ${account}`);
        console.log(`  Balance: ${balanceInEth} ETH`);
        console.log("");
      }
    } catch (error) {
      console.log("eth_accounts method not supported on this network");
    }

    // Method 3: Check coinbase account
    console.log("=== Method 3: Coinbase Account ===");
    try {
      const coinbase = await hre.ethers.provider.send("eth_coinbase", []);
      const balance = await hre.ethers.provider.getBalance(coinbase);
      const balanceInEth = hre.ethers.utils.formatEther(balance);

      console.log("Coinbase Account:");
      console.log(`  Address: ${coinbase}`);
      console.log(`  Balance: ${balanceInEth} ETH`);
      console.log("");
    } catch (error) {
      console.log("Could not get coinbase account:", error.message);
    }

    // Network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("=== Network Information ===");
    console.log(`Name: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);

  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });