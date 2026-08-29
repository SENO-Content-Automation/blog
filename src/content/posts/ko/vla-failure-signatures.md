---
title: "로봇 정책은 아키텍처마다 다르게 실패합니다"
description: "같은 과제, 같은 데이터셋, 비슷한 성공률. 그런데 두 정책이 실패하는 모양은 정반대였습니다."
pubDate: 2026-08-29
category: failure-modes
tags: ["vla"]
draft: true
---

## 이 문서에서 다루는 범위

<svg viewBox="0 0 720 250" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="두 로봇 정책의 실패 궤적 비교 — 한쪽은 떨면서 실패하고 다른 쪽은 멈춰서 실패한다">
  <title>같은 과제에서 나타난 두 가지 실패 모양</title>
  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.35">
    <rect x="10" y="30" width="340" height="180" rx="6"/>
    <rect x="370" y="30" width="340" height="180" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="14" y="22">이산 토큰 — VQ-BeT</text>
    <text x="374" y="22">연속 — Diffusion Policy</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M55 180 L100 120 L70 175 L118 118 L88 172 L136 116 L106 170 L154 114 L124 168 L172 112"/>
    <path d="M410 180 C450 158 492 133 532 121 C562 112 592 109 612 108"/>
  </g>
  <circle cx="55" cy="180" r="3" fill="currentColor"/>
  <circle cx="410" cy="180" r="3" fill="currentColor"/>
  <circle cx="612" cy="108" r="4" fill="currentColor"/>
  <circle cx="612" cy="108" r="13" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/>
  <g fill="currentColor" font-size="12" opacity="0.8">
    <text x="200" y="150">떨면서 실패</text>
    <text x="200" y="170">정지 스텝 1</text>
    <text x="410" y="165">멈춰서 실패</text>
    <text x="410" y="185">정지 스텝 117</text>
  </g>
  <text x="360" y="236" fill="currentColor" font-size="12" text-anchor="middle" opacity="0.75">같은 과제 · 같은 데이터셋 · 성공률 56.5% vs 58%</text>
</svg>

이 글은 arXiv 프리프린트 [How VLAs Fail Differently](https://arxiv.org/abs/2605.28726) 한 편에서 발견 하나만 따라갑니다 — **같은 과제에서 성적이 비슷한 두 로봇 정책이, 실패할 때는 정반대 모양으로 무너졌다**는 것입니다.

세 단계로 봅니다. 무엇이 관측됐는지, 그 차이가 어디서 오는지, 그래서 무엇을 감시해야 하는지.

미리 밝혀둘 것이 둘 있습니다. 이 논문은 **동료 심사를 거치지 않은 프리프린트**이고, 실험은 **전부 시뮬레이션**입니다. 실물 로봇 검증은 저자도 향후 과제로 남겨두었습니다.

---

## ① 같은 성공률인데 실패가 달랐습니다

설정이 깔끔합니다. **같은 데이터셋으로 학습된 두 정책**을 **같은 시드**로 각각 200 에피소드씩 돌립니다. 과제는 PushT — 원형 밀대로 T자 블록을 목표 위치에 밀어 넣는 2차원 문제이고, 목표 영역을 95% 이상 덮으면 성공입니다.

성적표는 거의 같습니다.

| | Diffusion Policy | VQ-BeT |
|---|---|---|
| 성공률 | 58% (116/200) | 56.5% (113/200) |
| 속도 한계 위반 | 772건 | **1,847건** (2.4배) |
| 평균 저크 | 8.0 | **21.6** (2.7배) |
| 정지 스텝 | **117** | 1 |

**성공률은 1.5%p 차이인데 나머지가 전부 다릅니다.**

정지 스텝을 보시면 117 대 1입니다. Diffusion Policy는 실패할 때 **멈춥니다.** VQ-BeT는 거의 안 멈추는 대신 저크가 2.7배, 위반이 2.4배입니다 — **떱니다.**

저크는 위치의 3차 미분입니다. 가속도가 얼마나 급하게 변하는지를 재는 값이고, 승차감을 이야기할 때 쓰는 그 값입니다. 크면 덜컹거린다는 뜻입니다.

같은 과제를 같은 정도로 실패하는데, 하나는 진동하다 시간을 다 쓰고 다른 하나는 그 자리에서 굳어버립니다.

논문은 세 번째 정책도 봅니다. ACT를 ALOHA 양팔 로봇(14자유도) 시뮬레이터에서 50 에피소드 돌렸고, 성공률 62%에 속도 위반이 **4,758건** 나왔습니다. 앞의 둘을 합친 것보다 많습니다.

---

## ② 실패 모양은 어디서 오는가

여기서 "정책"이 무엇인지 짚고 가겠습니다. 카메라 영상과 관절 상태를 넣으면 다음 명령을 내놓는 신경망입니다. 제어기 자리에 학습된 모델이 앉은 것이고, 차이는 우리가 식을 쓴 게 아니라 데이터에서 배웠다는 점입니다.

**그 모델이 명령을 만드는 방식이 크게 두 갈래입니다.**

<svg viewBox="0 0 720 250" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="이산 토큰 방식은 코드북에서 골라 계단형 출력을 내고, 연속 방식은 노이즈를 반복해 깎아 매끄러운 출력을 낸다">
  <title>행동을 만드는 두 방식</title>
  <defs>
    <marker id="fail-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.35">
    <rect x="10" y="30" width="340" height="190" rx="6"/>
    <rect x="370" y="30" width="340" height="190" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="14" y="22">사전에서 고른다</text>
    <text x="374" y="22">노이즈에서 깎아낸다</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.6">
    <rect x="40" y="52" width="38" height="24" rx="3"/>
    <rect x="86" y="52" width="38" height="24" rx="3"/>
    <rect x="178" y="52" width="38" height="24" rx="3"/>
    <rect x="224" y="52" width="38" height="24" rx="3"/>
    <rect x="270" y="52" width="38" height="24" rx="3"/>
  </g>
  <rect x="132" y="52" width="38" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <path d="M151 80 L151 104" fill="none" stroke="currentColor" stroke-width="1.2" marker-end="url(#fail-arrow)"/>
  <path d="M40 190 L80 190 L80 168 L120 168 L120 176 L160 176 L160 144 L200 144 L200 152 L240 152 L240 124 L300 124" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M394 66 L404 50 L412 82 L422 52 L432 80 L442 54 L452 78 L462 58"/>
    <path d="M508 66 L520 56 L532 74 L544 58 L556 72 L568 60 L578 70"/>
    <path d="M622 66 C640 56 660 72 690 62"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.8">
    <path d="M470 66 L500 66" marker-end="url(#fail-arrow)"/>
    <path d="M586 66 L614 66" marker-end="url(#fail-arrow)"/>
  </g>
  <path d="M394 176 C450 200 520 128 690 156" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <g fill="currentColor" font-size="12" opacity="0.8">
    <text x="40" y="212">계단처럼 튄다 → 저크</text>
    <text x="394" y="212">매끄럽다 → 실패해도 매끄럽다</text>
    <text x="40" y="100" font-size="11" opacity="0.75">가장 가까운 항목으로 스냅</text>
  </g>
</svg>

**이산 토큰 방식**은 가능한 동작을 미리 몇백 개 사전으로 만들어두고, 매 순간 그중 하나를 골라 씁니다. VQ-BeT가 여기 속합니다.

문제는 **필요한 동작이 사전 항목 사이에 있을 때**입니다. 가장 가까운 항목으로 붙습니다. ADC 분해능이나 GIF의 256색 팔레트와 같은 구조이고, 그 결과가 **계단**입니다. 고른 항목이 바뀌는 순간 출력이 점프하고, 그게 저크로 나타납니다.

**연속 방식**은 실수 궤적을 직접 만들어냅니다. Diffusion Policy는 난수 덩어리에서 시작해 카메라 영상을 조건으로 열 번 남짓 다듬어 궤적을 뽑아냅니다. 대리석에서 형상을 깎아내는 쪽에 가깝습니다. 격자에 붙을 일이 없으니 출력이 매끄럽습니다.

**그리고 여기가 이 논문의 핵심입니다. 매끄러운 모델은 실패할 때도 매끄럽습니다.**

궤적은 부드럽고, 속도도 적당하고, 물리적으로 아무 문제가 없어 보이는데 **엉뚱한 곳으로 갑니다.** 논문은 이걸 행동 오류라고 부릅니다. 제약을 어겨서 실패하는 게 아니라, 제약을 다 지키면서 틀린 일을 합니다.

ACT는 중간에 있습니다. 연속 방식인데 미래 100스텝을 한 덩어리로 내놓습니다. 덩어리 안은 매끄럽고, 덩어리와 덩어리가 만나는 이음매에서 튑니다.

정리하면 실패의 모양이 **데이터나 과제가 아니라 출력을 만드는 방식에서** 나옵니다.

---

## ③ 그래서 무엇을 감시해야 하는가

논문은 명령값 시계열만 보고 계산할 수 있는 지표 여러 개를 놓고, 각각이 실패를 얼마나 잘 가려내는지 쟀습니다. 척도는 AUROC입니다 — **0.5면 동전 던지기, 1.0이면 완벽**하다고 보시면 됩니다.

| 지표 | Diffusion | VQ-BeT | ACT |
|---|---|---|---|
| **방향 반전율** | 0.79 | **0.93** | **0.91** |
| 저크 | 0.41 | 0.88 | 0.69 |
| 모멘텀 일관성 | 0.70 | 0.86 | 0.71 |
| **속도 한계 위반** | 0.41 | 0.69 | **0.52** |

세 줄로 읽힙니다.

**방향 반전율만 셋 다에서 통했습니다.** 명령의 부호가 뒤집히는 비율, 즉 **앞으로 못 나가고 떨고 있는가**를 재는 값입니다. 실패의 원인이 무엇이든 증상으로는 나타난다는 뜻입니다.

**저크는 이산 쪽에서만 통합니다.** 0.88 → 0.69 → 0.41로 내려갑니다. 계단이 있는 모델에서만 신호가 되고 매끄러운 모델에서는 사라집니다.

**속도 한계 위반은 어디서도 통하지 않습니다.** 그리고 이게 배포 코드에서 가장 흔히 쓰이는 안전장치입니다.

ACT가 결정적입니다. 위반이 **4,758건**이나 나는데 AUROC는 0.52, 동전 던지기입니다. 논문의 설명은 이렇습니다 — **성공하는 에피소드가 오히려 더 크고 자신 있게 움직인다.** 속도로 자르면 잘 하고 있는 쪽을 자르게 됩니다.

그래서 논문의 권고는 아키텍처별로 갈립니다.

| 아키텍처 | 볼 것 | 보지 말 것 |
|---|---|---|
| 이산 토큰 (VQ-BeT 등) | 저크 + 방향 반전율 | — |
| 연속 (Diffusion 등) | 방향 반전율 + 모멘텀 일관성 | 저크 |
| 액션 청킹 (ACT) | 방향 반전율, 청크 이음매 | — |
| 공통 | — | 속도 위반을 주 신호로 쓰는 것 |

---

## 마무리

지금까지 같은 과제에서 두 로봇 정책이 어떻게 다른 모양으로 실패하는지, 그 차이가 어디서 오는지, 그래서 무엇을 감시해야 하는지 알아봤습니다.

논문이 내놓는 답은 **하나로 다 되는 감시자는 없다**는 것입니다. 다만 저는 그보다 한 겹 아래가 더 오래 남을 것 같습니다.

**크기를 재는 지표가 전부 실패했습니다.** 범위, 속도, 가속도는 모두 "얼마나 세게 움직이나"를 묻는데, 그건 잘 하고 있을 때도 큽니다. 살아남은 지표는 "앞으로 나아가고 있나"를 묻는 쪽이었습니다.

전통적인 안전 리미터는 한계선을 넘는지를 봅니다. 그런데 AI의 실패는 한계 안에서 조용히 일어납니다. 4,758번 경보가 울렸는데 그중 실패를 가리킨 게 하나도 없었다는 사실이 그걸 보여줍니다.

다음에는 그럼 그 조용한 실패를 무엇으로 잡을 수 있는지 쪽을 이야기해볼까 합니다.

다음에 더 좋은 글로 찾아뵙겠습니다. 감사합니다.

---

## Reference

| 무엇 | 어디 |
|---|---|
| 이 글이 다룬 논문 | [How VLAs Fail Differently (arXiv:2605.28726)](https://arxiv.org/abs/2605.28726) |
| ACT — 액션 청킹 | [arXiv:2304.13705](https://arxiv.org/abs/2304.13705) |
| Diffusion Policy | [arXiv:2303.04137](https://arxiv.org/abs/2303.04137) |
| VQ-BeT — 이산 토큰 | [arXiv:2403.03181](https://arxiv.org/abs/2403.03181) |
| 세 정책의 구현·체크포인트 | [LeRobot](https://github.com/huggingface/lerobot) |
| 실패 탐지 관련 연구 | [Sentinel (arXiv:2410.04640)](https://arxiv.org/abs/2410.04640) · [SAFE (arXiv:2506.09937)](https://arxiv.org/abs/2506.09937) |
