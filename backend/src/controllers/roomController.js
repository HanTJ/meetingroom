const roomService = require('../services/roomService')

class RoomController {
  async getAllRooms(req, res) {
    try {
      const { date, startTime, endTime } = req.query

      // 파라미터 유효성 검사
      if ((date && !startTime) || (date && !endTime) || (startTime && !endTime)) {
        return res.status(400).json({
          success: false,
          message: '날짜와 시간을 모두 입력하거나 모두 생략해야 합니다.'
        })
      }

      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)'
        })
      }

      if (startTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
        return res.status(400).json({
          success: false,
          message: '시작 시간 형식이 올바르지 않습니다. (HH:MM)'
        })
      }

      if (endTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
        return res.status(400).json({
          success: false,
          message: '종료 시간 형식이 올바르지 않습니다. (HH:MM)'
        })
      }

      if (startTime && endTime && startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: '종료 시간은 시작 시간보다 늦어야 합니다.'
        })
      }

      const rooms = await roomService.getAllRooms(date, startTime, endTime)
      res.json({
        success: true,
        data: rooms.map(room => room.toJSON()),
        query: { date, startTime, endTime }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  async getRoomById(req, res) {
    try {
      const { id } = req.params
      const room = await roomService.getRoomById(parseInt(id))
      res.json({
        success: true,
        data: room.toJSON()
      })
    } catch (error) {
      const status = error.message.includes('찾을 수 없습니다') ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body)
      res.status(201).json({
        success: true,
        message: '회의실이 성공적으로 생성되었습니다.',
        data: room.toJSON()
      })
    } catch (error) {
      const status = error.message.includes('유효성 검사') ||
                    error.message.includes('이미 존재합니다') ? 400 : 500
      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async updateRoom(req, res) {
    try {
      const { id } = req.params
      const room = await roomService.updateRoom(parseInt(id), req.body)
      res.json({
        success: true,
        message: '회의실이 성공적으로 수정되었습니다.',
        data: room.toJSON()
      })
    } catch (error) {
      let status = 500
      if (error.message.includes('찾을 수 없습니다')) status = 404
      if (error.message.includes('유효성 검사') ||
          error.message.includes('이미 존재합니다')) status = 400

      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async deleteRoom(req, res) {
    try {
      const { id } = req.params
      await roomService.deleteRoom(parseInt(id))
      res.json({
        success: true,
        message: '회의실이 성공적으로 삭제되었습니다.'
      })
    } catch (error) {
      let status = 500
      if (error.message.includes('찾을 수 없습니다')) status = 404
      if (error.message.includes('예약이 있는')) status = 400

      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async updateRoomStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({
          success: false,
          message: '상태 정보가 필요합니다.'
        })
      }

      const room = await roomService.updateRoomStatus(parseInt(id), status)
      res.json({
        success: true,
        message: '회의실 상태가 성공적으로 변경되었습니다.',
        data: room.toJSON()
      })
    } catch (error) {
      let status = 500
      if (error.message.includes('찾을 수 없습니다')) status = 404
      if (error.message.includes('유효하지 않은 상태')) status = 400

      res.status(status).json({
        success: false,
        message: error.message
      })
    }
  }

  async getAvailableRooms(req, res) {
    try {
      const rooms = await roomService.getAvailableRooms()
      res.json({
        success: true,
        data: rooms.map(room => room.toJSON())
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  async getRoomsByCapacity(req, res) {
    try {
      const { capacity } = req.query

      if (!capacity || isNaN(capacity)) {
        return res.status(400).json({
          success: false,
          message: '유효한 수용인원을 입력해주세요.'
        })
      }

      const rooms = await roomService.getRoomsByCapacity(parseInt(capacity))
      res.json({
        success: true,
        data: rooms.map(room => room.toJSON())
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  async getRoomsByLocation(req, res) {
    try {
      const { location } = req.query

      if (!location) {
        return res.status(400).json({
          success: false,
          message: '위치 정보를 입력해주세요.'
        })
      }

      const rooms = await roomService.getRoomsByLocation(location)
      res.json({
        success: true,
        data: rooms.map(room => room.toJSON())
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = new RoomController()