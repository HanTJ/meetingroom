class Room {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.capacity = data.capacity
    this.location = data.location
    this.status = data.status || 'available'
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

  static validate(data) {
    const errors = []

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('회의실 이름은 필수입니다.')
    }

    if (!data.capacity || typeof data.capacity !== 'number' || data.capacity <= 0) {
      errors.push('수용 인원은 양수여야 합니다.')
    }

    if (!data.location || typeof data.location !== 'string' || data.location.trim().length === 0) {
      errors.push('위치는 필수입니다.')
    }

    if (data.status && !['available', 'occupied', 'maintenance'].includes(data.status)) {
      errors.push('상태는 available, occupied, maintenance 중 하나여야 합니다.')
    }

    return errors
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      capacity: this.capacity,
      location: this.location,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

module.exports = Room