class Reservation {
  constructor(data) {
    this.id = data.id
    this.room_id = data.room_id
    this.date = data.date
    this.start_time = data.start_time
    this.end_time = data.end_time
    this.purpose = data.purpose
    this.requester = data.requester
    this.created_at = data.created_at
    this.room_name = data.room_name // JOIN 쿼리 결과용
    this.wallet_address = data.wallet_address
    this.kjb_burned = data.kjb_burned
    this.burn_tx_hash = data.burn_tx_hash
  }

  static validate(data) {
    const errors = []

    if (!data.room_id || typeof data.room_id !== 'number' || data.room_id <= 0) {
      errors.push('회의실 ID는 필수입니다.')
    }

    if (!data.date || !this.isValidDate(data.date)) {
      errors.push('유효한 날짜를 입력해주세요.')
    }

    if (!data.start_time || !this.isValidTime(data.start_time)) {
      errors.push('유효한 시작 시간을 입력해주세요.')
    }

    if (!data.end_time || !this.isValidTime(data.end_time)) {
      errors.push('유효한 종료 시간을 입력해주세요.')
    }

    if (data.start_time && data.end_time && data.start_time >= data.end_time) {
      errors.push('종료 시간은 시작 시간보다 늦어야 합니다.')
    }

    if (!data.purpose || typeof data.purpose !== 'string' || data.purpose.trim().length === 0) {
      errors.push('예약 목적은 필수입니다.')
    }

    if (!data.requester || typeof data.requester !== 'string' || data.requester.trim().length === 0) {
      errors.push('예약자 이름은 필수입니다.')
    }

    // 과거 날짜 체크 (오늘부터 가능)
    const today = new Date().toISOString().split('T')[0]
    if (data.date < today) {
      errors.push('과거 날짜로는 예약할 수 없습니다.')
    }

    return errors
  }

  static isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) return false

    const date = new Date(dateString)
    return date.toISOString().split('T')[0] === dateString
  }

  static isValidTime(timeString) {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return regex.test(timeString)
  }

  toJSON() {
    return {
      id: this.id,
      room_id: this.room_id,
      room_name: this.room_name,
      date: this.date,
      start_time: this.start_time,
      end_time: this.end_time,
      purpose: this.purpose,
      requester: this.requester,
      created_at: this.created_at,
      wallet_address: this.wallet_address,
      kjb_burned: this.kjb_burned,
      burn_tx_hash: this.burn_tx_hash
    }
  }
}

module.exports = Reservation