// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract MeetingRoom {
    struct Room {
        uint256 id;
        string name;
        string description;
        uint256 capacity;
        bool isActive;
        address createdBy;
        uint256 createdAt;
    }

    struct Reservation {
        uint256 id;
        uint256 roomId;
        address reservedBy;
        uint256 startTime;
        uint256 endTime;
        string purpose;
        bool isActive;
        uint256 createdAt;
    }

    // State variables
    uint256 private nextRoomId;
    uint256 private nextReservationId;

    mapping(uint256 => Room) public rooms;
    mapping(uint256 => Reservation) public reservations;
    mapping(uint256 => uint256[]) public roomReservations; // roomId => reservationIds[]
    mapping(address => uint256[]) public userReservations; // user => reservationIds[]

    address public owner;

    // Events
    event RoomCreated(uint256 indexed roomId, string name, uint256 capacity);
    event RoomUpdated(uint256 indexed roomId, string name, uint256 capacity);
    event RoomDeactivated(uint256 indexed roomId);
    event ReservationCreated(uint256 indexed reservationId, uint256 indexed roomId, address indexed user, uint256 startTime, uint256 endTime);
    event ReservationCancelled(uint256 indexed reservationId, address indexed user);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier roomExists(uint256 roomId) {
        require(rooms[roomId].id != 0, "Room does not exist");
        _;
    }

    modifier reservationExists(uint256 reservationId) {
        require(reservations[reservationId].id != 0, "Reservation does not exist");
        _;
    }

    modifier onlyReservationOwner(uint256 reservationId) {
        require(reservations[reservationId].reservedBy == msg.sender, "Only reservation owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextRoomId = 1;
        nextReservationId = 1;
    }

    // Room management functions
    function createRoom(
        string memory name,
        string memory description,
        uint256 capacity
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Room name cannot be empty");
        require(capacity > 0, "Room capacity must be greater than 0");

        uint256 roomId = nextRoomId++;

        rooms[roomId] = Room({
            id: roomId,
            name: name,
            description: description,
            capacity: capacity,
            isActive: true,
            createdBy: msg.sender,
            createdAt: block.timestamp
        });

        emit RoomCreated(roomId, name, capacity);
        return roomId;
    }

    function updateRoom(
        uint256 roomId,
        string memory name,
        string memory description,
        uint256 capacity
    ) external onlyOwner roomExists(roomId) {
        require(bytes(name).length > 0, "Room name cannot be empty");
        require(capacity > 0, "Room capacity must be greater than 0");

        rooms[roomId].name = name;
        rooms[roomId].description = description;
        rooms[roomId].capacity = capacity;

        emit RoomUpdated(roomId, name, capacity);
    }

    function deactivateRoom(uint256 roomId) external onlyOwner roomExists(roomId) {
        rooms[roomId].isActive = false;
        emit RoomDeactivated(roomId);
    }

    // Reservation functions
    function makeReservation(
        uint256 roomId,
        uint256 startTime,
        uint256 endTime,
        string memory purpose
    ) external roomExists(roomId) returns (uint256) {
        require(rooms[roomId].isActive, "Room is not active");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");
        require(!isRoomReserved(roomId, startTime, endTime), "Room is already reserved for this time period");

        uint256 reservationId = nextReservationId++;

        reservations[reservationId] = Reservation({
            id: reservationId,
            roomId: roomId,
            reservedBy: msg.sender,
            startTime: startTime,
            endTime: endTime,
            purpose: purpose,
            isActive: true,
            createdAt: block.timestamp
        });

        roomReservations[roomId].push(reservationId);
        userReservations[msg.sender].push(reservationId);

        emit ReservationCreated(reservationId, roomId, msg.sender, startTime, endTime);
        return reservationId;
    }

    function cancelReservation(uint256 reservationId)
        external
        reservationExists(reservationId)
        onlyReservationOwner(reservationId)
    {
        require(reservations[reservationId].isActive, "Reservation is already cancelled");
        require(reservations[reservationId].startTime > block.timestamp, "Cannot cancel past reservations");

        reservations[reservationId].isActive = false;
        emit ReservationCancelled(reservationId, msg.sender);
    }

    // View functions
    function isRoomReserved(uint256 roomId, uint256 startTime, uint256 endTime)
        public
        view
        roomExists(roomId)
        returns (bool)
    {
        uint256[] memory reservationIds = roomReservations[roomId];

        for (uint256 i = 0; i < reservationIds.length; i++) {
            Reservation memory reservation = reservations[reservationIds[i]];

            if (reservation.isActive &&
                ((startTime >= reservation.startTime && startTime < reservation.endTime) ||
                 (endTime > reservation.startTime && endTime <= reservation.endTime) ||
                 (startTime <= reservation.startTime && endTime >= reservation.endTime))) {
                return true;
            }
        }

        return false;
    }

    function getRoomReservations(uint256 roomId)
        external
        view
        roomExists(roomId)
        returns (uint256[] memory)
    {
        return roomReservations[roomId];
    }

    function getUserReservations(address user) external view returns (uint256[] memory) {
        return userReservations[user];
    }

    function getActiveReservations(uint256 roomId)
        external
        view
        roomExists(roomId)
        returns (uint256[] memory)
    {
        uint256[] memory allReservations = roomReservations[roomId];
        uint256 activeCount = 0;

        // Count active reservations
        for (uint256 i = 0; i < allReservations.length; i++) {
            if (reservations[allReservations[i]].isActive) {
                activeCount++;
            }
        }

        // Create array of active reservations
        uint256[] memory activeReservations = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allReservations.length; i++) {
            if (reservations[allReservations[i]].isActive) {
                activeReservations[index] = allReservations[i];
                index++;
            }
        }

        return activeReservations;
    }

    function getTotalRooms() external view returns (uint256) {
        return nextRoomId - 1;
    }

    function getTotalReservations() external view returns (uint256) {
        return nextReservationId - 1;
    }
}