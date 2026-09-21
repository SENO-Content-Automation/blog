---
title: "World-Action Model — 비디오 모델이 로봇 정책이 되었다"
description: "정책이 행동만 내놓지 않습니다. 다음에 무엇이 보일지도 같이 내놓습니다."
pubDate: 2026-09-21
category: robot-ai
tags: ["paper-review", "vla"]
draft: true
---

<!-- ① 훅  ★ 자동화 금지 (WRITING.md §6) — 아래는 초안입니다. 본인 문장으로 고쳐 쓰세요. -->

2026년 9월 4일과 9월 7일, 사흘 간격으로 논문 두 편이 올라왔습니다. 한쪽은 중국 로봇 회사, 다른 쪽은 대학 연합입니다. 서로 관계가 없는데 구조가 같았습니다. **비디오 생성 모델을 가져다 로봇 정책으로 만든 것**입니다.

## 출발점이 바뀌었다

지금까지 로봇 정책의 표준 레시피는 VLA였습니다. 이미 학습된 비전-언어 모델을 가져와 행동을 내보내는 전용 출구를 붙입니다. 2편에서 본 Diffusion Policy도 VQ-BeT도 ACT도, 출발점은 달라도 **행동 전용 출구를 따로 두었다**는 점은 같습니다.

WAM은 출발점을 비디오 생성 모델로 바꿉니다. NVIDIA가 [이 범주에 이름을 붙이면서](https://developer.nvidia.com/blog/pretrained-to-imagine-fine-tuned-to-act-the-rise-of-world-action-models/) 쓴 정의가 정확합니다.

> "a policy that starts from a pretrained world-model or video backbone and adapts it to represent or predict how the scene changes over time and emit corresponding actions."

비전-언어 모델이 배운 것은 이미지와 글자의 짝입니다. 비디오 모델이 배운 것은 **장면이 시간에 따라 어떻게 변하는가**입니다. 물건을 밀면 물건이 움직이고, 팔이 지나간 자리에 그림자가 집니다. 로봇이 하는 일은 후자에 가깝고, 비디오 백본은 그걸 이미 들고 있습니다.

그래서 출력이 하나 늘었습니다.

<svg viewBox="0 0 720 300" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="VLA는 행동만 내놓고, WAM은 행동과 함께 예측된 미래 장면을 내놓는다">
  <title>VLA와 WAM이 내놓는 것</title>
  <defs>
    <marker id="w2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>

  <text x="14" y="26" fill="currentColor" font-size="11" opacity="0.65">VLA — 비전·언어 모델에서 출발</text>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14"  y="40" width="150" height="56" rx="6"/>
    <rect x="212" y="40" width="190" height="56" rx="6"/>
    <rect x="450" y="40" width="150" height="56" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="28"  y="66">관측 + 지시</text>
    <text x="226" y="66">비전·언어 모델</text>
    <text x="464" y="74">행동</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="28"  y="84">이미지 · 언어</text>
    <text x="226" y="84">+ 행동을 내는 전용 출구</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M164 68 L208 68" marker-end="url(#w2)"/>
    <path d="M402 68 L446 68" marker-end="url(#w2)"/>
  </g>

  <text x="14" y="146" fill="currentColor" font-size="11" opacity="0.65">WAM — 비디오 생성 모델에서 출발</text>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14"  y="160" width="150" height="76" rx="6"/>
    <rect x="212" y="160" width="190" height="76" rx="6"/>
    <rect x="450" y="156" width="150" height="38" rx="6"/>
    <rect x="450" y="202" width="150" height="38" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="28"  y="192">관측 + 지시</text>
    <text x="226" y="192">비디오 생성 모델</text>
    <text x="464" y="180">행동</text>
    <text x="464" y="226">예측된 다음 장면</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="28"  y="210">이미지 · 언어</text>
    <text x="226" y="210">장면이 어떻게 변하는지로</text>
    <text x="226" y="224">사전학습</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M164 198 L208 198" marker-end="url(#w2)"/>
    <path d="M402 186 L446 177" marker-end="url(#w2)"/>
    <path d="M402 210 L446 219" marker-end="url(#w2)"/>
  </g>

  <line x1="14" y1="262" x2="706" y2="262" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="282" fill="currentColor" font-size="11.5" opacity="0.7">출력이 하나 늘었다. 이전 정책들은 다음 장면을 내놓은 적이 없다.</text>
</svg>

## 같은 문제, 네 가지 답

출발점을 비디오 모델로 잡으면 곧바로 질문이 하나 생깁니다. **행동을 어디에 둘 것인가.** 영상을 만들도록 학습된 모델에 관절값을 어떻게 끼워 넣느냐는 문제고, 네 팀이 다르게 답했습니다.

| 팀 | 행동을 어디에 두었나 |
|---|---|
| [Cosmos Policy](https://arxiv.org/abs/2601.16163) | 영상 시퀀스 **안에** — 행동을 프레임 한 칸처럼 취급합니다. 모델 구조를 안 고칩니다 |
| [OpenWAM](https://openwam-official.github.io/) | **행동 전용 탑을 따로** 세우고 비디오 탑과 묶습니다 |
| [GE-Act 2.0](https://arxiv.org/abs/2609.05588) | 부품 **셋으로 분리** — 장면을 압축하고, 미래를 그리고, 행동을 되뽑습니다 |
| [DreamZero](https://arxiv.org/abs/2602.15922) | **한 모델에서 끝까지** — 미래 영상을 예측하고 거기서 행동을 뽑습니다 |

OpenWAM은 여기서 한 걸음 더 나갑니다. **무엇을 정해야 하는지를 여섯 가지로 정리하고, 각각을 통제 실험으로 비교했습니다.** 아키텍처, 백본, 시각 표현, 두 흐름의 상호작용, 데이터 배합, 그리고 추론 전략입니다. 결론 중 하나가 행동 전용 용량이 필요하다는 것이고, 그래서 두 탑 구조를 골랐습니다.

## 데이터가 이긴 이유

기술보다 이쪽이 결정적입니다. **로봇 시연은 비싸고 영상은 쌉니다.**

행동 라벨이 붙은 로봇 시연을 모으려면 사람이 로봇을 붙들고 앉아 있어야 합니다. 반면 사람이 1인칭으로 찍은 영상은 이미 세상에 넘칩니다. 문제는 그 영상에 **"그때 관절이 몇 도였는지"가 없다**는 것이었습니다.

DreamZero의 해법이 간단합니다. **채점 기준을 데이터 출처마다 다르게 둡니다.**

```
로봇 시연  →  영상 예측 + 행동 예측  둘 다 채점
사람 영상  →  영상 예측만            행동은 채점하지 않음
```

정답이 없는 항목은 채점에서 빼면 됩니다. 그래서 행동 라벨 없는 영상도 **세상이 어떻게 변하는지를 배우는 데는 그대로 쓰입니다.** DreamZero는 이 방식으로 다른 로봇과 사람의 영상만 가지고 처음 보는 과제 성능을 42% 상대 개선했고, 새 로봇으로 옮길 때는 30분치 데이터로 붙였습니다.

[OpenWAM](https://arxiv.org/abs/2609.07398)은 아예 1인칭 사람 영상과 로봇 영상 약 6,400시간으로 사전학습했습니다.

## 지금 어디까지 왔나

데이터를 늘리면 얼마나 좋아지는가. GE-Act 2.0이 공동학습 데이터를 **300시간에서 30,000시간으로 100배** 늘려 답을 냈습니다.

| 하드웨어 | 300시간 | 30,000시간 |
|---|---|---|
| G1-OP | 17.1% | **44.1%** |
| G2-90D | 13.4% | **31.1%** |

과제별 파인튜닝 없이 20개 스킬 그룹, 100개 조작 과제를 돌린 결과입니다. **100배를 먹여 2.6배가 됐고, 여전히 절반 넘게 실패합니다.**

속도도 봐야 합니다. DreamZero는 140억 파라미터 모델로 **7Hz 폐루프 제어**를 합니다. 한 주기가 143ms인데, 그냥 되는 게 아니라 5.7초를 150ms로 줄인 **38배 최적화의 결과**입니다.

시작해보려면 [OpenWAM 저장소](https://github.com/OpenWAM-Official/OpenWAM)가 Apache-2.0으로 열려 있습니다. 사전학습 체크포인트와 설정, 평가 환경까지 들어 있고, 처음 돌려볼 조합이 기본값으로 박혀 있습니다.

## 마무리

지금까지 로봇 정책의 출발점이 비전-언어 모델에서 비디오 모델로 옮겨간 것, 그 이유가 행동 라벨 없는 영상을 쓸 수 있다는 데 있다는 것, 그리고 100배 데이터가 만든 폭이 어디까지인지 알아봤습니다.

안전 쪽에서 보면 **볼 수 있는 것이 하나 늘었다**는 게 이 전환의 요점입니다. Diffusion Policy도 VQ-BeT도 ACT도 행동만 내놨고, 그래서 2편의 감시 지표들은 전부 명령값 시계열을 쥐어짜는 것이었습니다. WAM은 예측된 다음 장면을 함께 내놓습니다. 그 예측과 잠시 뒤 실제로 들어온 관측을 비교하면 차이가 나오고, 그건 지금까지 없던 모양의 신호입니다. 다만 그 예측을 만든 가중치가 행동을 만든 가중치와 같습니다. 감시자와 감시 대상이 독립이 아닙니다.

다음에 더 좋은 글로 찾아뵙겠습니다. 감사합니다.


<!-- ─────────────────────────────────────────
     발행 전 체크 (docs/WRITING.md §7)
     □ 첫 두 줄이 정의문이 아닌가
     □ 숫자·버전·조항이 최소 하나
     □ 헤맨 이야기나 못 확인한 것이 있다면 적었는가
     □ 사실이 나오는 문장마다 1차 출처 링크가 붙어 있는가
     □ 불릿이 절반을 넘지 않는가
     □ 다음 글 예고가 없는가
     □ grep -rnP '\*\*[^*]*[)\]\.,:;!?]\*\*[가-힣]' src/content/posts/
     ───────────────────────────────────────── -->
