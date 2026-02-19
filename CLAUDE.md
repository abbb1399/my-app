# CLAUDE.md

## 언어 설정

항상 한국어(한글)로 대답한다.

## 프로젝트 개요

AI 기반 심리 상담 세션 앱. 사용자가 상담 세션을 생성하고, 음성 채팅(Hume AI)을 통해 상담을 진행하며, AI가 피드백과 질문을 생성한다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **DB**: PostgreSQL + Drizzle ORM
- **AI**: Google AI (`@ai-sdk/google`), Hume AI (음성)
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Package Manager**: pnpm
- **Validation**: Zod + React Hook Form

## 디렉토리 구조

```
src/
├── app/                        # Next.js App Router 페이지
│   ├── app/                    # 인증된 사용자 영역
│   │   ├── sessions/           # 세션 관련 페이지
│   │   │   ├── new/            # 세션 생성
│   │   │   └── [sessionId]/    # 세션 상세
│   │   │       ├── edit/       # 세션 수정
│   │   │       ├── chats/      # 채팅 목록 및 신규
│   │   │       ├── questions/  # 질문 목록
│   │   │       └── resume/     # 이력서 분석
│   │   └── _Navbar.tsx
│   └── api/                    # API 라우트 (AI 관련)
├── drizzle/
│   ├── db.ts                   # DB 연결
│   ├── schema.ts               # 스키마 export 집합
│   ├── schema/                 # 테이블 정의
│   │   ├── user.ts
│   │   ├── session.ts          # SessionTable ("sessions")
│   │   ├── chat.ts             # ChatTable ("chats")
│   │   └── question.ts         # QuestionTable ("questions")
│   └── schemaHelpers.ts        # 공통 컬럼 (id, createdAt, updatedAt)
├── features/                   # 도메인별 비즈니스 로직
│   ├── sessions/
│   │   ├── actions.ts          # Server Actions
│   │   ├── db.ts               # DB 쿼리
│   │   ├── dbCache.ts          # 캐시 태그 & revalidate
│   │   └── schemas.ts          # Zod 스키마
│   ├── chats/
│   ├── questions/
│   └── users/
├── services/
│   ├── clerk/                  # 인증 유틸
│   ├── hume/                   # Hume AI 음성 API
│   └── ai/                     # Google AI (질문 생성, 피드백, 이력서 분석)
├── lib/
│   ├── dataCache.ts            # 캐시 태그 헬퍼 (global / user / id)
│   └── utils.ts
└── data/env/                   # 환경변수 (client.ts / server.ts)
```

## DB 스키마 핵심

- `sessions` - 상담 세션 (userId FK, status, moodRating, emotionalState, topicTags)
- `chats` - 세션 내 채팅 (jobInfoId → sessions.id)
- `questions` - 세션 내 질문 (jobInfoId → sessions.id)
- `users` - Clerk 웹훅으로 동기화
