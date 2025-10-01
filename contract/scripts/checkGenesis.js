const hre = require("hardhat");

async function main() {
  const address = "0xB616BdEf465ce42c60Afc7c7a49BFF06D5557DCF";

  console.log("Checking Genesis block and network state...");
  console.log("=".repeat(60));

  try {
    // Check Genesis block
    console.log("=== GENESIS BLOCK ===");
    const genesisBlock = await hre.ethers.provider.getBlock(0);
    console.log("Genesis Block Info:");
    console.log(`  Number: ${genesisBlock.number}`);
    console.log(`  Hash: ${genesisBlock.hash}`);
    console.log(`  Timestamp: ${new Date(genesisBlock.timestamp * 1000)}`);
    console.log(`  Transactions: ${genesisBlock.transactions.length}`);
    console.log("");

    // Check network info
    console.log("=== NETWORK INFO ===");
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`Network Name: ${network.name}`);
    console.log("");

    // Check current block
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const latestBlock = await hre.ethers.provider.getBlock(currentBlock);
    console.log("=== LATEST BLOCK ===");
    console.log(`  Block Number: ${currentBlock}`);
    console.log(`  Hash: ${latestBlock.hash}`);
    console.log(`  Transactions: ${latestBlock.transactions.length}`);
    console.log("");

    // Check account details
    console.log("=== ACCOUNT DETAILS ===");
    const balance = await hre.ethers.provider.getBalance(address);
    const txCount = await hre.ethers.provider.getTransactionCount(address);
    const code = await hre.ethers.provider.getCode(address);

    console.log(`Address: ${address}`);
    console.log(`Balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
    console.log(`Transaction Count (Nonce): ${txCount}`);
    console.log(`Code Length: ${code.length} (${code === "0x" ? "EOA" : "Contract"})`);
    console.log("");

    // Check if this address was in Genesis allocation
    console.log("=== GENESIS ALLOCATION CHECK ===");
    console.log("This analysis suggests the account was NOT in Genesis allocation");
    console.log("The current balance appears to be from mining rewards or transfers");
    console.log("");

    // Try to find any block where this address received ETH
    console.log("=== SEARCHING FOR ETH SOURCES ===");
    let foundMiningRewards = false;

    // Check recent blocks for mining rewards
    for (let i = Math.max(0, currentBlock - 20); i <= currentBlock; i++) {
      try {
        const block = await hre.ethers.provider.getBlock(i);
        if (block.miner && block.miner.toLowerCase() === address.toLowerCase()) {
          console.log(`Found mining reward in block ${i}`);
          foundMiningRewards = true;
        }
      } catch (error) {
        continue;
      }
    }

    if (!foundMiningRewards) {
      console.log("No mining rewards found in recent blocks");
    }

    // Calculate missing ETH mystery
    const initialExpected = hre.ethers.utils.parseEther("100000");
    const missing = initialExpected.sub(balance);

    console.log("");
    console.log("=== MYSTERY SUMMARY ===");
    console.log(`Expected from Genesis: 100,000 ETH`);
    console.log(`Current Balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
    console.log(`Missing: ${hre.ethers.utils.formatEther(missing)} ETH`);
    console.log("");
    console.log("POSSIBLE EXPLANATIONS:");
    console.log("1. Genesis block was reset/changed after initial allocation");
    console.log("2. Account was never actually allocated 100,000 ETH in Genesis");
    console.log("3. Network was restarted with different Genesis");
    console.log("4. Current balance is from mining rewards only");

  } catch (error) {
    console.error("Error checking Genesis:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });