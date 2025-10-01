#!/usr/bin/env node

/**
 * KJB 토큰 입출금 내역 조회 스크립트
 * 사용법: node checkKjbTransactions.js <지갑주소>
 * 예시: node checkKjbTransactions.js 0xB616BdEf465ce42c60Afc7c7a49BFF06D5557DCF
 */

require('dotenv').config()
const { ethers } = require('ethers')

// KJB 컨트랙트 ABI (Transfer, TokensMinted, TokensBurned, InitialGrantClaimed 이벤트)
const KJB_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount)",
  "event TokensBurned(address indexed from, uint256 amount)",
  "event InitialGrantClaimed(address indexed recipient, uint256 amount)",
  "function balanceOf(address account) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
]

// 환경 변수에서 설정 로드
const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_URL || 'http://192.0.0.1:8545'
const KJB_CONTRACT_ADDRESS = process.env.KJB_CONTRACT_ADDRESS || '0x1234123412341234344d9E45Ebabf852D4CA6471'

async function checkKjbTransactions(walletAddress) {
  try {
    console.log('='.repeat(80))
    console.log('KJB 토큰 입출금 내역 조회')
    console.log('='.repeat(80))
    console.log()

    // 주소 유효성 검증
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('올바르지 않은 지갑 주소입니다.')
    }

    // 체크섬 주소로 변환
    const checksumAddress = ethers.getAddress(walletAddress)
    console.log(`📍 지갑 주소: ${checksumAddress}`)
    console.log(`🔗 블록체인 URL: ${BLOCKCHAIN_URL}`)
    console.log(`📝 KJB 컨트랙트: ${KJB_CONTRACT_ADDRESS}`)
    console.log()

    // Provider 및 Contract 초기화
    const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_URL)
    const contract = new ethers.Contract(KJB_CONTRACT_ADDRESS, KJB_ABI, provider)

    // 네트워크 정보 확인
    const network = await provider.getNetwork()
    const blockNumber = await provider.getBlockNumber()
    console.log(`🌐 네트워크 체인 ID: ${network.chainId}`)
    console.log(`📦 현재 블록 번호: ${blockNumber}`)
    console.log()

    // 현재 잔액 조회
    const balance = await contract.balanceOf(checksumAddress)
    const balanceFormatted = ethers.formatEther(balance)
    console.log(`💰 현재 KJB 잔액: ${balanceFormatted} KJB`)
    console.log()

    console.log('='.repeat(80))
    console.log('트랜잭션 내역 조회 중...')
    console.log('='.repeat(80))
    console.log()

    // 모든 이벤트 조회 (컨트랙트 배포 시점부터)
    const fromBlock = 0
    const toBlock = 'latest'

    // 1. Transfer 이벤트 - 받은 내역 (to = walletAddress)
    console.log('📥 입금 내역 (Transfer 이벤트 - 받은 내역)')
    console.log('-'.repeat(80))
    const transferInFilter = contract.filters.Transfer(null, checksumAddress)
    const transferInEvents = await contract.queryFilter(transferInFilter, fromBlock, toBlock)

    if (transferInEvents.length === 0) {
      console.log('   입금 내역이 없습니다.')
    } else {
      for (const event of transferInEvents) {
        const block = await event.getBlock()
        const amount = ethers.formatEther(event.args.value)
        console.log(`   블록: ${event.blockNumber} | 시간: ${new Date(block.timestamp * 1000).toLocaleString()}`)
        console.log(`   보낸 주소: ${event.args.from}`)
        console.log(`   금액: ${amount} KJB`)
        console.log(`   트랜잭션: ${event.transactionHash}`)
        console.log()
      }
    }

    // 2. Transfer 이벤트 - 보낸 내역 (from = walletAddress)
    console.log('📤 출금 내역 (Transfer 이벤트 - 보낸 내역)')
    console.log('-'.repeat(80))
    const transferOutFilter = contract.filters.Transfer(checksumAddress, null)
    const transferOutEvents = await contract.queryFilter(transferOutFilter, fromBlock, toBlock)

    if (transferOutEvents.length === 0) {
      console.log('   출금 내역이 없습니다.')
    } else {
      for (const event of transferOutEvents) {
        const block = await event.getBlock()
        const amount = ethers.formatEther(event.args.value)
        console.log(`   블록: ${event.blockNumber} | 시간: ${new Date(block.timestamp * 1000).toLocaleString()}`)
        console.log(`   받는 주소: ${event.args.to}`)
        console.log(`   금액: ${amount} KJB`)
        console.log(`   트랜잭션: ${event.transactionHash}`)
        console.log()
      }
    }

    // 3. TokensMinted 이벤트 (발행)
    console.log('🪙  토큰 발행 내역 (Minted)')
    console.log('-'.repeat(80))
    const mintFilter = contract.filters.TokensMinted(checksumAddress)
    const mintEvents = await contract.queryFilter(mintFilter, fromBlock, toBlock)

    if (mintEvents.length === 0) {
      console.log('   발행 내역이 없습니다.')
    } else {
      for (const event of mintEvents) {
        const block = await event.getBlock()
        const amount = ethers.formatEther(event.args.amount)
        console.log(`   블록: ${event.blockNumber} | 시간: ${new Date(block.timestamp * 1000).toLocaleString()}`)
        console.log(`   금액: ${amount} KJB`)
        console.log(`   트랜잭션: ${event.transactionHash}`)
        console.log()
      }
    }

    // 4. TokensBurned 이벤트 (소각)
    console.log('🔥 토큰 소각 내역 (Burned)')
    console.log('-'.repeat(80))
    const burnFilter = contract.filters.TokensBurned(checksumAddress)
    const burnEvents = await contract.queryFilter(burnFilter, fromBlock, toBlock)

    if (burnEvents.length === 0) {
      console.log('   소각 내역이 없습니다.')
    } else {
      for (const event of burnEvents) {
        const block = await event.getBlock()
        const amount = ethers.formatEther(event.args.amount)
        console.log(`   블록: ${event.blockNumber} | 시간: ${new Date(block.timestamp * 1000).toLocaleString()}`)
        console.log(`   금액: ${amount} KJB`)
        console.log(`   트랜잭션: ${event.transactionHash}`)
        console.log()
      }
    }

    // 5. InitialGrantClaimed 이벤트 (초기 지급)
    console.log('🎁 초기 지급 내역 (Initial Grant)')
    console.log('-'.repeat(80))
    const grantFilter = contract.filters.InitialGrantClaimed(checksumAddress)
    const grantEvents = await contract.queryFilter(grantFilter, fromBlock, toBlock)

    if (grantEvents.length === 0) {
      console.log('   초기 지급 내역이 없습니다.')
    } else {
      for (const event of grantEvents) {
        const block = await event.getBlock()
        const amount = ethers.formatEther(event.args.amount)
        console.log(`   블록: ${event.blockNumber} | 시간: ${new Date(block.timestamp * 1000).toLocaleString()}`)
        console.log(`   금액: ${amount} KJB`)
        console.log(`   트랜잭션: ${event.transactionHash}`)
        console.log()
      }
    }

    // 통계 정보
    console.log('='.repeat(80))
    console.log('📊 통계 정보')
    console.log('='.repeat(80))

    const totalReceived = transferInEvents.reduce((sum, event) =>
      sum + parseFloat(ethers.formatEther(event.args.value)), 0)
    const totalSent = transferOutEvents.reduce((sum, event) =>
      sum + parseFloat(ethers.formatEther(event.args.value)), 0)
    const totalMinted = mintEvents.reduce((sum, event) =>
      sum + parseFloat(ethers.formatEther(event.args.amount)), 0)
    const totalBurned = burnEvents.reduce((sum, event) =>
      sum + parseFloat(ethers.formatEther(event.args.amount)), 0)
    const totalGrant = grantEvents.reduce((sum, event) =>
      sum + parseFloat(ethers.formatEther(event.args.amount)), 0)

    console.log(`📥 총 받은 금액: ${totalReceived.toFixed(4)} KJB (${transferInEvents.length}건)`)
    console.log(`📤 총 보낸 금액: ${totalSent.toFixed(4)} KJB (${transferOutEvents.length}건)`)
    console.log(`🪙  총 발행 금액: ${totalMinted.toFixed(4)} KJB (${mintEvents.length}건)`)
    console.log(`🔥 총 소각 금액: ${totalBurned.toFixed(4)} KJB (${burnEvents.length}건)`)
    console.log(`🎁 총 초기 지급: ${totalGrant.toFixed(4)} KJB (${grantEvents.length}건)`)
    console.log(`💰 현재 잔액: ${balanceFormatted} KJB`)
    console.log()

    // 잔액 계산 검증
    const calculatedBalance = totalReceived - totalSent + totalMinted - totalBurned
    console.log(`🧮 계산된 잔액: ${calculatedBalance.toFixed(4)} KJB`)
    console.log(`✅ 잔액 일치 여부: ${Math.abs(calculatedBalance - parseFloat(balanceFormatted)) < 0.0001 ? '일치' : '불일치'}`)
    console.log()

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    if (error.code) {
      console.error('   에러 코드:', error.code)
    }
    process.exit(1)
  }
}

// 메인 실행
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('사용법: node checkKjbTransactions.js <지갑주소>')
    console.log('예시: node checkKjbTransactions.js 0xB616BdEf465ce42c60Afc7c7a49BFF06D5557DCF')
    process.exit(1)
  }

  const walletAddress = args[0]
  checkKjbTransactions(walletAddress)
    .then(() => {
      console.log('✅ 조회 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 실행 실패:', error)
      process.exit(1)
    })
}

module.exports = { checkKjbTransactions }
