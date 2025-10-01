const express = require('express')
const router = express.Router()
const reservationController = require('../controllers/reservationController')

// 모든 예약 조회
router.get('/', reservationController.getAllReservations)

// 다가오는 예약 조회
router.get('/upcoming', reservationController.getUpcomingReservations)

// 오늘의 예약 조회
router.get('/today', reservationController.getTodayReservations)

// 예약 가능 여부 확인
router.get('/availability', reservationController.checkAvailability)

// 날짜별 예약 조회
router.get('/date/:date', reservationController.getReservationsByDate)

// 회의실별 예약 조회
router.get('/room/:roomId', reservationController.getReservationsByRoom)

// 특정 예약 조회
router.get('/:id', reservationController.getReservationById)

// 예약 생성
router.post('/', reservationController.createReservation)

// 예약 수정
router.put('/:id', reservationController.updateReservation)

// 예약 삭제
router.delete('/:id', reservationController.deleteReservation)

module.exports = router