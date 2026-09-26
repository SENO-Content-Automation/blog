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

쓰는 쪽은 상태와 질문을 보냅니다. 상태는 텍스트나 JSON이고, [이미지·오디오·비디오는 받지 않습니다](https://docs.typesafe.ai/concepts/system-one). 질문은 세 형식 중 하나이고, 답도 그 형식으로만 돌아옵니다([API 문서](https://docs.typesafe.ai/api)).

| 형식 | 묻는 것 | 돌아오는 것 |
|---|---|---|
| Noul | 예/아니오 | "예"일 확률 0~1 |
| Choice | 정해 둔 선택지 중 하나 (최대 255개) | 고른 값, 선택지별 확률, confidence |
| Score | 2~10단계로 서술한 등급 | 등급, 등급별 확률, confidence |

답은 한 번에 나옵니다. 소개 글의 표현으로는 `"Generates all outputs in parallel instead of autoregressively generating by token."` 응답 시간은 같은 글에서 70–500ms라고 밝혔습니다.

문서가 권하는 쓰는 법은 한 줄입니다. [`"Keep control flow, deterministic rules, and side effects in code."`](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) 분기와 실행은 코드가 맡고, Jev는 좁은 판단 하나를 돌려줍니다.

이런 모델이 지금 나온 이유도 소개 글에 있습니다. 소프트웨어가 LLM을 부르면 돌아오는 건 문자열이고, 그 문자열은 무엇이든 될 수 있습니다.

> "Strings are flexible and can be anything: chat responses, code, hallucinations, refusals, or even type-safe structured values."

Jev는 이 문자열을 없앴습니다. 코드는 파싱하지 않고 값을 바로 받습니다.

## "맞다"에는 세 층이 있다

C로 치면 Jev의 Choice는 이런 함수입니다.

```c
typedef enum { ACT_STOP, ACT_SLOW, ACT_GO } action_t;

action_t decide(const state_t *s);  /* 셋 중 하나를 돌려준다 */
```

이 함수가 `7`을 돌려주는 일은 타입 규칙으로 막습니다. 멈춰야 할 때 `ACT_GO`를 돌려주는 일은 타입으로 못 막습니다. 그건 시험으로 잡습니다.

확률까지 붙으면 층이 하나 더 생깁니다. TypeSafe의 [AI primer](https://docs.typesafe.ai/introduction/machine-learning-primer)는 보정(calibration)을 이렇게 정의합니다. `"Outcomes assigned a probability of 0.8 should occur about 80% of the time."`

| 층 | 묻는 것 | Jev에서 |
|---|---|---|
| 형식 | 답이 선택지 안에 있나 | 구조적으로 보장 |
| 정답 | 고른 선택지가 맞나 | 사람이 매긴 정답 기준의 공개 수치 없음 |
| 보정 | 0.8이라고 한 것이 열에 여덟 맞나 | 보정 지표 공개 없음 |

## "환각 0%"는 첫 층만 증명한다

0% 문장을 끝까지 옮기면 이렇습니다.

> "Our number is not empirical. Schema matching is guaranteed, thus we can confidently add 0% into the plots."

[소개 글](https://typesafe.ai/blog/introducing-system-one-models-and-jev)이 말하는 환각은 스키마 밖으로 나간 문자열입니다. 선택지 안에서 틀린 것을 고르면 이 정의로는 환각이 아닙니다. 0%는 **형식 층에 대한 정의**이고 측정값이 아닙니다.

나머지 두 층은 회사 문서가 먼저 비워 둡니다. [Jev 1.13 한계 문서](https://docs.typesafe.ai/model-jaggedness/jev-1.13)는 `"Jev is not a calculator."`라고 적습니다. 여러 단계를 거치는 질문에서 정확도가 떨어진다고도 적습니다.

같은 문서는 관련된 질문 사이의 수학적 관계도 보장하지 않는다고 씁니다. 예로 든 것이 P(A) + P(not A) = 1입니다. "A인가"와 "A가 아닌가"를 따로 물으면 두 확률의 합이 1이 아닐 수 있습니다.

Choice와 Score에 붙는 confidence도 보정의 증거가 아닙니다. [confidence 문서](https://docs.typesafe.ai/confidence)의 식은 선택지 셋일 때 `(3 × 최대 확률 − 1) / 2`입니다. 최대 확률이 0.8이면 confidence는 0.7입니다. 분포가 한쪽에 몰린 정도를 0~1로 옮긴 값이고, 그 0.8이 실제로 열에 여덟 맞는지와는 별개입니다.

같은 문서도 임계값을 정해 주지 않습니다. `"The correct threshold values depend on your domain and the performance of the model for your use case."` 보정 지표(ECE, 신뢰도 다이어그램)는 소개 글, 문서, 평가 사이트 어디에도 없었습니다. 확인되는 것은 보정을 목표로 학습했다는 것까지입니다. 소개 글은 이 학습법을 RLCD(Reinforcement Learning for Calibrated Decisions)라고 부릅니다.

## 무엇이 증거로 안 되나

TypeSafe는 [Workflow evals](https://evals.typesafe.ai/)라는 비교 페이지를 냈습니다. 보안 사고, 에이전트 추적, 청구서 처리, 고객 응대의 네 워크플로입니다. 정확도의 기준은 이렇게 만듭니다.

> "the reference labels are generated via an average of the responses of GPT-6 Astra and Claude Fable 5.1, both at high thinking, answering every question in the harness."

기준은 사람이 매긴 정답이 아닙니다. 다른 모델 둘의 평균 답입니다. 워크플로마다 문항이 몇 개인지도 페이지에 없습니다. 이 페이지가 보여주는 것은 두 모델과 얼마나 같은 답을 냈는가입니다.

속도도 문서마다 다릅니다. 소개 글은 70–500ms, [설계 가이드](https://docs.typesafe.ai/concepts/how-to-build-with-system-one)는 `"about 100 ms"`, [사용 사례 페이지](https://docs.typesafe.ai/concepts/use-case-map)는 150ms입니다. 세 값 모두 측정 조건이 적혀 있지 않습니다.

## 로봇 쪽 판단 기준

TypeSafe 자료에는 로봇이 나오지 않습니다. 제어 루프에 가장 가까운 공개 사례는 Doom 데모입니다. 게임 상태를 텍스트로 넘겼고, 개발자는 [소개 글](https://typesafe.ai/blog/introducing-system-one-models-and-jev)에서 초당 10회 질의의 비용을 걱정했다고 적었습니다.

문서 구조와 맞는 자리는 지각 모듈이 만든 JSON 위의 좁은 판단입니다. 자연어 명령을 정해 둔 스킬 목록 중 하나로 고르는 일이 그렇습니다. [스킬 추천 쿡북](https://docs.typesafe.ai/cookbooks/skill_suggestion)은 스킬 182개, 요청 488건에서 에이전트가 잘못 고른 비율이 16.8%에서 7.3%로 줄었다고 보고합니다. 소프트웨어 에이전트의 스킬이고, 로봇 스킬에서 나온 수치는 없습니다.

맞지 않는 자리는 문서가 먼저 뺐습니다. 원시 센서 입력은 받지 않고, 계산은 코드로 하라고 하고, 다음 행동을 모델이 고르게 두지 않습니다(`"It does not generate code or choose its own next action."`).

기본은 이렇습니다. Jev가 보장하는 것은 답이 선택지 밖으로 나가지 않는다는 것까지입니다. 고른 값이 맞는지, 질문끼리 앞뒤가 맞는지는 이 보장 밖에 있고, 문서의 구조에서 그 확인은 코드 쪽에 있습니다.

## 마무리

Jev의 "환각 0%"는 스키마 일치에서 나온 정의상의 값이고, 회사도 측정값이 아니라고 적었습니다. 이 글은 형식·정답·보정의 세 층 중 공개 자료가 채운 것이 형식 하나라는 것을 문서 문장으로 따라갔습니다. 평가 페이지의 정확도는 다른 모델 둘의 답을 기준으로 삼았고, 보정 지표와 로봇에서 나온 수치는 아직 공개된 것이 없습니다.
