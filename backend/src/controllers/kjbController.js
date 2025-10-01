const kjbService = require('../services/kjbService')

const kjbController = {
  // KJB 토큰 잔액 조회
  async getBalance(req, res) {
    try {
      const { address } = req.params

      if (!address) {
        return res.status(400).json({
          success: false,
          message: '지갑 주소가 필요합니다.'
        })
      }

      const result = await kjbService.getTokenBalance(address)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('KJB 잔액 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'KJB 잔액 조회에 실패했습니다.'
      })
    }
  },

  // KJB 토큰 송금
  async transfer(req, res) {
    try {
      const { fromAddress, toAddress, amount, password } = req.body

      // 입력값 검증
      if (!fromAddress || !toAddress || !amount || !password) {
        return res.status(400).json({
          success: false,
          message: '모든 필드를 입력해주세요. (fromAddress, toAddress, amount, password)'
        })
      }

      if (parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: '전송량은 0보다 커야 합니다.'
        })
      }

      const result = await kjbService.transferTokens(fromAddress, toAddress, amount, password)

      res.json({
        success: true,
        data: result,
        message: 'KJB 토큰 전송이 완료되었습니다.'
      })
    } catch (error) {
      console.error('KJB 송금 오류:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'KJB 토큰 전송에 실패했습니다.'
      })
    }
  },

  // 초기 지급 요청
  async claimInitialGrant(req, res) {
    try {
      const { address, password } = req.body

      if (!address || !password) {
        return res.status(400).json({
          success: false,
          message: '지갑 주소와 비밀번호가 필요합니다.'
        })
      }

      const result = await kjbService.claimInitialGrant(address, password)

      res.json({
        success: true,
        data: result,
        message: '초기 1000 KJB 지급이 완료되었습니다.'
      })
    } catch (error) {
      console.error('초기 지급 오류:', error)
      res.status(500).json({
        success: false,
        message: error.message || '초기 KJB 지급에 실패했습니다.'
      })
    }
  },

  // KJB 컨트랙트 정보 조회
  async getContractInfo(req, res) {
    try {
      const result = await kjbService.getContractInfo()

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('컨트랙트 정보 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'KJB 컨트랙트 정보 조회에 실패했습니다.'
      })
    }
  },

  // KJB 토큰 통계 조회
  async getStats(req, res) {
    try {
      const result = await kjbService.getTokenStats()

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('KJB 통계 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'KJB 토큰 통계 조회에 실패했습니다.'
      })
    }
  },

  // 초기 지급 여부 확인
  async checkInitialGrantStatus(req, res) {
    try {
      const { address } = req.params

      if (!address) {
        return res.status(400).json({
          success: false,
          message: '지갑 주소가 필요합니다.'
        })
      }

      const result = await kjbService.checkInitialGrantStatus(address)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('초기 지급 상태 확인 오류:', error)
      res.status(500).json({
        success: false,
        message: error.message || '초기 지급 상태 확인에 실패했습니다.'
      })
    }
  },

  // KJB 토큰 소각
  async burnTokens(req, res) {
    try {
      const { address, amount, password } = req.body

      if (!address || !amount || !password) {
        return res.status(400).json({
          success: false,
          message: '모든 필드를 입력해주세요. (address, amount, password)'
        })
      }

      if (parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: '소각량은 0보다 커야 합니다.'
        })
      }

      const result = await kjbService.burnTokens(address, amount, password)

      res.json({
        success: true,
        data: result,
        message: 'KJB 토큰 소각이 완료되었습니다.'
      })
    } catch (error) {
      console.error('KJB 소각 오류:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'KJB 토큰 소각에 실패했습니다.'
      })
    }
  }
}

module.exports = kjbController