const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    }

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`)
      const response = await fetch(url, config)

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`)
        throw new Error(`서버 오류: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`API Response:`, data)

      return data
    } catch (error) {
      console.error('API request failed:', error)
      console.error('Request URL:', url)
      console.error('Request config:', config)

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
      }

      throw error
    }
  }

  // 회의실 관련 API
  async getRooms(filters = null) {
    let url = '/rooms'

    if (filters && filters.date && filters.startTime && filters.endTime) {
      const params = new URLSearchParams({
        date: filters.date,
        startTime: filters.startTime,
        endTime: filters.endTime
      })
      url += `?${params}`
    }

    return this.request(url)
  }

  async getRoomById(id) {
    return this.request(`/rooms/${id}`)
  }

  async createRoom(roomData) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    })
  }

  async updateRoom(id, roomData) {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    })
  }

  async deleteRoom(id) {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE',
    })
  }

  async updateRoomStatus(id, status) {
    return this.request(`/rooms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async getAvailableRooms() {
    return this.request('/rooms/available')
  }

  // 예약 관련 API
  async getReservations() {
    return this.request('/reservations')
  }

  async getReservationById(id) {
    return this.request(`/reservations/${id}`)
  }

  async createReservation(reservationData) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    })
  }

  async updateReservation(id, reservationData) {
    return this.request(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reservationData),
    })
  }

  async deleteReservation(id, password = null) {
    const config = {
      method: 'DELETE',
    }

    // 비밀번호가 제공된 경우 body에 포함
    if (password) {
      config.body = JSON.stringify({ password })
    }

    return this.request(`/reservations/${id}`, config)
  }

  async getReservationsByRoom(roomId) {
    return this.request(`/reservations/room/${roomId}`)
  }

  async getReservationsByDate(date) {
    return this.request(`/reservations/date/${date}`)
  }

  async getTodayReservations() {
    return this.request('/reservations/today')
  }

  async getUpcomingReservations(limit = 10) {
    return this.request(`/reservations/upcoming?limit=${limit}`)
  }

  async checkAvailability(roomId, date, startTime, endTime) {
    const params = new URLSearchParams({
      roomId,
      date,
      startTime,
      endTime,
    })
    return this.request(`/reservations/availability?${params}`)
  }

  // 헬스 체크
  async healthCheck() {
    return this.request('/health')
  }
}

export default new ApiService()