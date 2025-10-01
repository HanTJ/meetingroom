// .env 파일 로드 (실제 운영 정보)
require('dotenv').config()

const { app, initializeApp } = require('./app')

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // 데이터베이스 초기화
    await initializeApp()

    // 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`)
      console.log(`📍 로컬 URL: http://localhost:${PORT}`)
      console.log(`🔗 API 문서: http://localhost:${PORT}/api`)
      console.log(`🏥 헬스 체크: http://localhost:${PORT}/api/health`)
    })

    // 서버 에러 핸들링
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT

      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`)
          process.exit(1)
          break
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`)
          process.exit(1)
          break
        default:
          throw error
      }
    })

    return server
  } catch (error) {
    console.error('서버 시작 중 오류 발생:', error)
    process.exit(1)
  }
}

// 서버 시작
startServer()

module.exports = startServer