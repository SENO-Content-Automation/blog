---
title: "World-Action Model — 동작과 함께 다음 장면을 그린다"
description: "로봇 정책에 칸 하나가 더 생겼습니다. 그 칸이 무엇을 바꿨는지 봅니다."
pubDate: 2026-09-21
category: robot-ai
tags: ["paper-review", "vla"]
draft: true
---

<!-- ① 훅  ★ 자동화 금지 (WRITING.md §6) — 아래는 초안입니다. 본인 문장으로 고쳐 쓰세요. -->

2026년 9월 4일과 9월 7일, 사흘 간격으로 논문 두 편이 올라왔습니다. 한쪽은 중국 로봇 회사, 다른 쪽은 대학 연합입니다. 서로 관계가 없는데 만든 물건의 모양이 같았습니다. 둘 다 로봇에게 **동작을 내기 전에 다음 장면을 먼저 그리게** 했습니다.

## 로봇 정책이 하는 일

로봇 정책은 신경망 하나입니다. **카메라 그림과 "무엇을 하라"는 지시를 넣으면 관절 명령이 나옵니다.** 그게 전부입니다. 제어기 자리에 수식 대신 학습된 모델이 앉아 있는 것이고, 차이는 우리가 식을 쓴 게 아니라 데이터에서 배웠다는 점뿐입니다.

[2편](/ko/posts/vla-failure-signatures/)에서 본 세 가지도 전부 이 틀 안에 있습니다. 다른 건 **관절값을 만들어내는 방식** 하나뿐입니다.

| 이름 | 무엇의 줄임말인가 | 동작을 어떻게 만드나 |
|---|---|---|
| **VQ-BeT** | Vector-Quantized Behavior Transformer | 동작 사전을 미리 만들어두고 매 순간 하나를 고릅니다. 객관식입니다 |
| **Diffusion Policy** | 줄임말이 아닙니다. 확산(diffusion) 모델을 정책으로 쓴 것 | 잡음 덩어리에서 시작해 조금씩 다듬어 궤적을 깎아냅니다 |
| **ACT** | Action Chunking with Transformers | 한 스텝이 아니라 **미래 한 구간을 통째로** 내놓습니다 |

방식은 달라도 **공통점이 하나 있습니다. 그림에서 동작으로 한 번에 갑니다.** 중간에 아무것도 없습니다.

## WAM은 동작을 혼자 만들지 않는다

WAM이 바꾼 것이 정확히 그 지점입니다. 동작만 내놓지 않고 **"그러면 다음에 이렇게 보일 것"을 같이 만듭니다.** 그리고 동작 쪽이 그 장면을 보고 나옵니다.

<svg viewBox="0 0 720 346" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="기존 정책은 그림에서 동작으로 한 번에 가고, WAM은 다음 장면과 동작을 같이 만들되 동작이 그 장면을 보고 나온다">
  <title>기존 정책과 WAM의 구조</title>
  <defs>
    <marker id="w3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <text x="14" y="26" fill="currentColor" font-size="11" opacity="0.65">지금까지 — 그림에서 동작으로 바로</text>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14" y="40" width="150" height="54" rx="6"/>
    <rect x="248" y="40" width="200" height="54" rx="6"/>
    <rect x="532" y="40" width="150" height="54" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="28" y="66">카메라 그림</text>
    <text x="262" y="66">정책</text>
    <text x="546" y="72">관절 명령</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="28" y="84">+ 무엇을 하라는 지시</text>
    <text x="262" y="84">Diffusion Policy · VQ-BeT · ACT</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M164 67 L244 67" marker-end="url(#w3)"/>
    <path d="M448 67 L528 67" marker-end="url(#w3)"/>
  </g>
  <text x="14" y="136" fill="currentColor" font-size="11" opacity="0.65">WAM — 장면과 동작을 같이 만든다</text>
  <rect x="248" y="142" width="200" height="134" rx="8" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4" opacity="0.45"/>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14" y="182" width="150" height="54" rx="6"/>
    <rect x="258" y="152" width="180" height="44" rx="6"/>
    <rect x="258" y="222" width="180" height="44" rx="6"/>
    <rect x="532" y="217" width="150" height="54" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="28" y="208">카메라 그림</text>
    <text x="270" y="172">다음 장면을 그린다</text>
    <text x="270" y="249">동작을 만든다</text>
    <text x="546" y="249">관절 명령</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="28" y="226">+ 무엇을 하라는 지시</text>
    <text x="270" y="188">이렇게 될 것이다</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M164 209 L244 209" marker-end="url(#w3)"/>
    <path d="M348 198 L348 218" marker-end="url(#w3)"/>
    <path d="M438 244 L528 244" marker-end="url(#w3)"/>
  </g>
  <text x="358" y="214" fill="currentColor" font-size="10.5" opacity="0.75">이 장면을 보고</text>
  <g fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.6">
    <path d="M348 276 L348 296" marker-end="url(#w3)"/>
  </g>
  <text x="360" y="294" fill="currentColor" font-size="10.5" opacity="0.75">이 중간 장면은 밖에서 볼 수 있다</text>
  <line x1="14" y1="312" x2="706" y2="312" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="332" fill="currentColor" font-size="11.5" opacity="0.7">더 생긴 것은 장면 칸 하나다. 동작은 그 장면을 보고 나온다.</text>
</svg>

사람이 컵을 집을 때와 같습니다. 머릿속 그림을 다 그린 다음에 팔을 뻗는 게 아니라, 그리면서 같이 움직입니다.

왜 이런 게 가능하냐면, **출발점으로 쓴 모델이 원래 영상을 만들던 모델**이기 때문입니다.

지금까지의 정책들은 이미지와 글자의 짝을 배운 모델에서 출발했습니다. WAM은 **장면이 시간에 따라 어떻게 변하는지를 배운 모델**에서 출발합니다. 물건을 밀면 물건이 움직이고, 팔이 지나간 자리에 그림자가 집니다. 영상을 만들려면 그걸 알아야 하고, 로봇이 하는 일도 결국 그쪽에 가깝습니다.

NVIDIA가 [이 범주에 이름을 붙이면서](https://developer.nvidia.com/blog/pretrained-to-imagine-fine-tuned-to-act-the-rise-of-world-action-models/) 쓴 정의가 그 말을 그대로 합니다.

> "a policy that starts from a pretrained world-model or video backbone and adapts it to represent or predict how the scene changes over time and emit corresponding actions."

**둘 중 무엇이 먼저 나오느냐는 팀마다 다릅니다.** [GE-Act 2.0](https://arxiv.org/abs/2609.05588)과 [DreamZero](https://arxiv.org/abs/2602.15922)는 장면을 먼저 그리고 거기서 동작을 뽑습니다. [Cosmos Policy](https://arxiv.org/abs/2601.16163)는 반대로 동작이 먼저 나오고 미래 장면이 뒤따르게 시퀀스를 짰습니다. [OpenWAM](https://arxiv.org/abs/2609.07398)이 이 선택지들을 통제 실험으로 비교했는데, 결론은 **둘을 동시에 다듬는 쪽**이 제일 낫다는 것이었습니다.

> "World–action synergy requires explicit world-to-action information flow during training, and synchronized joint denoising at inference."

순서가 무엇이든 공통점은 하나입니다. **동작이 혼자 나오지 않습니다.** 같이 만들어진 장면이 근거로 붙습니다.

## 왜 이게 더 잘 됐나

기술보다 데이터 쪽이 결정적입니다. **로봇 시연은 비싸고 영상은 쌉니다.**

동작 라벨이 붙은 로봇 시연을 모으려면 사람이 로봇을 붙들고 앉아 있어야 합니다. 반면 사람이 1인칭으로 찍은 영상은 이미 세상에 넘칩니다. 문제는 그 영상에 **"그때 관절이 몇 도였는지"가 없다**는 것이었습니다.

[DreamZero](https://arxiv.org/abs/2602.15922)의 해법이 간단합니다. **채점 기준을 데이터 출처마다 다르게 둡니다.**

```
로봇 시연  →  영상 예측 + 동작 예측   둘 다 채점
사람 영상  →  영상 예측만             동작은 채점하지 않음
```

정답이 없는 항목은 채점에서 빼면 됩니다. 그래서 라벨 없는 영상도 **장면 칸을 키우는 데는 그대로 쓰입니다.** 이 방식으로 다른 로봇과 사람의 영상만 가지고 처음 보는 과제 성능을 42% 상대 개선했고, 새 로봇으로 옮길 때는 30분치 데이터로 붙였습니다. [OpenWAM](https://arxiv.org/abs/2609.07398)은 아예 1인칭 사람 영상과 로봇 영상 약 6,400시간으로 사전학습했습니다.

## 언제 써볼 수 있나

**아직 제품이 아닙니다.** 연구 단계이고, 지금 손댈 수 있는 것은 공개된 코드와 체크포인트까지입니다.

그 앞에서 숫자를 먼저 봐야 합니다. GE-Act 2.0이 공동학습 데이터를 **300시간에서 30,000시간으로 100배** 늘려 결과를 냈습니다.

| 하드웨어 | 300시간 | 30,000시간 |
|---|---|---|
| G1-OP | 17.1% | **44.1%** |
| G2-90D | 13.4% | **31.1%** |

과제별 파인튜닝 없이 20개 스킬 그룹, 100개 조작 과제를 돌린 결과입니다. **100배를 먹여 2.6배가 됐고, 여전히 절반 넘게 실패합니다.** 사람이 안 보는 곳에 둘 수 있는 숫자가 아닙니다.

속도도 마찬가지입니다. DreamZero는 140억 파라미터 모델로 **7Hz 폐루프 제어**를 합니다. 한 주기가 143ms인데, 그냥 되는 게 아니라 5.7초를 150ms로 줄인 38배 최적화의 결과입니다. **그 칸이 공짜가 아니라는 뜻**이고, 빠른 반응이 필요한 자리에는 아직 안 맞습니다.

그래서 지금 이 계열이 쓸모 있는 자리는 좁습니다. **팔과 그리퍼로 하는 조작 과제**, 사람이 옆에서 지켜보는 환경, 그리고 **로봇 시연 데이터가 부족해서 사람 영상으로 메워야 하는 경우**입니다. 마지막 항목이 이 계열의 고유한 쓸모입니다.

돌려보려면 [OpenWAM 저장소](https://github.com/OpenWAM-Official/OpenWAM)가 Apache-2.0으로 열려 있습니다. 사전학습 체크포인트와 설정, 벤치마크 여덟 종이 들어 있고, 처음 돌려볼 조합이 기본값으로 박혀 있습니다.

## 마무리

지금까지 로봇 정책에 칸 하나가 더 생긴 것, 그 칸이 다음 장면을 그린다는 것, 그게 가능해진 이유가 라벨 없는 영상이었다는 것, 그리고 지금 그걸 어디에 써볼 수 있는지를 알아봤습니다.

더 생긴 것은 칸 하나입니다. 그런데 그 한 칸 때문에 **모델이 무엇을 예상하고 움직이는지가 밖에서 보이게** 됐습니다.

다음에 더 좋은 글로 찾아뵙겠습니다. 감사합니다.


<!-- ─────────────────────────────────────────
     발행 전 체크 (docs/WRITING.md §7)
     □ 첫 두 줄이 정의문이 아닌가
     □ 숫자·버전·조항이 최소 하나
     □ 헤맨 이야기나 못 확인한 것이 있다면 적었는가
     □ 사실이 나오는 문장마다 1차 출처 링크가 붙어 있는가
     □ 불릿이 절반을 넘지 않는가
     □ 다음 글 예고가 없는가
     □ SVG 안에 빈 줄이 없는가 (WORKFLOW.md §8)
     □ grep -rnP '\*\*[^*]*[)\]\.,:;!?]\*\*[가-힣]' src/content/posts/
     ───────────────────────────────────────── -->
