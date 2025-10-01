const sqlite3 = require('sqlite3').verbose()
const path = require('path')

async function clearAllReservations() {
  const dbPath = path.join(__dirname, '../data/meetingroom.db')

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err.message)
        reject(err)
        return
      }

      console.log('Connected to SQLite database')

      // 모든 예약 삭제
      db.run('DELETE FROM reservations', function(err) {
        if (err) {
          console.error('Error deleting reservations:', err.message)
          reject(err)
          return
        }

        console.log(`✅ 삭제 완료: ${this.changes}개의 예약이 삭제되었습니다.`)

        // AUTO_INCREMENT 카운터 리셋
        db.run('DELETE FROM sqlite_sequence WHERE name="reservations"', function(err) {
          if (err) {
            console.warn('Warning: Failed to reset AUTO_INCREMENT counter:', err.message)
          } else {
            console.log('✅ ID 카운터가 리셋되었습니다.')
          }

          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message)
              reject(err)
            } else {
              console.log('📦 데이터베이스 연결이 닫혔습니다.')
              resolve()
            }
          })
        })
      })
    })
  })
}

// 스크립트 실행
if (require.main === module) {
  clearAllReservations()
    .then(() => {
      console.log('🎉 모든 예약 데이터가 성공적으로 삭제되었습니다!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 예약 삭제 실패:', error.message)
      process.exit(1)
    })
}

module.exports = clearAllReservations