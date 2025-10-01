const hre = require("hardhat");

async function main() {
  const extraData = "0x00000000000000000000000000000000000000000000000000000000000000003fdf0b9d413c62c49cbd8c7971da43100330c4b228af5fab265568e79e57f932e63267f72e248fc60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

  console.log("Genesis Block extraData Analysis");
  console.log("================================");
  console.log(`Full extraData: ${extraData}`);
  console.log("");

  // Remove 0x prefix
  const data = extraData.slice(2);
  console.log(`Data length: ${data.length} characters (${data.length / 2} bytes)`);
  console.log("");

  // PoA (Clique) extraData structure:
  // 32 bytes: vanity data
  // N * 20 bytes: validator addresses
  // 65 bytes: signature (for non-genesis blocks)

  // Extract vanity data (first 32 bytes = 64 hex characters)
  const vanityData = data.slice(0, 64);
  console.log(`Vanity data (32 bytes): 0x${vanityData}`);
  console.log("");

  // Find validator addresses (20 bytes each = 40 hex characters)
  // Skip vanity data (64 chars) and look for addresses
  let remainingData = data.slice(64);

  // For genesis block, the structure is simpler
  // Look for 40-character (20-byte) sequences that could be addresses
  const addresses = [];

  // Method 1: Extract known address patterns
  console.log("Searching for validator addresses...");
  console.log("");

  // Known addresses from the data
  const knownAddresses = [
    "3fdf0b9d413c62c49cbd8c7971da43100330c4b2",
    "28af5fab265568e79e57f932e63267f72e248fc6"
  ];

  for (const addr of knownAddresses) {
    const index = data.toLowerCase().indexOf(addr.toLowerCase());
    if (index !== -1) {
      const fullAddress = "0x" + addr;
      addresses.push(fullAddress);
      console.log(`Found address: ${fullAddress} at position ${index}`);

      // Check balance
      try {
        const balance = await hre.ethers.provider.getBalance(fullAddress);
        const balanceInEth = hre.ethers.utils.formatEther(balance);
        console.log(`  Balance: ${balanceInEth} ETH`);
      } catch (error) {
        console.log(`  Error checking balance: ${error.message}`);
      }
      console.log("");
    }
  }

  // Method 2: Extract all possible 20-byte sequences
  console.log("All possible addresses from extraData:");
  console.log("=====================================");

  for (let i = 0; i < data.length - 39; i += 2) {
    const possibleAddress = data.slice(i, i + 40);

    // Check if it looks like a valid address (not all zeros)
    if (possibleAddress.match(/^[0-9a-fA-F]{40}$/) &&
        possibleAddress !== "0000000000000000000000000000000000000000") {

      const fullAddr = "0x" + possibleAddress;
      console.log(`Checking: ${fullAddr}`);

      try {
        const balance = await hre.ethers.provider.getBalance(fullAddr);
        if (balance.gt(0)) {
          const balanceInEth = hre.ethers.utils.formatEther(balance);
          console.log(`  *** HAS BALANCE: ${balanceInEth} ETH ***`);
        } else {
          console.log(`  Balance: 0 ETH`);
        }
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });