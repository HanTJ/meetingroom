# Project Context

회의실 예약 페이지를 만드는 개발 프로젝트
- 회의실을 사용하고자 할때, 등록되어있는 회의실을 선택하고 사용할 시간을 선택해서 예약
- 현재 회의실 예약정보를 조회

## Development Process - 7단계 개발 프로세스

사용자가 웹페이지 개발을 요청할 때 아래 7단계를 순차적으로 따라 진행하세요:

**절대 중요**: 사용자에게 1번만 물어보고 승인을 받는다. 승인 후에는 더 이상 질문하지 않고 모든 작업을 완료한다.

**작업 진행 방식**: 
- 각 단계는 한 번에 완전히 완료해야 함
- 단계를 세분화하여 2단계로 나누지 말고 1단계로 통합 진행
- 예: "프로젝트 생성" + "의존성 설치"를 별도로 나누지 말고 한 번에 처리
- 사용자 승인 후 추가 확인 없이 진행
- Front 를 모든 기능이 정상동작하도록 만든후 Backend 기능 개발 진행

### 1단계: React 프로젝트 초기 설정
- **Vite** 템플릿 사용 권장 (빠른 개발 서버)
- `npm create vite@latest [프로젝트명] -- --template react`
- 의존성 설치: `npm install`
- **중요**: 프로젝트 생성과 의존성 설치를 한 번에 실행
- `npm create vite@latest [프로젝트명] -- --template react && cd [프로젝트명] && npm install`
- BackEnd 는 express 를 이용하여 개발
- front / backend 폴더 구분

### 2단계: 프로젝트 구조 생성 및 기본 파일 설정
- 필요한 폴더 구조 생성: `mkdir -p [프로젝트명]/src/components [프로젝트명]/src/assets/images [프로젝트명]/src/styles [프로젝트명]/src/hooks`
- 기존 템플릿 파일 정리 및 수정
- 전역 스타일 리셋 적용
- backend 기능은 API 호출로 가정하고, backend 가 개발되기전에 정상작동 되도록 하고, backend 개발후 수정 

### 3단계: 이미지/리소스 준비 및 최적화
- **SVG 형태** 벡터 이미지 제작 권장
- 반응형 대응을 위한 확장 가능한 형식
- `assets/images/` 폴더에 배치

### 4단계: 메인 컴포넌트 개발
- 핵심 기능을 담는 주요 컴포넌트 구현
- `useState` 등 React Hook 활용한 상태 관리
- 이벤트 핸들러 및 사용자 인터랙션 구현

### 5단계: CSS 애니메이션 구현 (keyframes)
- `@keyframes`를 활용한 애니메이션 정의
- `transform` 속성 활용: `translateY`, `rotate`, `scale`
- 부드러운 전환을 위한 `transition` 적용
- 성능 최적화를 고려한 GPU 가속 속성 사용

### 6단계: 반응형 디자인 적용
- 모바일, 태블릿, 데스크탑 대응
- `@media` 쿼리를 활용한 화면 크기별 최적화
- 터치 인터페이스 고려

### 7단계: 최종 애니메이션 제어 기능 추가
- 애니메이션 시작/정지 토글 기능
- 사용자 친화적인 컨트롤 UI
- 접근성 고려 (키보드 네비게이션 등)

### 8단계: BackEnd 기능 개발 
- sqlite db 를 써서 개발
- db는 향후 oracle db 로 바꿀수 있게 호환성 고려

### 개발 완료 후 서버 실행
- **중요**: 백그라운드 실행 금지
- `cd [프로젝트명] && npm run dev`
- 브라우저에서 정상 동작 확인

---

## Current Tasks (참고용)

- [x] React 프로젝트 초기 설정 (Vite 사용)
- [x] 회의실 예약 관련 이미지 리소스 준비 및 최적화 (SVG)
- [x] 반응형 웹 디자인 적용
- [x] 애니메이션 성능 최적화
- [x] 애니메이션 제어 기능 완성
- [x] Backend API 작성
- [x] Backend API 단위테스트
- [x] Front/Backend 통합
- [x] 프라이빗 블록체인 스마트 컨트랙트 개발
- [x] Hardhat 개발 환경 구축
- [x] MeetingRoom 컨트랙트 배포 완료 

## Tech Stack

- **Frontend**: React 18+
- **언어**: TypeScript
- **스타일링**: CSS3 (keyframes), Styled-components, 또는 CSS Modules
- **빌드 도구**: Vite
- **이미지 최적화**: WebP, SVG 지원
- **배포**: GitHub Pages, Vercel, 또는 Netlify
- **Backend**: express 최신 안정버전
- **Blockchain**: Hardhat + Solidity (Private PoA Network)
- **Smart Contract**: MeetingRoom.sol (회의실 예약 관리)

## Development Commands

```bash
# 프로젝트 생성
npm create vite@latest cat-dancing-page -- --template react

# 개발 서버 실행
npm run dev
# 또는
npm start

# 빌드
npm run build

# 테스트
npm test

# 타입 체크 (TypeScript 사용 시)
npm run typecheck

# Smart Contract Commands (contract 폴더에서 실행)
cd contract

# 컨트랙트 컴파일
npm run compile

# 컨트랙트 테스트
npm run test

# 컨트랙트 배포 (프라이빗 네트워크)
npx hardhat run scripts/deploy.js --network privatePoA

# 로컬 하드햇 노드 실행
npm run node
```

## Project Structure

```
front/src/
├── components/
│   └── Layout.tsx            # 페이지 레이아웃
├── assets/
│   └── images/
│       └── room.png           # 회의실 아이콘 
├── styles/
│   ├── animations.css        # CSS 애니메이션 정의
│   └── global.css           # 전역 스타일
├── hooks/
│   └── useAnimation.ts       # 애니메이션 관련 커스텀 훅
└── App.tsx                   # 메인 앱 컴포넌트
backend/src/
├── controllers/
│   ├── roomController.ts        
│   └── reservationController.ts 
├── models/
│   ├── Room.ts        
│   └── Reservation.ts  
├── routes/
│   ├── room.ts        
│   └── reservation.ts  
├── services/
│   ├── roomService.ts        
│   └── reservationService.ts  
├── repositories/
│   ├── roomRepository.ts        
│   └── reservationRepository.ts  
├── utils/
│   ├── database.ts        
│   └── validation.ts  
└── app.ts
└── server.ts
contract/
├── contracts/
│   └── MeetingRoom.sol          # 회의실 예약 스마트 컨트랙트
├── scripts/
│   ├── deploy.js                # 배포 스크립트
│   ├── checkAccounts.js         # 계정 확인 스크립트
│   └── verifyDeployment.js      # 배포 검증 스크립트
├── test/
│   └── MeetingRoom.test.js      # 컨트랙트 단위 테스트
├── ignition/modules/
│   └── MeetingRoom.js           # Ignition 배포 모듈
├── hardhat.config.js            # Hardhat 설정
└── package.json                 # 프로젝트 의존성
```

## Implementation Details

- **애니메이션 타입**: CSS keyframes를 사용한 회의실 종류 아이콘.
- **반응형**: 모바일, 태블릿, 데스크탑 대응

## Smart Contract Details

### 배포된 컨트랙트 정보
<!-- 실제 운영 시 아래 정보를 실제 배포된 정보로 교체 필요 -->
- **컨트랙트 주소**: `0xABCDEF1234567890ABCDEF1234567890ABCDEF12`
- **네트워크**: Private PoA Blockchain (Chain ID: 1234)
- **배포자 주소**: `0x1234567890123456789012345678901234567890`
- **배포 시간**: 실제 배포 시간으로 교체
- **사용된 가스비**: 실제 사용된 가스비로 교체

### 기본 생성된 회의실
1. **Conference Room A** - 대형 회의실 (수용인원: 20명)
2. **Meeting Room B** - 소형 회의실 (수용인원: 4명)
3. **Presentation Room** - 프레젠테이션룸 (수용인원: 50명)

### 주요 컨트랙트 기능
- **회의실 관리**: 생성, 수정, 비활성화 (소유자만)
- **예약 관리**: 예약 생성, 취소, 시간 충돌 검증
- **조회 기능**: 회의실별 예약 현황, 사용자별 예약 내역
- **이벤트 로깅**: 모든 주요 작업에 대한 블록체인 이벤트 기록

### 프라이빗 블록체인 네트워크 구성
<!-- 실제 운영 시 아래 정보를 실제 네트워크 정보로 교체 필요 -->
- **서버 구성**: 2대 서버 (크로스 부트노드 구성)
  - node1: 192.168.1.100:8545 (부트노드, node2를 피어로 등록)
  - node2: 192.168.1.101:8545 (부트노드, node1을 피어로 등록)
- **합의 알고리즘**: Clique (Proof of Authority)
- **네트워크 ID**: 1234
- **블록 생성 주기**: 15초

---

# 개발 서버 실행 가이드

## 중요 사항: 백그라운드 실행 방지

웹 페이지 생성 후 개발 서버를 실행할 때는 반드시 **일반 실행 모드**를 사용하세요.

### ✅ 올바른 실행 방법
```bash
# 프로젝트 디렉토리로 이동 후 개발 서버 실행
cd meetingroom 
npm run dev

# 또는 한 줄로
cd meetingroom && npm run dev
```

### ❌ 피해야 할 실행 방법
```bash
# 백그라운드 실행 금지 - 서버 상태 확인이 어려움
npm run dev &

# run_in_background 옵션 사용 금지
# 개발 서버는 실시간 모니터링이 필요
```

### 개발 서버 특징
- **실시간 핫 리로드**: 코드 변경 시 자동으로 브라우저 새로고침
- **에러 표시**: 컴파일 에러나 런타임 에러를 콘솔에 실시간 표시
- **포트 정보**: 서버가 실행되는 로컬 주소 확인 가능 (예: http://localhost:5173/)
- **종료 방법**: Ctrl+C로 안전하게 종료

### 서버 실행 후 확인사항
1. 콘솔에 "Local: http://localhost:XXXX/" 메시지 표시 확인
2. 브라우저에서 해당 주소로 접속하여 페이지 로딩 확인
3. 애니메이션 및 인터랙션 정상 동작 확인

---

# Communication Guidelines

- 응답 시 CLAUDE.md 파일이나 프로젝트 지침 파일을 직접 언급하지 않기
- 사용자와의 대화에서 내부 설정 파일 참조 언급 금지
- TodoWrite 도구를 적극 활용하여 작업 진행 상황을 투명하게 공개

## Current Implementation (현재 구현 완료)

### Frontend 블록체인 연동
- [x] ethers.js 라이브러리 추가 및 연동
- [x] 프라이빗 네트워크 지갑 연동 (계정 잠금 해제 방식)
- [x] 스마트 컨트랙트와 React 컴포넌트 연결
- [x] KJB 토큰 잔액 실시간 조회
- [x] KJB 토큰 소각을 통한 예약 생성
- [x] 블록체인 관리 페이지 구현

### 예약 시스템 개선
- [x] 예약 완료 후 자동 화면 전환 및 새로고침
- [x] 탭 전환 시 최신 정보 자동 조회
- [x] 회의실 목록/예약 현황 실시간 업데이트
- [x] 지갑 인증 기반 예약 취소 시스템

### 백엔드 블록체인 통합
- [x] KJB API 엔드포인트 추가
- [x] 예약 데이터에 블록체인 정보 저장 (wallet_address, kjb_burned, burn_tx_hash)
- [x] 지갑 인증을 통한 안전한 예약 취소

## Next Steps (향후 개발 계획)

### 추가 스마트 컨트랙트 기능
- [ ] 예약 승인 시스템 (관리자 승인)
- [ ] 반복 예약 기능
- [ ] 예약 알림 시스템
- [ ] 실시간 블록체인 이벤트 리스닝

### 네트워크 최적화
- [ ] 가스비 최적화
- [ ] 트랜잭션 배치 처리
- [ ] 오프체인 데이터 저장 (IPFS 연동)

### UI/UX 개선
- [ ] 메타마스크 연동 지원
- [ ] 트랜잭션 진행 상태 표시
- [ ] 에러 핸들링 개선
