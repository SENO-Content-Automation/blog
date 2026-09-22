---
title: "World-Action Model — 동작과 함께 다음 장면을 그린다"
description: "로봇 정책에 칸 하나가 더 생겼습니다. 그 칸이 무엇을 바꿨는지 봅니다."
pubDate: 2026-09-21
category: robot-ai
tags: ["paper-review", "vla"]
draft: false
---

<!-- ① 훅  ★ 자동화 금지 (WRITING.md §6) — 아래는 초안입니다. 본인 문장으로 고쳐 쓰세요. -->

사흘 사이에 논문 두 편이 올라왔습니다. 9월 4일과 9월 7일. 앞의 것은 새 로봇 모델([GE-Act 2.0](https://arxiv.org/abs/2609.05588), AgiBot)이고, 뒤의 것은 **그런 모델들을 부품 단위로 쪼개서 비교하는 틀**([OpenWAM](https://arxiv.org/abs/2609.07398))이었습니다.

비교표가 나왔다는 건 비교할 것이 이미 여러 개라는 뜻입니다. 그리고 그 여러 개가 공통으로 하는 일이 하나 있습니다 — **동작만 내지 않고, "그러면 다음에 이렇게 보일 것"을 같이 만듭니다.**

## 로봇 정책이 하는 일

로봇 정책은 신경망 하나입니다. **카메라 그림과 "무엇을 하라"는 지시를 넣으면 관절 명령이 나옵니다.** 그게 전부입니다. 제어기 자리에 수식 대신 학습된 모델이 앉아 있는 것이고, 차이는 우리가 식을 쓴 게 아니라 데이터에서 배웠다는 점뿐입니다.

[2편](/ko/posts/vla-failure-signatures/)에서 본 세 가지도 전부 이 틀 안에 있습니다. 다른 건 **관절값을 만들어내는 방식** 하나뿐입니다.

| 이름 | 동작을 어떻게 만드나 |
|---|---|
| **VQ-BeT** (Vector-Quantized Behavior Transformer) | 동작 사전을 미리 만들어두고 매 순간 하나를 고릅니다. 객관식입니다 |
| **Diffusion Policy** (확산 모델을 정책으로 쓴 것) | 잡음 덩어리에서 시작해 조금씩 다듬어 궤적을 깎아냅니다 |
| **ACT** (Action Chunking with Transformers) | 한 스텝이 아니라 **미래 한 구간을 통째로** 내놓습니다 |

<svg viewBox="0 0 720 152" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="VQ-BeT는 미리 만든 동작 목록에서 하나를 고르고, Diffusion Policy는 잡음에서 궤적을 다듬어내고, ACT는 미래 한 구간을 통째로 내놓는다">
  <title>동작을 만들어내는 세 가지 방식</title>
  <defs>
    <marker id="m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g stroke="currentColor" stroke-width="1" opacity="0.18">
    <line x1="240" y1="10" x2="240" y2="142"/>
    <line x1="480" y1="10" x2="480" y2="142"/>
  </g>
  <g fill="currentColor" font-size="12">
    <text x="14" y="22">VQ-BeT — 고른다</text>
    <text x="254" y="22">Diffusion Policy — 다듬는다</text>
    <text x="494" y="22">ACT — 통째로 낸다</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <rect x="16" y="40" width="36" height="22" rx="3"/>
    <rect x="58" y="40" width="36" height="22" rx="3"/>
    <rect x="100" y="40" width="36" height="22" rx="3"/>
    <rect x="16" y="70" width="36" height="22" rx="3"/>
    <rect x="100" y="70" width="36" height="22" rx="3"/>
  </g>
  <rect x="58" y="70" width="36" height="22" rx="3" fill="currentColor" opacity="0.85"/>
  <path d="M142 81 L170 81" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#m3)"/>
  <text x="178" y="85" fill="currentColor" font-size="11">동작</text>
  <path d="M258 88 L266 62 L274 92 L282 66 L290 90 L298 64 L306 93 L314 68 L322 86 L330 70" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.75"/>
  <path d="M338 78 L362 78" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#m3)"/>
  <path d="M370 90 C 396 90 400 60 428 60 C 450 60 456 80 462 86" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <line x1="498" y1="80" x2="702" y2="80" stroke="currentColor" stroke-width="1" opacity="0.25"/>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <circle cx="522" cy="80" r="3.2"/>
    <circle cx="544" cy="80" r="3.2"/>
    <circle cx="566" cy="80" r="3.2"/>
    <circle cx="588" cy="80" r="3.2"/>
    <circle cx="610" cy="80" r="3.2"/>
    <circle cx="632" cy="80" r="3.2"/>
    <circle cx="654" cy="80" r="3.2"/>
    <circle cx="676" cy="80" r="3.2"/>
    <circle cx="698" cy="80" r="3.2"/>
  </g>
  <circle cx="500" cy="80" r="3.6" fill="currentColor"/>
  <path d="M522 64 L522 56 L698 56 L698 64" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="610" y="48" fill="currentColor" font-size="10.5" text-anchor="middle" opacity="0.8">이 구간을 한 번에</text>
  <g fill="currentColor" font-size="10" opacity="0.6">
    <text x="16" y="108">동작 사전</text>
    <text x="258" y="110">잡음</text>
    <text x="400" y="110">궤적</text>
    <text x="494" y="104">현재</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.75">
    <text x="14" y="136">미리 만든 목록에서 하나를 고른다</text>
    <text x="254" y="136">잡음에서 시작해 궤적으로 깎아낸다</text>
    <text x="494" y="136">다음 한 구간을 통째로 내놓는다</text>
  </g>
</svg>

방식은 달라도 **공통점이 하나 있습니다. 그림에서 동작으로 한 번에 갑니다.** 중간에 아무것도 없습니다.

## WAM은 동작을 혼자 만들지 않는다

WAM이 바꾼 것이 정확히 그 지점입니다. 동작만 내놓지 않고 **"그러면 다음에 이렇게 보일 것"을 같이 만듭니다.** 그리고 동작 쪽이 그 장면을 보고 나옵니다.

<svg viewBox="0 0 720 352" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="지금까지는 카메라 그림을 정책에 넣어 관절 명령을 바로 얻었고, WAM은 그리퍼가 컵을 잡은 다음 장면을 같이 만들고 그 장면을 보고 동작을 만들어 관절 명령을 낸다">
  <title>기존 정책과 WAM의 구조</title>
  <defs>
    <marker id="w3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g opacity="0.55">
    <text x="14" y="30" fill="currentColor" font-size="11">지금까지 — 그림을 보고 동작을 바로 낸다</text>
    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="14" y="42" width="100" height="62" rx="4"/>
      <rect x="168" y="48" width="280" height="50" rx="6"/>
      <rect x="492" y="48" width="214" height="50" rx="6"/>
    </g>
    <line x1="22" y1="92" x2="106" y2="92" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    <path d="M82 72 L98 72 L96 92 L84 92 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <g fill="none" stroke="currentColor" stroke-width="1.3">
      <path d="M44 50 L44 60"/>
      <path d="M36 60 L52 60"/>
      <path d="M36 60 L36 76"/>
      <path d="M52 60 L52 76"/>
    </g>
    <text x="182" y="78" fill="currentColor" font-size="13">정책</text>
    <text x="232" y="78" fill="currentColor" font-size="10" opacity="0.75">Diffusion Policy · VQ-BeT · ACT</text>
    <text x="506" y="68" fill="currentColor" font-size="12">관절 명령</text>
    <text x="506" y="88" fill="currentColor" font-size="10" font-family="ui-monospace, monospace" opacity="0.75">0.12  -0.38  0.04  …</text>
    <g fill="none" stroke="currentColor" stroke-width="1.4">
      <path d="M122 73 L162 73" marker-end="url(#w3)"/>
      <path d="M456 73 L486 73" marker-end="url(#w3)"/>
    </g>
  </g>
  <text x="14" y="146" fill="currentColor" font-size="11" opacity="0.7">WAM — 다음 장면을 같이 만들고, 그것을 보고 동작을 낸다</text>
  <rect x="168" y="158" width="280" height="136" rx="8" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4" opacity="0.45"/>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="14" y="195" width="100" height="62" rx="4"/>
    <rect x="180" y="252" width="250" height="34" rx="6"/>
    <rect x="492" y="244" width="214" height="50" rx="6"/>
  </g>
  <line x1="22" y1="245" x2="106" y2="245" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <path d="M82 225 L98 225 L96 245 L84 245 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <g fill="none" stroke="currentColor" stroke-width="1.3">
    <path d="M44 203 L44 213"/>
    <path d="M36 213 L52 213"/>
    <path d="M36 213 L36 229"/>
    <path d="M52 213 L52 229"/>
  </g>
  <rect x="180" y="168" width="100" height="62" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/>
  <line x1="188" y1="218" x2="272" y2="218" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <path d="M248 198 L264 198 L262 218 L250 218 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M256 176 L256 182"/>
    <path d="M242 182 L270 182"/>
    <path d="M242 182 L242 212"/>
    <path d="M270 182 L270 212"/>
  </g>
  <text x="292" y="188" fill="currentColor" font-size="11.5">다음 장면</text>
  <text x="292" y="206" fill="currentColor" font-size="10" opacity="0.6">이렇게 될 것이다</text>
  <path d="M230 234 L230 248" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#w3)"/>
  <text x="240" y="247" fill="currentColor" font-size="10" opacity="0.75">이 장면을 보고</text>
  <text x="194" y="274" fill="currentColor" font-size="12">동작을 만든다</text>
  <text x="506" y="264" fill="currentColor" font-size="12" opacity="0.8">관절 명령</text>
  <text x="506" y="284" fill="currentColor" font-size="10" font-family="ui-monospace, monospace" opacity="0.6">0.12  -0.38  0.04  …</text>
  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M122 226 L162 226" marker-end="url(#w3)"/>
    <path d="M434 269 L486 269" marker-end="url(#w3)"/>
  </g>
  <line x1="14" y1="316" x2="706" y2="316" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="338" fill="currentColor" font-size="11.5" opacity="0.7">더 생긴 것은 가운데 장면 하나다. 동작은 그 장면을 보고 나온다.</text>
</svg>

사람이 컵을 집을 때와 같습니다. 머릿속 그림을 다 그린 다음에 팔을 뻗는 게 아니라, 그리면서 같이 움직입니다.

왜 이런 게 가능하냐면, **출발점으로 쓴 모델이 원래 영상을 만들던 모델**이기 때문입니다.

지금까지의 정책들은 이미지와 글자의 짝을 배운 모델에서 출발했습니다. WAM은 **장면이 시간에 따라 어떻게 변하는지를 배운 모델**에서 출발합니다. 물건을 밀면 물건이 움직이고, 팔이 지나간 자리에 그림자가 집니다. 영상을 만들려면 그걸 알아야 하고, 로봇이 하는 일도 결국 그쪽에 가깝습니다.

NVIDIA가 [이 범주에 이름을 붙이면서](https://developer.nvidia.com/blog/pretrained-to-imagine-fine-tuned-to-act-the-rise-of-world-action-models/) 쓴 정의가 그 말을 그대로 합니다.

> "a policy that starts from a pretrained world-model or video backbone and adapts it to represent or predict how the scene changes over time and emit corresponding actions."

**그 장면을 무엇에 쓰는지는 팀마다 다릅니다.** [GE-Act 2.0](https://arxiv.org/abs/2609.05588)과 [DreamZero](https://arxiv.org/abs/2602.15922)는 **재료**로 씁니다. 예측한 장면을 역동역학 모델에 넣고, 거기서 동작을 뽑습니다.

[Cosmos Policy](https://arxiv.org/abs/2601.16163)는 **채점표**로 씁니다. 동작 후보를 여러 개 뽑아놓고, 후보마다 미래와 그 미래의 가치를 예측해서 제일 높은 것을 고릅니다. 장면이 동작을 만드는 게 아니라 **고르는 데** 들어갑니다. 이 고르는 과정은 꺼도 되고, 끄면 장면 예측은 학습할 때만 쓰인 목표가 됩니다.

[OpenWAM](https://arxiv.org/abs/2609.07398)은 **참조**로 씁니다. 장면과 동작을 한 번에 같이 다듬으면서 동작 쪽이 장면 쪽을 계속 봅니다. 그리고 이 선택지들을 통제 실험으로 비교해서, 이 방식이 제일 낫다고 결론했습니다.

쓰는 방식이 다르니 나오는 순서도 갈립니다. **재료로 쓰려면 장면이 먼저 나와야 하고, 채점표로 쓰려면 동작이 먼저 나와야 합니다.**

> "World–action synergy requires explicit world-to-action information flow during training, and synchronized joint denoising at inference."

<svg viewBox="0 0 720 376" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="GE-Act 2.0과 DreamZero는 예측한 장면을 동작을 만드는 재료로 쓰고, Cosmos Policy는 동작 후보를 고르는 채점표로 쓰고, OpenWAM은 다듬는 동안 참조로 쓴다. 어느 쪽이든 로봇으로 나가는 것은 관절값이다">
  <title>예측한 장면을 무엇에 쓰나</title>
  <defs>
    <marker id="d2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <text x="14" y="20" fill="currentColor" font-size="11" opacity="0.65">예측한 장면을 무엇에 쓰나 — 팀마다 다르다</text>
  <g fill="currentColor" font-size="10" opacity="0.6" text-anchor="middle">
    <text x="164" y="46">다음 장면</text>
    <text x="288" y="46">동작 — 관절값</text>
  </g>
  <line x1="14" y1="54" x2="706" y2="54" stroke="currentColor" stroke-width="1" opacity="0.25"/>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="120" y="64" width="88" height="58" rx="6"/>
    <rect x="244" y="64" width="88" height="58" rx="6"/>
  </g>
  <line x1="130" y1="106" x2="198" y2="106" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <path d="M174 90 L188 90 L186 106 L176 106 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <g fill="none" stroke="currentColor" stroke-width="1.3">
    <path d="M146 76 L146 82"/>
    <path d="M138 82 L154 82"/>
    <path d="M138 82 L138 96"/>
    <path d="M154 82 L154 96"/>
  </g>
  <text x="256" y="90" fill="currentColor" font-size="9.5" font-family="ui-monospace, monospace" opacity="0.8">0.12  -0.38</text>
  <text x="256" y="108" fill="currentColor" font-size="9.5" font-family="ui-monospace, monospace" opacity="0.8">0.04   0.51  …</text>
  <path d="M212 93 L240 93" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#d2)"/>
  <path d="M342 93 L372 93" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#d2)"/>
  <text x="380" y="97" fill="currentColor" font-size="11">로봇</text>
  <text x="14" y="91" fill="currentColor" font-size="12.5">재료</text>
  <text x="14" y="109" fill="currentColor" font-size="10" opacity="0.6">장면 → 동작</text>
  <text x="418" y="87" fill="currentColor" font-size="11.5">GE-Act 2.0 · DreamZero</text>
  <text x="418" y="105" fill="currentColor" font-size="10" opacity="0.6">예측한 장면을 역동역학에 넣어 동작을 뽑는다</text>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="120" y="152" width="88" height="58" rx="6"/>
    <rect x="244" y="152" width="88" height="58" rx="6"/>
  </g>
  <line x1="130" y1="194" x2="198" y2="194" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <path d="M174 178 L188 178 L186 194 L176 194 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <g fill="none" stroke="currentColor" stroke-width="1.3">
    <path d="M146 164 L146 170"/>
    <path d="M138 170 L154 170"/>
    <path d="M138 170 L138 184"/>
    <path d="M154 170 L154 184"/>
  </g>
  <text x="256" y="178" fill="currentColor" font-size="9.5" font-family="ui-monospace, monospace" opacity="0.8">0.12  -0.38</text>
  <text x="256" y="196" fill="currentColor" font-size="9.5" font-family="ui-monospace, monospace" opacity="0.8">0.04   0.51  …</text>
  <path d="M240 181 L212 181" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#d2)"/>
  <path d="M164 216 L164 228 L288 228 L288 216" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" opacity="0.7" marker-end="url(#d2)"/>
  <text x="300" y="232" fill="currentColor" font-size="10" opacity="0.75">골라낸다</text>
  <path d="M342 181 L372 181" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#d2)"/>
  <text x="380" y="185" fill="currentColor" font-size="11">로봇</text>
  <text x="14" y="179" fill="currentColor" font-size="12.5">채점표</text>
  <text x="14" y="197" fill="currentColor" font-size="10" opacity="0.6">동작 → 장면</text>
  <text x="418" y="175" fill="currentColor" font-size="11.5">Cosmos Policy</text>
  <text x="418" y="193" fill="currentColor" font-size="10" opacity="0.6">후보들의 미래와 가치를 예측해 제일 좋은 걸 고른다</text>
  <rect x="114" y="252" width="224" height="70" rx="8" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4" opacity="0.45"/>
  <g fill="none" stroke="currentColor" stroke-width="2">
    <rect x="120" y="258" width="88" height="58" rx="6"/>
    <rect x="244" y="258" width="88" height="58" rx="6"/>
  </g>
  <line x1="130" y1="300" x2="198" y2="300" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <path d="M174 284 L188 284 L186 300 L176 300 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <g fill="none" stroke="currentColor" stroke-width="1.3">
    <path d="M146 270 L146 276"/>
    <path d="M138 276 L154 276"/>
    <path d="M138 276 L138 290"/>
    <path d="M154 276 L154 290"/>
  </g>
  <text x="256" y="284" fill="currentColor" font-size="9.5" font-family="ui-monospace, monospace" opacity="0.8">0.12  -0.38</text>
  <text x="256" y="302" fill="currentColor" font-size="9.5" font-family="ui-monospace, monospace" opacity="0.8">0.04   0.51  …</text>
  <path d="M212 287 L240 287" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#d2)"/>
  <path d="M342 287 L372 287" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#d2)"/>
  <text x="380" y="291" fill="currentColor" font-size="11">로봇</text>
  <text x="14" y="285" fill="currentColor" font-size="12.5">참조</text>
  <text x="14" y="303" fill="currentColor" font-size="10" opacity="0.6">동시</text>
  <text x="418" y="281" fill="currentColor" font-size="11.5">OpenWAM</text>
  <text x="418" y="299" fill="currentColor" font-size="10" opacity="0.6">다듬는 동안 동작 쪽이 장면 쪽을 계속 본다</text>
  <line x1="14" y1="140" x2="706" y2="140" stroke="currentColor" stroke-width="1" opacity="0.12"/>
  <line x1="14" y1="246" x2="706" y2="246" stroke="currentColor" stroke-width="1" opacity="0.12"/>
  <line x1="14" y1="342" x2="706" y2="342" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="364" fill="currentColor" font-size="11.5" opacity="0.7">쓰는 방식이 무엇이든 로봇으로 나가는 것은 동작, 곧 관절값 한 묶음이다.</text>
</svg>

쓰는 방식이 무엇이든 공통점은 하나입니다. **동작이 혼자 나오지 않습니다.** 같이 만들어진 장면이 근거로 붙습니다.

## 왜 이게 더 잘 됐나

기술보다 데이터 쪽이 결정적입니다. **로봇 시연은 비싸고 영상은 쌉니다.**

동작 라벨이 붙은 로봇 시연을 모으려면 사람이 로봇을 붙들고 앉아 있어야 합니다. 반면 사람이 1인칭으로 찍은 영상은 이미 세상에 넘칩니다. 문제는 그 영상에 **"그때 관절이 몇 도였는지"가 없다**는 것이었습니다.

[DreamZero](https://arxiv.org/abs/2602.15922)의 해법이 간단합니다. **채점 기준을 데이터 출처마다 다르게 둡니다.**

<svg viewBox="0 0 720 258" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="로봇 시연은 영상 예측과 동작 예측을 둘 다 채점하고, 사람 영상은 관절값에 정답이 없어서 동작 예측을 채점에서 뺀다">
  <title>데이터 출처마다 다른 채점 기준</title>
  <text x="14" y="26" fill="currentColor" font-size="12.5">로봇 시연</text>
  <text x="14" y="44" fill="currentColor" font-size="10" opacity="0.6">관절값이 붙어 있다</text>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <circle cx="40" cy="100" r="11"/>
    <path d="M40 111 L40 142"/>
    <path d="M40 142 L28 162"/>
    <path d="M40 142 L52 162"/>
    <path d="M40 120 L72 128"/>
  </g>
  <rect x="171" y="54" width="60" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="76" y="62" width="250" height="112" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="90" y="76" width="52" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <line x1="94" y1="100" x2="138" y2="100" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <path d="M122 89 L132 89 L131 100 L123 100 Z" fill="none" stroke="currentColor" stroke-width="1.1"/>
  <g fill="none" stroke="currentColor" stroke-width="1.1">
    <path d="M106 81 L106 86"/>
    <path d="M100 86 L112 86"/>
    <path d="M100 86 L100 96"/>
    <path d="M112 86 L112 96"/>
  </g>
  <text x="164" y="96" fill="currentColor" font-size="11">영상 예측</text>
  <path d="M266 90 L272 96 L284 84" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="84" y1="118" x2="318" y2="118" stroke="currentColor" stroke-width="1" opacity="0.18"/>
  <rect x="90" y="130" width="52" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <g fill="currentColor" font-size="8.5" font-family="ui-monospace, monospace" text-anchor="middle" opacity="0.8">
    <text x="116" y="144">0.12</text>
    <text x="116" y="155">-0.38</text>
  </g>
  <text x="164" y="150" fill="currentColor" font-size="11">동작 예측</text>
  <path d="M266 144 L272 150 L284 138" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <text x="76" y="196" fill="currentColor" font-size="11.5">둘 다 채점한다</text>
  <line x1="360" y1="20" x2="360" y2="206" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4" opacity="0.25"/>
  <text x="376" y="26" fill="currentColor" font-size="12.5">사람 영상</text>
  <text x="376" y="44" fill="currentColor" font-size="10" opacity="0.6">관절값이 없다</text>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <circle cx="402" cy="100" r="11"/>
    <path d="M402 111 L402 142"/>
    <path d="M402 142 L390 162"/>
    <path d="M402 142 L414 162"/>
    <path d="M402 120 L434 128"/>
  </g>
  <rect x="533" y="54" width="60" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="438" y="62" width="250" height="112" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="452" y="76" width="52" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <line x1="456" y1="100" x2="500" y2="100" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <path d="M484 89 L494 89 L493 100 L485 100 Z" fill="none" stroke="currentColor" stroke-width="1.1"/>
  <g fill="none" stroke="currentColor" stroke-width="1.1">
    <path d="M468 81 L468 86"/>
    <path d="M462 86 L474 86"/>
    <path d="M462 86 L462 96"/>
    <path d="M474 86 L474 96"/>
  </g>
  <text x="526" y="96" fill="currentColor" font-size="11">영상 예측</text>
  <path d="M628 90 L634 96 L646 84" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="446" y1="118" x2="680" y2="118" stroke="currentColor" stroke-width="1" opacity="0.18"/>
  <rect x="452" y="130" width="52" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.5"/>
  <g fill="currentColor" font-size="8.5" text-anchor="middle" opacity="0.5">
    <text x="478" y="144">정답</text>
    <text x="478" y="155">없음</text>
  </g>
  <text x="526" y="150" fill="currentColor" font-size="11" opacity="0.55">동작 예측</text>
  <g stroke="currentColor" stroke-width="1.8" opacity="0.5" stroke-linecap="round">
    <line x1="630" y1="138" x2="644" y2="152"/>
    <line x1="644" y1="138" x2="630" y2="152"/>
  </g>
  <text x="438" y="196" fill="currentColor" font-size="11.5">동작 예측은 채점에서 뺀다</text>
  <line x1="14" y1="222" x2="706" y2="222" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="244" fill="currentColor" font-size="11.5" opacity="0.7">정답이 없는 항목만 채점에서 빼면 된다. 그래서 라벨 없는 영상이 그대로 재료가 된다.</text>
</svg>

정답이 없는 항목은 채점에서 빼면 됩니다. 그래서 라벨 없는 영상도 **장면 칸을 키우는 데는 그대로 쓰입니다.** 이 방식으로 다른 로봇과 사람의 영상만 가지고 처음 보는 과제 성능을 42% 상대 개선했고, 새 로봇으로 옮길 때는 30분치 데이터로 붙였습니다. [OpenWAM](https://arxiv.org/abs/2609.07398)은 아예 1인칭 사람 영상과 로봇 영상 약 6,400시간으로 사전학습했습니다.

## 지금 어디까지 왔나

연구 단계입니다. 논문과 코드, 사전학습 체크포인트까지는 공개돼 있고 제품으로 나온 것은 아직 없습니다.

숫자부터 보겠습니다. GE-Act 2.0이 공동학습 데이터를 **300시간에서 30,000시간으로 100배** 늘려 결과를 냈습니다.

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
