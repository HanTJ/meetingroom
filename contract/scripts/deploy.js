const hre = require("hardhat");

async function main() {
  console.log("Deploying MeetingRoom contract...");

  // Deploy the contract
  const MeetingRoom = await hre.ethers.getContractFactory("MeetingRoom");
  const meetingRoom = await MeetingRoom.deploy();

  await meetingRoom.deployed();

  const contractAddress = meetingRoom.address;
  console.log("MeetingRoom contract deployed to:", contractAddress);

  // Create some sample rooms
  console.log("\nCreating sample rooms...");

  const tx1 = await meetingRoom.createRoom("Conference Room A", "Large conference room for team meetings", 20);
  await tx1.wait();
  console.log("Created Conference Room A");

  const tx2 = await meetingRoom.createRoom("Meeting Room B", "Small meeting room for 1-on-1 discussions", 4);
  await tx2.wait();
  console.log("Created Meeting Room B");

  const tx3 = await meetingRoom.createRoom("Presentation Room", "Room with projector for presentations", 50);
  await tx3.wait();
  console.log("Created Presentation Room");

  console.log("\nDeployment completed!");
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Total rooms created: 3`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });