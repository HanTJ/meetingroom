const hre = require("hardhat");

async function main() {
  const privateKey = "0x813786e481f5062476ec89b2b2bdab7698f9a5ded5fb7fa27bb476e2b95ac290";

  console.log("Importing account from private key...");
  console.log("Private Key:", privateKey);

  // Create wallet from private key
  const wallet = new hre.ethers.Wallet(privateKey);
  const address = wallet.address;

  console.log("Account Address:", address);
  console.log("");

  // Check balance
  try {
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInEth = hre.ethers.utils.formatEther(balance);

    console.log("Balance Information:");
    console.log(`  Address: ${address}`);
    console.log(`  Balance: ${balanceInEth} ETH`);
    console.log(`  Balance (Wei): ${balance.toString()}`);
    console.log("");

    // Check if sufficient for deployment
    const deploymentCost = hre.ethers.utils.parseEther("0.01"); // Estimated
    const hasSufficientBalance = balance.gte(deploymentCost);

    console.log("Deployment Check:");
    console.log(`  Estimated cost: 0.01 ETH`);
    console.log(`  Sufficient balance: ${hasSufficientBalance ? "YES ✅" : "NO ❌"}`);

    if (hasSufficientBalance) {
      console.log(`  Remaining after deployment: ${hre.ethers.utils.formatEther(balance.sub(deploymentCost))} ETH`);
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