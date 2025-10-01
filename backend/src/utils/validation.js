const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      const errors = error.details.map(detail => detail.message)
      return res.status(400).json({
        success: false,
        message: '유효성 검사 실패',
        errors: errors
      })
    }

    next()
  }
}

const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false })

    if (error) {
      const errors = error.details.map(detail => detail.message)
      return res.status(400).json({
        success: false,
        message: '쿼리 매개변수 검증 실패',
        errors: errors
      })
    }

    next()
  }
}

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false })

    if (error) {
      const errors = error.details.map(detail => detail.message)
      return res.status(400).json({
        success: false,
        message: '경로 매개변수 검증 실패',
        errors: errors
      })
    }

    next()
  }
}

// 에러 핸들러 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // 기본 에러 응답
  let status = 500
  let message = '서버 내부 오류가 발생했습니다.'

  // SQLite 에러 처리
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    status = 400
    message = '중복된 데이터입니다.'
  } else if (err.code && err.code.startsWith('SQLITE')) {
    status = 500
    message = '데이터베이스 오류가 발생했습니다.'
  }

  // 커스텀 에러 처리
  if (err.message) {
    message = err.message
  }

  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

// 404 핸들러
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.',
    path: req.originalUrl
  })
}

// 비동기 함수 에러 핸들링 래퍼
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 날짜 형식 검증
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString)
  return date.toISOString().split('T')[0] === dateString
}

// 시간 형식 검증
const isValidTime = (timeString) => {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(timeString)
}

// ID 검증
const isValidId = (id) => {
  return Number.isInteger(parseInt(id)) && parseInt(id) > 0
}

// 이더리움 주소 검증
const isValidEthereumAddress = (address) => {
  const regex = /^0x[a-fA-F0-9]{40}$/
  return regex.test(address)
}

// KJB 토큰 양 검증
const isValidTokenAmount = (amount) => {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0 && num <= 1000000 // 최대 1M KJB
}

// KJB 전송 검증
const validateKjbTransfer = (req, res, next) => {
  const { fromAddress, toAddress, amount, password } = req.body

  const errors = []

  if (!fromAddress) errors.push('보내는 주소가 필요합니다.')
  else if (!isValidEthereumAddress(fromAddress)) errors.push('올바른 보내는 주소 형식이 아닙니다.')

  if (!toAddress) errors.push('받는 주소가 필요합니다.')
  else if (!isValidEthereumAddress(toAddress)) errors.push('올바른 받는 주소 형식이 아닙니다.')

  if (!amount) errors.push('전송량이 필요합니다.')
  else if (!isValidTokenAmount(amount)) errors.push('올바른 전송량을 입력해주세요. (0 < amount <= 1,000,000)')

  if (!password) errors.push('비밀번호가 필요합니다.')

  if (fromAddress && toAddress && fromAddress.toLowerCase() === toAddress.toLowerCase()) {
    errors.push('보내는 주소와 받는 주소가 같을 수 없습니다.')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: '유효성 검사 실패',
      errors
    })
  }

  next()
}

// KJB 초기 지급 검증
const validateKjbClaimGrant = (req, res, next) => {
  const { address, password } = req.body

  const errors = []

  if (!address) errors.push('지갑 주소가 필요합니다.')
  else if (!isValidEthereumAddress(address)) errors.push('올바른 지갑 주소 형식이 아닙니다.')

  if (!password) errors.push('비밀번호가 필요합니다.')

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: '유효성 검사 실패',
      errors
    })
  }

  next()
}

// KJB 소각 검증
const validateKjbBurn = (req, res, next) => {
  const { address, amount, password } = req.body

  const errors = []

  if (!address) errors.push('지갑 주소가 필요합니다.')
  else if (!isValidEthereumAddress(address)) errors.push('올바른 지갑 주소 형식이 아닙니다.')

  if (!amount) errors.push('소각량이 필요합니다.')
  else if (!isValidTokenAmount(amount)) errors.push('올바른 소각량을 입력해주세요. (0 < amount <= 1,000,000)')

  if (!password) errors.push('비밀번호가 필요합니다.')

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: '유효성 검사 실패',
      errors
    })
  }

  next()
}

// 스키마 객체 (호환성을 위해)
const schemas = {
  kjbTransfer: { validate: () => ({ error: null }) }, // 더미 스키마
  kjbClaimGrant: { validate: () => ({ error: null }) },
  kjbBurn: { validate: () => ({ error: null }) }
}

module.exports = {
  validateRequest,
  validateQueryParams,
  validateParams,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  isValidDate,
  isValidTime,
  isValidId,
  isValidEthereumAddress,
  isValidTokenAmount,
  validateKjbTransfer,
  validateKjbClaimGrant,
  validateKjbBurn,
  schemas
}