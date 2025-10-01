const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MeetingRoomModule", (m) => {
  // Deploy the MeetingRoom contract
  const meetingRoom = m.contract("MeetingRoom");

  return { meetingRoom };
});