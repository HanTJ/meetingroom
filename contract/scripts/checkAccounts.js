const hre = require("hardhat");

async function main() {
  console.log("Checking all accounts and balances on private PoA network...\n");

  try {
    // Get all accounts from the network
    const accounts = await hre.ethers.provider.listAccounts();
    console.log(`Found ${accounts.length} accounts:\n`);

    // Check balance for each account
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const balance = await hre.ethers.provider.getBalance(account);
      const balanceInEth = hre.ethers.utils.formatEther(balance);

      console.log(`Account ${i + 1}:`);
      console.log(`  Address: ${account}`);
      console.log(`  Balance: ${balanceInEth} ETH`);
      console.log(`  Balance (Wei): ${balance.toString()}`);
      console.log("");
    }

    // Check network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("Network Information:");
    console.log(`  Name: ${network.name}`);
    console.log(`  Chain ID: ${network.chainId}`);
    console.log("");

    // Check latest block
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`Latest block number: ${blockNumber}`);

  } catch (error) {
    console.error("Error checking accounts:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });