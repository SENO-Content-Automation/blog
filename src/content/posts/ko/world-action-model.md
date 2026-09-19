---
title: "World-Action Model — 비디오 모델이 로봇 정책이 되었다"
description: "정책이 행동만 내놓지 않습니다. 다음에 무엇이 보일지도 같이 내놓습니다."
pubDate: 2026-09-19
category: robot-ai
tags: ["paper-review", "vla"]
draft: true
---

<!-- ① 훅  ★ 자동화 금지 (WRITING.md §6) — 아래는 초안입니다. 본인 문장으로 고쳐 쓰세요. -->

2026년 9월 4일과 9월 7일, 사흘 간격으로 논문 두 편이 올라왔습니다. 한쪽은 중국 로봇 회사, 다른 쪽은 대학 연합입니다. 서로 관계가 없는데 구조가 같았습니다. **비디오 생성 모델을 가져다 로봇 정책으로 만든 것**입니다.

## 무엇이 바뀌었나

지금까지 로봇 정책의 표준 레시피는 VLA였습니다. 사전학습된 비전-언어 모델을 가져와 행동을 뱉는 헤드를 붙입니다. 2편에서 본 Diffusion Policy도 VQ-BeT도 ACT도, 출발점은 다르지만 **행동을 만드는 전용 출구를 따로 두었다**는 점은 같습니다.

WAM은 출발점을 바꿉니다. NVIDIA가 [이 범주에 이름을 붙이면서](https://developer.nvidia.com/blog/pretrained-to-imagine-fine-tuned-to-act-the-rise-of-world-action-models/) 쓴 정의가 정확합니다.

> "a policy that starts from a pretrained world-model or video backbone and adapts it to represent or predict how the scene changes over time and emit corresponding actions."

전용 출구가 없어졌다는 게 핵심입니다. [Cosmos Policy](https://arxiv.org/abs/2601.16163)는 행동을 비디오 모델의 잠재 확산 과정 안에서 **잠재 프레임으로 인코딩**합니다. 행동이 영상의 한 프레임과 같은 자리에 앉는다는 뜻입니다. 같은 방식으로 미래 상태 이미지와 가치도 프레임으로 만들어내고, 그걸로 실행 전에 경로를 골라봅니다.

[DreamZero](https://arxiv.org/abs/2602.15922)는 이 선택을 한 문장으로 설명합니다. 영상을 세계가 어떻게 변해가는지에 대한 표현으로 쓰는 것이고, 행동은 그 변화의 일부라는 겁니다. 비디오와 행동을 함께 모델링한 결과 처음 보는 과제와 환경에 대한 일반화가 기존 VLA 대비 2배를 넘었다고 보고합니다.

## 왜 비디오였나

비전-언어 모델이 배운 것은 이미지와 글자의 짝입니다. 비디오 모델이 배운 것은 **장면이 시간에 따라 어떻게 변하는가**입니다. 로봇이 하는 일은 후자에 가깝습니다. 물건을 밀면 물건이 움직이고, 팔이 지나간 자리에 그림자가 집니다. 이걸 따로 가르치지 않아도 비디오 백본은 이미 들고 있습니다.

데이터 쪽 이유가 하나 더 있고, 이게 더 셉니다. **로봇 시연은 비싸고 영상은 쌉니다.** 행동 라벨이 붙은 로봇 시연을 모으려면 사람이 로봇을 붙들고 앉아 있어야 합니다. 반면 사람이 1인칭으로 찍은 영상은 이미 세상에 넘칩니다.

DreamZero가 이 둘을 잇습니다. **다른 로봇이나 사람의 영상만 가지고도** 처음 보는 과제 성능을 42% 상대 개선했습니다. 새로운 로봇으로 옮길 때도 30분치 play 데이터면 붙었고, 그러면서 제로샷 일반화를 유지했다고 적혀 있습니다. [OpenWAM](https://arxiv.org/abs/2609.07398)은 아예 1인칭 사람 영상과 로봇 영상 약 6,400시간으로 사전학습했고, 인프라와 평가 프로토콜, 가중치, 데이터 레시피까지 공개했습니다.

## 숫자가 말하는 것

데이터를 늘리면 얼마나 좋아지는가. [GE-Act 2.0](https://arxiv.org/abs/2609.05588)이 이 질문에 답을 냈습니다. 공동학습 데이터를 **300시간에서 30,000시간으로 100배** 늘렸습니다.

| 하드웨어 | 300시간 | 30,000시간 |
|---|---|---|
| G1-OP | 17.1% | **44.1%** |
| G2-90D | 13.4% | **31.1%** |

과제별 파인튜닝 없이 20개 스킬 그룹, 100개 조작 과제를 돌린 결과입니다. 100배를 먹여서 2.6배가 됐고, **여전히 절반 넘게 실패합니다.**

평가 폭도 넓어졌습니다. [OpenWAM](https://arxiv.org/abs/2609.07398)은 시뮬레이터 여덟 개에 더해 외팔, 양팔, 손가락 달린 손까지 실물 로봇 세 종류에서 돌렸습니다. 한 벤치마크에서 잘 나온 수치가 아니라는 뜻입니다.

<svg viewBox="0 0 720 292" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="VLA는 행동만 내놓고, WAM은 행동과 함께 예측 프레임을 내놓는다">
  <title>VLA와 WAM의 출력 비교</title>
  <defs>
    <marker id="wm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>

  <text x="14" y="28" fill="currentColor" font-size="11" opacity="0.65">VLA — 비전·언어 모델에서 출발</text>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14"  y="42" width="150" height="56" rx="6"/>
    <rect x="204" y="42" width="180" height="56" rx="6"/>
    <rect x="440" y="42" width="150" height="56" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="28"  y="70">관측 + 지시</text>
    <text x="218" y="70">VLM + 행동 헤드</text>
    <text x="454" y="76">행동</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="28"  y="88">이미지 · 언어</text>
    <text x="218" y="88">언어-이미지 짝으로 사전학습</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M164 70 L200 70" marker-end="url(#wm)"/>
    <path d="M384 70 L436 70" marker-end="url(#wm)"/>
  </g>

  <text x="14" y="136" fill="currentColor" font-size="11" opacity="0.65">WAM — 비디오 모델에서 출발</text>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14"  y="148" width="150" height="76" rx="6"/>
    <rect x="204" y="148" width="180" height="76" rx="6"/>
    <rect x="440" y="144" width="150" height="38" rx="6"/>
    <rect x="440" y="190" width="150" height="38" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="28"  y="182">관측 + 지시</text>
    <text x="218" y="182">비디오 백본</text>
    <text x="454" y="168">행동</text>
    <text x="454" y="214">예측 프레임</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="28"  y="200">이미지 · 언어</text>
    <text x="218" y="200">장면이 어떻게 변하는지로 사전학습</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M164 186 L200 186" marker-end="url(#wm)"/>
    <path d="M384 174 L436 165" marker-end="url(#wm)"/>
    <path d="M384 198 L436 207" marker-end="url(#wm)"/>
  </g>

  <line x1="14" y1="252" x2="706" y2="252" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="272" fill="currentColor" font-size="11.5" opacity="0.7">WAM은 행동과 함께 예측 프레임을 내놓는다. 이전 정책에는 없던 산출물이다.</text>
</svg>

속도도 같이 봐야 합니다. DreamZero는 14B 오토리그레시브 비디오 디퓨전 모델로 **7Hz 폐루프 제어**를 합니다. 한 주기가 143ms입니다. 시뮬레이터 숫자는 더 좋아서 Cosmos Policy는 LIBERO 98.5%, RoboCasa 67.1%인데, 2편에서 봤듯 시뮬레이터 성공률과 실물 거동은 다른 이야기입니다.

## 마무리

지금까지 로봇 정책의 출발점이 비전-언어 모델에서 비디오 모델로 옮겨간 것, 그 이유가 물리 동역학과 데이터 값이라는 것, 그리고 100배 데이터가 만든 폭이 어디까지인지 알아봤습니다.

안전 쪽에서 보면 **산출물이 하나 늘었다**는 게 이 전환의 요점입니다. Diffusion Policy도 VQ-BeT도 ACT도 행동만 내놨고, 그래서 2편의 감시 지표들은 전부 명령값 시계열을 쥐어짜는 것이었습니다. WAM은 예측된 미래 관측을 함께 내놓습니다. t+k의 예측 프레임과 그때 실제로 들어온 관측을 비교하면 잔차가 나오고, 그건 지금까지 없던 모양의 신호입니다. 다만 그 예측을 만든 가중치가 행동을 만든 가중치와 같습니다. 감시자와 감시 대상이 독립이 아닙니다.

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
