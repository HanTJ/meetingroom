import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import KJBContract from '../contracts/KJBStableCoin.json'
import '../styles/BlockchainPage.css'

const BlockchainPage = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [kjbBalance, setKjbBalance] = useState(null)
  const [ethBalance, setEthBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [networkInfo, setNetworkInfo] = useState(null)
  const [hasClaimedGrant, setHasClaimedGrant] = useState(false)

  // KJB 송금 관련 상태
  const [transferForm, setTransferForm] = useState({
    fromAddress: '',
    password: '',
    toAddress: '',
    amount: '',
    gasPrice: '1',
    gasLimit: '100000'
  })
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState('')
  const [transferSuccess, setTransferSuccess] = useState('')
  const [transactionHash, setTransactionHash] = useState('')

  // 초기 지급 관련 상태
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState('')

  // 프라이빗 네트워크 설정
  // .env 파일에서 실제 네트워크 정보 로드, 없으면 기본값 사용
  const PRIVATE_NETWORK_URL = import.meta.env.VITE_BLOCKCHAIN_URL || 'http://192.168.1.100:8545'
  const EXPECTED_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID) || 1234

  const validateAddress = (address) => {
    if (!address) {
      return '지갑 주소를 입력해주세요.'
    }
    if (!ethers.isAddress(address)) {
      return '올바른 이더리움 주소 형식이 아닙니다.'
    }
    return null
  }

  const checkBalance = async () => {
    const validationError = validateAddress(walletAddress)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setKjbBalance(null)
    setEthBalance(null)
    setNetworkInfo(null)
    setHasClaimedGrant(false)

    try {
      // 지갑 주소 체크섬 검증
      const checksumWalletAddress = ethers.getAddress(walletAddress)

      const provider = new ethers.JsonRpcProvider(PRIVATE_NETWORK_URL)

      // 네트워크 정보 확인
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
        throw new Error(`잘못된 네트워크입니다. 예상: ${EXPECTED_CHAIN_ID}, 실제: ${network.chainId}`)
      }

      // ETH 잔액 조회
      const ethBalanceWei = await provider.getBalance(checksumWalletAddress)
      const ethBalanceEther = ethers.formatEther(ethBalanceWei)

      // KJB 컨트랙트 인스턴스 생성
      // .env 파일에서 실제 컨트랙트 주소 로드, 없으면 기본값 사용
      const contractAddress = import.meta.env.VITE_KJB_CONTRACT_ADDRESS || KJBContract.address
      // 체크섬 주소로 변환 (대소문자 정규화)
      const checksumContractAddress = ethers.getAddress(contractAddress)
      const kjbContract = new ethers.Contract(checksumContractAddress, KJBContract.abi, provider)

      // KJB 잔액 조회
      const kjbBalanceWei = await kjbContract.balanceOf(checksumWalletAddress)
      const kjbBalanceFormatted = ethers.formatEther(kjbBalanceWei)

      // 초기 지급 여부 확인
      const hasReceived = await kjbContract.hasClaimedInitialGrant(checksumWalletAddress)

      // 컨트랙트 통계 조회
      const stats = await kjbContract.getStats()
      const totalSupply = ethers.formatEther(stats[0])
      const totalMinted = ethers.formatEther(stats[1])
      const totalBurned = ethers.formatEther(stats[2])

      setKjbBalance(kjbBalanceFormatted)
      setEthBalance(ethBalanceEther)
      setHasClaimedGrant(hasReceived)

      setNetworkInfo({
        chainId: Number(network.chainId),
        networkName: network.name || 'Private Network',
        blockNumber: await provider.getBlockNumber(),
        gasPrice: ethers.formatUnits(await provider.getFeeData().then(fee => fee.gasPrice), 'gwei'),
        kjbContract: {
          address: checksumContractAddress,
          totalSupply,
          totalMinted,
          totalBurned
        }
      })

    } catch (err) {
      console.error('Balance check error:', err)
      setError(`잔액 조회 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const claimInitialGrant = async () => {
    const validationError = validateAddress(walletAddress)
    if (validationError) {
      setClaimError(validationError)
      return
    }

    setClaimLoading(true)
    setClaimError('')
    setClaimSuccess('')

    try {
      // 지갑 주소 체크섬 검증
      const checksumWalletAddress = ethers.getAddress(walletAddress)

      // 계정 잠금 해제 (패스워드 필요)
      const password = prompt('계정 비밀번호를 입력하세요:')
      if (!password) {
        throw new Error('비밀번호가 필요합니다.')
      }

      // 계정 잠금 해제 RPC 호출
      const unlockResponse = await fetch(PRIVATE_NETWORK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'personal_unlockAccount',
          params: [checksumWalletAddress, password, 300],
          id: 1
        })
      })

      const unlockResult = await unlockResponse.json()
      if (unlockResult.error) {
        throw new Error(`계정 잠금 해제 실패: ${unlockResult.error.message}`)
      }

      // KJB 컨트랙트와 상호작용
      const provider = new ethers.JsonRpcProvider(PRIVATE_NETWORK_URL)
      const signer = await provider.getSigner(checksumWalletAddress)
      const contractAddress = import.meta.env.VITE_KJB_CONTRACT_ADDRESS || KJBContract.address
      const checksumContractAddress = ethers.getAddress(contractAddress)
      const kjbContract = new ethers.Contract(checksumContractAddress, KJBContract.abi, signer)

      // 초기 지급 실행
      const tx = await kjbContract.claimInitialGrant()

      setClaimSuccess(`초기 지급 트랜잭션이 전송되었습니다!
트랜잭션 해시: ${tx.hash}
1000 KJB가 지급됩니다. 트랜잭션이 완료될 때까지 잠시 기다려주세요.`)

      // 트랜잭션 완료 대기
      await tx.wait()

      setClaimSuccess(`✅ 초기 지급이 완료되었습니다!
트랜잭션 해시: ${tx.hash}
1000 KJB가 성공적으로 지급되었습니다.`)

      // 잔액 새로고침
      setTimeout(() => {
        checkBalance()
      }, 2000)

    } catch (err) {
      console.error('Initial grant claim error:', err)
      setClaimError(`초기 지급 실패: ${err.message}`)
    } finally {
      setClaimLoading(false)
    }
  }

  const handleTransfer = async () => {
    // 폼 검증
    const fromError = validateAddress(transferForm.fromAddress)
    const toError = validateAddress(transferForm.toAddress)

    if (fromError) {
      setTransferError(`보내는 주소 오류: ${fromError}`)
      return
    }
    if (toError) {
      setTransferError(`받는 주소 오류: ${toError}`)
      return
    }
    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      setTransferError('올바른 전송량을 입력해주세요.')
      return
    }
    if (!transferForm.password) {
      setTransferError('비밀번호를 입력해주세요.')
      return
    }
    if (transferForm.fromAddress.toLowerCase() === transferForm.toAddress.toLowerCase()) {
      setTransferError('보내는 주소와 받는 주소가 같을 수 없습니다.')
      return
    }

    setTransferLoading(true)
    setTransferError('')
    setTransferSuccess('')
    setTransactionHash('')

    try {
      // 주소 체크섬 검증
      const checksumFromAddress = ethers.getAddress(transferForm.fromAddress)
      const checksumToAddress = ethers.getAddress(transferForm.toAddress)

      // 계정 잠금 해제
      const unlockResponse = await fetch(PRIVATE_NETWORK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'personal_unlockAccount',
          params: [checksumFromAddress, transferForm.password, 300],
          id: 2
        })
      })

      const unlockResult = await unlockResponse.json()
      if (unlockResult.error) {
        throw new Error(`계정 잠금 해제 실패: ${unlockResult.error.message}`)
      }

      // KJB 전송
      const provider = new ethers.JsonRpcProvider(PRIVATE_NETWORK_URL)
      const signer = await provider.getSigner(checksumFromAddress)
      const contractAddress = import.meta.env.VITE_KJB_CONTRACT_ADDRESS || KJBContract.address
      const checksumContractAddress = ethers.getAddress(contractAddress)
      const kjbContract = new ethers.Contract(checksumContractAddress, KJBContract.abi, signer)

      // 잔액 확인
      const balance = await kjbContract.balanceOf(checksumFromAddress)
      const balanceEther = ethers.formatEther(balance)

      if (parseFloat(balanceEther) < parseFloat(transferForm.amount)) {
        throw new Error(`잔액이 부족합니다. 현재 잔액: ${balanceEther} KJB`)
      }

      // KJB 전송 실행
      const amountWei = ethers.parseEther(transferForm.amount)
      const tx = await kjbContract.transfer(checksumToAddress, amountWei, {
        gasLimit: transferForm.gasLimit,
        gasPrice: ethers.parseUnits(transferForm.gasPrice, 'gwei')
      })

      setTransactionHash(tx.hash)
      setTransferSuccess(`KJB 전송 트랜잭션이 전송되었습니다!
트랜잭션 해시: ${tx.hash}
${transferForm.amount} KJB를 ${transferForm.toAddress}에게 전송했습니다.`)

      // 트랜잭션 완료 대기
      const receipt = await tx.wait()

      setTransferSuccess(`✅ KJB 전송이 완료되었습니다!
트랜잭션 해시: ${tx.hash}
블록 번호: ${receipt.blockNumber}
${transferForm.amount} KJB가 성공적으로 전송되었습니다.`)

    } catch (err) {
      console.error('KJB transfer error:', err)
      setTransferError(`KJB 전송 실패: ${err.message}`)
    } finally {
      setTransferLoading(false)
    }
  }

  const clearResults = () => {
    setKjbBalance(null)
    setEthBalance(null)
    setNetworkInfo(null)
    setError('')
    setHasClaimedGrant(false)
  }

  const clearTransferForm = () => {
    setTransferForm({
      fromAddress: '',
      password: '',
      toAddress: '',
      amount: '',
      gasPrice: '1',
      gasLimit: '100000'
    })
    setTransferError('')
    setTransferSuccess('')
    setTransactionHash('')
  }

  const clearClaimResults = () => {
    setClaimError('')
    setClaimSuccess('')
  }

  return (
    <div className="blockchain-page">

      <div className="wallet-balance-section">
        <h3>💰 KJB 토큰 잔액 조회</h3>

        <div className="input-group">
          <label htmlFor="wallet-address">지갑 주소</label>
          <div className="input-with-button">
            <input
              id="wallet-address"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className={error ? 'error' : ''}
            />
            <button
              onClick={checkBalance}
              disabled={loading}
              className="check-btn"
            >
              {loading ? '조회 중...' : '잔액 조회'}
            </button>
            <button
              onClick={clearResults}
              className="clear-btn"
            >
              초기화
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {kjbBalance !== null && (
          <div className="balance-result">
            <h4>잔액 조회 결과</h4>
            <div className="balance-card">
              <div className="balance-main">
                <span className="balance-label">KJB 토큰 잔액</span>
                <span className="balance-value">{kjbBalance} KJB</span>
              </div>
              <div className="balance-details">
                <div className="detail-row">
                  <span className="detail-label">ETH 잔액</span>
                  <span className="detail-value">{ethBalance} ETH</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">지갑 주소</span>
                  <span className="detail-value">{walletAddress}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">초기 지급 여부</span>
                  <span className="detail-value">{hasClaimedGrant ? '✅ 지급받음' : '❌ 미지급'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!hasClaimedGrant && walletAddress && kjbBalance !== null && (
          <div className="claim-section">
            <h4>🎁 초기 지급 받기</h4>
            <p>새로운 지갑은 1000 KJB를 무료로 받을 수 있습니다!</p>
            <button
              onClick={claimInitialGrant}
              disabled={claimLoading}
              className="claim-btn"
            >
              {claimLoading ? '지급 중...' : '1000 KJB 받기'}
            </button>

            {claimError && (
              <div className="error-message">
                {claimError}
              </div>
            )}

            {claimSuccess && (
              <div className="success-message">
                <pre>{claimSuccess}</pre>
                <button onClick={clearClaimResults} className="clear-btn">
                  결과 지우기
                </button>
              </div>
            )}
          </div>
        )}

        {networkInfo && (
          <div className="network-info">
            <h4>🌐 네트워크 정보</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">체인 ID:</span>
                <span>{networkInfo.chainId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">네트워크:</span>
                <span>{networkInfo.networkName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">현재 블록:</span>
                <span>{networkInfo.blockNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label">가스 가격:</span>
                <span>{networkInfo.gasPrice} Gwei</span>
              </div>
              <div className="info-item">
                <span className="info-label">KJB 컨트랙트:</span>
                <span>{networkInfo.kjbContract.address}</span>
              </div>
              <div className="info-item">
                <span className="info-label">총 공급량:</span>
                <span>{networkInfo.kjbContract.totalSupply} KJB</span>
              </div>
              <div className="info-item">
                <span className="info-label">총 발행량:</span>
                <span>{networkInfo.kjbContract.totalMinted} KJB</span>
              </div>
              <div className="info-item">
                <span className="info-label">총 소각량:</span>
                <span>{networkInfo.kjbContract.totalBurned} KJB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="transfer-section">
        <h3>💸 KJB 토큰 송금</h3>

        <div className="transfer-form">
          <div className="form-row two-columns">
            <div className="input-group">
              <label>보내는 지갑 주소</label>
              <input
                type="text"
                value={transferForm.fromAddress}
                onChange={(e) => setTransferForm(prev => ({...prev, fromAddress: e.target.value}))}
                placeholder="0x..."
                className={transferError.includes('보내는 주소') ? 'error' : ''}
              />
            </div>
            <div className="input-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={transferForm.password}
                onChange={(e) => setTransferForm(prev => ({...prev, password: e.target.value}))}
                placeholder="계정 비밀번호"
                className={transferError.includes('비밀번호') ? 'error' : ''}
              />
            </div>
          </div>

          <div className="form-row two-columns">
            <div className="input-group">
              <label>받는 지갑 주소</label>
              <input
                type="text"
                value={transferForm.toAddress}
                onChange={(e) => setTransferForm(prev => ({...prev, toAddress: e.target.value}))}
                placeholder="0x..."
                className={transferError.includes('받는 주소') ? 'error' : ''}
              />
            </div>
            <div className="input-group">
              <label>전송량 (KJB)</label>
              <input
                type="number"
                step="0.01"
                value={transferForm.amount}
                onChange={(e) => setTransferForm(prev => ({...prev, amount: e.target.value}))}
                placeholder="0.00"
                className={transferError.includes('전송량') ? 'error' : ''}
              />
            </div>
          </div>

          <div className="form-row two-columns">
            <div className="input-group">
              <label>가스 가격 (Gwei)</label>
              <input
                type="number"
                value={transferForm.gasPrice}
                onChange={(e) => setTransferForm(prev => ({...prev, gasPrice: e.target.value}))}
                placeholder="1"
              />
            </div>
            <div className="input-group">
              <label>가스 한도</label>
              <input
                type="number"
                value={transferForm.gasLimit}
                onChange={(e) => setTransferForm(prev => ({...prev, gasLimit: e.target.value}))}
                placeholder="100000"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleTransfer}
              disabled={transferLoading}
              className="transfer-btn"
            >
              {transferLoading ? 'KJB 송금 중...' : 'KJB 송금하기'}
            </button>
            <button
              onClick={clearTransferForm}
              className="clear-btn"
            >
              폼 초기화
            </button>
          </div>

          {transferError && (
            <div className="error-message">
              {transferError}
            </div>
          )}

          {transferSuccess && (
            <div className="success-message">
              <pre>{transferSuccess}</pre>
              {transactionHash && (
                <div className="transaction-info">
                  <p>트랜잭션 해시:</p>
                  <code>{transactionHash}</code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="blockchain-info">
        <h3>📘 KJB 스테이블 코인 정보</h3>
        <div className="info-box">
          <p><strong>토큰 이름:</strong> KJB Stable Coin</p>
          <p><strong>토큰 심볼:</strong> KJB</p>
          <p><strong>컨트랙트 주소:</strong> {import.meta.env.VITE_KJB_CONTRACT_ADDRESS || KJBContract.address}</p>
          <p><strong>초기 지급:</strong> 새로운 지갑마다 1000 KJB 지급</p>
          <p><strong>기능:</strong> 잔액 조회, 토큰 송금, 초기 지급 받기</p>
          <p><strong>네트워크:</strong> 프라이빗 블록체인 (Chain ID: {EXPECTED_CHAIN_ID})</p>
        </div>
      </div>
    </div>
  )
}

export default BlockchainPage