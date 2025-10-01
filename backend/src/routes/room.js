const express = require('express')
const router = express.Router()
const roomController = require('../controllers/roomController')

// 모든 회의실 조회
router.get('/', roomController.getAllRooms)

// 사용 가능한 회의실 조회
router.get('/available', roomController.getAvailableRooms)

// 수용인원별 회의실 조회
router.get('/by-capacity', roomController.getRoomsByCapacity)

// 위치별 회의실 조회
router.get('/by-location', roomController.getRoomsByLocation)

// 특정 회의실 조회
router.get('/:id', roomController.getRoomById)

// 회의실 생성
router.post('/', roomController.createRoom)

// 회의실 정보 수정
router.put('/:id', roomController.updateRoom)

// 회의실 상태 변경
router.patch('/:id/status', roomController.updateRoomStatus)

// 회의실 삭제
router.delete('/:id', roomController.deleteRoom)

module.exports = router