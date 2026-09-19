---
title: "NVIDIA Halos — 안전 감시를 로봇 바깥에 두는 구조"
description: "감시하는 쪽은 전부 작업장에 있습니다. 블루프린트가 주는 부품 중에 로봇에 올라가는 것은 없습니다."
pubDate: 2026-09-19
category: safety-architecture
tags: ["product-analysis", "machine-safety"]
draft: true
---

<!-- ① 훅  ★ 자동화 금지 (WRITING.md §6) — 아래는 초안입니다. 본인 문장으로 고쳐 쓰세요. -->

NVIDIA가 2026년 6월 22일에 공개한 [Halos for Robotics](https://developer.nvidia.com/blog/inside-nvidia-halos-for-robotics-a-full-stack-functional-safety-system-for-physical-ai/)에는 [Outside-In Safety](https://docs.nvidia.com/halos-outside-in/latest/)라는 블루프린트가 있습니다. 부품 목록을 보면 로봇에 올라가는 것이 없습니다. 카메라는 천장에 달리고, 인지와 판단은 작업장 연산 장치에서 돌아갑니다. 로봇 쪽으로 넘어가는 것은 명령 하나이고, 그 명령을 받는 코드는 제품에 들어 있지 않습니다.

<svg viewBox="0 0 720 268" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="감시하는 장비는 전부 작업장에 설치되고, 로봇 쪽으로는 명령 하나만 건너간다">
  <title>Halos Outside-In — 감시는 작업장, 로봇은 명령만 받는다</title>
  <defs>
    <marker id="hk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>

  <g fill="currentColor" font-size="11" opacity="0.65">
    <text x="14" y="20">오프보드 — 작업장 인프라</text>
    <text x="520" y="20">온보드 — 장비</text>
  </g>

  <line x1="490" y1="30" x2="490" y2="222" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.5"/>

  <line x1="14" y1="44" x2="450" y2="44" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="92" y="44" width="34" height="16" rx="2"/>
    <rect x="300" y="44" width="34" height="16" rx="2"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.35">
    <path d="M92 60 L56 126 L162 126 Z"/>
    <path d="M300 60 L264 126 L370 126 Z"/>
  </g>
  <text x="140" y="56" fill="currentColor" font-size="10.5" opacity="0.7">고정 카메라</text>

  <line x1="14" y1="140" x2="450" y2="140" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="150" y="154" width="212" height="58" rx="6"/>
  </g>
  <text x="166" y="180" fill="currentColor" font-size="13">연산 장치</text>
  <text x="166" y="198" fill="currentColor" font-size="10.5" opacity="0.7">인지 · 이벤트 융합 · 판단</text>

  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M362 183 L508 183" marker-end="url(#hk)"/>
  </g>
  <text x="435" y="174" fill="currentColor" font-size="10.5" text-anchor="middle" opacity="0.8">명령 하나</text>

  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="530" y="140" width="176" height="72" rx="6"/>
  </g>
  <text x="546" y="172" fill="currentColor" font-size="13">장비</text>
  <text x="546" y="192" fill="currentColor" font-size="10.5" opacity="0.7">명령을 받는 코드는 직접 씁니다</text>

  <line x1="14" y1="236" x2="706" y2="236" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="14" y="256" fill="currentColor" font-size="11.5" opacity="0.7">감시하는 쪽은 전부 작업장에 있다. 경계를 넘는 것은 명령 하나다.</text>
</svg>

## 왜 바깥인가

로봇에 달린 카메라로 사람을 감지하는 기능에 안전 등급을 매기려고 하면 같은 자리에서 막힙니다. ISO 26262든 IEC 61508이든 체계적 고장에 대해 요구하는 것은 요구사항 추적성과 구조적 커버리지인데, 학습된 가중치를 상대로 그걸 만드는 방법이 아직 없습니다.

고정 카메라는 조건이 다릅니다. 시야가 고정돼 있고, 조명을 통제할 수 있고, 검증해야 할 장면의 집합이 유한합니다. 셋 다 같은 것을 뜻합니다 — 인지를 **닫힌 문제**로 줄일 수 있다는 것. 로봇에 달린 카메라는 로봇이 가는 곳마다 입력 분포가 바뀌어서 그 목록을 닫을 수 없습니다.

## 무엇으로 되어 있나

NVIDIA는 이 구조를 [풀스택](https://developer.nvidia.com/blog/inside-nvidia-halos-for-robotics-a-full-stack-functional-safety-system-for-physical-ai/)이라고 부릅니다.

| Component | What it is |
|---|---|
| IGX Thor | Thor SoC + 전용 Functional Safety Island(FSI) + 안전 MCU |
| Halos Core | 로봇에 올라가는 안전 OS. Linux 구성과 Linux+QNX 구성 |
| Holoscan Sensor Bridge | [센서·액추에이터 이더넷 링크](https://developer.download.nvidia.com/assets/igx/robotics-product-brief-igx-thor-safety-4473375.pdf). end-to-end IEC 61508 SIL 2 프로토콜 |
| AI Perception | VSS(Video Search and Summarization) 블루프린트 기반 인지. 교체 가능한 부품 |
| Safety Core | 작업장 쪽 이벤트 융합, 판단, 명령 전송 |
| Closed-Loop Testing | Isaac Sim 회귀 시험 |

이 중에서 교체를 전제로 설계된 것은 **AI Perception 하나**입니다. 카메라 배치도 감시 대상도 현장마다 다르니 인지 모델이 같을 수가 없습니다. 나머지는 뼈대입니다.

뼈대의 안쪽은 조각마다 약어 이름을 달고 있고, 문서가 그 약어로만 씁니다. [용어집](https://docs.nvidia.com/halos-outside-in/latest/reference/glossary.html)에서 옮겨 적습니다. 블루프린트 자체는 **HOISA**입니다.

| 약어 | 원어 | 하는 일 |
|---|---|---|
| SIPP | Sensor Input Processing Pipeline | 카메라·레이더 원본을 DNN·CV로 돌려 구조화된 표현으로 |
| SAIM | Safety AI Monitor | 카메라 입력이 건전한지 감시 (분포 밖 입력·가림·끊김) |
| PCM | Perception Container Monitor | 인지 파이프라인이 살아 있는지 감시 |
| SEI | Safety Event Integrator | 안전 이벤트를 시간 축으로 융합 |
| SDM | Safety Decision Maker | 융합된 사건을 명령으로 번역. UDP로 내보냄 |
| SBB · SUI | Safety Black Box · Safety User Interface | 기록·감사 추적, 운영자 화면 |

<svg viewBox="0 0 720 382" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="Safety Core 내부 — 고정 카메라에서 SIPP, SEI, SDM을 거쳐 장비로 명령이 나가고, SAIM과 PCM이 인지 건전성을 감시한다">
  <title>Safety Core 내부 파이프라인</title>
  <defs>
    <marker id="pp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>

  <g fill="currentColor" font-size="11" opacity="0.65">
    <text x="8" y="18">작업장 인프라</text>
    <text x="566" y="18">장비</text>
  </g>

  <line x1="540" y1="26" x2="540" y2="212" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.5"/>

  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.6">
    <rect x="200" y="40" width="128" height="46" rx="6"/>
    <rect x="348" y="40" width="128" height="46" rx="6"/>
    <path d="M264 86 L292 112" marker-end="url(#pp)"/>
    <path d="M412 86 L344 112" marker-end="url(#pp)"/>
  </g>
  <g fill="currentColor" font-size="12.5" opacity="0.8">
    <text x="214" y="62">SAIM</text>
    <text x="362" y="62">PCM</text>
  </g>
  <g fill="currentColor" font-size="10" opacity="0.6">
    <text x="214" y="78">입력 건전성</text>
    <text x="362" y="78">파이프라인 건전성</text>
  </g>

  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="8"   y="120" width="96"  height="64" rx="6"/>
    <rect x="124" y="120" width="118" height="64" rx="6"/>
    <rect x="262" y="120" width="108" height="64" rx="6"/>
    <rect x="390" y="120" width="118" height="64" rx="6"/>
    <rect x="566" y="120" width="146" height="64" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="20"  y="148">카메라</text>
    <text x="138" y="148">SIPP</text>
    <text x="276" y="148">SEI</text>
    <text x="404" y="148">SDM</text>
    <text x="580" y="148">장비</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="20"  y="166">고정 설치</text>
    <text x="138" y="166">원본 → 구조화</text>
    <text x="276" y="166">이벤트 융합</text>
    <text x="404" y="166">명령으로 번역</text>
    <text x="580" y="166">수신기는 직접 씁니다</text>
  </g>

  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M104 152 L120 152" marker-end="url(#pp)"/>
    <path d="M242 152 L258 152" marker-end="url(#pp)"/>
    <path d="M370 152 L386 152" marker-end="url(#pp)"/>
    <path d="M508 152 L562 152" marker-end="url(#pp)"/>
  </g>
  <text x="392" y="204" fill="currentColor" font-size="10.5" opacity="0.8">STOP · REDUCE · NORMAL</text>

  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.45">
    <path d="M180 184 L180 224"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="124" y="224" width="384" height="46" rx="6"/>
  </g>
  <text x="138" y="252" fill="currentColor" font-size="12.5">플랫폼 — IGX Thor 또는 x86-64 + GPU</text>

  <g fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.55">
    <path d="M316 270 L316 296"/>
    <rect x="124" y="296" width="384" height="46" rx="6"/>
  </g>
  <text x="138" y="324" fill="currentColor" font-size="12" opacity="0.6">Closed-Loop Testing — Isaac Sim</text>

  <line x1="8" y1="356" x2="712" y2="356" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.35"/>
  <text x="8" y="376" fill="currentColor" font-size="11.5" opacity="0.7">점선 칸은 현장이 도는 동안에는 없다. 배포 전 회귀 시험에만 쓴다.</text>
</svg>

SDM이 내보내는 명령은 셋뿐입니다. REDUCE는 문서에 정의가 없고, [레퍼런스 수신기 코드](https://github.com/NVIDIA/halos-outside-in-safety)가 SLOW DOWN으로 해석합니다.

그림 아래쪽 점선 칸은 Closed-Loop Testing입니다. Isaac Sim에서 시나리오를 돌려 회귀를 잡는 도구라, 현장이 돌아가는 동안에는 이 칸이 존재하지 않습니다. 배포 전에만 씁니다.

## 언제 쓸 수 있나

현장 조건부터 걸립니다. 감시할 구역이 고정돼 있어야 하고, 천장이나 기둥에 카메라를 달 수 있어야 하고, 조명이 통제돼야 합니다. 옥외를 돌아다니는 장비나 배치가 매번 바뀌는 비정형 환경에서는 이 구조가 애초에 성립하지 않습니다.

하드웨어는 양쪽에 다 필요합니다. [통합 가이드](https://docs.nvidia.com/halos-outside-in/latest/integration/index.html) 기준으로 인프라 쪽은 IGX-Thor 또는 x86-64에 GPU를 얹고, 인지는 Kafka로, 판단 명령은 UDP로 흐릅니다. 장비 쪽에는 그 명령을 받아 실제 동작으로 바꾸는 수신기가 있어야 하는데, **이건 제품에 들어 있지 않습니다.**

직접 써야 하는 것이 셋 더 있습니다. 이벤트 매핑 설정(Protobuf), SDM 판단 로직, 그리고 액추에이터 인터페이스입니다. 문서가 선을 직접 긋습니다.

> "SDM logic is deployment-specific; integrators implement their own behavior."
>
> — [Safety Decision Maker 문서](https://docs.nvidia.com/halos-outside-in/latest/integration/components/decision-maker.html)

[저장소](https://github.com/NVIDIA/halos-outside-in-safety)가 들고 있는 레퍼런스 시나리오는 워크셀 근접 감시(proximity)와 창고 하역장의 자율 트레일러 적재(ATL)입니다. 후자는 고정 카메라와 AI 인지가 작업자와 자율 지게차를 함께 감시하는 구성입니다. 다만 Known Limitations 기준으로 검증된 범위는 지게차 한 대, 이벤트 유형 세 종입니다. README도 같은 선을 긋습니다 — 프로토타이핑과 통합 개발용이고, 자체 인증된 안전 계층 없이 양산 안전 시스템에 쓰지 말라고 적혀 있습니다.

## 지금 어디까지 왔나

[생태계에는 40곳이 넘는 회사](https://nvidianews.nvidia.com/news/nvidia-announces-halos-for-robotics-the-industrys-first-full-stack-safety-system-for-physical-ai)가 들어와 있습니다. 인증기관만 TÜV Rheinland, TÜV SÜD, UL Solutions, exida, SGS, CertX 여섯 곳이고, 반도체 쪽에 Infineon·NXP·STMicroelectronics·TI, 산업 응용 쪽에 FORT Robotics와 KION Group이 있습니다.

제일 구체적인 이름은 [Agility Robotics](https://nvidianews.nvidia.com/news/nvidia-announces-halos-for-robotics-the-industrys-first-full-stack-safety-system-for-physical-ai)입니다. 휴머노이드 Digit의 **자체 사람 감지 시스템**에 IGX Thor와 Halos Core를 넣고 있습니다. Outside-In이 아니라 온보드 쪽입니다. 단계는 통합 중이고, 랩에서 Digit의 안전 소프트웨어와 AI 구성요소, 보안을 점검하겠다는 계획까지입니다. 출하도 인증도 아닙니다.

표준 쪽도 움직입니다. NVIDIA는 능동 안정 로봇을 다루는 [ISO 25785-1에 "active contribution" 중](https://developer.nvidia.com/blog/inside-nvidia-halos-for-robotics-a-full-stack-functional-safety-system-for-physical-ai/)이라고 밝히고, 기능안전과 AI를 다루는 ISO/IEC TS 22440을 준비 중인 표준으로 듭니다. 다만 협동로봇 쪽 ISO 10218-1:2025와 개인 지원 로봇 쪽 ISO 13482는 제가 확인한 Halos 자료 어디에도 없습니다.

남는 질문은 하나입니다. 이 구조가 고정 워크셀 바깥으로 나갈 수 있는가. Inside-Out 쪽 저장소는 공개돼 있지 않아서 온보드 절반은 문서로만 봤고, 그래서 아직 답을 못 하겠습니다.

## 마무리

지금까지 Halos for Robotics가 안전 감시를 어디에 두었는지, 무엇으로 되어 있고 어떤 현장에 쓸 수 있는지 알아봤습니다.

감시하는 쪽은 전부 작업장에 있습니다. 로봇이 받는 것은 명령 하나이고, 그 명령을 받아 무엇을 할지는 로봇 만드는 쪽이 씁니다.

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
