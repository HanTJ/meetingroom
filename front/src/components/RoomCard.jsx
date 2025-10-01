import { useState } from 'react'
import roomIcon from '../assets/images/room.svg'

const RoomCard = ({ room, onReserve }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`room-card fade-in-up hover-scale ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="room-icon">
        <img src={roomIcon} alt="회의실" />
      </div>
      <div className="room-info">
        <h3>{room.name}</h3>
        <p className="room-capacity">수용인원: {room.capacity}명</p>
        <p className="room-location">위치: {room.location}</p>
        <p className={`room-status ${room.status}`}>
          상태: {
            room.status === 'available' ? '예약가능' :
            room.status === 'occupied' ? '사용중' :
            room.status === 'unavailable' ? '예약불가' :
            room.status === 'maintenance' ? '정비중' : '사용불가'
          }
        </p>
      </div>
      <button
        className="reserve-btn"
        onClick={() => onReserve(room)}
        disabled={room.status !== 'available'}
      >
        예약하기
      </button>
    </div>
  )
}

export default RoomCard