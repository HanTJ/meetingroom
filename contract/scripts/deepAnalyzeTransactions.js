const hre = require("hardhat");

async function main() {
  const address = "0xB616BdEf465ce42c60Afc7c7a49BFF06D5557DCF";

  console.log("Deep analysis of transaction history for address:", address);
  console.log("=".repeat(70));

  try {
    // Get current block number
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    console.log(`Current block: ${currentBlock}`);

    // Get transaction count (nonce) - this tells us how many transactions were sent
    const txCount = await hre.ethers.provider.getTransactionCount(address);
    console.log(`Total transactions sent from this address: ${txCount}`);
    console.log("");

    // Search through ALL blocks from genesis
    console.log("Searching through all blocks from genesis...");
    let foundTransactions = [];
    let totalGasUsed = hre.ethers.BigNumber.from(0);
    let totalValue = hre.ethers.BigNumber.from(0);

    for (let i = 0; i <= currentBlock; i++) {
      try {
        const block = await hre.ethers.provider.getBlock(i, true);

        if (block && block.transactions) {
          for (let tx of block.transactions) {
            // Check transactions FROM our address
            if (tx.from && tx.from.toLowerCase() === address.toLowerCase()) {
              const receipt = await hre.ethers.provider.getTransactionReceipt(tx.hash);

              foundTransactions.push({
                type: "OUTGOING",
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

            // Check transactions TO our address (incoming)
            if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
              foundTransactions.push({
                type: "INCOMING",
                blockNumber: i,
                hash: tx.hash,
                from: tx.from,
                value: tx.value,
                gasPrice: tx.gasPrice
              });
            }
          }
        }

        // Progress indicator
        if (i % 10 === 0) {
          process.stdout.write(`\rProgress: ${i}/${currentBlock} blocks checked`);
        }
      } catch (error) {
        // Skip problematic blocks
        continue;
      }
    }

    console.log("\n");
    console.log("=".repeat(70));

    // Display found transactions
    if (foundTransactions.length > 0) {
      console.log(`Found ${foundTransactions.length} transactions:`);
      console.log("-".repeat(70));

      foundTransactions.forEach((tx, index) => {
        console.log(`Transaction ${index + 1} [${tx.type}]:`);
        console.log(`  Block: ${tx.blockNumber}`);
        console.log(`  Hash: ${tx.hash}`);

        if (tx.type === "OUTGOING") {
          console.log(`  To: ${tx.to || "Contract Creation"}`);
          console.log(`  Value Sent: ${hre.ethers.utils.formatEther(tx.value)} ETH`);
          console.log(`  Gas Price: ${hre.ethers.utils.formatUnits(tx.gasPrice, "gwei")} Gwei`);
          console.log(`  Gas Used: ${tx.gasUsed ? tx.gasUsed.toString() : "N/A"}`);
          console.log(`  Gas Cost: ${tx.gasUsed ? hre.ethers.utils.formatEther(tx.gasPrice.mul(tx.gasUsed)) : "N/A"} ETH`);
          console.log(`  Status: ${tx.status === 1 ? "Success" : tx.status === 0 ? "Failed" : "Unknown"}`);
        } else {
          console.log(`  From: ${tx.from}`);
          console.log(`  Value Received: ${hre.ethers.utils.formatEther(tx.value)} ETH`);
        }
        console.log("");
      });
    } else {
      console.log("❌ No transactions found for this address!");
    }

    console.log("=".repeat(70));
    console.log("SUMMARY:");
    console.log(`  Total outgoing transactions: ${foundTransactions.filter(tx => tx.type === "OUTGOING").length}`);
    console.log(`  Total incoming transactions: ${foundTransactions.filter(tx => tx.type === "INCOMING").length}`);
    console.log(`  Total gas cost: ${hre.ethers.utils.formatEther(totalGasUsed)} ETH`);
    console.log(`  Total value sent: ${hre.ethers.utils.formatEther(totalValue)} ETH`);
    console.log(`  Total outgoing: ${hre.ethers.utils.formatEther(totalGasUsed.add(totalValue))} ETH`);

    const currentBalance = await hre.ethers.provider.getBalance(address);
    console.log(`  Current balance: ${hre.ethers.utils.formatEther(currentBalance)} ETH`);

    // Calculate discrepancy
    const initialBalance = hre.ethers.utils.parseEther("100000");
    const totalIncoming = foundTransactions
      .filter(tx => tx.type === "INCOMING")
      .reduce((sum, tx) => sum.add(tx.value), hre.ethers.BigNumber.from(0));

    console.log("");
    console.log("BALANCE ANALYSIS:");
    console.log(`  Expected initial: 100,000 ETH`);
    console.log(`  Total received: ${hre.ethers.utils.formatEther(totalIncoming)} ETH`);
    console.log(`  Total spent: ${hre.ethers.utils.formatEther(totalGasUsed.add(totalValue))} ETH`);
    console.log(`  Current balance: ${hre.ethers.utils.formatEther(currentBalance)} ETH`);

    const expectedBalance = totalIncoming.sub(totalGasUsed).sub(totalValue);
    console.log(`  Expected balance: ${hre.ethers.utils.formatEther(expectedBalance)} ETH`);
    console.log(`  Discrepancy: ${hre.ethers.utils.formatEther(currentBalance.sub(expectedBalance))} ETH`);

  } catch (error) {
    console.error("Error in deep analysis:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });