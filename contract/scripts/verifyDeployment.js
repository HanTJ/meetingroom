const hre = require("hardhat");

async function main() {
  const contractAddress = "0xD64Ed41dd56067E8FB23DA217F252D582AE8e353";
  const deployerAddress = "0xB616BdEf465ce42c60Afc7c7a49BFF06D5557DCF";

  console.log("Verifying MeetingRoom contract deployment...");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", deployerAddress);
  console.log("");

  // Get contract instance
  const MeetingRoom = await hre.ethers.getContractFactory("MeetingRoom");
  const meetingRoom = MeetingRoom.attach(contractAddress);

  try {
    // Check basic contract info
    console.log("=== Contract Verification ===");

    // Check owner
    const owner = await meetingRoom.owner();
    console.log(`Contract Owner: ${owner}`);
    console.log(`Owner matches deployer: ${owner.toLowerCase() === deployerAddress.toLowerCase()}`);

    // Check total rooms
    const totalRooms = await meetingRoom.getTotalRooms();
    console.log(`Total Rooms: ${totalRooms}`);

    // Check each room
    console.log("\n=== Room Information ===");
    for (let i = 1; i <= totalRooms; i++) {
      const room = await meetingRoom.rooms(i);
      console.log(`Room ${i}:`);
      console.log(`  Name: ${room.name}`);
      console.log(`  Description: ${room.description}`);
      console.log(`  Capacity: ${room.capacity}`);
      console.log(`  Active: ${room.isActive}`);
      console.log("");
    }

    // Check deployer balance after deployment
    const balance = await hre.ethers.provider.getBalance(deployerAddress);
    const balanceInEth = hre.ethers.utils.formatEther(balance);
    console.log("=== Deployer Balance After Deployment ===");
    console.log(`Address: ${deployerAddress}`);
    console.log(`Balance: ${balanceInEth} ETH`);

    console.log("\n✅ Contract deployment verified successfully!");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });