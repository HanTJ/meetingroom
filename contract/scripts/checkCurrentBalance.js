const hre = require("hardhat");

async function main() {
  const address = "0xB616BdEf465ce42c60Afc7c7a49BFF06D5557DCF";

  console.log("Checking current balance...");
  console.log("Address:", address);
  console.log("");

  try {
    // Get current balance
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInEth = hre.ethers.utils.formatEther(balance);

    console.log("Current Balance Information:");
    console.log(`  Address: ${address}`);
    console.log(`  Balance: ${balanceInEth} ETH`);
    console.log(`  Balance (Wei): ${balance.toString()}`);
    console.log("");

    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    const blockNumber = await hre.ethers.provider.getBlockNumber();

    console.log("Network Information:");
    console.log(`  Chain ID: ${network.chainId}`);
    console.log(`  Current Block: ${blockNumber}`);
    console.log("");

    // Compare with initial balance
    const initialBalance = hre.ethers.utils.parseEther("100000");
    const usedAmount = initialBalance.sub(balance);
    const usedInEth = hre.ethers.utils.formatEther(usedAmount);

    console.log("Balance Analysis:");
    console.log(`  Initial Balance: 100,000 ETH`);
    console.log(`  Current Balance: ${balanceInEth} ETH`);
    console.log(`  Total Used: ${usedInEth} ETH`);
    console.log(`  Remaining Percentage: ${(parseFloat(balanceInEth) / 100000 * 100).toFixed(6)}%`);

  } catch (error) {
    console.error("Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });