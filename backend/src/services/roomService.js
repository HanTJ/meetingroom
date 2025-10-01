const roomRepository = require('../repositories/roomRepository')
const reservationRepository = require('../repositories/reservationRepository')
const Room = require('../models/Room')

class RoomService {
  async getAllRooms(date = null, startTime = null, endTime = null) {
    const rooms = await roomRepository.findAll()

    // 각 회의실의 상태를 동적으로 계산
    for (let room of rooms) {
      if (date && startTime && endTime) {
        // 특정 일자/시간대에 대한 상태 계산
        room.status = await this.calculateRoomStatusForDateTime(room.id, date, startTime, endTime)
      } else {
        // 현재 시간 기준 상태 계산
        room.status = await this.calculateRoomStatus(room.id)
      }
    }

    return rooms
  }

  async calculateRoomStatus(roomId) {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM 형식

    // 오늘 해당 회의실의 예약 조회
    const todayReservations = await reservationRepository.findByRoomAndDate(roomId, today)

    // 현재 시간에 진행 중인 예약이 있는지 확인
    const currentReservation = todayReservations.find(reservation => {
      return reservation.start_time <= currentTime && reservation.end_time > currentTime
    })

    return currentReservation ? 'occupied' : 'available'
  }

  async calculateRoomStatusForDateTime(roomId, date, startTime, endTime) {
    // 해당 날짜의 회의실 예약 조회
    const reservations = await reservationRepository.findByRoomAndDate(roomId, date)

    // 요청한 시간대와 겹치는 예약이 있는지 확인
    const conflictingReservation = reservations.find(reservation => {
      // 시간 겹침 확인:
      // (요청시작 < 예약종료) && (요청종료 > 예약시작)
      return (startTime < reservation.end_time) && (endTime > reservation.start_time)
    })

    if (conflictingReservation) {
      // 현재 시간이 해당 예약 시간 내에 있으면 '사용중', 아니면 '예약불가'
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().slice(0, 5)

      if (date === today) {
        // 오늘 날짜인 경우
        const isCurrentlyOccupied = conflictingReservation.start_time <= currentTime &&
                                  conflictingReservation.end_time > currentTime
        return isCurrentlyOccupied ? 'occupied' : 'unavailable'
      } else {
        // 미래 날짜인 경우
        return 'unavailable'
      }
    }

    // 과거 시간대인지 확인 (오늘 날짜인 경우만)
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().slice(0, 5)

    if (date === today && endTime <= currentTime) {
      return 'unavailable' // 과거 시간은 예약 불가
    }

    return 'available'
  }

  async getRoomById(id) {
    const room = await roomRepository.findById(id)
    if (!room) {
      throw new Error('회의실을 찾을 수 없습니다.')
    }

    // 현재 상태 동적 계산
    room.status = await this.calculateRoomStatus(room.id)

    return room
  }

  async createRoom(roomData) {
    // 데이터 유효성 검사
    const errors = Room.validate(roomData)
    if (errors.length > 0) {
      throw new Error(`유효성 검사 실패: ${errors.join(', ')}`)
    }

    // 중복 이름 검사
    const existingRoom = await roomRepository.findByName(roomData.name)
    if (existingRoom) {
      throw new Error('동일한 이름의 회의실이 이미 존재합니다.')
    }

    return await roomRepository.create(roomData)
  }

  async updateRoom(id, roomData) {
    // 회의실 존재 여부 확인
    await this.getRoomById(id)

    // 업데이트할 데이터가 있는 경우에만 유효성 검사
    const dataToValidate = {}
    if (roomData.name !== undefined) dataToValidate.name = roomData.name
    if (roomData.capacity !== undefined) dataToValidate.capacity = roomData.capacity
    if (roomData.location !== undefined) dataToValidate.location = roomData.location
    if (roomData.status !== undefined) dataToValidate.status = roomData.status

    if (Object.keys(dataToValidate).length > 0) {
      const errors = Room.validate(dataToValidate)
      if (errors.length > 0) {
        throw new Error(`유효성 검사 실패: ${errors.join(', ')}`)
      }
    }

    // 이름 중복 검사 (이름이 변경되는 경우)
    if (roomData.name) {
      const existingRoom = await roomRepository.findByName(roomData.name)
      if (existingRoom && existingRoom.id !== parseInt(id)) {
        throw new Error('동일한 이름의 회의실이 이미 존재합니다.')
      }
    }

    return await roomRepository.update(id, roomData)
  }

  async deleteRoom(id) {
    // 회의실 존재 여부 확인
    await this.getRoomById(id)

    return await roomRepository.delete(id)
  }

  async updateRoomStatus(id, status) {
    // 회의실 존재 여부 확인
    await this.getRoomById(id)

    // 상태 유효성 검사
    const validStatuses = ['available', 'occupied', 'maintenance']
    if (!validStatuses.includes(status)) {
      throw new Error(`유효하지 않은 상태입니다. 사용 가능한 상태: ${validStatuses.join(', ')}`)
    }

    return await roomRepository.updateStatus(id, status)
  }

  async getAvailableRooms() {
    const allRooms = await roomRepository.findAll()
    return allRooms.filter(room => room.status === 'available')
  }

  async getRoomsByCapacity(minCapacity) {
    const allRooms = await roomRepository.findAll()
    return allRooms.filter(room => room.capacity >= minCapacity)
  }

  async getRoomsByLocation(location) {
    const allRooms = await roomRepository.findAll()
    return allRooms.filter(room =>
      room.location.toLowerCase().includes(location.toLowerCase())
    )
  }
}

module.exports = new RoomService()