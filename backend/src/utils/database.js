const sqlite3 = require('sqlite3').verbose()
const path = require('path')

class Database {
  constructor() {
    this.db = null
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '../../data/meetingroom.db')
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err.message)
          reject(err)
        } else {
          console.log('Connected to SQLite database')
          this.initializeTables().then(() => resolve()).catch(reject)
        }
      })
    })
  }

  async initializeTables() {
    return new Promise((resolve, reject) => {
      // 회의실 테이블
      const createRoomsTable = `
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          capacity INTEGER NOT NULL,
          location TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'available',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `

      // 예약 테이블
      const createReservationsTable = `
        CREATE TABLE IF NOT EXISTS reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          purpose TEXT NOT NULL,
          requester TEXT NOT NULL,
          wallet_address TEXT,
          kjb_burned REAL,
          burn_tx_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms (id)
        )
      `

      this.db.serialize(() => {
        this.db.run(createRoomsTable, (err) => {
          if (err) {
            console.error('Error creating rooms table:', err)
            reject(err)
            return
          }
        })

        this.db.run(createReservationsTable, (err) => {
          if (err) {
            console.error('Error creating reservations table:', err)
            reject(err)
            return
          }
        })

        // 기존 테이블에 KJB 관련 컬럼 추가 (마이그레이션)
        this.migrateReservationsTable()

        // 초기 데이터 삽입
        this.insertInitialData()
        resolve()
      })
    })
  }

  migrateReservationsTable() {
    // 기존 테이블에 KJB 관련 컬럼이 없다면 추가
    const alterQueries = [
      'ALTER TABLE reservations ADD COLUMN wallet_address TEXT',
      'ALTER TABLE reservations ADD COLUMN kjb_burned REAL',
      'ALTER TABLE reservations ADD COLUMN burn_tx_hash TEXT'
    ]

    alterQueries.forEach(query => {
      this.db.run(query, (err) => {
        if (err && err.message.includes('duplicate column name')) {
          // 컬럼이 이미 존재하는 경우는 무시
          console.log('KJB columns already exist, skipping migration')
        } else if (err) {
          console.error('Migration error:', err.message)
        } else {
          console.log('Migration completed:', query)
        }
      })
    })
  }

  insertInitialData() {
    const rooms = [
      { name: '회의실 A', capacity: 8, location: '3층', status: 'available' },
      { name: '회의실 B', capacity: 12, location: '3층', status: 'available' },
      { name: '회의실 C', capacity: 6, location: '4층', status: 'available' },
      { name: '대회의실', capacity: 20, location: '5층', status: 'available' }
    ]

    rooms.forEach(room => {
      this.db.run(
        'INSERT OR IGNORE INTO rooms (name, capacity, location, status) VALUES (?, ?, ?, ?)',
        [room.name, room.capacity, room.location, room.status]
      )
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err)
          } else {
            console.log('Database connection closed')
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  // 쿼리 실행을 위한 헬퍼 메소드들
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID, changes: this.changes })
        }
      })
    })
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

module.exports = new Database()