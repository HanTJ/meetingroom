import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import KJBContract from '../contracts/KJBStableCoin.json'
import calendarIcon from '../assets/images/calendar.svg'
import clockIcon from '../assets/images/clock.svg'

const ReservationForm = ({ selectedRoom, onSubmit, onCancel, defaultFilters = null }) => {
  // 기본값 계산 함수
  const getInitialFormData = () => {
    if (defaultFilters && defaultFilters.enabled) {
      return {
        date: defaultFilters.date,
        startTime: defaultFilters.startTime,
        endTime: defaultFilters.endTime,
        purpose: '',
        requester: '',
        walletAddress: '',
        password: ''
      }
    }
    return {
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      purpose: '',
      requester: '',
      walletAddress: '',
      password: ''
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())

  // defaultFilters가 변경될 때 formData 업데이트
  useEffect(() => {
    if (defaultFilters && defaultFilters.enabled) {
      console.log('Applying default filters to reservation form:', defaultFilters)
      setFormData(prev => ({
        ...prev,
        date: defaultFilters.date,
        startTime: defaultFilters.startTime,
        endTime: defaultFilters.endTime
      }))
    }
  }, [defaultFilters])

  const [kjbInfo, setKjbInfo] = useState({
    requiredKjb: 0,
    userBalance: 0,
    hasEnoughBalance: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // KJB 토큰 단가 (시간당 10 KJB)
  const KJB_PER_HOUR = 10
  // 실제 운영 시 실제 프라이빗 네트워크 RPC URL로 교체 필요
  const PRIVATE_NETWORK_URL = 'http://192.168.1.100:8545'

  // 시간 계산 및 KJB 소모량 계산
  useEffect(() => {
    calculateKjbRequired()
  }, [formData.startTime, formData.endTime])

  // 지갑 주소 변경 시 잔액 확인
  useEffect(() => {
    if (formData.walletAddress && ethers.isAddress(formData.walletAddress)) {
      checkKjbBalance()
    }
  }, [formData.walletAddress, kjbInfo.requiredKjb])

  const calculateKjbRequired = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.endTime}`)
      const diffHours = (end - start) / (1000 * 60 * 60)

      if (diffHours > 0) {
        const requiredKjb = Math.ceil(diffHours * KJB_PER_HOUR)
        setKjbInfo(prev => ({ ...prev, requiredKjb }))
      }
    }
  }

  const checkKjbBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(PRIVATE_NETWORK_URL)
      const contract = new ethers.Contract(KJBContract.address, KJBContract.abi, provider)

      const balance = await contract.balanceOf(formData.walletAddress)
      const balanceFormatted = parseFloat(ethers.formatEther(balance))

      setKjbInfo(prev => ({
        ...prev,
        userBalance: balanceFormatted,
        hasEnoughBalance: balanceFormatted >= prev.requiredKjb
      }))

    } catch (err) {
      console.error('KJB 잔액 확인 실패:', err)
      setKjbInfo(prev => ({ ...prev, userBalance: 0, hasEnoughBalance: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.walletAddress || !ethers.isAddress(formData.walletAddress)) {
      setError('올바른 지갑 주소를 입력해주세요.')
      return
    }

    if (!formData.password) {
      setError('지갑 비밀번호를 입력해주세요.')
      return
    }

    if (!kjbInfo.hasEnoughBalance) {
      setError(`KJB 잔액이 부족합니다. 필요: ${kjbInfo.requiredKjb} KJB, 보유: ${kjbInfo.userBalance} KJB`)
      return
    }

    setLoading(true)
    setError('')

    try {
      // KJB 토큰 소각 처리
      const burnTxHash = await burnKjbTokens()
      console.log('KJB 소각 완료, 트랜잭션 해시:', burnTxHash)

      // 예약 정보 제출 (KJB 관련 정보 포함)
      onSubmit({
        ...formData,
        roomId: selectedRoom.id,
        walletAddress: formData.walletAddress,
        kjbBurned: kjbInfo.requiredKjb,
        burnTxHash: burnTxHash
      })

    } catch (err) {
      console.error('예약 처리 실패:', err)
      setError(err.message || '예약 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const burnKjbTokens = async () => {
    try {
      // 계정 잠금 해제
      const unlockResponse = await fetch(PRIVATE_NETWORK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'personal_unlockAccount',
          params: [formData.walletAddress, formData.password, 300],
          id: Date.now()
        })
      })

      const unlockResult = await unlockResponse.json()
      if (unlockResult.error) {
        if (unlockResult.error.message.includes('could not decrypt key with given password')) {
          throw new Error('지갑 비밀번호가 올바르지 않습니다. 올바른 비밀번호를 입력해주세요.')
        } else if (unlockResult.error.message.includes('unknown account')) {
          throw new Error('지갑 주소를 찾을 수 없습니다. 올바른 지갑 주소를 입력해주세요.')
        } else {
          throw new Error(`계정 잠금 해제 실패: ${unlockResult.error.message}`)
        }
      }

      // KJB 토큰 소각
      const provider = new ethers.JsonRpcProvider(PRIVATE_NETWORK_URL)
      const signer = await provider.getSigner(formData.walletAddress)
      const contract = new ethers.Contract(KJBContract.address, KJBContract.abi, signer)

      const burnAmount = ethers.parseEther(kjbInfo.requiredKjb.toString())
      const tx = await contract.burn(burnAmount)

      console.log('KJB 소각 트랜잭션:', tx.hash)
      await tx.wait()

      return tx.hash
    } catch (error) {
      throw new Error(`KJB 토큰 소각 실패: ${error.message}`)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const timeSlots = []
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 18) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
  }

  return (
    <div className="reservation-form-overlay">
      <div className="reservation-form scale-in">
        <h2>회의실 예약</h2>
        <div className="selected-room">
          <strong>{selectedRoom.name}</strong> 예약
        </div>

        {/* 조회 조건 자동 입력 안내 */}
        {defaultFilters && defaultFilters.enabled && (
          <div className="auto-fill-notice">
            📅 조회 조건이 자동 입력되었습니다: {defaultFilters.date} {defaultFilters.startTime} - {defaultFilters.endTime}
          </div>
        )}

        {/* KJB 소모 안내 */}
        <div className="kjb-info-box">
          <h3>💰 KJB 토큰 소모 안내</h3>
          <div className="kjb-details">
            <div className="kjb-rate">
              <span className="label">시간당 요금:</span>
              <span className="value">{KJB_PER_HOUR} KJB</span>
            </div>
            <div className="kjb-required">
              <span className="label">필요 KJB:</span>
              <span className="value highlight">{kjbInfo.requiredKjb} KJB</span>
            </div>
            {formData.walletAddress && (
              <div className="kjb-balance">
                <span className="label">보유 KJB:</span>
                <span className={`value ${kjbInfo.hasEnoughBalance ? 'sufficient' : 'insufficient'}`}>
                  {kjbInfo.userBalance} KJB
                </span>
              </div>
            )}
          </div>
          {!kjbInfo.hasEnoughBalance && formData.walletAddress && (
            <div className="insufficient-warning">
              ⚠️ KJB 잔액이 부족합니다. 추가로 {kjbInfo.requiredKjb - kjbInfo.userBalance} KJB가 필요합니다.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* 기본 예약 정보 */}
          <div className="form-section">
            <h4>📅 예약 정보</h4>

            <div className="form-group">
              <label>
                <img src={calendarIcon} alt="날짜" className="form-icon" />
                날짜
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <img src={clockIcon} alt="시작시간" className="form-icon" />
                  시작 시간
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <img src={clockIcon} alt="종료시간" className="form-icon" />
                  종료 시간
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>사용 목적</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="회의 목적을 입력하세요"
                required
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>예약자명</label>
              <input
                type="text"
                name="requester"
                value={formData.requester}
                onChange={handleChange}
                placeholder="예약자 이름을 입력하세요"
                required
              />
            </div>
          </div>

          {/* KJB 지갑 정보 */}
          <div className="form-section">
            <h4>💳 KJB 지갑 정보</h4>

            <div className="form-group">
              <label>지갑 주소</label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                placeholder="0x..."
                className={formData.walletAddress && !ethers.isAddress(formData.walletAddress) ? 'error' : ''}
                required
              />
              {formData.walletAddress && !ethers.isAddress(formData.walletAddress) && (
                <small className="error-text">올바른 이더리움 주소 형식이 아닙니다.</small>
              )}
            </div>

            <div className="form-group">
              <label>지갑 비밀번호</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="지갑 계정 비밀번호"
                required
              />
              <small className="info-text">
                예약 확정 시 {kjbInfo.requiredKjb} KJB가 자동으로 소각됩니다.
              </small>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !kjbInfo.hasEnoughBalance}
            >
              {loading ? 'KJB 소각 및 예약 중...' : `${kjbInfo.requiredKjb} KJB 소각하고 예약하기`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationForm