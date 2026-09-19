# Safety Node (SENO) 블로그

한국어/영어 2개 언어를 지원하는 Astro 정적 블로그입니다.
배포는 Vercel — <https://safetynode.vercel.app/ko/>

절차와 문체 규칙은 `docs/`에 있습니다. 글을 쓰기 전에
[`docs/WORKFLOW.md`](./docs/WORKFLOW.md)와 [`docs/WRITING.md`](./docs/WRITING.md)를 읽으세요.

## 처음 한 번만 하는 설정

1. `src/consts.ts` — `YOUR_HANDLE`을 필명으로 바꾸기
2. `astro.config.mjs` — `site` 를 실제 도메인으로 바꾸기
3. `src/i18n/ui.ts` — 문구가 마음에 안 들면 수정

## 글 쓰는 법

```
src/content/posts/ko/글-주소가-될-이름.md   ← 한국어
src/content/posts/en/slug-goes-here.md      ← 영어
```

파일 맨 위에 이렇게 씁니다:

```markdown
---
title: "제목"
description: "목록과 검색결과에 뜨는 한 줄 설명"
pubDate: 2026-08-20
category: safety-architecture   # 아래 5개 중 하나. 메타 글이면 생략 가능
tags: ["ros2", "safety"]
draft: true          # true면 배포 사이트에 안 올라감. 다 쓰면 지우거나 false로
---

본문을 마크다운으로 씁니다.
```

### 카테고리 (글당 1개)

| slug | 이름 | 답하는 질문 |
|---|---|---|
| `standards` | Standards & Regulation | 무엇이 요구되는가 |
| `failure-modes` | AI Failure Modes | 무엇이 잘못될 수 있는가 |
| `safety-architecture` | Safety Architecture | 어떻게 막는가 |
| `verification` | Verification & Evidence | 어떻게 증명하는가 |
| `robot-ai` | Robot AI | 대상 기술 자체 |

- **여기 없는 값을 쓰면 빌드가 실패합니다.** 카테고리가 늘어나는 걸 막는 장치입니다
- 카테고리를 늘리려면 `src/categories.ts` 한 곳만 고치면 됩니다
- 기준: **카테고리 = 이 글이 *무엇에 대한* 글인가 / 태그 = *무엇을 다뤘나***
  - 논문을 인용했다고 해서 분류가 바뀌지 않습니다. `paper-review` 태그를 붙이세요
  - ROS 2, VLA 같은 플랫폼·기술 이름은 태그입니다

- 파일명이 곧 주소가 됩니다 → `/ko/글-주소가-될-이름/`
- `draft: true`인 글은 `npm run dev`에서는 보이고, 배포본에는 안 나옵니다

## 글 쓸 때

- **`docs/WRITING.md`** — 글쓰기 가이드. AI처럼 읽히지 않게 쓰는 법, 구조, 체크리스트
- **`docs/post-template.md`** — 복사해서 쓰는 템플릿

```bash
cp docs/post-template.md src/content/posts/ko/새-글-주소.md
```

## 명령어

```bash
npm install      # 처음 한 번
npm run dev      # http://localhost:4321 에서 미리보기 (저장하면 바로 반영)
npm run build    # dist/ 에 정적 파일 생성
npm run preview  # build 결과를 실제처럼 확인
```

## 나오는 주소들

| 주소 | 내용 |
|---|---|
| `/` | `/ko/` 로 이동 |
| `/ko/`, `/en/` | 글 목록 |
| `/ko/posts/<파일명>/` | 글 본문 |
| `/ko/tags/`, `/ko/tags/<태그>/` | 태그 |
| `/ko/rss.xml`, `/en/rss.xml` | RSS |
| `/sitemap-index.xml` | 사이트맵 (검색엔진용) |

## 배포

GitHub에 올린 뒤 Vercel에서 저장소를 import 하면 끝입니다.
이후에는 `git push` 할 때마다 자동 배포됩니다.
