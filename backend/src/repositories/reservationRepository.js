const database = require('../utils/database')
const Reservation = require('../models/Reservation')

class ReservationRepository {
  async findAll() {
    try {
      const rows = await database.all(`
        SELECT r.*, rooms.name as room_name
        FROM reservations r
        JOIN rooms ON r.room_id = rooms.id
        ORDER BY r.date DESC, r.start_time DESC
      `)
      return rows.map(row => new Reservation(row))
    } catch (error) {
      throw new Error(`예약 목록 조회 실패: ${error.message}`)
    }
  }

  async findById(id) {
    try {
      const row = await database.get(`
        SELECT r.*, rooms.name as room_name
        FROM reservations r
        JOIN rooms ON r.room_id = rooms.id
        WHERE r.id = ?
      `, [id])
      return row ? new Reservation(row) : null
    } catch (error) {
      throw new Error(`예약 조회 실패: ${error.message}`)
    }
  }

  async findByRoomAndDate(roomId, date) {
    try {
      const rows = await database.all(`
        SELECT r.*, rooms.name as room_name
        FROM reservations r
        JOIN rooms ON r.room_id = rooms.id
        WHERE r.room_id = ? AND r.date = ?
        ORDER BY r.start_time
      `, [roomId, date])
      return rows.map(row => new Reservation(row))
    } catch (error) {
      throw new Error(`회의실별 예약 조회 실패: ${error.message}`)
    }
  }

  async checkConflict(roomId, date, startTime, endTime, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM reservations
        WHERE room_id = ? AND date = ?
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `
      const params = [roomId, date, startTime, startTime, endTime, endTime, startTime, endTime]

      if (excludeId) {
        query += ' AND id != ?'
        params.push(excludeId)
      }

      const result = await database.get(query, params)
      return result.count > 0
    } catch (error) {
      throw new Error(`시간 충돌 검사 실패: ${error.message}`)
    }
  }

  async create(reservationData) {
    try {
      // 시간 충돌 검사
      const hasConflict = await this.checkConflict(
        reservationData.room_id,
        reservationData.date,
        reservationData.start_time,
        reservationData.end_time
      )

      if (hasConflict) {
        throw new Error('해당 시간대에 이미 예약이 있습니다.')
      }

      const result = await database.run(`
        INSERT INTO reservations (room_id, date, start_time, end_time, purpose, requester, wallet_address, kjb_burned, burn_tx_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reservationData.room_id,
        reservationData.date,
        reservationData.start_time,
        reservationData.end_time,
        reservationData.purpose,
        reservationData.requester,
        reservationData.wallet_address || null,
        reservationData.kjb_burned || null,
        reservationData.burn_tx_hash || null
      ])

      return await this.findById(result.id)
    } catch (error) {
      throw new Error(`예약 생성 실패: ${error.message}`)
    }
  }

  async update(id, reservationData) {
    try {
      const updates = []
      const values = []

      if (reservationData.date !== undefined) {
        updates.push('date = ?')
        values.push(reservationData.date)
      }
      if (reservationData.start_time !== undefined) {
        updates.push('start_time = ?')
        values.push(reservationData.start_time)
      }
      if (reservationData.end_time !== undefined) {
        updates.push('end_time = ?')
        values.push(reservationData.end_time)
      }
      if (reservationData.purpose !== undefined) {
        updates.push('purpose = ?')
        values.push(reservationData.purpose)
      }
      if (reservationData.requester !== undefined) {
        updates.push('requester = ?')
        values.push(reservationData.requester)
      }

      if (updates.length === 0) {
        throw new Error('업데이트할 데이터가 없습니다.')
      }

      // 기존 예약 정보 조회
      const existing = await this.findById(id)
      if (!existing) {
        throw new Error('해당 예약을 찾을 수 없습니다.')
      }

      // 시간 충돌 검사 (자신 제외)
      const finalRoomId = reservationData.room_id || existing.room_id
      const finalDate = reservationData.date || existing.date
      const finalStartTime = reservationData.start_time || existing.start_time
      const finalEndTime = reservationData.end_time || existing.end_time

      const hasConflict = await this.checkConflict(
        finalRoomId,
        finalDate,
        finalStartTime,
        finalEndTime,
        id
      )

      if (hasConflict) {
        throw new Error('해당 시간대에 이미 예약이 있습니다.')
      }

      values.push(id)

      const result = await database.run(
        `UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`,
        values
      )

      if (result.changes === 0) {
        throw new Error('해당 예약을 찾을 수 없습니다.')
      }

      return await this.findById(id)
    } catch (error) {
      throw new Error(`예약 수정 실패: ${error.message}`)
    }
  }

  async delete(id) {
    try {
      const result = await database.run('DELETE FROM reservations WHERE id = ?', [id])

      if (result.changes === 0) {
        throw new Error('해당 예약을 찾을 수 없습니다.')
      }

      return true
    } catch (error) {
      throw new Error(`예약 삭제 실패: ${error.message}`)
    }
  }

  async findUpcoming(limit = 10) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const rows = await database.all(`
        SELECT r.*, rooms.name as room_name
        FROM reservations r
        JOIN rooms ON r.room_id = rooms.id
        WHERE r.date >= ?
        ORDER BY r.date, r.start_time
        LIMIT ?
      `, [today, limit])
      return rows.map(row => new Reservation(row))
    } catch (error) {
      throw new Error(`다가오는 예약 조회 실패: ${error.message}`)
    }
  }
}

module.exports = new ReservationRepository()