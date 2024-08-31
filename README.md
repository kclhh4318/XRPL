# NBLE - XRP NFT Game Platform

## URL

https://xrpl-hack.netlify.app/

## Introduction

The XRP NFT Game Platform is a gaming platform that using NFTs to boost NFT utility and adoption. This platform allows users to connect their XRP wallets, select NFTs, and participate in various games while leveraging the value of their digital assets.

## Features

1. **Wallet Integration**:

   - Connect with gem wallet

2. **NFT Integration**:

   - Browse and view NFT collections

3. **Game Ecosystem**:

   - Multiple game options (currently featuring Math High Low Game)
   - Game selection interface
   - NFT-based gameplay, where NFTs influence game mechanics or rewards

4. **Token Swap**:
   - Integrated swap functionality for XRP and NBL(NBLE token).

## Technical Stack

- Frontend: React.js
- Backend: Python - FastAPI

## Getting Started

We deployed the website using Netlify - ![NBLE](https://xrpl-hack.netlify.app/) and server to Google Cloud Platform.

Follow these steps to set up and run the NBLE - XRP NFT Game Platform locally.

### Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- pip (Python package installer)
- npm (Node package manager)
- ![GemWallet](https://chromewebstore.google.com/detail/gemwallet/egebedonbdapoieedfcfkofloclfghab)

### Wallet Setup

1. Create a new wallet in GemWallet.
2. Change to testnet
3. Fund XRP

### Environment Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-username/nble-xrp-nft-game.git
   cd nble-xrp-nft-game
   ```

2. Set up a Python virtual environment (optional but recommended):

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install Python dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Install Node.js dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:

   ```
   cd backend
   uvicorn app.main:app --port 80
   ```

   The backend API will be available at `http://localhost:80`

2. In a new terminal, start the frontend development server:

   ```
   cd frontend
   npm run start
   ```

   The frontend application will be available at `http://localhost:3000`

3. Open your web browser and visit `http://localhost:3000` to access the NBLE - XRP NFT Game Platform.

# NBLE - XRP NFT 게임 플랫폼

## 소개

NBLE 게임 플랫폼은 NFT를 활용하여 NFT의 유틸리티와 사용성을 증가시키기 위해 탄생한 Platform 입니다. NBLE에서 사용자는 XRP 지갑을 연결하고, NFT를 선택하여 다양한 게임에 참여하면서 NFT를 활용 할 수 있습니다.

## 특징

1. **지갑 통합**:
   - GemWallet을 사용하여 Wallet Connect
2. **NFT 통합**:
   - NFT 컬렉션 탐색 및 보기
3. **게임 생태계**:
   - 다양한 게임 옵션 (현재 Math High Low 게임 제공)
   - 게임 선택 인터페이스
   - NFT 기반 게임플레이, NFT가 게임 메커니즘이나 보상에 영향을 미침
4. **토큰 스왑**:
   - XRP와 NBL(NBLE 토큰) 스왑 기능

## 기술 스택

- 프론트엔드: React.js
- 백엔드: Python - FastAPI

## 시작하기

Netlify를 사용하여 웹사이트를 배포했습니다 - [NBLE](https://xrpl-hack.netlify.app/)와 서버는 Google Cloud Platform에 배포했습니다.

로컬에서 실행하려면 아래의 설명을 읽어주세요.

### 사전 요구 사항

- Node.js (v14 이상)
- Python (v3.7 이상)
- pip (Python 패키지 설치 관리자)
- npm (Node 패키지 관리자)
- [GemWallet](https://chromewebstore.google.com/detail/gemwallet/egebedonbdapoieedfcfkofloclfghab)

### 지갑 설정

1. GemWallet에서 새 지갑을 생성합니다.
2. 테스트넷으로 변경합니다.
3. XRP를 충전합니다.

### 환경 설정

1. 리포지토리 복제:
   ```
   git clone https://github.com/your-username/nble-xrp-nft-game.git
   cd nble-xrp-nft-game
   ```
2. Python 가상 환경 설정 (선택사항이지만 권장):
   ```
   python -m venv venv
   source venv/bin/activate  # Windows에서는 `venv\Scripts\activate` 사용
   ```
3. Python 의존성 설치:
   ```
   pip install -r requirements.txt
   ```
4. Node.js 의존성 설치:
   ```
   cd frontend
   npm install
   ```

### 애플리케이션 실행

1. 백엔드 서버 시작:

   ```
   cd backend
   uvicorn app.main:app --port 80
   ```

   백엔드 API는 `http://localhost:80`에서 사용 가능합니다.

2. 새 터미널에서 프론트엔드 개발 서버 시작:

   ```
   cd frontend
   npm run start
   ```

   프론트엔드 애플리케이션은 `http://localhost:3000`에서 사용 가능합니다.

3. `http://localhost:3000` 로 접속하며 웹페이지가 나옵니다.
