const express = require('express')
const cors = require('cors')
const path = require('path')

const database = require('./utils/database')
const { errorHandler, notFoundHandler } = require('./utils/validation')

// Routes
const roomRoutes = require('./routes/room')
const reservationRoutes = require('./routes/reservation')
const kjbRoutes = require('./routes/kjb')

const app = express()

// 미들웨어
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 라우트
app.use('/api/rooms', roomRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/kjb', kjbRoutes)

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '서버가 정상적으로 동작 중입니다.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API 정보 엔드포인트
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '회의실 예약 시스템 API',
    version: '1.0.0',
    endpoints: {
      rooms: {
        'GET /api/rooms': '모든 회의실 조회',
        'GET /api/rooms/available': '사용 가능한 회의실 조회',
        'GET /api/rooms/by-capacity?capacity=N': '수용인원별 회의실 조회',
        'GET /api/rooms/by-location?location=위치': '위치별 회의실 조회',
        'GET /api/rooms/:id': '특정 회의실 조회',
        'POST /api/rooms': '회의실 생성',
        'PUT /api/rooms/:id': '회의실 정보 수정',
        'PATCH /api/rooms/:id/status': '회의실 상태 변경',
        'DELETE /api/rooms/:id': '회의실 삭제'
      },
      reservations: {
        'GET /api/reservations': '모든 예약 조회',
        'GET /api/reservations/upcoming': '다가오는 예약 조회',
        'GET /api/reservations/today': '오늘의 예약 조회',
        'GET /api/reservations/availability': '예약 가능 여부 확인',
        'GET /api/reservations/date/:date': '날짜별 예약 조회',
        'GET /api/reservations/room/:roomId': '회의실별 예약 조회',
        'GET /api/reservations/:id': '특정 예약 조회',
        'POST /api/reservations': '예약 생성',
        'PUT /api/reservations/:id': '예약 수정',
        'DELETE /api/reservations/:id': '예약 삭제'
      }
    }
  })
})

// 정적 파일 제공 (프로덕션 환경)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../front/dist')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../front/dist/index.html'))
  })
}

// 404 핸들러
app.use(notFoundHandler)

// 에러 핸들러
app.use(errorHandler)

// 데이터베이스 연결
async function initializeApp() {
  try {
    await database.connect()
    console.log('데이터베이스 연결 성공')
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다.')
  await database.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT 신호를 받았습니다. 서버를 종료합니다.')
  await database.close()
  process.exit(0)
})

module.exports = { app, initializeApp }