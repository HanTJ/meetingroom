const hre = require("hardhat");

async function main() {
  const address = "0xB616BdEf465ce42c60Afc7c7a49BFF06D5557DCF";

  console.log("Analyzing transaction history for address:", address);
  console.log("=".repeat(60));

  try {
    // Get current block number
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    console.log(`Current block: ${currentBlock}`);
    console.log("");

    // Get transaction count (nonce)
    const txCount = await hre.ethers.provider.getTransactionCount(address);
    console.log(`Total transactions sent: ${txCount}`);
    console.log("");

    let totalGasUsed = hre.ethers.BigNumber.from(0);
    let totalValue = hre.ethers.BigNumber.from(0);

    console.log("Transaction History:");
    console.log("-".repeat(60));

    // Search through recent blocks for transactions from this address
    const blocksToCheck = Math.min(currentBlock, 100); // Check last 100 blocks or all if less
    let foundTransactions = [];

    for (let i = Math.max(0, currentBlock - blocksToCheck); i <= currentBlock; i++) {
      try {
        const block = await hre.ethers.provider.getBlock(i, true);

        if (block && block.transactions) {
          for (let tx of block.transactions) {
            if (tx.from && tx.from.toLowerCase() === address.toLowerCase()) {
              // Get transaction receipt for gas used
              const receipt = await hre.ethers.provider.getTransactionReceipt(tx.hash);

              foundTransactions.push({
                blockNumber: i,
                hash: tx.hash,
                to: tx.to,
                value: tx.value,
                gasPrice: tx.gasPrice,
                gasLimit: tx.gasLimit,
                gasUsed: receipt ? receipt.gasUsed : null,
                status: receipt ? receipt.status : null
              });

              if (receipt) {
                const gasCost = tx.gasPrice.mul(receipt.gasUsed);
                totalGasUsed = totalGasUsed.add(gasCost);
              }

              if (tx.value) {
                totalValue = totalValue.add(tx.value);
              }
            }
          }
        }
      } catch (error) {
        // Skip blocks that can't be fetched
        continue;
      }
    }

    // Display found transactions
    if (foundTransactions.length > 0) {
      foundTransactions.forEach((tx, index) => {
        console.log(`Transaction ${index + 1}:`);
        console.log(`  Block: ${tx.blockNumber}`);
        console.log(`  Hash: ${tx.hash}`);
        console.log(`  To: ${tx.to || "Contract Creation"}`);
        console.log(`  Value: ${hre.ethers.utils.formatEther(tx.value)} ETH`);
        console.log(`  Gas Price: ${hre.ethers.utils.formatUnits(tx.gasPrice, "gwei")} Gwei`);
        console.log(`  Gas Limit: ${tx.gasLimit.toString()}`);
        console.log(`  Gas Used: ${tx.gasUsed ? tx.gasUsed.toString() : "N/A"}`);
        console.log(`  Gas Cost: ${tx.gasUsed ? hre.ethers.utils.formatEther(tx.gasPrice.mul(tx.gasUsed)) : "N/A"} ETH`);
        console.log(`  Status: ${tx.status === 1 ? "Success" : tx.status === 0 ? "Failed" : "Unknown"}`);
        console.log("");
      });
    } else {
      console.log("No transactions found in recent blocks");
    }

    console.log("=".repeat(60));
    console.log("Summary:");
    console.log(`  Total transactions found: ${foundTransactions.length}`);
    console.log(`  Total gas cost: ${hre.ethers.utils.formatEther(totalGasUsed)} ETH`);
    console.log(`  Total value sent: ${hre.ethers.utils.formatEther(totalValue)} ETH`);
    console.log(`  Total outgoing: ${hre.ethers.utils.formatEther(totalGasUsed.add(totalValue))} ETH`);

    // Check current balance
    const currentBalance = await hre.ethers.provider.getBalance(address);
    console.log(`  Current balance: ${hre.ethers.utils.formatEther(currentBalance)} ETH`);

    // Calculate missing amount
    const initialBalance = hre.ethers.utils.parseEther("100000");
    const accountedFor = totalGasUsed.add(totalValue).add(currentBalance);
    const missing = initialBalance.sub(accountedFor);

    console.log("");
    console.log("Balance Analysis:");
    console.log(`  Initial balance: 100,000 ETH`);
    console.log(`  Accounted for: ${hre.ethers.utils.formatEther(accountedFor)} ETH`);
    console.log(`  Missing/Unaccounted: ${hre.ethers.utils.formatEther(missing)} ETH`);

  } catch (error) {
    console.error("Error analyzing transactions:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });