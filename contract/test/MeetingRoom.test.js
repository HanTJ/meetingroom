const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MeetingRoom", function () {
  let MeetingRoom;
  let meetingRoom;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    MeetingRoom = await ethers.getContractFactory("MeetingRoom");
    meetingRoom = await MeetingRoom.deploy();
    await meetingRoom.deployed();
  });

  describe("Room Management", function () {
    it("Should allow owner to create a room", async function () {
      const tx = await meetingRoom.createRoom("Test Room", "Test Description", 10);
      await tx.wait();

      const room = await meetingRoom.rooms(1);
      expect(room.name).to.equal("Test Room");
      expect(room.description).to.equal("Test Description");
      expect(room.capacity).to.equal(10);
      expect(room.isActive).to.be.true;
    });

    it("Should not allow non-owner to create a room", async function () {
      await expect(
        meetingRoom.connect(user1).createRoom("Test Room", "Test Description", 10)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should allow owner to update a room", async function () {
      await meetingRoom.createRoom("Test Room", "Test Description", 10);

      await meetingRoom.updateRoom(1, "Updated Room", "Updated Description", 15);

      const room = await meetingRoom.rooms(1);
      expect(room.name).to.equal("Updated Room");
      expect(room.description).to.equal("Updated Description");
      expect(room.capacity).to.equal(15);
    });

    it("Should allow owner to deactivate a room", async function () {
      await meetingRoom.createRoom("Test Room", "Test Description", 10);

      await meetingRoom.deactivateRoom(1);

      const room = await meetingRoom.rooms(1);
      expect(room.isActive).to.be.false;
    });
  });

  describe("Reservations", function () {
    beforeEach(async function () {
      await meetingRoom.createRoom("Test Room", "Test Description", 10);
    });

    it("Should allow users to make reservations", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hours duration

      const tx = await meetingRoom.connect(user1).makeReservation(
        1,
        startTime,
        endTime,
        "Team meeting"
      );
      await tx.wait();

      const reservation = await meetingRoom.reservations(1);
      expect(reservation.roomId).to.equal(1);
      expect(reservation.reservedBy).to.equal(user1.address);
      expect(reservation.startTime).to.equal(startTime);
      expect(reservation.endTime).to.equal(endTime);
      expect(reservation.purpose).to.equal("Team meeting");
      expect(reservation.isActive).to.be.true;
    });

    it("Should not allow overlapping reservations", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime1 = now + 3600;
      const endTime1 = startTime1 + 7200;
      const startTime2 = startTime1 + 3600; // Overlaps with first reservation
      const endTime2 = startTime2 + 7200;

      await meetingRoom.connect(user1).makeReservation(1, startTime1, endTime1, "Meeting 1");

      await expect(
        meetingRoom.connect(user2).makeReservation(1, startTime2, endTime2, "Meeting 2")
      ).to.be.revertedWith("Room is already reserved for this time period");
    });

    it("Should allow users to cancel their own reservations", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600;
      const endTime = startTime + 7200;

      await meetingRoom.connect(user1).makeReservation(1, startTime, endTime, "Team meeting");

      await meetingRoom.connect(user1).cancelReservation(1);

      const reservation = await meetingRoom.reservations(1);
      expect(reservation.isActive).to.be.false;
    });

    it("Should not allow users to cancel other users' reservations", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600;
      const endTime = startTime + 7200;

      await meetingRoom.connect(user1).makeReservation(1, startTime, endTime, "Team meeting");

      await expect(
        meetingRoom.connect(user2).cancelReservation(1)
      ).to.be.revertedWith("Only reservation owner can perform this action");
    });

    it("Should correctly check room availability", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600;
      const endTime = startTime + 7200;

      expect(await meetingRoom.isRoomReserved(1, startTime, endTime)).to.be.false;

      await meetingRoom.connect(user1).makeReservation(1, startTime, endTime, "Team meeting");

      expect(await meetingRoom.isRoomReserved(1, startTime, endTime)).to.be.true;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await meetingRoom.createRoom("Test Room 1", "Description 1", 10);
      await meetingRoom.createRoom("Test Room 2", "Description 2", 20);
    });

    it("Should return correct total rooms count", async function () {
      const totalRooms = await meetingRoom.getTotalRooms();
      expect(totalRooms).to.equal(2);
    });

    it("Should return user reservations", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600;
      const endTime = startTime + 7200;

      await meetingRoom.connect(user1).makeReservation(1, startTime, endTime, "Meeting 1");
      await meetingRoom.connect(user1).makeReservation(2, startTime + 8000, endTime + 8000, "Meeting 2");

      const userReservations = await meetingRoom.getUserReservations(user1.address);
      expect(userReservations.length).to.equal(2);
      expect(userReservations[0]).to.equal(1);
      expect(userReservations[1]).to.equal(2);
    });

    it("Should return room reservations", async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600;
      const endTime = startTime + 7200;

      await meetingRoom.connect(user1).makeReservation(1, startTime, endTime, "Meeting 1");
      await meetingRoom.connect(user2).makeReservation(1, startTime + 8000, endTime + 8000, "Meeting 2");

      const roomReservations = await meetingRoom.getRoomReservations(1);
      expect(roomReservations.length).to.equal(2);
    });
  });
});