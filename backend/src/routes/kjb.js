const express = require('express')
const kjbController = require('../controllers/kjbController')
const {
  validateKjbTransfer,
  validateKjbClaimGrant,
  validateKjbBurn
} = require('../utils/validation')

const router = express.Router()

// KJB 토큰 잔액 조회
router.get('/balance/:address', kjbController.getBalance)

// KJB 토큰 송금
router.post('/transfer',
  validateKjbTransfer,
  kjbController.transfer
)

// 초기 지급 요청
router.post('/claim-grant',
  validateKjbClaimGrant,
  kjbController.claimInitialGrant
)

// KJB 컨트랙트 정보 조회
router.get('/contract-info', kjbController.getContractInfo)

// KJB 토큰 통계 조회
router.get('/stats', kjbController.getStats)

// 초기 지급 여부 확인
router.get('/grant-status/:address', kjbController.checkInitialGrantStatus)

// KJB 토큰 소각
router.post('/burn',
  validateKjbBurn,
  kjbController.burnTokens
)

module.exports = router