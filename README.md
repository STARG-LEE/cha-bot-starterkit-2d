# Δ 에브리옵션 with GREEK

> **옵션 거래의 진입장벽을 허무는 AI 챗봇 학습 플랫폼**
> 복잡한 옵션 개념과 그릭(Δ Γ Θ ν ρ)을 일상 언어로. 이해도 퀴즈와 자격시험 모의고사까지 —
> 옵션이 처음이어도 체계적으로 거래 준비를 마칠 수 있어요.

`sungbongju/cha-bot-starterkit-2d` 스타터킷을 포크해, 옵션 교육 서비스 **에브리옵션**으로 리뉴얼한 프로젝트입니다.
화면 전체를 쓰던 봇을 **우하단 토글 → 화면 절반 도크**로 바꾸고, 옵션 학습 기능들을 봇과 연계했습니다.

---

## ✨ 무엇이 들어있나

| 기능 | 설명 |
|---|---|
| 🗺️ **학습 로드맵** | 기초 → 그릭 → 전략 → 자격까지 4단계 커리큘럼. 레슨 체크로 진도 저장(localStorage) |
| 📖 **옵션 용어집** | 30+ 핵심 용어를 카테고리·검색으로. 카드를 펼치면 상세 설명 |
| ✅ **이해도 퀴즈** | 주제별(기초·그릭·손익·전략·제도) 객관식 + 즉시 채점·해설 |
| Δ **그릭 Lab** | 블랙-숄즈 기반 옵션 가격·그릭 실시간 계산기 + 만기 손익(페이오프) 그래프 |
| 📝 **모의고사** | 자격시험 대비 15문항 타이머 모의고사 + 합격 판정·복습 (학습용 자체 제작 문항) |
| 🤖 **AI 길잡이 GREEK** | 우하단 토글로 여는 화면 절반 도크. 텍스트 채팅 + (선택) 음성 |

### 🔗 모든 기능이 봇과 연결됩니다

각 기능의 **“💬 GREEK에게”** 버튼은 `useBot().askGreek(prompt)`를 호출해
**도크를 열고 GREEK에게 질문을 자동으로 주입**합니다.

- 용어집 카드 → 그 용어를 비유로 설명 요청
- 퀴즈 오답/총평 → 해당 개념 해설 요청
- 그릭 Lab → 현재 슬라이더 값 기반 옵션 해석 요청
- 모의고사 → 틀린 문제 묶음 복습 요청
- 로드맵 레슨 → 해당 주제 설명 요청

---

## 🧠 봇은 어떻게 답하나 (중요)

봇의 “두뇌”는 이 레포가 아니라 **미들턴 서버의 팀별 RAG**입니다.
프론트엔드는 `/api/chat-stream`으로 프록시만 하고, 실제 답변은 `TEAM_ID`로 선택된 팀의 RAG + LLM이 생성합니다.

```
[에브리옵션 프론트]  ──/api/chat-stream──▶  [Vercel 서버리스 프록시]  ──▶  [미들턴 RAG + LLM]
                                                                        ▲ TEAM_ID 로 본인 팀 RAG
```

> ⚠️ **로컬(`npm run dev`)에서는 채팅이 동작하지 않습니다.** `/api/*`는 Vercel 서버리스 함수라
> 배포 후에만 작동해요. 로컬에서는 랜딩·용어집·퀴즈·모의고사·그릭 Lab 등 **클라이언트 기능만** 확인됩니다.
> 봇이 옵션 지식을 답하려면 아래 5단계에서 **RAG에 옵션 콘텐츠를 등록**해야 합니다.

---

## 🚀 배포 (Vercel)

1. 이 레포를 Vercel에 **New Project**로 연결
2. **Environment Variables** 추가
   | Name | Value |
   |---|---|
   | `TEAM_ID` | 본인 팀 번호 (예: `07`) |
   | `VITE_KAKAO_JS_KEY` | 카카오 JS 키 (로그인/공유용, 선택) |
3. **Deploy** → 배포 URL 발급

### RAG에 옵션 지식 넣기 ⭐

```
https://middleton.p-e.kr/finbot/team/<TEAM_ID>/rag
```

- **방법 A (쉬움):** 옵션 강의노트·용어 설명 텍스트를 붙여넣고 **🤖 AI로 청크 만들기** → 저장
- **방법 B:** JSONL 직접 업로드

> GREEK의 페르소나(말투·역할)도 RAG 청크로 정의합니다.
> 예: `{"question":"너 누구야","answer":"나는 옵션 길잡이 GREEK이야. Δ Γ Θ ν ρ 그릭부터 자격까지 도와줄게!"}`

---

## 🛠 로컬 개발

```bash
npm install
npm run dev      # http://localhost:5176
npm run build    # 프로덕션 빌드
```

---

## 🗂 구조

```
src/
├─ App.jsx                  # 조합: BotProvider + Header + Landing + BotDock
├─ context/BotContext.jsx   # 채팅 스트리밍·TTS·도크 상태 + askGreek (봇 연계 핵심)
├─ components/
│  ├─ BotDock.jsx           # 우하단 FAB + 화면 절반 도크 (아바타+채팅)
│  └─ Image2DAvatar.jsx     # GREEK 2D 마스코트 (립싱크)
├─ site/                    # 랜딩 + 기능 섹션
│  ├─ Hero · PainPoints · FeatureNav · Roadmap
│  ├─ Glossary · Quiz · GreeksLab · MockExam · Footer
│  └─ site.module.css       # 공유 디자인 시스템
├─ data/                    # 콘텐츠 (여기만 고치면 내용 변경)
│  ├─ glossary.js · greeks.js · quizzes.js · mockExam.js · roadmap.js
└─ lib/blackScholes.js      # 옵션 가격·그릭 계산
```

**콘텐츠를 바꾸려면** `src/data/`의 파일만 수정하면 됩니다.

---

## 🎭 마스코트 GREEK

헤르메스(상업·거래의 신)의 날개·카두케우스 + 그리스 문양을 두른 화이트·골드 로봇.
`public/avatar2d/`의 `idle.png`·`talk.png`·`wink.png`(+`expressions/`)로 표정·립싱크가 작동합니다.
교체하려면 같은 파일명으로 PNG만 바꾸면 됩니다.

---

## ⚖️ 면책

본 서비스는 옵션·파생상품 **학습용 데모**입니다. 모든 정보·계산·모의고사는 교육 목적이며
특정 종목·상품의 투자 권유나 매매 신호가 아닙니다. 투자 판단과 결과의 책임은 투자자 본인에게 있습니다.

---

## 🙏 만든 사람

- **에브리옵션 기획·발표**: 김영민 · 김윤호 · 이서희 · 홍성혁
- **스타터킷 + 백엔드**: 성봉주 + Claude (Anthropic) — [cha-bot-starterkit-2d](https://github.com/sungbongju/cha-bot-starterkit-2d)

MIT License.
