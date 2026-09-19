---
title: "로봇 정책은 아키텍처마다 다르게 실패합니다"
description: "같은 과제, 같은 데이터셋, 비슷한 성공률. 그런데 두 정책이 실패하는 모양은 정반대였습니다."
pubDate: 2026-08-29
category: failure-modes
tags: ["paper-review", "runtime-monitoring"]
draft: false
---

## 이 문서에서 다루는 범위

로봇 AI의 실패를 다루는 순서는 아래와 같이 나눌 수 있습니다.

<svg viewBox="0 0 720 214" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="실패 대응 네 단계 중 이 글이 다루는 앞의 세 단계">
  <title>실패 대응 네 단계와 이 글의 범위</title>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="8" y="26" width="200" height="62" rx="6"/>
    <rect x="224" y="26" width="200" height="62" rx="6"/>
    <rect x="440" y="26" width="200" height="62" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="24" y="52">[1] 어떻게 실패하는가</text>
    <text x="240" y="52">[2] 왜 그렇게 실패하는가</text>
    <text x="456" y="52">[3] 어떻게 알아채는가</text>
  </g>
  <g fill="currentColor" font-size="12" opacity="0.7">
    <text x="24" y="72">실패 신호 관측</text>
    <text x="240" y="72">아키텍처 차이</text>
    <text x="456" y="72">감시 지표 선택</text>
    <text x="656" y="61">← 이 글</text>
  </g>
  <g opacity="0.5">
    <line x1="8" y1="112" x2="712" y2="112" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5"/>
  </g>
  <text x="360" y="106" fill="currentColor" font-size="12" text-anchor="middle" opacity="0.85">무엇을 감시할지 정해져야 여기부터 설계된다</text>
  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.55">
    <rect x="8" y="134" width="200" height="62" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13" opacity="0.55">
    <text x="24" y="160">[4] 어떻게 막는가</text>
  </g>
  <g fill="currentColor" font-size="12" opacity="0.45">
    <text x="24" y="180">안전계층 설계</text>
  </g>
</svg>

이 글은 **[1]에서 [3]까지**를 다룹니다. 무엇을 감시할지가 정해져야 [4]에서 무엇을 막을지도 정해지기 때문입니다.

재료는 arXiv 프리프린트 [How VLAs Fail Differently](https://arxiv.org/abs/2605.28726)(Krishnam Gupta) 한 편입니다. 심사를 거치지 않았고, 소속 없는 연구자가 혼자 냈고, 실험은 전부 시뮬레이션입니다. 그래서 결론을 그대로 가져오기보다, 저자가 무엇을 보고 그렇게 말했는지를 따라갑니다.

---

## ① 같은 성공률인데 실패가 달랐습니다

**같은 데이터셋으로 학습된 두 정책**을 **같은 시드**(0–199번)로 각각 200 에피소드씩 돌립니다. 시드는 시뮬레이터가 매 에피소드 초기 위치를 무작위로 놓을 때 쓰는 난수 씨앗입니다. 같은 시드를 쓴다는 건 두 정책이 **완전히 같은 200개 상황**을 마주했다는 뜻이고, 한쪽이 쉬운 판을 받아서 이긴 게 아니라는 걸 보장합니다.

과제는 PushT입니다. 위에서 내려다본 2차원 평면에서 원형 밀대 하나로 T자 블록을 밀어 바닥에 그려진 목표 윤곽에 맞춰 넣습니다. 집을 수 없고 **밀 수만 있다**는 게 어려운 지점입니다 — 회전시키려면 모서리를, 평행이동시키려면 가운데를 밀어야 하고, 미는 지점이 조금만 달라져도 결과가 완전히 달라집니다. 정답 경로가 하나가 아닙니다. 한 에피소드는 300스텝이고, 목표 영역을 95% 이상 덮으면 성공입니다.

두 정책은 같은 일을 합니다 — 카메라 영상을 보고 다음 명령을 내놓습니다. 다른 것은 **명령을 만드는 방식**입니다. [**Diffusion Policy**](https://arxiv.org/abs/2303.04137)는 실수값 궤적을 직접 그려내고, [**VQ-BeT**](https://arxiv.org/abs/2403.03181)는 미리 만들어둔 동작 사전에서 하나를 골라 씁니다. 이 차이가 왜 중요한지는 ②에서 봅니다.

| | Diffusion Policy | VQ-BeT |
|---|---|---|
| 성공률 | 58% (116/200) | 56.5% (113/200) |
| 속도 한계 위반 | 772건 | **1,847건** (2.4배) |
| 저크 RMS | 8.0 | **21.6** (2.7배) |
| 정지 스텝 | **117** | 1 |

**성공률은 1.5%p 차이인데 나머지가 전부 다릅니다.**

여기서 **정지 스텝**은 로봇이 사실상 움직이지 않은 스텝입니다. 논문의 정의는 "변위가 임계값 아래로 떨어진 스텝이 연속으로 이어진 것"인데, **그 임계값이 얼마인지는 논문에 나오지 않습니다.**

200 에피소드 × 300스텝 = 총 60,000스텝 중 Diffusion은 117스텝, VQ-BeT는 1스텝이 여기 해당합니다. 비율로는 0.2% 대 0.0017%로 둘 다 드물지만, **117배 차이**입니다.

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

정지 스텝을 보시면 117 대 1입니다. Diffusion Policy는 실패할 때 **멈춥니다.** VQ-BeT는 거의 안 멈추는 대신 저크가 2.7배, 위반이 2.4배입니다 — **떱니다.**

한 가지 짚고 갑니다. **정책에는 "멈춤" 명령이 없습니다.** 매 스텝 반드시 무언가를 출력합니다. 그러니 멈췄다는 건 로봇이 멈추기로 판단한 게 아니라, **출력된 명령이 0에 가까웠다**는 뜻입니다. 로봇은 계속 명령을 받고 있고, 그 명령이 "거의 움직이지 마라"였을 뿐입니다.

저크는 가속도가 얼마나 급하게 변하는지를 재는 값입니다. 크면 덜컹거립니다.

논문은 세 번째 정책도 봅니다. [**ACT**](https://arxiv.org/abs/2304.13705)는 매 스텝 명령을 하나씩 내는 대신 미래 한 구간을 통째로 내놓는 정책이고, **ALOHA**는 그 정책이 처음 시연된 양팔 로봇 플랫폼입니다. 팔 하나에 7자유도씩, 합쳐서 14자유도입니다. 앞의 둘이 2차원 밀기였다면 이쪽은 팔 두 개로 하는 실제 조작에 가깝습니다.

시뮬레이터에서 50 에피소드를 돌렸고, 성공률 62%에 속도 위반이 **4,758건** 나왔습니다. 앞의 둘을 합친 것보다 많습니다.

---

## ② 실패 모양은 어디서 오는가

여기서 "정책"은 카메라 영상과 관절 상태를 넣으면 다음 명령을 내놓는 신경망입니다. 제어기 자리에 학습된 모델이 앉은 것이고, 차이는 우리가 식을 쓴 게 아니라 데이터에서 배웠다는 점입니다.

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
    <text x="394" y="212">매끄럽다 → 저크가 안 남는다</text>
    <text x="40" y="100" font-size="11" opacity="0.75">가장 가까운 항목으로 스냅</text>
  </g>
</svg>

**이산 토큰 방식**은 가능한 동작을 미리 사전으로 만들어두고, 매 순간 그중 하나를 골라 씁니다. VQ-BeT가 여기 속하는데, 사전이 16칸짜리 코드북 두 단으로 되어 있어 조합이 [256가지](https://mintlify.wiki/huggingface/lerobot/policies/vqbet)입니다. 세 정책의 구현과 체크포인트는 [LeRobot](https://github.com/huggingface/lerobot)에 있습니다. 그리고 **토큰 하나가 명령 하나가 아니라 연속 다섯 스텝 분량의 동작 한 덩어리**입니다. 다섯 스텝마다 사전에서 새로 고르고, 고른 항목이 바뀌는 그 경계에서 출력이 점프합니다.

문제는 **필요한 동작이 사전 항목 사이에 있을 때**입니다. 가장 가까운 항목으로 붙습니다. ADC 분해능이나 GIF의 256색 팔레트와 같은 구조이고, 그 결과가 **계단**입니다. 고른 항목이 바뀌는 순간 출력이 점프하고, 그게 저크로 나타납니다.

**연속 방식**은 실수 궤적을 직접 만들어냅니다. Diffusion Policy는 난수 덩어리에서 시작해 카메라 영상을 조건으로 여러 번 되풀이해 다듬으며 궤적을 뽑아냅니다. 대리석에서 형상을 깎아내는 쪽에 가깝습니다. 격자에 붙을 일이 없으니 출력이 매끄럽습니다.

**매끄러운 모델은 실패할 때도 매끄럽습니다.**

궤적은 부드럽고, 속도도 적당하고, 물리적으로 아무 문제가 없어 보이는데 **엉뚱한 곳으로 갑니다.** 논문은 이걸 행동 오류(behavioral error)라고 부릅니다. 제약을 어겨서 실패하는 게 아니라, 제약을 다 지키면서 틀린 일을 합니다.

ACT는 중간에 있습니다. 덩어리 안은 매끄럽고, 덩어리와 덩어리가 만나는 이음매에서 튑니다.

### 그런데 정지는 아무도 설명하지 않습니다

여기까지 오면 저크는 설명이 됩니다. 계단이 있으니 튀는 것이지요. 그런데 **이 글의 대표 숫자는 저크가 아니라 117 대 1입니다.** 왜 Diffusion만 굳어버리는가.

논문을 다시 뒤졌는데, **논문도 답하지 않습니다.** 있는 것은 서술뿐입니다 — "두 아키텍처는 질적으로 다르게 실패한다. VQ-BeT는 덜컹거리며 진동하고, Diffusion은 매끄럽지만 멈춘다." 무슨 일이 일어나는지는 말하고, 왜 그런지는 손대지 않았습니다.

왜 한쪽만 굳는지, 저도 아직 모릅니다.

다만 감시 지표를 고르는 데는 그 답이 없어도 됩니다. 확실한 것은 **실패의 모양이 데이터나 과제가 아니라 출력을 만드는 방식에서 나온다**는 것이고, 무엇을 감시할지는 거기서부터 정해지기 때문입니다.

---

## ③ 그래서 무엇을 감시해야 하는가

논문은 명령값 시계열만 보고 계산할 수 있는 지표 일곱 개를 놓고, 각각이 실패를 얼마나 잘 가려내는지 쟀습니다. 척도는 AUROC입니다 — **0.5면 동전 던지기, 1.0이면 완벽**하다고 보시면 됩니다.

| 지표 | Diffusion | VQ-BeT | ACT |
|---|---|---|---|
| **방향 반전율** | 0.79 | **0.93** | **0.91** |
| 총변동 | 0.71 | 0.89 | 0.75 |
| 저크 RMS | 0.41 | **0.88** | 0.69 |
| 모멘텀 일관성 | 0.70 | 0.86 | 0.71 |
| 스펙트럼 에너지비 | 0.34 | 0.75 | 0.74 |
| 속도 한계 위반 | 0.41 | 0.69 | 0.52 |
| **정지율** | 0.50 | 0.49 | 0.53 |

**방향 반전율만 셋 다에서 통했습니다.** 명령의 부호가 뒤집히는 비율, 즉 **앞으로 못 나가고 제자리에서 오가는가**를 재는 값입니다. 실패의 원인이 무엇이든 증상으로는 나타난다는 뜻입니다.

**저크는 이산 쪽에서만 통합니다.** 0.88 → 0.69 → 0.41로 내려갑니다. 계단이 있는 모델에서만 신호가 되고, 매끄러운 모델에서는 사라집니다. 앞 절의 이야기가 숫자로 확인되는 지점입니다.

**속도 한계 위반은 어디서도 통하지 않습니다.** 배포 코드에서 가장 흔히 쓰이는 안전장치가 바로 이것입니다. ACT를 보면 위반이 4,758건이나 나는데 AUROC는 0.52, 사실상 동전 던지기입니다. 논문에 따르면 ACT의 실패는 위험한 동작이 아니라 **물리적으로 멀쩡해 보이는 틀린 동작** 때문이고, 속도로는 잘 하는 쪽과 못 하는 쪽이 갈리지 않습니다.

**그런데 정지율이 0.50, 0.49, 0.53입니다.** 셋 다 동전 던지기입니다.

이 글은 117 대 1이라는 정지 스텝 차이로 시작했습니다. 두 모델을 가장 선명하게 갈라놓은 숫자입니다. 그런데 **그 선명한 증상을 감시자로 쓰면 아무것도 못 잡습니다.** 정지는 아키텍처를 구별해주지만 실패를 구별해주지는 않습니다. Diffusion은 성공할 때도 잠깐씩 멈추기 때문입니다.

그래서 논문의 권고는 아키텍처별로 갈립니다.

| 아키텍처 | 볼 것 | 보지 말 것 |
|---|---|---|
| 이산 토큰 (VQ-BeT, OpenVLA) | 저크 RMS + 방향 반전율 | — |
| 연속 (Diffusion, flow matching) | 방향 반전율 + 모멘텀 일관성 | 저크 |
| 액션 청킹 (ACT) | 방향 반전율, 청크 이음매 | — |
| 공통 | — | 속도 위반·정지를 주 신호로 쓰는 것 |

다만 95% 신뢰구간을 보면 ACT의 방향 반전율은 **0.91 [0.79, 0.99]** 로 폭이 넓습니다. 50 에피소드밖에 안 돌렸기 때문입니다. VQ-BeT는 **0.93 [0.88, 0.97]** 로 좁습니다. 결론은 유지되지만 ACT 쪽 표본은 아직 얇습니다.

실패를 실행 중에 잡아내는 문제를 다른 각도에서 본 연구로는 [Sentinel](https://arxiv.org/abs/2410.04640)과 [SAFE](https://arxiv.org/abs/2506.09937)가 있습니다.

---

## 마무리

지금까지 같은 과제에서 두 로봇 정책이 어떻게 다른 모양으로 실패하는지, 그 차이가 어디서 오는지, 그래서 무엇을 감시해야 하는지 알아봤습니다.

논문이 내놓는 답은 **하나로 다 되는 감시자는 없다**는 것입니다.

**크기를 재는 지표가 전부 무너졌습니다.** 속도, 가속도, 저크는 모두 "얼마나 세게 움직이나"를 묻습니다. 그런데 그 값은 잘 하고 있을 때도 큽니다. 살아남은 지표는 **"앞으로 나아가고 있나"** 를 묻는 쪽이었습니다. 방향 반전율은 크기를 재지 않고 부호가 뒤집히는 횟수를 셉니다.

그리고 눈에 가장 잘 띄던 증상 — 117 대 1의 정지 — 은 감시자로는 쓸모가 없었습니다.

앞서 밝힌 대로 심사 전 프리프린트이고, 실험은 전부 시뮬레이션입니다.

다음에 더 좋은 글로 찾아뵙겠습니다. 감사합니다.
