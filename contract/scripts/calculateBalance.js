const hre = require("hardhat");

async function main() {
  const hexBalance = "0x200000000000000000000000000000000000000000000000000000000000000";

  console.log("Genesis Block Balance Analysis");
  console.log("================================");
  console.log(`Hex Value: ${hexBalance}`);
  console.log("");

  // Convert hex to BigNumber
  const balanceInWei = hre.ethers.BigNumber.from(hexBalance);

  console.log(`Balance in Wei: ${balanceInWei.toString()}`);

  // Convert to ETH
  const balanceInEth = hre.ethers.utils.formatEther(balanceInWei);
  console.log(`Balance in ETH: ${balanceInEth}`);

  // Scientific notation analysis
  const weiString = balanceInWei.toString();
  const digitCount = weiString.length;
  console.log("");
  console.log("Analysis:");
  console.log(`- Total digits: ${digitCount}`);
  console.log(`- Scientific notation: ${parseFloat(balanceInEth).toExponential()}`);

  // Compare with common values
  console.log("");
  console.log("Comparison:");
  console.log(`- 1 ETH = 1,000,000,000,000,000,000 Wei (18 zeros)`);
  console.log(`- This balance has ${digitCount - 1} digits after the first digit`);

  // Check if this is enough for deployment
  const deploymentCost = hre.ethers.utils.parseEther("0.01"); // 0.01 ETH should be enough
  const isEnough = balanceInWei.gte(deploymentCost);
  console.log("");
  console.log("Deployment Check:");
  console.log(`- Estimated deployment cost: 0.01 ETH`);
  console.log(`- Is balance sufficient: ${isEnough ? "YES ✅" : "NO ❌"}`);

  if (isEnough) {
    const remaining = balanceInWei.sub(deploymentCost);
    console.log(`- Remaining after deployment: ${hre.ethers.utils.formatEther(remaining)} ETH`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });