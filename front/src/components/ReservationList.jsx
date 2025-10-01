import { useState } from 'react'

const ReservationList = ({ reservations, onCancel }) => {
  const [cancelModal, setCancelModal] = useState(null)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleCancelClick = (reservation) => {
    console.log('취소 클릭된 예약:', reservation)
    console.log('지갑 주소:', reservation.wallet_address)

    // 모든 예약에 대해 지갑 인증 모달 표시 (지갑 주소가 있는 경우만)
    // 지갑 주소가 없는 기존 예약은 지갑 인증을 요구하지 않음
    if (reservation.wallet_address && reservation.wallet_address.trim() !== '') {
      console.log('지갑 인증 모달 표시')
      setCancelModal(reservation)
      setPassword('')
    } else {
      console.log('기존 예약 방식으로 바로 취소 (지갑 정보 없음)')
      // 기존 예약 (지갑 정보 없음)은 바로 취소
      if (confirm('정말로 예약을 취소하시겠습니까?')) {
        onCancel(reservation.id)
      }
    }
  }

  const handlePasswordCancel = async () => {
    if (!password.trim()) {
      alert('지갑 비밀번호를 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      await onCancel(cancelModal.id, password)
      setCancelModal(null)
      setPassword('')
    } catch (error) {
      console.error('Cancel failed:', error)
      // 에러는 상위 컴포넌트에서 처리
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="reservation-list slide-in-left">
      <h2>예약 현황</h2>
      {reservations.length === 0 ? (
        <p className="no-reservations">예약 내역이 없습니다.</p>
      ) : (
        <div className="reservations">
          {reservations.map((reservation, index) => (
            <div key={reservation.id} className={`reservation-item slide-in-right`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="reservation-info">
                <h4>{reservation.room_name || reservation.roomName}</h4>
                <p className="reservation-date">{formatDate(reservation.date)}</p>
                <p className="reservation-time">
                  {reservation.start_time || reservation.startTime} - {reservation.end_time || reservation.endTime}
                </p>
                <p className="reservation-purpose">{reservation.purpose}</p>
                <p className="reservation-requester">예약자: {reservation.requester}</p>
              </div>
              <div className="reservation-actions">
                <button
                  className="cancel-reservation-btn"
                  onClick={() => handleCancelClick(reservation)}
                >
                  {reservation.wallet_address ? '🔐 예약 취소' : '예약 취소'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 지갑 비밀번호 입력 모달 */}
      {cancelModal && (
        <div className="reservation-form-overlay">
          <div className="reservation-form scale-in">
            <h2>예약 취소 인증</h2>
            <div className="selected-room">
              <strong>{cancelModal.room_name}</strong> 예약 취소
            </div>
            <div className="wallet-info">
              <p>📅 {formatDate(cancelModal.date)} {cancelModal.start_time} - {cancelModal.end_time}</p>
              <p>💳 지갑 주소: {cancelModal.wallet_address}</p>
              <p className="auth-notice">
                ⚠️ 예약 취소를 위해 예약시 사용한 지갑의 비밀번호를 입력해주세요.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handlePasswordCancel(); }}>
              <div className="form-group">
                <label>지갑 비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="지갑 계정 비밀번호"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCancelModal(null)}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading || !password.trim()}
                >
                  {isLoading ? '인증 중...' : '인증 후 예약 취소'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationList