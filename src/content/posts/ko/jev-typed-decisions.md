---
title: "Jev — 틀린 형식을 낼 수 없게 만든 판단 모델"
description: "\"환각 0%\"라는 숫자가 무엇을 증명하고 무엇을 증명하지 않는지 따라가 봅니다."
pubDate: 2026-09-26
category: verification
tags: ["product-analysis"]
draft: true
---

<!-- ① 훅  ★ 사람 자리 (WRITING.md §6) — 요청에 따라 Claude가 대강 쓴 초안입니다. 본인 문장으로 고쳐 쓰세요. -->

그래프 한쪽에 "환각률 0%"가 찍혀 있었습니다. 9월 15일에 나온 새 모델 Jev의 소개 글입니다. 그런데 같은 글 몇 문단 아래에 이 문장이 있습니다.

> "Our number is not empirical."

[TypeSafe 공식 블로그](https://typesafe.ai/blog/introducing-system-one-models-and-jev)의 문장입니다. 측정하지 않은 0%입니다. 이 글은 그 0%가 무엇을 증명하는지 따라가 봅니다.

## Jev는 무엇을 돌려주나

![TypeSafe AI 로고](/images/posts/jev/typesafe-ai.png)

*TypeSafe AI 로고. 출처 [typesafe.ai](https://typesafe.ai/)*

Jev는 TypeSafe가 2026년 9월 15일 공개한 모델입니다. 회사는 이것을 첫 "System One model"이라고 부릅니다. 이 모델은 글을 쓰지 않습니다. [소개 글](https://typesafe.ai/blog/introducing-system-one-models-and-jev)은 이렇게 적습니다.

> "While Jev gives up string generation, it's optimized for structured outputs and can't hallucinate."

쓰는 쪽은 상태와 질문을 보냅니다. 상태는 텍스트나 JSON이고, [이미지·오디오·비디오는 받지 않습니다](https://docs.typesafe.ai/concepts/system-one). 질문은 세 형식 중 하나이고, 답도 그 형식으로만 돌아옵니다([API 문서](https://docs.typesafe.ai/api)). 예/아니오를 묻는 Noul, 정해 둔 선택지(최대 255개) 중 하나를 고르는 Choice, 2~10단계 등급을 매기는 Score입니다.

### 실제로 주고받는 것

[Noul 문서](https://docs.typesafe.ai/primitives/noul)의 예시를 그대로 옮깁니다. 고객 메시지 한 줄을 상태로 넣고, 예/아니오 질문 두 개를 이름을 붙여 보냅니다.

```json
{
  "state": "I have asked three times now. Can I please just talk to a real person?",
  "model": "jev-latest",
  "questions": {
    "is_human_escalation": {
      "type": "noul",
      "instructions": "Is the customer asking for a human agent?"
    },
    "is_repeat_contact": {
      "type": "noul",
      "instructions": "Has the customer contacted support about this before?",
      "criteria": {
        "true": "Mentions a prior attempt, ticket, or that they have asked before",
        "false": "No sign of any previous contact"
      }
    }
  }
}
```

돌아오는 것은 질문 이름마다 숫자 하나입니다.

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "is_human_escalation": { "type": "noul", "noul": 0.99 },
    "is_repeat_contact":   { "type": "noul", "noul": 0.93 }
  },
  "usage": { "input_tokens": 360, "output_tokens": 39 }
}
```

응답에는 문장이 없습니다. 코드는 `answers.is_human_escalation.noul`을 읽어 바로 분기합니다. 분기 기준을 정하는 것도 코드입니다. [설계 가이드](https://docs.typesafe.ai/concepts/how-to-build-with-system-one)의 첫 원칙이 `"Keep control flow, deterministic rules, and side effects in code."`입니다.

### 어디에 쓰나

TypeSafe 문서에 나온 사례를 모으면 모양이 같습니다. Jev가 좁은 판단 하나를 돌려주고, 실행 여부와 임계값은 코드가 정합니다.

| 사례 | Jev에 묻는 것 | 코드가 하는 것 |
|---|---|---|
| [음성 뱅킹](https://docs.typesafe.ai/patterns/confidence-routing) | 잔액 조회인가 송금인가 (Choice) | confidence 0.6 미만이면 상담원에게, 송금은 0.85 초과일 때만 자동 승인 |
| [스마트홈](https://docs.typesafe.ai/demos/smart-home) | "불 다 꺼줘"의 범위·기기·동작 (Choice 여러 개) | 답을 모아 기기 명령으로 바꾸고, 대화형 요청은 LLM으로 넘김 |
| [LLM 가드레일](https://docs.typesafe.ai/cookbooks/llm_guardrails) | 탈옥 시도인가, 위험 요청인가 (Noul), 심각도 (Score) | 정책별 임계값으로 통과·검토·차단 |
| [에이전트 스킬 추천](https://docs.typesafe.ai/cookbooks/skill_suggestion) | 스킬 182개 중 무엇이 맞나 (Choice) | 1위 스킬 이름을 에이전트 프롬프트에 힌트 한 줄로 넣음 |

음성 뱅킹의 0.6과 0.85는 문서의 예시값입니다. 성능 수치가 붙은 사례는 스킬 추천 하나이고, 요청 488건에서 에이전트가 스킬을 잘못 고른 비율이 16.8%에서 7.3%로 줄었다고 보고합니다. 나머지 셋은 시연이고 정확도 수치가 없습니다.

## 기존 LLM과 무엇이 다른가

TypeSafe가 공개한 차이는 출력, 생성 방식, 후학습 세 가지입니다. 파라미터 수나 내부 구조는 공개하지 않았습니다.

| | 일반 LLM | Jev |
|---|---|---|
| 출력 | 문자열 | 정해 둔 형식의 값과 확률 |
| 생성 | 토큰을 하나씩 순서대로 | `"Generates all outputs in parallel"` |
| 후학습 | RLHF | RLCD (Reinforcement Learning for Calibrated Decisions) |
| 출력 토큰 가격 | `"~5x more expensive than input tokens"` | `"FREE (too cheap to meter)"` |

생성과 가격 행은 [소개 글](https://typesafe.ai/blog/introducing-system-one-models-and-jev)의 표현입니다. 같은 글은 응답 시간을 70–500ms, 비교한 프런티어 모델을 3~329초로 적었습니다.

후학습의 차이는 [AI primer](https://docs.typesafe.ai/introduction/machine-learning-primer)가 설명합니다. `"RLHF teaches a model to say things that people prefer"`이고, 그 보상이 그럴듯한 환각을 키울 수 있다고 적습니다. RLCD에 대해서는 `"The model does not generate text. It returns decisions and probabilities."`라고 씁니다.


## "맞다"에는 세 층이 있다

C로 치면 Choice는 `enum`을 돌려주는 함수입니다. 이 함수가 `7`을 돌려주는 일은 타입 규칙으로 막습니다. 멈춰야 할 때 `ACT_GO`를 돌려주는 일은 타입으로 못 막습니다. 확률이 붙으면 그 확률을 믿어도 되는가가 한 층 더 생깁니다.

<svg viewBox="0 0 720 262" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="형식, 정답, 보정의 세 층 중 환각 0퍼센트가 가리키는 것은 맨 위 형식 층 하나이고, 정답과 보정 층은 공개 근거가 없다">
  <title>맞다의 세 층 — 환각 0%가 덮는 범위</title>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14" y="24" width="440" height="52" rx="6"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="5 5" opacity="0.6">
    <rect x="14" y="92" width="440" height="52" rx="6"/>
    <rect x="14" y="160" width="440" height="52" rx="6"/>
  </g>
  <text x="30" y="48" fill="currentColor" font-size="13">형식 — 답이 선택지 안에 있나</text>
  <text x="30" y="66" fill="currentColor" font-size="10.5" opacity="0.7">스키마 일치로 구조적으로 보장</text>
  <text x="30" y="116" fill="currentColor" font-size="13" opacity="0.75">정답 — 고른 선택지가 맞나</text>
  <text x="30" y="134" fill="currentColor" font-size="10.5" opacity="0.6">사람이 매긴 정답 기준의 공개 수치 없음</text>
  <text x="30" y="184" fill="currentColor" font-size="13" opacity="0.75">보정 — 0.8이라 하면 열에 여덟 맞나</text>
  <text x="30" y="202" fill="currentColor" font-size="10.5" opacity="0.6">보정 지표 공개 없음</text>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <path d="M470 24 L482 24 L482 76 L470 76"/>
    <path d="M482 50 L498 50"/>
  </g>
  <text x="506" y="46" fill="currentColor" font-size="13">"환각 0%"가</text>
  <text x="506" y="64" fill="currentColor" font-size="13">가리키는 범위</text>
  <line x1="14" y1="228" x2="706" y2="228" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="248" fill="currentColor" font-size="11.5" opacity="0.7">0%가 덮는 것은 맨 위 층 하나다. 점선 두 층은 공개된 근거가 없다.</text>
</svg>

보정의 정의는 [AI primer](https://docs.typesafe.ai/introduction/machine-learning-primer)의 문장을 따랐습니다. `"Outcomes assigned a probability of 0.8 should occur about 80% of the time."`

## "환각 0%"는 첫 층만 증명한다

0% 문장을 끝까지 옮기면 이렇습니다.

> "Our number is not empirical. Schema matching is guaranteed, thus we can confidently add 0% into the plots."

[소개 글](https://typesafe.ai/blog/introducing-system-one-models-and-jev)이 말하는 환각은 스키마 밖으로 나간 문자열입니다. 선택지 안에서 틀린 것을 고르면 이 정의로는 환각이 아닙니다. 0%는 **형식 층에 대한 정의**이고 측정값이 아닙니다.

나머지 두 층은 회사 문서가 먼저 비워 둡니다. [Jev 1.13 한계 문서](https://docs.typesafe.ai/model-jaggedness/jev-1.13)는 `"Jev is not a calculator."`라고 적고, 여러 단계를 거치는 질문에서 정확도가 떨어진다고 씁니다. 관련된 질문 사이의 수학적 관계도 보장하지 않는다고 하고, 예로 P(A) + P(not A) = 1을 듭니다.

Choice와 Score에 붙는 confidence도 보정의 증거가 아닙니다. [confidence 문서](https://docs.typesafe.ai/confidence)의 식은 선택지 셋일 때 `(3 × 최대 확률 − 1) / 2`입니다. 최대 확률이 0.8이면 confidence는 0.7입니다. 분포가 한쪽에 몰린 정도를 옮긴 값이고, 그 0.8이 실제로 열에 여덟 맞는지와는 별개입니다.

보정 지표(ECE, 신뢰도 다이어그램)는 소개 글과 문서 어디에도 없었습니다. 확인되는 것은 보정을 목표로 학습했다는 것까지입니다.
