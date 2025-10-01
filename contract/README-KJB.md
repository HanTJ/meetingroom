# KJB Stable Coin Contract

KJB는 관리자 발행, 사용자 이체/소각, 초기 지급 기능을 제공하는 ERC-20 스테이블 코인입니다.

## 📋 주요 기능

### 1. 관리자 전용 기능
- **토큰 발행(mint)**: 관리자만 새로운 토큰을 발행할 수 있습니다
- **소유권 관리**: 관리자 권한을 다른 주소로 이전 가능 (포기는 불가)

### 2. 모든 사용자 기능
- **이체(transfer)**: 일반적인 ERC-20 토큰 이체
- **소각(burn)**: 자신의 토큰을 소각하여 총 공급량 감소
- **대신 소각(burnFrom)**: 허용량 내에서 다른 사용자의 토큰 소각
- **초기 지급**: 주소당 최초 1회 1000 KJB 지급

### 3. 조회 기능
- **잔액 조회**: 특정 주소의 토큰 잔액
- **통계 조회**: 총 공급량, 총 발행량, 총 소각량
- **초기 지급 여부**: 특정 주소의 초기 지급 받았는지 확인

## 🚀 배포 정보

- **컨트랙트 주소**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **토큰 이름**: KJB Stable Coin
- **토큰 심볼**: KJB
- **소수점 자릿수**: 18
- **초기 지급량**: 1000 KJB

## 💻 사용법

### 스마트 컨트랙트 함수

```solidity
// 관리자 전용
function mint(address to, uint256 amount) external onlyOwner

// 모든 사용자
function claimInitialGrant() external                    // 초기 1000 KJB 받기
function transfer(address to, uint256 amount) external   // 토큰 이체
function burn(uint256 amount) external                   // 토큰 소각
function burnFrom(address from, uint256 amount) external // 대신 소각

// 조회 함수
function balanceOf(address account) external view returns (uint256)
function hasClaimedInitialGrant(address account) external view returns (bool)
function getStats() external view returns (uint256, uint256, uint256)
```

### JavaScript/Web3 사용 예시

```javascript
// 컨트랙트 연결
const kjbContract = new ethers.Contract(contractAddress, abi, signer);

// 초기 지급 받기
await kjbContract.claimInitialGrant();

// 토큰 이체
await kjbContract.transfer(recipientAddress, ethers.utils.parseEther("100"));

// 토큰 소각
await kjbContract.burn(ethers.utils.parseEther("50"));

// 잔액 조회
const balance = await kjbContract.balanceOf(userAddress);
console.log("잔액:", ethers.utils.formatEther(balance), "KJB");

// 통계 조회
const [totalSupply, totalMinted, totalBurned] = await kjbContract.getStats();
```

## 🧪 테스트

전체 테스트 실행:
```bash
npx hardhat test test/KJBStableCoin.test.js
```

테스트 커버리지:
- ✅ 배포 및 초기 설정 (4개 테스트)
- ✅ 초기 지급 기능 (4개 테스트)
- ✅ 관리자 발행 기능 (5개 테스트)
- ✅ 소각 기능 (4개 테스트)
- ✅ 대신 소각 기능 (2개 테스트)
- ✅ 이체 기능 (2개 테스트)
- ✅ 통계 및 조회 기능 (2개 테스트)
- ✅ 보안 및 제한 사항 (2개 테스트)

**총 25개 테스트 모두 통과**

## 📊 컨트랙트 상태

### 현재 배포된 컨트랙트 정보
- 총 공급량: 1000.0 KJB (초기 지급으로 생성)
- 총 발행량: 1000.0 KJB
- 총 소각량: 0.0 KJB
- 관리자: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

## 🔒 보안 기능

1. **관리자 권한 제한**: 오직 토큰 발행(mint)만 가능
2. **소유권 포기 방지**: `renounceOwnership()` 함수 비활성화
3. **재입 공격 방지**: ReentrancyGuard 적용
4. **입력값 검증**: 모든 함수에서 적절한 유효성 검사
5. **이벤트 로깅**: 모든 중요한 작업에 대한 이벤트 발생

## 🎯 사용 시나리오

### 신규 사용자
1. 지갑 생성 후 `claimInitialGrant()` 호출
2. 1000 KJB 자동 지급 받음
3. 필요에 따라 이체, 소각 등 수행

### 관리자
1. 필요시 `mint()` 함수로 추가 토큰 발행
2. `transferOwnership()`으로 관리자 권한 이전 가능

### 일반 거래
1. `transfer()` 또는 `transferFrom()`으로 토큰 이체
2. `burn()` 또는 `burnFrom()`으로 토큰 소각
3. `approve()`로 다른 주소에 사용 권한 부여

## 📁 파일 구조

```
contract/
├── contracts/KJBStableCoin.sol     # 메인 컨트랙트
├── scripts/deploy-kjb.js           # 배포 스크립트
├── test/KJBStableCoin.test.js      # 테스트 파일
├── deployment-kjb.json             # 배포 정보
└── README-KJB.md                   # 이 문서
```

## 🔧 개발 명령어

```bash
# 컴파일
npm run compile

# 테스트
npx hardhat test test/KJBStableCoin.test.js

# 배포 (로컬)
npx hardhat run scripts/deploy-kjb.js

# 배포 (특정 네트워크)
npx hardhat run scripts/deploy-kjb.js --network <network-name>
```

---

**개발자**: R&D Team
**배포일**: 2025-09-30
**버전**: 1.0.0