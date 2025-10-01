const hre = require("hardhat");

async function main() {
  const address = "0x28AF5FAb265568E79e57F932E63267F72E248fc6";

  console.log(`Checking balance for address: ${address}\n`);

  try {
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInEth = hre.ethers.utils.formatEther(balance);

    console.log("Balance Information:");
    console.log(`  Address: ${address}`);
    console.log(`  Balance: ${balanceInEth} ETH`);
    console.log(`  Balance (Wei): ${balance.toString()}`);
    console.log("");

    // Check if this address has enough for deployment
    const deploymentCost = hre.ethers.utils.parseEther("0.003"); // Estimated deployment cost
    const hasEnoughBalance = balance.gte(deploymentCost);

    console.log("Deployment Feasibility:");
    console.log(`  Estimated deployment cost: 0.003 ETH`);
    console.log(`  Sufficient balance: ${hasEnoughBalance ? "YES" : "NO"}`);

    if (hasEnoughBalance) {
      console.log(`  Excess after deployment: ${hre.ethers.utils.formatEther(balance.sub(deploymentCost))} ETH`);
    } else {
      console.log(`  Additional ETH needed: ${hre.ethers.utils.formatEther(deploymentCost.sub(balance))} ETH`);
    }

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