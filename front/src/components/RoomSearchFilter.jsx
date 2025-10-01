import { useState, useEffect } from 'react'
import calendarIcon from '../assets/images/calendar.svg'
import clockIcon from '../assets/images/clock.svg'

const RoomSearchFilter = ({ onFilterChange, autoSearch = false, initialFilter = null }) => {
  // 현재 시간 계산
  const getCurrentTime = () => {
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
        endTime: '10:00'
      }
    }

    const startTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
    const endHour = nextMinute === 30 ? nextHour + 1 : nextHour
    const endMinute = nextMinute === 30 ? 0 : 30
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

    return {
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime
    }
  }

  const currentTimeSlot = getCurrentTime()

  const [filterData, setFilterData] = useState({
    date: currentTimeSlot.date,
    startTime: currentTimeSlot.startTime,
    endTime: currentTimeSlot.endTime,
    enabled: false
  })

  // 부모 컴포넌트로부터 전달받은 초기 필터 적용
  useEffect(() => {
    if (initialFilter) {
      console.log('Applying initial filter:', initialFilter)
      setFilterData({
        date: initialFilter.date,
        startTime: initialFilter.startTime,
        endTime: initialFilter.endTime,
        enabled: initialFilter.enabled || false
      })
    }
  }, [initialFilter])

  const timeSlots = []
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 18) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  // 자동 검색 완전히 비활성화 - 사용자가 조회 버튼을 눌러야만 검색됨

  const handleChange = (field, value) => {
    setFilterData({
      ...filterData,
      [field]: value
    })
  }

  const handleToggle = (enabled) => {
    const newFilterData = {
      ...filterData,
      enabled
    }
    setFilterData(newFilterData)

    if (!enabled) {
      onFilterChange(null)
    }
  }

  const handleSearch = () => {
    if (filterData.startTime >= filterData.endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    const searchData = {
      ...filterData,
      enabled: true
    }
    setFilterData(searchData)
    onFilterChange(searchData)
  }

  return (
    <div className="room-search-filter">
      <div className="filter-header">
        <h3>시간대별 회의실 조회</h3>
      </div>

      <div className="filter-controls scale-in">
        <div className="filter-group">
          <label>
            <img src={calendarIcon} alt="날짜" className="filter-icon" />
            날짜
          </label>
          <input
            type="date"
            value={filterData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="filter-group">
          <label>
            <img src={clockIcon} alt="시작시간" className="filter-icon" />
            시작 시간
          </label>
          <select
            value={filterData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
          >
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>
            <img src={clockIcon} alt="종료시간" className="filter-icon" />
            종료 시간
          </label>
          <select
            value={filterData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
          >
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>&nbsp;</label>
          {filterData.enabled ? (
            <button
              className="search-btn active"
              onClick={handleSearch}
              disabled={filterData.startTime >= filterData.endTime}
            >
              ✅ 조회됨 (재조회)
            </button>
          ) : (
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={filterData.startTime >= filterData.endTime}
            >
              🔍 조회하기
            </button>
          )}
        </div>

        {filterData.startTime >= filterData.endTime && (
          <div className="filter-error">
            종료 시간은 시작 시간보다 늦어야 합니다.
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomSearchFilter