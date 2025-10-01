const database = require('../utils/database')
const Room = require('../models/Room')

class RoomRepository {
  async findAll() {
    try {
      const rows = await database.all('SELECT * FROM rooms ORDER BY name')
      return rows.map(row => new Room(row))
    } catch (error) {
      throw new Error(`회의실 목록 조회 실패: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      const row = await database.get('SELECT * FROM rooms WHERE id = ?', [id])
      return row ? new Room(row) : null
    } catch (error) {
      throw new Error(`회의실 조회 실패: ${error.message}`)
    }
  }

  async findByName(name) {
    try {
      const row = await database.get('SELECT * FROM rooms WHERE name = ?', [name])
      return row ? new Room(row) : null
    } catch (error) {
      throw new Error(`회의실 이름 조회 실패: ${error.message}`)
    }
  }

  async create(roomData) {
    try {
      const result = await database.run(
        'INSERT INTO rooms (name, capacity, location, status) VALUES (?, ?, ?, ?)',
        [roomData.name, roomData.capacity, roomData.location, roomData.status || 'available']
      )
      return await this.findById(result.id)
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('동일한 이름의 회의실이 이미 존재합니다.')
      }
      throw new Error(`회의실 생성 실패: ${error.message}`)
    }
  }

  async update(id, roomData) {
    try {
      const updates = []
      const values = []

      if (roomData.name !== undefined) {
        updates.push('name = ?')
        values.push(roomData.name)
      }
      if (roomData.capacity !== undefined) {
        updates.push('capacity = ?')
        values.push(roomData.capacity)
      }
      if (roomData.location !== undefined) {
        updates.push('location = ?')
        values.push(roomData.location)
      }
      if (roomData.status !== undefined) {
        updates.push('status = ?')
        values.push(roomData.status)
      }

      if (updates.length === 0) {
        throw new Error('업데이트할 데이터가 없습니다.')
      }

      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      const result = await database.run(
        `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
        values
      )

      if (result.changes === 0) {
        throw new Error('해당 회의실을 찾을 수 없습니다.')
      }

      return await this.findById(id)
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('동일한 이름의 회의실이 이미 존재합니다.')
      }
      throw new Error(`회의실 수정 실패: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      // 해당 회의실의 예약이 있는지 확인
      const reservations = await database.get(
        'SELECT COUNT(*) as count FROM reservations WHERE room_id = ?',
        [id]
      )

      if (reservations.count > 0) {
        throw new Error('예약이 있는 회의실은 삭제할 수 없습니다.')
      }

      const result = await database.run('DELETE FROM rooms WHERE id = ?', [id])

      if (result.changes === 0) {
        throw new Error('해당 회의실을 찾을 수 없습니다.')
      }

      return true
    } catch (error) {
      throw new Error(`회의실 삭제 실패: ${error.message}`)
    }
  }

  async updateStatus(id, status) {
    try {
      const result = await database.run(
        'UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      )

      if (result.changes === 0) {
        throw new Error('해당 회의실을 찾을 수 없습니다.')
      }

      return await this.findById(id)
    } catch (error) {
      throw new Error(`회의실 상태 변경 실패: ${error.message}`)
    }
  }
}

module.exports = new RoomRepository()