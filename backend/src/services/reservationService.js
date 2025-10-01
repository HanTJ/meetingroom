const reservationRepository = require('../repositories/reservationRepository')
const roomRepository = require('../repositories/roomRepository')
const Reservation = require('../models/Reservation')

// Node.js 18+ global fetch 또는 polyfill 사용
const fetch = globalThis.fetch || require('node-fetch')

class ReservationService {
  async getAllReservations() {
    return await reservationRepository.findAll()
  }

  async getReservationById(id) {
    const reservation = await reservationRepository.findById(id)
    if (!reservation) {
      throw new Error('예약을 찾을 수 없습니다.')
    }
    return reservation
  }

  async createReservation(reservationData) {
    // 데이터 유효성 검사
    const errors = Reservation.validate(reservationData)
    if (errors.length > 0) {
      throw new Error(`유효성 검사 실패: ${errors.join(', ')}`)
    }

    // 회의실 존재 여부 및 사용 가능 상태 확인
    const room = await roomRepository.findById(reservationData.room_id)
    if (!room) {
      throw new Error('존재하지 않는 회의실입니다.')
    }
    if (room.status !== 'available') {
      throw new Error('현재 사용할 수 없는 회의실입니다.')
    }

    // 영업시간 체크 (9:00 ~ 18:00)
    const startHour = parseInt(reservationData.start_time.split(':')[0])
    const endHour = parseInt(reservationData.end_time.split(':')[0])
    const endMinute = parseInt(reservationData.end_time.split(':')[1])

    if (startHour < 9 || endHour > 18 || (endHour === 18 && endMinute > 0)) {
      throw new Error('예약 가능한 시간은 09:00 ~ 18:00 입니다.')
    }

    // 최소 예약 시간 체크 (30분)
    const startTime = new Date(`2000-01-01T${reservationData.start_time}:00`)
    const endTime = new Date(`2000-01-01T${reservationData.end_time}:00`)
    const diffMinutes = (endTime - startTime) / (1000 * 60)

    if (diffMinutes < 30) {
      throw new Error('최소 예약 시간은 30분입니다.')
    }

    if (diffMinutes > 480) { // 8시간
      throw new Error('최대 예약 시간은 8시간입니다.')
    }

    return await reservationRepository.create(reservationData)
  }

  async updateReservation(id, reservationData) {
    // 예약 존재 여부 확인
    await this.getReservationById(id)

    // 업데이트할 데이터가 있는 경우에만 유효성 검사
    const dataToValidate = { ...reservationData }
    if (Object.keys(dataToValidate).length > 0) {
      // room_id는 수정 시 기본값으로 설정 (실제로는 수정되지 않음)
      if (!dataToValidate.room_id) {
        dataToValidate.room_id = 1 // 임시값
      }

      const errors = Reservation.validate(dataToValidate)
      if (errors.length > 0) {
        throw new Error(`유효성 검사 실패: ${errors.join(', ')}`)
      }
    }

    // 시간 관련 검증 (시작시간과 종료시간이 모두 제공된 경우)
    if (reservationData.start_time && reservationData.end_time) {
      const startTime = new Date(`2000-01-01T${reservationData.start_time}:00`)
      const endTime = new Date(`2000-01-01T${reservationData.end_time}:00`)
      const diffMinutes = (endTime - startTime) / (1000 * 60)

      if (diffMinutes < 30) {
        throw new Error('최소 예약 시간은 30분입니다.')
      }

      if (diffMinutes > 480) {
        throw new Error('최대 예약 시간은 8시간입니다.')
      }
    }

    return await reservationRepository.update(id, reservationData)
  }

  async deleteReservation(id, password) {
    // 예약 존재 여부 확인
    const reservation = await this.getReservationById(id)

    // 지갑 정보가 있는 예약인 경우에만 인증 진행
    if (reservation.wallet_address) {
      await this.verifyWalletAuthentication(reservation.wallet_address, password)
    }

    return await reservationRepository.delete(id)
  }

  async verifyWalletAuthentication(walletAddress, password) {
    try {
      // 블록체인 노드에 계정 잠금 해제 요청으로 비밀번호 검증
      // .env 파일에서 실제 네트워크 URL 로드, 없으면 기본값 사용
      const PRIVATE_NETWORK_URL = process.env.BLOCKCHAIN_URL || 'http://192.168.1.100:8545'

      const response = await fetch(PRIVATE_NETWORK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'personal_unlockAccount',
          params: [walletAddress, password, 1], // 1초만 잠금 해제 (테스트용)
          id: Date.now()
        })
      })

      const result = await response.json()

      if (result.error) {
        throw new Error('지갑 비밀번호가 올바르지 않습니다.')
      }

      if (!result.result) {
        throw new Error('지갑 인증에 실패했습니다.')
      }

      console.log('지갑 인증 성공:', walletAddress)
      return true
    } catch (error) {
      console.error('지갑 인증 실패:', error.message)
      throw new Error(`지갑 인증 실패: ${error.message}`)
    }
  }

  async getReservationsByRoom(roomId) {
    // 회의실 존재 여부 확인
    const room = await roomRepository.findById(roomId)
    if (!room) {
      throw new Error('존재하지 않는 회의실입니다.')
    }

    return await reservationRepository.findByRoomAndDate(roomId, new Date().toISOString().split('T')[0])
  }

  async getReservationsByDate(date) {
    // 날짜 유효성 검사
    if (!Reservation.isValidDate(date)) {
      throw new Error('유효하지 않은 날짜 형식입니다. (YYYY-MM-DD)')
    }

    const allReservations = await reservationRepository.findAll()
    return allReservations.filter(reservation => reservation.date === date)
  }

  async getUpcomingReservations(limit = 10) {
    return await reservationRepository.findUpcoming(limit)
  }

  async checkAvailability(roomId, date, startTime, endTime) {
    // 회의실 존재 여부 확인
    const room = await roomRepository.findById(roomId)
    if (!room) {
      throw new Error('존재하지 않는 회의실입니다.')
    }

    // 날짜와 시간 유효성 검사
    if (!Reservation.isValidDate(date)) {
      throw new Error('유효하지 않은 날짜 형식입니다.')
    }

    if (!Reservation.isValidTime(startTime) || !Reservation.isValidTime(endTime)) {
      throw new Error('유효하지 않은 시간 형식입니다.')
    }

    if (startTime >= endTime) {
      throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.')
    }

    // 충돌 검사
    const hasConflict = await reservationRepository.checkConflict(roomId, date, startTime, endTime)

    return {
      available: !hasConflict,
      room: room.toJSON(),
      requestedDate: date,
      requestedStartTime: startTime,
      requestedEndTime: endTime
    }
  }

  async getTodayReservations() {
    const today = new Date().toISOString().split('T')[0]
    return await this.getReservationsByDate(today)
  }
}

module.exports = new ReservationService()