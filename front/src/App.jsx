import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import RoomCard from './components/RoomCard'
import ReservationForm from './components/ReservationForm'
import ReservationList from './components/ReservationList'
import RoomSearchFilter from './components/RoomSearchFilter'
import AnimationControls from './components/AnimationControls'
import BlockchainPage from './components/BlockchainPage'
import useAnimation from './hooks/useAnimation'
import apiService from './services/api'
import './App.css'

// 네비게이션 컴포넌트
const Navigation = () => {
  const location = useLocation()

  return (
    <nav className="main-navigation">
      <div className="nav-links">
        <Link
          to="/"
          className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
        >
          🏢 회의실 예약
        </Link>
        <Link
          to="/blockchain"
          className={location.pathname === '/blockchain' ? 'nav-link active' : 'nav-link'}
        >
          🔗 블록체인
        </Link>
      </div>
    </nav>
  )
}

// 회의실 앱 컴포넌트
const MeetingRoomApp = () => {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [currentView, setCurrentView] = useState('rooms')
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roomFilters, setRoomFilters] = useState(null)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const [roomsLoaded, setRoomsLoaded] = useState(false)
  const { isAnimationEnabled, animationSpeed, toggleAnimation } = useAnimation()

  // 현재 시간을 기반으로 한 기본 검색 필터 생성
  const getCurrentTimeFilter = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // 30분 단위로 반올림
    const roundedMinute = currentMinute >= 30 ? 30 : 0
    let nextHour = currentHour
    let nextMinute = roundedMinute

    // 다음 시간대로 설정 (현재 시간 + 30분 후)
    if (roundedMinute === 30) {
      nextHour = currentHour + 1
      nextMinute = 0
    } else {
      nextMinute = 30
    }

    // 18시를 넘으면 다음 날 9시로 설정
    if (nextHour > 18 || (nextHour === 18 && nextMinute > 0)) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        enabled: true
      }
    }

    const startTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
    const endHour = nextMinute === 30 ? nextHour + 1 : nextHour
    const endMinute = nextMinute === 30 ? 0 : 30
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

    return {
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      enabled: true
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading initial data...')

      // 현재 시간대 필터 생성
      const currentTimeFilter = getCurrentTimeFilter()
      console.log('Current time filter:', currentTimeFilter)

      // 예약 데이터와 현재 시간대 회의실 데이터를 병렬로 로드
      const [reservationsResponse, roomsResponse] = await Promise.all([
        apiService.getReservations(),
        apiService.getRooms(currentTimeFilter)
      ])

      console.log('Reservations response:', reservationsResponse)
      console.log('Rooms response:', roomsResponse)

      if (reservationsResponse.success) {
        setReservations(reservationsResponse.data)
        console.log('Reservations loaded:', reservationsResponse.data.length, 'items')
        console.log('Sample reservation data:', reservationsResponse.data[0])
      } else {
        console.error('Reservations API returned false success:', reservationsResponse)
        setError('예약 데이터를 불러오는데 실패했습니다.')
      }

      if (roomsResponse.success) {
        setRooms(roomsResponse.data)
        setRoomFilters(currentTimeFilter) // 필터 상태도 설정
        console.log('Rooms loaded:', roomsResponse.data.length, 'items for current time slot')
      } else {
        console.error('Rooms API returned false success:', roomsResponse)
        // 회의실 로드 실패는 전체 에러로 처리하지 않음 (예약은 성공했을 수 있으므로)
      }

      setInitialDataLoaded(true)
    } catch (err) {
      console.error('Failed to load initial data:', err)
      console.error('Error details:', err.message, err.stack)
      setError('데이터를 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 필터 변경 시 회의실 목록 새로고침 완전히 비활성화 - 수동 검색만 허용

  const loadRooms = async (filters = null) => {
    try {
      console.log('Loading rooms with filters:', filters)
      const roomsResponse = await apiService.getRooms(filters)
      console.log('Rooms response:', roomsResponse)

      if (roomsResponse.success) {
        setRooms(roomsResponse.data)
        console.log('Rooms loaded:', roomsResponse.data.length, 'items')
      } else {
        console.error('Rooms API returned false success:', roomsResponse)
        setError('회의실 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to load rooms:', err)
      console.error('Error details:', err.message, err.stack)
      setError(`회의실 목록을 불러오는데 실패했습니다: ${err.message}`)
    }
  }

  const handleFilterChange = (filters) => {
    setRoomFilters(filters)
    if (filters) {
      loadRooms(filters) // 직접 로딩
    }
  }

  const handleReserve = (room) => {
    setSelectedRoom(room)
  }

  const handleSubmitReservation = async (reservationData) => {
    try {
      console.log('Creating reservation with data:', reservationData)

      const response = await apiService.createReservation({
        room_id: parseInt(reservationData.roomId),
        date: reservationData.date,
        start_time: reservationData.startTime,
        end_time: reservationData.endTime,
        purpose: reservationData.purpose,
        requester: reservationData.requester,
        // KJB 관련 정보 추가
        wallet_address: reservationData.walletAddress,
        kjb_burned: reservationData.kjbBurned,
        burn_tx_hash: reservationData.burnTxHash
      })

      if (response.success) {
        // 예약 목록 새로고침
        const reservationsResponse = await apiService.getReservations()
        if (reservationsResponse.success) {
          setReservations(reservationsResponse.data)
        }

        // 회의실 목록도 새로고침 (현재 필터 조건으로)
        if (roomFilters) {
          await loadRooms(roomFilters)
        }

        setSelectedRoom(null)

        // 회의실 목록 화면으로 자동 이동
        setCurrentView('rooms')

        alert('예약이 완료되었습니다!')
      } else {
        console.error('Reservation API returned false success:', response)
        alert(`예약 실패: ${response.message || '알 수 없는 오류'}`)
      }
    } catch (err) {
      console.error('Failed to create reservation:', err)
      alert(`예약 실패: ${err.message}`)
    }
  }

  const handleCancelReservation = async (reservationId, password = null) => {
    // 비밀번호가 없는 경우 (기존 예약) 확인 메시지
    if (!password && !confirm('정말로 예약을 취소하시겠습니까?')) {
      return
    }

    try {
      const response = await apiService.deleteReservation(reservationId, password)

      if (response.success) {
        // 예약 목록 새로고침
        const reservationsResponse = await apiService.getReservations()
        if (reservationsResponse.success) {
          setReservations(reservationsResponse.data)
        }

        alert('예약이 취소되었습니다.')
      } else {
        console.error('Reservation cancellation API returned false success:', response)
        alert(`예약 취소 실패: ${response.message || '알 수 없는 오류'}`)
      }
    } catch (err) {
      console.error('Failed to cancel reservation:', err)
      alert(`예약 취소 실패: ${err.message}`)
      throw err // ReservationList에서 에러 처리를 위해 re-throw
    }
  }

  const refreshData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Refreshing data...')

      const [roomsResponse, reservationsResponse] = await Promise.all([
        roomFilters ? apiService.getRooms(roomFilters) : Promise.resolve({ success: true, data: [] }),
        apiService.getReservations()
      ])

      console.log('Refresh - Rooms response:', roomsResponse)
      console.log('Refresh - Reservations response:', reservationsResponse)

      if (roomsResponse.success && roomFilters) {
        setRooms(roomsResponse.data)
        console.log('Refresh - Rooms updated:', roomsResponse.data.length, 'items')
      }

      if (reservationsResponse.success) {
        setReservations(reservationsResponse.data)
        console.log('Refresh - Reservations updated:', reservationsResponse.data.length, 'items')
      } else {
        console.error('Refresh - Reservations API returned false success:', reservationsResponse)
        setError('예약 데이터 새로고침에 실패했습니다.')
      }
    } catch (err) {
      console.error('Failed to refresh data:', err)
      console.error('Refresh error details:', err.message, err.stack)
      setError(`데이터 새로고침에 실패했습니다: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-message">
            <h3>⚠️ 오류 발생</h3>
            <p>{error}</p>
            <button onClick={refreshData} className="retry-btn">
              다시 시도
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const handleViewChange = async (view) => {
    setCurrentView(view)

    // 회의실 목록으로 전환 시 최신 정보 조회
    if (view === 'rooms' && roomFilters) {
      await loadRooms(roomFilters)
    }

    // 예약 현황으로 전환 시 최신 정보 조회
    if (view === 'reservations') {
      const reservationsResponse = await apiService.getReservations()
      if (reservationsResponse.success) {
        setReservations(reservationsResponse.data)
      }
    }
  }

  return (
    <div className={`app ${isAnimationEnabled ? 'animations-enabled' : 'animations-disabled'}`} style={{'--animation-speed': `${1/animationSpeed}s`}}>
      <nav className="navigation">
        <button
          className={currentView === 'rooms' ? 'active' : ''}
          onClick={() => handleViewChange('rooms')}
        >
          회의실 목록
        </button>
        <button
          className={currentView === 'reservations' ? 'active' : ''}
          onClick={() => handleViewChange('reservations')}
        >
          예약 현황
        </button>
        <button
          className="animation-toggle"
          onClick={toggleAnimation}
        >
          {isAnimationEnabled ? '애니메이션 끄기' : '애니메이션 켜기'}
        </button>
        <button
          className="refresh-btn"
          onClick={refreshData}
        >
          🔄 새로고침
        </button>
      </nav>

      {currentView === 'rooms' && (
        <div className="rooms-container">
          <div className="rooms-header">
            <h2>회의실 목록</h2>
            <RoomSearchFilter
              onFilterChange={handleFilterChange}
              autoSearch={false}
              initialFilter={roomFilters}
            />
          </div>

          {roomFilters && (
            <div className="active-filter-info">
              <p>🔍 {roomFilters.date} {roomFilters.startTime} - {roomFilters.endTime} 시간대 조회</p>
            </div>
          )}

          {rooms.length === 0 ? (
            <p className="no-rooms">등록된 회의실이 없습니다.</p>
          ) : (
            <div className="rooms-grid">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onReserve={handleReserve}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'reservations' && (
        <ReservationList
          reservations={reservations}
          onCancel={handleCancelReservation}
        />
      )}

      {selectedRoom && (
        <ReservationForm
          selectedRoom={selectedRoom}
          onSubmit={handleSubmitReservation}
          onCancel={() => setSelectedRoom(null)}
          defaultFilters={roomFilters}
        />
      )}

      <AnimationControls />
    </div>
  )
}

// 메인 App 컴포넌트
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Navigation />
            <MeetingRoomApp />
          </Layout>
        } />
        <Route path="/blockchain" element={
          <Layout title="블록체인 관리 시스템">
            <Navigation />
            <BlockchainPage />
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App