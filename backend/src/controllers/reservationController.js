const reservationService = require('../services/reservationService')

class ReservationController {
  async getAllReservations(req, res) {
    try {
      const reservations = await reservationService.getAllReservations()
      res.json({
        success: true,
        data: reservations.map(reservation => reservation.toJSON())
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  async getReservationById(req, res) {
    try {
      const { id } = req.params
      const reservation = await reservationService.getReservationById(parseInt(id))
      res.json({
        success: true,
        data: reservation.toJSON()
      })
    } catch (error) {
      const status = error.message.includes('찾을 수 없습니다') ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async createReservation(req, res) {
    try {
      const reservation = await reservationService.createReservation(req.body)
      res.status(201).json({
        success: true,
        message: '예약이 성공적으로 생성되었습니다.',
        data: reservation.toJSON()
      })
    } catch (error) {
      let status = 500
      if (error.message.includes('유효성 검사') ||
          error.message.includes('존재하지 않는') ||
          error.message.includes('사용할 수 없는') ||
          error.message.includes('예약 가능한 시간') ||
          error.message.includes('예약 시간') ||
          error.message.includes('이미 예약이')) status = 400

      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async updateReservation(req, res) {
    try {
      const { id } = req.params
      const reservation = await reservationService.updateReservation(parseInt(id), req.body)
      res.json({
        success: true,
        message: '예약이 성공적으로 수정되었습니다.',
        data: reservation.toJSON()
      })
    } catch (error) {
      let status = 500
      if (error.message.includes('찾을 수 없습니다')) status = 404
      if (error.message.includes('유효성 검사') ||
          error.message.includes('예약 시간') ||
          error.message.includes('이미 예약이')) status = 400

      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async deleteReservation(req, res) {
    try {
      const { id } = req.params
      const password = req.body?.password

      await reservationService.deleteReservation(parseInt(id), password)
      res.json({
        success: true,
        message: '예약이 성공적으로 삭제되었습니다.'
      })
    } catch (error) {
      let status = 500
      if (error.message.includes('찾을 수 없습니다')) status = 404
      if (error.message.includes('인증') || error.message.includes('비밀번호')) status = 401

      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async getReservationsByRoom(req, res) {
    try {
      const { roomId } = req.params
      const reservations = await reservationService.getReservationsByRoom(parseInt(roomId))
      res.json({
        success: true,
        data: reservations.map(reservation => reservation.toJSON())
      })
    } catch (error) {
      const status = error.message.includes('존재하지 않는') ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async getReservationsByDate(req, res) {
    try {
      const { date } = req.params
      const reservations = await reservationService.getReservationsByDate(date)
      res.json({
        success: true,
        data: reservations.map(reservation => reservation.toJSON())
      })
    } catch (error) {
      const status = error.message.includes('유효하지 않은 날짜') ? 400 : 500
      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async getUpcomingReservations(req, res) {
    try {
      const { limit = 10 } = req.query
      const reservations = await reservationService.getUpcomingReservations(parseInt(limit))
      res.json({
        success: true,
        data: reservations.map(reservation => reservation.toJSON())
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  async checkAvailability(req, res) {
    try {
      const { roomId, date, startTime, endTime } = req.query

      if (!roomId || !date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: '회의실 ID, 날짜, 시작시간, 종료시간이 모두 필요합니다.'
        })
      }

      const result = await reservationService.checkAvailability(
        parseInt(roomId),
        date,
        startTime,
        endTime
      )

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      let status = 500
      if (error.message.includes('존재하지 않는') ||
          error.message.includes('유효하지 않은')) status = 400

      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async getTodayReservations(req, res) {
    try {
      const reservations = await reservationService.getTodayReservations()
      res.json({
        success: true,
        data: reservations.map(reservation => reservation.toJSON())
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = new ReservationController()