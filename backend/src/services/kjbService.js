const { ethers } = require('ethers')

// KJB 컨트랙트 정보
// .env 파일에서 실제 컨트랙트 주소 로드, 없으면 기본값 사용
const KJB_CONTRACT_INFO = {
  address: process.env.KJB_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "InitialGrantClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensBurned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensMinted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "INITIAL_GRANT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burnFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimInitialGrant",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_totalSupply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_totalMinted",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_totalBurned",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasClaimedInitialGrant",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasReceivedInitialGrant",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalBurned",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalMinted",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}

// 네트워크 설정
// .env 파일에서 실제 네트워크 정보 로드, 없으면 기본값 사용
const PRIVATE_NETWORK_URL = process.env.BLOCKCHAIN_URL || 'http://192.168.1.100:8545'
const EXPECTED_CHAIN_ID = parseInt(process.env.CHAIN_ID) || 1234

const kjbService = {
  // Provider 인스턴스 생성
  getProvider() {
    return new ethers.JsonRpcProvider(PRIVATE_NETWORK_URL)
  },

  // KJB 컨트랙트 인스턴스 생성
  getContract(signerOrProvider) {
    return new ethers.Contract(KJB_CONTRACT_INFO.address, KJB_CONTRACT_INFO.abi, signerOrProvider)
  },

  // 계정 잠금 해제
  async unlockAccount(address, password, duration = 300) {
    const response = await fetch(PRIVATE_NETWORK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'personal_unlockAccount',
        params: [address, password, duration],
        id: Date.now()
      })
    })

    const result = await response.json()
    if (result.error) {
      throw new Error(`계정 잠금 해제 실패: ${result.error.message}`)
    }

    return result.result
  },

  // KJB 토큰 잔액 조회
  async getTokenBalance(address) {
    try {
      const provider = this.getProvider()
      const contract = this.getContract(provider)

      // KJB 잔액 조회
      const kjbBalance = await contract.balanceOf(address)
      const kjbBalanceFormatted = ethers.formatEther(kjbBalance)

      // ETH 잔액 조회
      const ethBalance = await provider.getBalance(address)
      const ethBalanceFormatted = ethers.formatEther(ethBalance)

      // 초기 지급 여부 확인
      const hasClaimedGrant = await contract.hasClaimedInitialGrant(address)

      // 네트워크 정보
      const network = await provider.getNetwork()
      const blockNumber = await provider.getBlockNumber()

      return {
        address,
        kjbBalance: kjbBalanceFormatted,
        ethBalance: ethBalanceFormatted,
        hasClaimedGrant,
        network: {
          chainId: Number(network.chainId),
          blockNumber
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`잔액 조회 실패: ${error.message}`)
    }
  },

  // KJB 토큰 송금
  async transferTokens(fromAddress, toAddress, amount, password) {
    try {
      // 계정 잠금 해제
      await this.unlockAccount(fromAddress, password)

      const provider = this.getProvider()
      const signer = await provider.getSigner(fromAddress)
      const contract = this.getContract(signer)

      // 잔액 확인
      const balance = await contract.balanceOf(fromAddress)
      const balanceFormatted = ethers.formatEther(balance)

      if (parseFloat(balanceFormatted) < parseFloat(amount)) {
        throw new Error(`잔액이 부족합니다. 현재 잔액: ${balanceFormatted} KJB`)
      }

      // 토큰 전송
      const amountWei = ethers.parseEther(amount.toString())
      const tx = await contract.transfer(toAddress, amountWei)

      // 트랜잭션 완료 대기
      const receipt = await tx.wait()

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        fromAddress,
        toAddress,
        amount: amount.toString(),
        gasUsed: receipt.gasUsed.toString(),
        status: 'success',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`토큰 전송 실패: ${error.message}`)
    }
  },

  // 초기 지급 요청
  async claimInitialGrant(address, password) {
    try {
      // 이미 지급받았는지 확인
      const provider = this.getProvider()
      const contract = this.getContract(provider)
      const hasReceived = await contract.hasClaimedInitialGrant(address)

      if (hasReceived) {
        throw new Error('이미 초기 지급을 받았습니다.')
      }

      // 계정 잠금 해제
      await this.unlockAccount(address, password)

      const signer = await provider.getSigner(address)
      const contractWithSigner = this.getContract(signer)

      // 초기 지급 실행
      const tx = await contractWithSigner.claimInitialGrant()
      const receipt = await tx.wait()

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        address,
        amount: '1000',
        gasUsed: receipt.gasUsed.toString(),
        status: 'success',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`초기 지급 실패: ${error.message}`)
    }
  },

  // KJB 컨트랙트 정보 조회
  async getContractInfo() {
    try {
      const provider = this.getProvider()
      const contract = this.getContract(provider)

      const name = await contract.name()
      const symbol = await contract.symbol()
      const decimals = await contract.decimals()
      const owner = await contract.owner()
      const initialGrant = await contract.INITIAL_GRANT()

      return {
        address: KJB_CONTRACT_INFO.address,
        name,
        symbol,
        decimals: Number(decimals),
        owner,
        initialGrant: ethers.formatEther(initialGrant),
        network: {
          url: PRIVATE_NETWORK_URL,
          chainId: EXPECTED_CHAIN_ID
        }
      }
    } catch (error) {
      throw new Error(`컨트랙트 정보 조회 실패: ${error.message}`)
    }
  },

  // KJB 토큰 통계 조회
  async getTokenStats() {
    try {
      const provider = this.getProvider()
      const contract = this.getContract(provider)

      const stats = await contract.getStats()
      const totalSupply = ethers.formatEther(stats[0])
      const totalMinted = ethers.formatEther(stats[1])
      const totalBurned = ethers.formatEther(stats[2])

      return {
        totalSupply,
        totalMinted,
        totalBurned,
        contractAddress: KJB_CONTRACT_INFO.address,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`토큰 통계 조회 실패: ${error.message}`)
    }
  },

  // 초기 지급 여부 확인
  async checkInitialGrantStatus(address) {
    try {
      const provider = this.getProvider()
      const contract = this.getContract(provider)

      const hasReceived = await contract.hasClaimedInitialGrant(address)

      return {
        address,
        hasClaimedGrant: hasReceived,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`초기 지급 상태 확인 실패: ${error.message}`)
    }
  },

  // KJB 토큰 소각
  async burnTokens(address, amount, password) {
    try {
      // 계정 잠금 해제
      await this.unlockAccount(address, password)

      const provider = this.getProvider()
      const signer = await provider.getSigner(address)
      const contract = this.getContract(signer)

      // 잔액 확인
      const balance = await contract.balanceOf(address)
      const balanceFormatted = ethers.formatEther(balance)

      if (parseFloat(balanceFormatted) < parseFloat(amount)) {
        throw new Error(`잔액이 부족합니다. 현재 잔액: ${balanceFormatted} KJB`)
      }

      // 토큰 소각
      const amountWei = ethers.parseEther(amount.toString())
      const tx = await contract.burn(amountWei)

      // 트랜잭션 완료 대기
      const receipt = await tx.wait()

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        address,
        amount: amount.toString(),
        gasUsed: receipt.gasUsed.toString(),
        status: 'success',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`토큰 소각 실패: ${error.message}`)
    }
  }
}

module.exports = kjbService