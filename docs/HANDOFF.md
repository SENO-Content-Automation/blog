# 인수인계 — 블로그 배포

> 작성: 2026-08-19
> 프로젝트 경로: `D:\astro-blog-scaffold\blog-scaffold`
> 저장소: [SENO-Content-Automation/blog](https://github.com/SENO-Content-Automation/blog)
> 배포: Vercel — <https://safetynode.vercel.app/ko/>

---

## 0. 이게 뭔가

**Safety Node (SENO)** — AI 로봇 안전성 검증을 다루는 개인 기술 블로그입니다.
운영자는 임베디드 SW 개발자(자동차 기능안전 ISO 26262 배경, 현재 휴머노이드 로봇 SW).
Safety Node라는 안전성 검증 컨설팅 사업의 콘텐츠 기반을 만드는 것이 목적입니다.

**실명으로 공개 운영합니다.** (익명 운영은 검토 후 폐기)

---

## 1. 현재 상태 — 완료된 것

| 항목 | 상태 |
|---|---|
| Astro v7 프로젝트 구성 | ✅ 빌드 통과 |
| 한/영 2개 언어 라우팅 (`/ko/`, `/en/`) | ✅ |
| UI 전체 영어 (메뉴, 날짜) | ✅ |
| 카테고리 5개 + `z.enum` 빌드타임 검증 | ✅ |
| 태그 | ✅ |
| RSS (언어별), 사이트맵 | ✅ |
| SENO 브랜드 컬러 · 로고 · 파비콘 | ✅ |
| DM Sans / DM Mono (self-host) | ✅ |
| 라이트/다크 모드 (WCAG AA 대비 검증 완료) | ✅ |
| 글쓰기 가이드 + 템플릿 | ✅ `docs/` |
| **Git 저장소** | ❌ 아직 `git init` 안 함 |
| **배포** | ❌ 아직 |
| **도메인** | ❌ 미구매 |

### 글 현황

- `src/content/posts/ko/safe-ros-what-does-it-mean.md` — **draft 상태**, 뼈대만 있음 (TODO 주석)
- 그 외 없음

⚠️ **즉, 지금 배포하면 글이 0개인 사이트가 올라갑니다.** 이건 의도된 상태입니다
(구조를 먼저 배포해두고 글을 채우는 순서). 문제되면 아래 3-B 참고.

---

## 2. 프로젝트 구조

```
blog-scaffold/
├── astro.config.mjs          site URL, 리다이렉트, 마크다운 설정
├── package.json
├── README.md                 사용법
├── docs/
│   ├── WRITING.md            글쓰기 가이드 (AI스럽게 안 쓰는 법, 체크리스트)
│   ├── post-template.md      글 템플릿
│   └── HANDOFF.md            이 문서
├── public/favicon.svg        SENO 로고
└── src/
    ├── consts.ts             사이트 제목/저자/GitHub, DEFAULT_LANG
    ├── categories.ts         ★ 카테고리 정의 (여기 한 곳만 고치면 됨)
    ├── content.config.ts     프론트매터 스키마 (zod)
    ├── i18n/ui.ts            UI 문구 (전부 영어)
    ├── lib/posts.ts          글 조회 헬퍼
    ├── styles/global.css     SENO 브랜드 토큰 + 전체 스타일
    ├── components/           Header, Footer, PostCard, CategoryBadge, FormattedDate
    ├── layouts/BaseLayout.astro
    ├── content/posts/{ko,en}/*.md
    └── pages/[lang]/         index, posts, categories, tags, rss
```

### 카테고리 (글당 1개, `src/categories.ts`)

| slug | 이름 | 질문 |
|---|---|---|
| `standards` | Standards & Regulation | What is required? |
| `failure-modes` | AI Failure Modes | What can go wrong? |
| `safety-architecture` | Safety Architecture | How do we prevent it? |
| `verification` | Verification & Evidence | How do we prove it? |
| `robot-ai` | Robot AI | The technology itself |

앞의 4개는 순서가 의미입니다 (요구 → 위험 → 대응 → 증명).
**정의되지 않은 값을 쓰면 빌드가 실패합니다.**

분류 기준: **카테고리 = 무엇에 *대한* 글인가 / 태그 = 무엇을 다뤘나.**
ROS 2, VLA 같은 플랫폼·기술 이름은 태그입니다. 논문 인용 여부로 카테고리가 바뀌지 않습니다.

---

## 3. 다음 작업: 배포

### 3-A. 사전 확인

```bash
cd D:\astro-blog-scaffold\blog-scaffold

node --version      # v22.12 이상이어야 함 (홀수 버전 불가)
npm install         # @fontsource 패키지 포함. 안 하면 빌드 실패
npm run build       # 통과해야 다음 단계로
```

- `_to_delete/` 폴더가 있으면 내용 확인 후 삭제 (`.gitignore`에 포함돼 있음)
- 실행 중인 `npm run dev`가 있으면 끄고 진행 (Windows 파일 잠금)

### 3-B. ⚠️ 배포 전 결정할 것 두 가지

**① `DEFAULT_LANG` 문제**

`src/consts.ts`의 `DEFAULT_LANG = 'en'`이고 `astro.config.mjs`가 `/` → `/en/`로 보내는데,
**영어 글이 0개**라 첫 화면이 비어 보입니다.

- 영어 글을 곧 쓸 계획이면 그대로 두기
- 아니면 `DEFAULT_LANG = 'ko'` + `astro.config.mjs`의 리다이렉트를 `/ko/`로 되돌리기

**② 글 0개 상태로 배포할지**

- 그대로 배포 → `.vercel.app` 주소만 확보하고 도메인은 첫 글 나온 뒤 연결 (권장)
- 아니면 짧은 소개 글 1편 먼저 쓰고 배포

### 3-C. Git 저장소

⚠️ **실명 공개 운영이므로 git 익명 설정은 하지 않습니다.** 전역 설정 그대로 쓰면 됩니다.

```bash
git init
git add .
git commit -m "init: SENO blog scaffold"
git branch -M main
```

GitHub에서 새 저장소 생성 (**Public** 권장) 후:

```bash
git remote add origin git@github.com:SENO-Content-Automation/blog.git
git push -u origin main
```

`gh` CLI가 있으면:

```bash
gh repo create <repo> --public --source=. --remote=origin --push
```

### 3-D. Vercel 연결

1. https://vercel.com → **Continue with GitHub**
2. **Add New → Project** → 방금 만든 저장소 **Import**
3. Framework Preset이 **`Astro`** 로 자동 인식되는지 확인. 나머지 기본값 유지
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**

1~2분 뒤 `<프로젝트명>.vercel.app` 주소가 나옵니다.
이후 `git push` 할 때마다 자동 재배포됩니다.

### 3-E. 도메인 (나중에 해도 됨)

**후보 (DNS 조회 기준 추정 — 구매 전 등록업체에서 재확인 필요):**

| 도메인 | 비고 |
|---|---|
| **safetynode.dev** | ⭐ 1순위. 개발자 대상 신뢰도 높음, HTTPS 강제 |
| safetynode.io | 가능하나 갱신비가 `.dev`의 2~3배 |
| safetynode.tech | 저렴, 인지도 낮음 |
| ~~safetynode.com~~ | 이미 사용 중 |

등록업체: Cloudflare Registrar(원가) / Namecheap / 가비아
**whois 개인정보 보호 옵션 포함 여부 확인.**

연결 순서:

1. Vercel 프로젝트 → **Settings → Domains** → 도메인 추가
2. Vercel이 화면에 표시하는 DNS 레코드를 등록업체에 **그대로** 입력
3. 반영 후 `astro.config.mjs` 수정:

```js
site: 'https://safetynode.dev',   // 현재 'https://example.com'
```

4. `git push` — 이걸 안 하면 RSS·사이트맵 링크가 `example.com`으로 나갑니다

SSL은 Vercel이 자동 처리합니다.

---

## 4. 배포 후 체크

- [ ] `/` 접속 시 리다이렉트 동작
- [ ] `/en/`, `/ko/` 렌더링
- [ ] `/en/categories/` 카테고리 5개 표시
- [ ] `/en/rss.xml` 200 응답
- [ ] `/sitemap-index.xml` 생성
- [ ] 파비콘 표시
- [ ] 다크모드 (OS 설정 변경해서 확인)
- [ ] 모바일 폭에서 가로 스크롤 없음
- [ ] `astro.config.mjs`의 `site`가 실제 도메인인지

---

## 5. 절대 하면 안 되는 것

콘텐츠 작성 시 지켜야 할 선입니다. 배포 자체와는 무관하지만 이 저장소는 공개됩니다.

- **회사 업무 결과물** — 코드, 설계 문서, 고객사 정보
  (단, 배경 경력 언급은 OK: "ISO 26262 환경에서 일해봤는데 로봇은 다르더라")
- **KIST G1 과제 고유 정보** — 목표, 성능 수치, 미공개 하드웨어, 발주처 요구사항
- **ISO 표준 원문 발췌** — 저작물입니다. 자기 말로 재작성하고 조항 번호는 참조 포인터로만.
  정량 수치(속도·힘·거리)는 넣지 말고 "ISO/TS 15066 참조" 식으로

---

## 6. 미결 사항

- [ ] **취업규칙 겸직·지식재산 조항 확인** ← 최우선. 실명 공개는 되돌릴 수 없음
- [ ] KIST G1 과제 NDA / 발표 승인 범위
- [ ] 도메인 확정 및 구매
- [ ] `DEFAULT_LANG` 결정 (3-B 참고)
- [ ] 첫 글 본문 작성 — `ko/safe-ros-what-does-it-mean.md`의 TODO 채우기

---

## 7. 참고 사실 (2026-08 확인)

첫 글에 쓸 조사 내용입니다.

**"Safe ROS"는 서로 다른 네 가지가 섞여 있습니다:**

| 이름 | 실제로 다루는 것 |
|---|---|
| **SROS2** | **사이버 보안.** safety 아님 — 가장 흔한 오해 |
| ROS 2 Safety Working Group | 커뮤니티 논의체 (`github.com/ros-safety`) |
| Apex.OS | 상용. ISO 26262 ASIL-D 인증받은 **별도 구현** (오픈소스 ROS 2가 인증된 게 아님) |
| micro-ROS | 안전 MCU/RTOS 실행 환경 |

**표준·규제:**

- **ISO/FDIS 13482** 개정 진행 중 — "personal care robots" → **"service robots"** 로 범위 확대
- 정확한 표기는 **ISO/IEC TR 5469:2024** (IEC TR 5469 아님)
- **Regulation (EU) 2023/1230** 기계류 규정 — 2027년 1월 적용
- EU AI Act = Regulation (EU) 2024/1689
