# 회의실 예약 시스템 (Meeting Room Reservation System)

회의실을 효율적으로 관리하고 예약할 수 있는 블록체인 기반 웹 애플리케이션입니다.

## 📋 프로젝트 개요

이 시스템은 프라이빗 블록체인과 KJB 스테이블코인을 활용한 회의실 예약 시스템으로, 투명하고 안전한 예약 관리를 제공합니다.

## 🏗️ 시스템 구조

```
meetingroom/
├── front/             # React + Vite 프론트엔드
├── backend/           # Express.js + SQLite 백엔드
├── contract/          # Hardhat + Solidity 스마트 컨트랙트
├── CLAUDE.md          # 개발 가이드라인
└── README.md          # 프로젝트 소개
```

## ✨ 주요 기능

### 회의실 관리
- 📅 **시간대별 회의실 조회**: 특정 날짜와 시간으로 사용 가능한 회의실 검색
- 🏢 **회의실 정보**: 수용인원, 위치, 현재 상태 표시
- 🔄 **실시간 상태**: 예약가능/사용중/예약불가 상태 실시간 업데이트
- 🔗 **블록체인 연동**: 회의실 정보 스마트 컨트랙트 관리

### 예약 시스템
- ➕ **KJB 기반 예약**: KJB 스테이블코인을 소각하여 예약 생성
- 💰 **자동 가격 계산**: 시간당 10 KJB 자동 계산
- 📋 **예약 현황**: 전체 예약 목록 조회 및 관리
- ❌ **안전한 예약 취소**: 지갑 인증을 통한 예약 취소
- 🔄 **자동 새로고침**: 탭 전환 및 예약 완료 시 최신 정보 자동 조회

### 블록체인 기능
- 🔐 **지갑 인증**: 프라이빗 네트워크 지갑 연동
- 💸 **KJB 토큰 소각**: 예약 시 자동 토큰 소각
- 📊 **블록체인 조회**: 계정 잔액 및 트랜잭션 확인

### 사용자 인터페이스
- 🎨 **반응형 디자인**: 모바일, 태블릿, 데스크탑 지원
- ⚡ **부드러운 애니메이션**: CSS keyframes를 활용한 UX 향상
- 🔄 **애니메이션 제어**: 사용자 설정에 따른 애니메이션 ON/OFF

## 🛠️ 기술 스택

### Frontend
- **React 18+**: 컴포넌트 기반 UI 라이브러리
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **ethers.js 6.15**: 블록체인 연동 라이브러리
- **React Router**: 페이지 라우팅
- **CSS3**: Keyframes 애니메이션 및 반응형 디자인

### Backend
- **Express.js 5.1**: Node.js 웹 프레임워크
- **SQLite**: 경량 데이터베이스 (Oracle DB 호환 설계)
- **ethers.js**: 블록체인 네트워크 통신
- **CORS**: 크로스 오리진 리소스 공유 지원
- **node-fetch**: HTTP 클라이언트

### Blockchain
- **Hardhat**: 스마트 컨트랙트 개발 프레임워크
- **Solidity 0.8.28**: 스마트 컨트랙트 언어
- **Private PoA Network**: 3노드 Clique 합의 알고리즘
- **KJB StableCoin**: ERC20 기반 스테이블코인

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/HanTJ/meetingroom.git
cd meetingroom
```

### 2. 스마트 컨트랙트 배포 (선택사항)
```bash
cd contract
npm install
npm run compile
npx hardhat run scripts/deploy.js --network privatePoA
```

### 3. 백엔드 실행
```bash
cd backend
npm install
npm start
```
백엔드 서버: http://localhost:3001

### 4. 프론트엔드 실행
```bash
cd front
npm install
npm run dev
```
프론트엔드 서버: http://localhost:5173

## 📡 API 엔드포인트

### 회의실 API
- `GET /api/rooms` - 회의실 목록 조회
- `GET /api/rooms?date=YYYY-MM-DD&startTime=HH:MM&endTime=HH:MM` - 시간대별 조회
- `PATCH /api/rooms/:id/status` - 회의실 상태 업데이트

### 예약 API
- `GET /api/reservations` - 예약 목록 조회
- `POST /api/reservations` - 새 예약 생성 (KJB 소각 포함)
- `DELETE /api/reservations/:id` - 예약 취소 (지갑 인증)

### KJB API
- `POST /api/kjb/balance` - KJB 잔액 조회
- `POST /api/kjb/burn` - KJB 토큰 소각

## 🔗 블록체인 네트워크 구성

### 프라이빗 PoA 네트워크
- **네트워크 ID**: 1234
- **합의 알고리즘**: Clique (Proof of Authority)
- **블록 생성 주기**: 15초
- **노드 구성**: 2개 서버 (크로스 부트노드 구성)
  - node1: 192.168.1.100:8545 (부트노드, node2를 피어로 등록)
  - node2: 192.168.1.101:8545 (부트노드, node1을 피어로 등록)

### 배포된 컨트랙트
- **KJB StableCoin**: `0x1234567890123456789012345678901234567890`
- **Meeting Room**: `0xABCDEF1234567890ABCDEF1234567890ABCDEF12`

## 🎯 주요 해결 사항

### 무한 루프 문제 해결
- ✅ React 컴포넌트의 자동 검색 기능으로 인한 무한 API 호출 문제 해결
- ✅ 사용자 주도적 검색으로 변경하여 성능 최적화
- ✅ useEffect 의존성 관리 개선

### 시간 기반 상태 관리
- ✅ 실시간 회의실 상태 계산 로직 구현
- ✅ 예약 시간과 현재 시간 비교를 통한 동적 상태 업데이트

### 탭 전환 시 자동 새로고침
- ✅ 회의실 목록/예약 현황 탭 전환 시 최신 데이터 자동 조회
- ✅ 예약 완료 후 회의실 목록 자동 새로고침 및 화면 전환

### 블록체인 통합
- ✅ 프라이빗 네트워크 지갑 연동
- ✅ KJB 토큰 소각을 통한 예약 시스템
- ✅ 지갑 인증 기반 예약 취소

## 🎨 화면 구성

1. **회의실 목록 페이지**
   - 시간대별 필터링 기능
   - 회의실 카드 형태 표시
   - 실시간 상태 표시
   - 탭 전환 시 자동 새로고침

2. **예약 현황 페이지**
   - 전체 예약 목록
   - 지갑 인증 기반 예약 취소
   - 탭 전환 시 자동 새로고침

3. **예약 생성 모달**
   - 날짜/시간 선택
   - 용도 및 예약자 정보 입력
   - 지갑 주소 및 비밀번호 입력
   - KJB 잔액 실시간 확인
   - 자동 KJB 소모량 계산
   - 예약 완료 후 자동 화면 전환

4. **블록체인 관리 페이지**
   - 지갑 계정 조회
   - KJB 잔액 확인
   - 트랜잭션 내역 조회

## 🔧 개발 환경

- **Node.js**: v18+
- **npm**: v8+
- **Git**: 버전 관리

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👨‍💻 개발자

**HanTJ** - [gauguin135@gmail.com](mailto:gauguin135@gmail.com)

---

🤖 **Generated with [Claude Code](https://claude.ai/code)**