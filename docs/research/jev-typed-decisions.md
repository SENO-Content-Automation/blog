# 5편 자료조사 — Jev: 틀린 형식을 낼 수 없게 만든 판단 모델

> 조사일 2026-09-23. 표기: **[V]** 1차 출처에서 직접 확인 / **[S]** 1차 출처이나 요약 도구 경유로만 읽음 — 원문 대조 필요 / **[U] 미확인 — 사실로 쓰지 말 것**
>
> **읽은 경로에 대한 주의.** 조사 환경에서 `typesafe.ai`, `docs.typesafe.ai`, `avatars.githubusercontent.com` 직접 접속이
> 프록시에서 막혔습니다. 모든 페이지를 웹 페치 도구(요약 모델 경유)로 읽었습니다.
> [V]는 "문자열 검색으로 원문 문장을 그대로 받아낸 것"이고, 그래도 초안 전에 **사람이 페이지를 열어 한 번 대조**해야 합니다.

---

## 결론 먼저 — 논지가 1차 출처에서 그대로 확인됐습니다

게이트 1-b에서 세운 논지:

> Jev는 출력이 스키마를 벗어나지 않는 것까지를 보장한다. 값이 맞는지, 확률이 보정됐는지는
> 공개 자료로 확인할 수 없다.

TypeSafe 공식 블로그가 **스스로** 이렇게 적었습니다 — [V]

> "Our number is not empirical. Schema matching is guaranteed, thus we can confidently add 0% into the plots."

"환각 0%"는 측정값이 아니라 **스키마 일치가 구조적으로 보장된다는 정의에서 나온 값**입니다. 회사가 먼저 밝혔습니다.
그리고 같은 회사의 문서 `Jev 1.13 jaggedness`는 **관련된 질문들 사이의 확률 관계조차 보장하지 않는다**고 적습니다(§4-3).

글의 척추는 이 두 문장 사이입니다.

---

## 0. 무엇인가 — 메타

| 항목 | 값 | 출처 | 표기 |
|---|---|---|---|
| 개발사 | TypeSafe (TypeSafe AI) | 공식 블로그 | [V] |
| 공개일 | 2026-09-15 | 블로그 게시일 `Sep 15, 2026` | [V] |
| 글쓴이 | `Diogo Almeida, founder, TypeSafe` | 블로그 저자란 | [V] |
| 현재 모델 | Jev 1.13 (`jev-1.13.0`), 별칭 `jev-latest`·`jev-preview` 둘 다 1.13.0 | [docs/models](https://docs.typesafe.ai/models) | [S] |
| 기술 보고서·논문·가중치 | **없음** | 블로그·문서에 링크 없음. arXiv 검색 결과 없음 | [S] |

1차 출처 목록

- 공식 블로그: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- 문서: https://docs.typesafe.ai/ (전체 목차 `https://docs.typesafe.ai/llms.txt`)
- 평가 사이트: https://evals.typesafe.ai/
- GitHub 조직: https://github.com/typesafe-ai

---

## 1. Jev가 무엇인가

### 1-1. 정의 — 원문 그대로

- **System One model:** `"System One models are a class of AI models built to make fast, structured decisions that software can use directly."` — [docs/concepts/system-one](https://docs.typesafe.ai/concepts/system-one) [S]
- **Jev:** `"Jev is TypeSafe's flagship model and the first System One model. Send state and typed questions; get structured answers your code can use directly."` — docs 목차의 Introduction 설명 [S]
- **하지 않는 것:** `"System One models do not write replies, produce code, or generate explanations of their reasoning."` — system-one [S]
- **문자열 생성을 포기:** `"While Jev gives up string generation, it's optimized for structured outputs and can't hallucinate."` — 블로그 [V]

### 1-2. 어떻게 다른가 — 생성 방식과 학습

- `"Generates all outputs in parallel instead of autoregressively generating by token."` — 블로그 [V]
- `"Generates all outputs in a single query."` — 블로그 [V]
- 학습: `"training method we call Reinforcement Learning for Calibrated Decisions (RLCD)."` — 블로그 [V]
- `"System One models are trained for calibrated decisions: their probabilities are optimized against outcomes to reflect uncertainty."` — system-one [S]
- 아키텍처 세부(트랜스포머인지, 디퓨전인지, 파라미터 수): **공개 안 됨.** [U]
  - GitHub 조직에 `LLaDA`(Large Language Diffusion Models) 포크가 있습니다. **이것으로 Jev가 디퓨전이라고 추론하지 마세요.** 포크는 근거가 아닙니다.
  - 위키백과가 "trained exclusively on synthetic data"라고 적었지만 블로그에서 `synthetic`은 NOT FOUND. **인용 금지.**

### 1-3. 입력과 출력

**입력 — 텍스트만.** [S]

- `"Jev currently accepts text input only. It evaluates strings, JSON objects, and arrays of text."` — system-one
- `"Images, audio, and video are not supported (yet)."` — system-one, state 문서 동일 문장

**출력 — 세 가지 질문형(primitive).** 이것 말고 다른 출력은 없습니다. [S] [docs/api](https://docs.typesafe.ai/api)

| 질문형 | 무엇을 묻나 | 응답 필드 | 제약 |
|---|---|---|---|
| **Noul** | 예/아니오 | `noul` (0–1, "yes"일 확률) | — |
| **Choice** | 정해진 선택지 중 하나 | `choice`, `probabilities`, `confidence` | 선택지 최대 255개 |
| **Score** | 서술된 등급에 매기기 | `score`, `legend`, `probabilities`, `confidence` | 등급 2~10개 |

Noul 정의 원문: `"A Noul question asks the TypeSafe model to evaluate a yes/no question and return the probability that the answer is yes."` — [docs/primitives/noul](https://docs.typesafe.ai/primitives/noul) [S]

**Noul에는 `confidence`가 없습니다.** 확률 하나가 답과 확신을 같이 담습니다. [S] [docs/confidence](https://docs.typesafe.ai/confidence)

### 1-4. 한계 — 컨텍스트·속도 제한 [S] [docs/models](https://docs.typesafe.ai/models)

| 항목 | 값 |
|---|---|
| 요청당 컨텍스트 | 64k 토큰 (`state` + 가장 긴 질문은 32k) |
| 속도 제한 | 250,000 토큰/초, 1,200 요청/분, 넘으면 `429` |
| 언어 | 영어가 주. CJK 포함 다른 언어는 지원하되 정확도 낮음 |
| 고객별 파인튜닝 | 안 함. 요청 파라미터로만 조정 |

---

## 2. 어떻게 쓰나

### 2-1. 호출 형태 [S] [docs/api](https://docs.typesafe.ai/api), [quickstart](https://docs.typesafe.ai/introduction/quickstart)

```
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>

{ "model": "jev-latest",
  "state": { ... 문자열 | JSON 객체 | 텍스트 배열 ... },
  "questions": { "<이름>": { "type": "noul" | "choice" | "score",
                             "instructions": "...", "criteria": ... } } }
```

- Python: `pip install typesafe-sdk` (Python ≥ 3.10), 환경변수 `TYPESAFE_API_KEY`
- JS/TS SDK: `typesafe-sdk-js` (MIT)
- 오류 코드: 401 / 422 / 429 / **529 (Service overloaded)**. SDK가 429·529에 지수 백오프를 자동 적용 [S]
- 클라우드 API 외 배포 형태(온프레미스·온디바이스)는 문서에서 **못 찾았습니다.** [U]

### 2-2. 문서가 말하는 설계 원칙 — 원문 그대로 [S] [how-to-build](https://docs.typesafe.ai/concepts/how-to-build-with-system-one)

- `"Keep control flow, deterministic rules, and side effects in code."`
- `"It does not generate code or choose its own next action."`
- `"Break broad judgments into narrow, typed questions with explicit instructions and criteria."`
- `"Ask independent questions together, then compose their answers in code."`
- `"Escalate uncertain cases to a person or a more expensive reasoning model."`

**흐름을 쥐는 건 코드이고 모델은 좁은 판단만 합니다.** 로봇 적용 가능성(§5)을 따질 때 이 원칙이 기준입니다.

### 2-3. 대표 패턴 [S]

**Confidence-gated routing** — `"The answer tells you what; confidence tells you whether to act."`
([patterns/confidence-routing](https://docs.typesafe.ai/patterns/confidence-routing))

문서의 음성 뱅킹 예시 코드는 이렇습니다.

```python
if action.confidence < 0.6:
    route_to_support_agent(account_id)
elif action.choice == "check_balance":
    show_balance(account_id)
elif action.choice == "approve_transfer":
    if action.confidence > 0.85:
        approve_transfer(account_id)
    else:
        ask_user_to_confirm("Just to confirm...")
```

- `"each action type has its own threshold based on the consequences of acting on a wrong classification."`
- 임계값 0.6 / 0.85는 **예시값**입니다. confidence 문서의 말: `"The correct threshold values depend on your domain and the performance of the model for your use case."`

**confidence의 정의** — 3지선다 Choice에서 `(3 × largest probability − 1) / 2`. 최대로 몰리면 1.0, 균등 분포(각 33⅓%)면 0입니다.
**보정이 된 척도가 아니라 분포 모양을 0~1로 접은 통계량**입니다. [S] [docs/confidence](https://docs.typesafe.ai/confidence)

**Speculative fan-out** — 관련 여부가 정해지기 전에 필요할 법한 질문을 한 요청에 다 넣고, 쓸 답만 코드가 고릅니다.
스마트홈 데모가 이 방식입니다. "집 안 불 다 꺼줘" → 요청 범주 / 범위(집 전체) / 기기(조명) / 동작(끄기)을 동시에 묻습니다.
대화형 요청이나 복합 명령은 LLM으로 넘깁니다. 데모 소스는 `"full source code will be available on GitHub at release."` — **아직 없습니다.**
[S] [demos/smart-home](https://docs.typesafe.ai/demos/smart-home)

### 2-4. 로봇과 구조가 비슷한 쿡북 — Skill suggestion [S] [cookbooks/skill_suggestion](https://docs.typesafe.ai/cookbooks/skill_suggestion)

에이전트가 고를 스킬 182개(Nous Research Hermes 카탈로그)가 있고, 요청 488건을 `claude-haiku-4-5-20251001`로 돌린 결과입니다.

| 방식 | 잘못 로드 | 불필요 로드 |
|---|---|---|
| 에이전트 단독 | 16.8% | 9.8% |
| 에이전트 + Jev 제안 | 7.3% | 4.0% |
| 오라클(정답 제공) | 2.5% | 1.2% |

- 분모: **요청 488건**
- 방식: Choice 하나로 182개 전체를 순위 매기고 Noul 셋으로 "해당 스킬이 있기는 한가"를 묻습니다. 상위 3개는 전체 설명을 붙여 다시 순위를 매깁니다
- Jev의 답은 **명령이 아니라 시스템 프롬프트 한 줄 힌트**로 들어갑니다. 에이전트가 무시할 수 있습니다

**로봇 스킬 라이브러리에서 스킬을 고르는 문제와 구조가 같습니다.** 다만 이 실험은 소프트웨어 에이전트 스킬이고, 로봇 스킬 선택에서 나온 수치는 **없습니다.**

### 2-5. 가드레일 쿡북 [S] [cookbooks/llm_guardrails](https://docs.typesafe.ai/cookbooks/llm_guardrails)

- 프롬프트 10개 + 응답 5개 = **메시지 15개**. `jev-1.12`로 2026-08-15에 생성한 숫자
- 결과: Pass 5 / Review 1 / Block 7 / Support 1 → **합이 14입니다. 15와 안 맞습니다.** 원문 대조 필요 [U]
- 정책 두 개: Strict(action ≥ 0.70), Permissive(action ≥ 0.85). 같은 판정 결과가 정책에 따라 다르게 라우팅됩니다
- **분모 15는 성능 평가가 아니라 시연입니다.** 정밀도·재현율 수치는 없습니다

### 2-6. 명령 분해의 성능 — 공개 수치가 없습니다 (2026-09-23 추가)

- **Intent routing 패턴** ([patterns/intent-routing](https://docs.typesafe.ai/patterns/intent-routing)): 정확도·데이터셋·지연 수치 **없음** [S]. 예시는 고객 문의를 의도 4종 × 복잡도로 분류하고 의도 confidence < 0.5면 사람에게 넘깁니다
- **스마트홈 데모**: 수치 없음, 소스 미공개 (§2-3)
- **Function calling 쿡북** ([cookbooks/function_calling](https://docs.typesafe.ai/cookbooks/function_calling)) [S]
  - 함수 10개, 채울 인자 합 28개, 시험 명령 **14개**. 데이터는 1분봉 156,780개
  - 보고된 것은 **confidence 0.53~1.00**이지 정답률이 아닙니다. 14개 중 몇 개가 맞았는지는 요약 도구 경유로 확인 못 함 [U]
  - 인자 채우기: 고정 목록(Literal)은 Choice/Set/Flag 질문으로 바꾸고, **자유 텍스트·숫자·날짜는 함수 기본값을 유지**한다는 취지 — 원문 대조 필요 [U]
  - 숫자 인자는 Jev가 만들지 못하고, 코드가 미리 뽑은 후보 중에서 고르게 하는 쿡북이 따로 있습니다: `Pre-parsed value extraction` — 이번에 안 읽음 [U]
- 로봇 명령("30cm 앞으로")처럼 **숫자가 핵심 인자인 명령**을 어떻게 다루는지는 확인 안 됨 [U]

---

## 3. 공개된 숫자 — 전부 회사 발표

### 3-1. 지연시간 — 문서끼리 다릅니다

| 값 | 원문 | 출처 | 표기 |
|---|---|---|---|
| **70ms–500ms** | `"End-to-end response time is 70ms-500ms for TypeSafe."` | 블로그 | [V] |
| 비교 대상 3–329초 | `"End-to-end response time is 3 to 329 seconds for frontier models."` | 블로그 | [V] |
| 40x–200x | `"This can range from 40x-200x faster for the same levels of frontier intelligence for System One shaped queries."` | 블로그 | [V] |
| **약 100ms** | `"Most queries complete in about 100 ms."` | how-to-build | [S] |
| **150ms** | `"Frontier intelligence at real-time speeds (150ms) ..."` | use-case-map | [S] |

**세 문서가 세 값을 적었습니다.** 셋 다 적고, 어느 것을 대표값으로 쓸지는 사람이 정합니다. 측정 조건(네트워크 포함 여부, 질문 수, 상태 크기)은 **어디에도 없습니다.** [U]

### 3-2. 가격 [V]

- `"Input tokens: $0.042 / MTok"`, `"Output tokens: FREE (too cheap to meter)."` — 블로그
- 비교로 제시한 LLM 입력 단가 `"$0.20 to $10 / MTok"` — 블로그

### 3-3. Workflow evals — 정답이 무엇인가 [S] [evals.typesafe.ai](https://evals.typesafe.ai/)

- 워크플로 4개: Security Incidents / Agent Trace Observability / Invoice Processing / Customer Service
- 집계: `"Each point averages one model configuration's accuracy, cost and time over the four workflows with equal weight, against the consensus labels."`
- **정답 라벨:** `"the reference labels are generated via an average of the responses of GPT-6 Astra and Claude Fable 5.1, both at high thinking, answering every question in the harness."`
- 가정: `"the code is correct"`
- 워크플로당 문항 수(분모): **표시 안 됨** [U]
- Jev 정확도 67.8%, 건당 $0.0004, 0.4초 — **요약 도구가 읽은 값입니다. 사람이 페이지에서 직접 확인하기 전에는 인용 금지** [U]
- 홈페이지의 `193.6x faster, 444.6x cheaper`는 이번에 원문 문장으로 받아내지 못했습니다 [U]

**정확도는 사람이 매긴 정답이 아니라 다른 LLM 두 개의 평균 답과 일치한 비율입니다.** `docs/research/robot-ai-topic-candidates.md`의 A3("평가는 검증이 아니다")가 걸리는 자리입니다.

### 3-4. 데모 [V]

- Doom: `"The demo is on structured state as a data structure with text, not on images (yet…)"`
- 같은 글: `"A non-AI doom bot could play better, but we wanted a bot that was reactive to different representations of game state, and most importantly… following instructions was cool as heck!"`
- 판단 주기: 엔지니어가 `"was worried about making 10 queries a second (which ends up costing ~$7/hour)."` → **Doom 데모는 초당 10회 질의**
- Wikiracing: `"Our speedups here tend to be a lot less than in previous demos."`

---

## 4. 무엇이 보장되고 무엇이 안 되나

### 4-1. 보장되는 것 — 형식

- `"The model never makes type errors."` — 블로그 [V]
- 스키마 일치는 구조적으로 보장됩니다. Choice는 선택지 밖의 값을 낼 수 없고, Noul은 0~1 밖의 값을 낼 수 없습니다

### 4-2. "환각 0%"의 정체 [V]

- `"Our number is not empirical. Schema matching is guaranteed, thus we can confidently add 0% into the plots."`
- 블로그가 말하는 환각은 **스키마 밖의 문자열**입니다. `"Strings are flexible and can be anything: chat responses, code, hallucinations, refusals, or even type-safe structured values."`
- 따라서 **"선택지 안에서 틀린 것을 고르는 것"은 이 정의의 환각이 아닙니다.** 정의상 0%입니다

### 4-3. 보장 안 되는 것 — 회사 문서가 직접 적은 것 [S] [model-jaggedness/jev-1.13](https://docs.typesafe.ai/model-jaggedness/jev-1.13)

| 항목 | 원문 요지 |
|---|---|
| 문자 그대로 해석 | `"answers the question you wrote, not the one you meant."` |
| 계산 | `"Jev is not a calculator."` 셈·수치 정밀도·수학 추론이 약함 → 코드로 |
| 날짜·시간 | `"reads dates as text, not as ordered quantities."` |
| 간접 질문 | 여러 단계 추론·이중 부정에서 정확도 하락 |
| 무관한 맥락 | `"Unrelated detail acts as a distractor."` |
| 적대적 입력 | 데이터를 기본적으로 적대적이라 취급하지 않음 |
| 지시·기준 충돌 | 혼란 |
| **구조적 불변식** | 관련 질문 사이의 수학적 관계를 보장하지 않음 (예: P(A) + P(not A) = 1) |
| 텍스트 생성 | `"Jev-1.13 is not trained to generate text."` |

**타입은 보장하되 질문 간 일관성은 보장하지 않습니다.** 같은 상태에 "A인가"와 "A가 아닌가"를 따로 물으면 두 확률의 합이 1이 아닐 수 있습니다.

### 4-4. 보정 — 정의는 있고 증거는 없습니다

- 정의: `"Outcomes assigned a probability of 0.8 should occur about 80% of the time."` — [AI primer](https://docs.typesafe.ai/introduction/machine-learning-primer) [S]
- 문서 자신의 단서: 이 관계는 개별 예측이 아니라 **예측 묶음에 대한 통계적 성질**입니다 [S]
- **보정 지표(ECE, Brier, 신뢰도 다이어그램)가 블로그·문서·평가 사이트 어디에도 없습니다.** [S] — 평가 사이트도 보정 결과를 다루지 않습니다
- 확인된 것은 "보정을 목표로 학습했다(RLCD)"까지입니다. "보정됐다"는 **측정으로 확인된 적이 없습니다**

---

## 5. 로봇 쪽에 쓸 수 있나 — 문서 사실로만 판단

TypeSafe 공식 자료에는 **로봇·제조·산업 제어·자율주행 언급이 없습니다.** [S] (use-case-map, 블로그, system-one 모두)

로봇팔 데모는 [MindStudio 글](https://www.mindstudio.ai/blog/jev-computer-use-minecraft-robotics-demos)에만 있습니다. 시뮬레이션에서 빨간 큐브를 맞는 구멍에 넣는 과제이고,
입력은 기하·접촉 데이터를 정리한 구조화 상태였습니다. **만든 사람과 원본이 없어서 근거가 아닙니다.** [U]

아래는 1차 출처 사실을 로봇 조건에 대 본 것입니다. **오른쪽 열은 분석이지 출처가 있는 사실이 아닙니다.** 초안에서는 판단 기준 문장으로만 쓰세요(`WRITING.md` §1 14번 주의).

| Jev의 사실 | 출처 | 로봇에 대 보면 |
|---|---|---|
| 입력은 텍스트·JSON만. 이미지·오디오·비디오 불가 | system-one, state | 카메라·라이다를 직접 못 받음. 지각 결과를 누군가 먼저 구조화해야 함 |
| 70–500ms / 약 100ms / 150ms | 블로그, how-to-build, use-case-map | 관절 제어 루프에는 안 맞음. 과제 수준 판단 주기와는 겹칠 수 있음 — **로봇 제어 주기 수치는 이번 조사에서 1차 출처를 안 찾았으므로 숫자로 쓰지 말 것** |
| Doom 데모 초당 10회 질의 | 블로그 | 공개된 것 중 제어 루프에 가장 가까운 사례. 단 게임 상태를 텍스트로 준 것 |
| `"Jev is not a calculator."` | jaggedness | 기하·거리·힘 계산은 코드 몫 |
| 클라우드 API, `429`·`529` 반환 | api, models | 네트워크·과부하에 따라 답이 안 올 수 있음. 온디바이스 형태는 못 찾음 |
| 질문 간 확률 합 보장 안 됨 | jaggedness | 여러 판단을 조합해 결정을 내릴 때 일관성은 코드가 따로 확인해야 함 |
| `"Keep control flow, deterministic rules, and side effects in code."` | how-to-build | 회사 자신이 모델을 흐름 제어자 자리에 두지 않음 |

**문서 구조상 가능성이 있는 자리** (전부 로봇 실험 수치는 없음)

1. **지시 해석·의도 라우팅** — 스마트홈 데모와 같은 구조. 자연어 명령 → (과제 종류, 대상, 동작) Choice
2. **스킬 선택** — skill_suggestion 쿡북과 같은 구조. 스킬 라이브러리에서 후보 순위 → 실행기에는 힌트로
3. **지시 선별** — 가드레일 쿡북 구조. 위험 요청 Noul → 임계값 이상이면 사람에게
4. **구조화된 상태에 대한 예/아니오 판정** — "과제가 끝났나", "이 물체가 목표 물체인가"를 지각 모듈이 만든 JSON 위에서 묻기

**문서가 스스로 배제한 자리:** 연속 제어, 수치 계산, 원시 센서 해석, 다음 행동을 스스로 고르는 것(`"It does not ... choose its own next action."`)

---

## 6. 로고 — 글에 첨부하려면

- 사람 요청: 웹의 Jev 마크를 글에 첨부
- **공식 파일을 확보하지 못했습니다.** 조사 환경에서 `typesafe.ai`와 `avatars.githubusercontent.com` 다운로드가 막혔습니다
- 후보 출처: GitHub 조직 아바타 `https://avatars.githubusercontent.com/u/171090879?s=200&v=4` — **TypeSafe 회사 마크인지 Jev 모델 마크인지 확인 안 됨** [U]
- 확인할 것
  1. TypeSafe에 브랜드·프레스 키트 페이지가 있는가 — 못 찾음
  2. 이 블로그는 무채색 사이트입니다(`WORKFLOW.md` §8은 다이어그램 규칙이지만 사이트 원칙이 같음). 컬러 로고를 넣을지, 단색으로 넣을지는 사람이 정합니다
  3. **로고를 다시 그리지 않습니다.** 공식 파일을 그대로 쓰고 출처를 캡션에 답니다
- 후보 URL (typesafe.ai 홈페이지에서 요약 도구가 뽑은 것 — 열어서 무엇인지 확인 필요) [U]
  - og:image `https://framerusercontent.com/images/RtIGTDwO43jR4ZDilesXiR5znc.jpg`
  - 워드마크로 추정 `https://framerusercontent.com/images/yfB1VlQapdkfInBgB2VX1cDehHs.png`
  - 프레스 키트·브랜드 가이드 페이지: 없음
- 사람이 직접 받아 대화에 올리기로 함 (2026-09-23)

---

## 7. 확인 못한 것 — 인용 금지

1. **[U] 아키텍처 세부** — 트랜스포머/디퓨전 여부, 파라미터 수. 공개 안 됨. `LLaDA` 포크로 추론 금지
2. **[U] 학습 데이터가 합성 데이터뿐인가** — 위키백과에만 있음. 블로그에서 `synthetic` NOT FOUND
3. **[U] 보정 지표** — ECE·Brier·신뢰도 다이어그램 어디에도 없음. "보정됐다"로 쓰지 말고 "보정을 목표로 학습했다"까지
4. **[U] 지연시간 측정 조건** — 70–500ms / 100ms / 150ms 세 값의 조건 없음
5. **[U] Workflow evals의 문항 수와 Jev 수치(67.8%, $0.0004, 0.4초)** — 요약 도구 경유. 사람이 직접 확인 전 인용 금지
6. **[U] `193.6x faster, 444.6x cheaper`** — 원문 문장을 못 받아냄
7. **[U] 가드레일 쿡북 결과 합 14 ≠ 메시지 15** — 원문 대조 필요
8. **[U] 로봇팔 데모** — MindStudio 글에만 있음. 제작자·원본 없음
9. **[U] 배포 형태** — 클라우드 API 외 온프레미스·온디바이스 제공 여부
10. **[U] 스마트홈 데모 소스** — `"will be available on GitHub at release"`, 아직 없음
11. **[U] 로봇 제어 주기 수치** — 이번 조사 범위 밖. 쓰려면 별도 1차 출처 필요
12. **[U] 로고 파일** — §6
13. **2차 기사(Forbes 2026-09-15, TechCrunch 2026-09-18, The Register 2026-09-16)** — 근거 아님. The Register 링크는 404
14. **[S] 초안에 쓴 인용 중 문자열 검색으로 받지 않은 것** (2026-09-29 초안 수정분) — 게이트 3 전 원문 대조 필요
    - 블로그 `"~5x more expensive than input tokens"` (LLM 출력 토큰 가격) — 첫 요약 추출에서만 나옴
    - AI primer `"Large-scale automation will be dominated by AI-to-AI and AI-to-software interactions, so the machine interface matters more than the chat interface."`
    - AI primer `"RLHF teaches a model to say things that people prefer"` / `confident-sounding hallucinations`
    - Noul 문서 요청·응답 JSON 예시 (`input_tokens: 360`, `output_tokens: 39`)
15. **⑥ 검증 결과 (2026-09-30)** — 초안 인용을 문자열 검색으로 재확인
    - 확인: `"~5x more expensive than input tokens."`, `"FREE (too cheap to meter)"`, `"3 to 329 seconds"`, `"70ms-500ms"`, `"Our number is not empirical."`, 첫 System One Model, RLHF 문장·`confident-sounding hallucinations`, `"The model does not generate text. It returns decisions and probabilities."`, 0.8 보정 문장, 입력 형식 문장, Choice 255개 / Score 최대 10단계, 음성 뱅킹 0.6·0.85, 스마트홈 4개 질문, 가드레일 Noul·Score, 스킬 추천 488건 16.8%→7.3%
    - **고친 것:** `"Generates all outputs in parallel"`은 두 문장을 합친 오인용 → 원문 `"Jev outputs all probabilities in parallel instead of autoregressively generating by token."`
    - **고친 것:** P(A) + P(not A) = 1 예시는 원문과 다름(Noul과 Choice 형식 간 비교) → 원문 `"structural invariants ... simply aren't guaranteed by the model"` 인용으로 교체
    - **고친 것:** "설계 가이드의 첫 원칙" → 요약 목록의 첫 항목
    - **고친 것:** 스킬 추천 지표 정의 → `"the share where the first skill_view call was not the covering skill"`
    - 스킬 카탈로그 182개는 첫 조사 때만 확인 [S]
