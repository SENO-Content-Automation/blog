---
title: "NVIDIA Halos — 안전 감시를 로봇 바깥에 두는 구조"
description: "구성 요소 목록에 로봇에 올라가는 것이 하나도 없습니다. 카메라도 연산 보드도 작업장에 설치됩니다."
pubDate: 2026-09-19
category: safety-architecture
tags: ["product-analysis", "machine-safety"]
draft: true
---

<!-- ① 훅  ★ 자동화 금지 (WRITING.md §6) — 아래는 초안입니다. 본인 문장으로 고쳐 쓰세요.
     지시: 2026년 6월 22일 공개 / 구성 요소 목록에 로봇에 올라가는 게 없다는 사실 하나로 시작 -->

NVIDIA가 2026년 6월 22일에 공개한 Halos for Robotics에는 Outside-In Safety라는 블루프린트가 들어 있습니다. 구성 요소 목록을 보면 로봇에 올라가는 것이 하나도 없습니다. 카메라도, 인지 파이프라인도, 판단을 내리는 연산 보드도 전부 작업장에 설치됩니다. 로봇 쪽으로 넘어가는 것은 명령 하나입니다.

## 왜 바깥인가

로봇에 달린 카메라로 사람을 감지하는 기능에 안전 등급을 매기려고 하면 같은 자리에서 막힙니다. ISO 26262든 IEC 61508이든 체계적 고장에 대해 요구하는 것은 요구사항 추적성과 구조적 커버리지인데, 학습된 가중치를 상대로 그걸 만드는 방법이 아직 없습니다.

고정 카메라는 조건이 다릅니다. 시야가 고정돼 있고, 조명을 통제할 수 있고, 검증해야 할 장면의 집합이 유한합니다. 같은 인지 문제를 **경계가 그어진 쪽**으로 옮긴 셈입니다.

<!-- ▸ 자동차↔로봇 대비  ★ 자동화 금지 (WRITING.md §6) — 아래 문단이 그 자리입니다. 본인 경험으로 고쳐 쓰세요. -->

자동차에는 이 선택지가 없습니다. 도로 전체에 카메라를 달아 차를 감시할 수는 없으니, 인지는 차에 실려야 하고 등급 문제도 차 안에서 풀어야 합니다. 공장 벽에는 카메라를 답니다. 로봇 안전에는 자동차에 없는 선택지가 하나 더 있고, Halos는 그 선택지를 고른 제품입니다.

## 무엇으로 되어 있나

NVIDIA는 이 구조를 풀스택이라고 부릅니다. 세로로는 맞는 말입니다. 실리콘부터 애플리케이션까지 한 벤더가 채웁니다.

| 구성 요소 | 무엇 | 오늘 상태 |
|---|---|---|
| IGX Thor | Thor SoC + 전용 Functional Safety Island(FSI) + 안전 MCU | TÜV Rheinland 검사 중 |
| Halos Core | 안전 OS 층. Linux 구성과 Linux+QNX 구성 | 얼리 액세스 |
| AI Perception | VSS 블루프린트 기반 인지. 교체 가능한 부품 | 얼리 액세스 |
| Safety Core | 이벤트 통합, 판단, 명령 전송 | 얼리 액세스 |
| Edge Safety Link (HSB) | 센서·액추에이터 이더넷 링크. end-to-end IEC 61508 SIL 2 프로토콜 | 검사 중 |
| Closed-Loop Testing | Isaac Sim 회귀 시험 | 런타임 컴포넌트 아님 |

교체를 전제로 설계된 것은 **AI Perception 하나**입니다. 카메라 배치도 감시 대상도 현장마다 다르니 인지 모델이 같을 수가 없습니다. 나머지는 뼈대고, 그 뼈대가 하는 일은 여러 이벤트를 하나의 판단으로 줄이는 것입니다. 파이프라인은 SIPP에서 시작해 SAIM, PCM, SEI를 거쳐 SDM으로 가고, 거기서 나가는 명령은 STOP과 REDUCE와 NORMAL 셋뿐입니다.

표의 마지막 줄만 성격이 다릅니다. Isaac Sim으로 돌리는 회귀 시험이라 런타임에는 존재하지 않습니다. 아래 그림에서 점선으로 떼어 놓은 칸입니다.

<svg viewBox="0 0 720 320" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="Halos Outside-In Safety 구조 — 작업장에 고정된 카메라에서 AI 인지와 Safety Core를 거쳐 장비로 명령이 간다">
  <title>Halos Outside-In Safety 구조</title>
  <defs>
    <marker id="hx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>

  <g fill="currentColor" font-size="11" opacity="0.65">
    <text x="14" y="20">오프보드 — 인프라 측</text>
    <text x="558" y="20">온보드 — 장비 측</text>
  </g>

  <line x1="546" y1="28" x2="546" y2="306" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.5"/>

  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="14"  y="46" width="104" height="72" rx="6"/>
    <rect x="142" y="46" width="168" height="72" rx="6"/>
    <rect x="334" y="46" width="176" height="72" rx="6"/>
    <rect x="578" y="46" width="128" height="72" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13">
    <text x="30"  y="72">고정 카메라</text>
    <text x="158" y="72">AI Perception</text>
    <text x="350" y="72">Safety Core</text>
    <text x="592" y="72">장비</text>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.7">
    <text x="30"  y="92">워크셀 감시</text>
    <text x="158" y="92">VSS Blueprint</text>
    <text x="158" y="107">교체 가능한 부품</text>
    <text x="350" y="92">이벤트 통합 · 판단</text>
    <text x="350" y="107">STOP · REDUCE · NORMAL</text>
    <text x="592" y="92">지게차 · 휴머노이드</text>
  </g>

  <g fill="none" stroke="currentColor" stroke-width="1.4">
    <path d="M118 82 L138 82" marker-end="url(#hx)"/>
    <path d="M310 82 L330 82" marker-end="url(#hx)"/>
    <path d="M510 82 L574 82" marker-end="url(#hx)"/>
  </g>
  <g fill="currentColor" font-size="10.5" opacity="0.8">
    <text x="322" y="36" text-anchor="middle">structured events</text>
    <text x="512" y="36">명령</text>
  </g>

  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.45">
    <path d="M226 118 L226 148"/>
    <path d="M422 118 L422 148"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="142" y="148" width="368" height="58" rx="6"/>
  </g>
  <text x="158" y="174" fill="currentColor" font-size="13">플랫폼 — IGX Thor + Halos Core</text>
  <text x="158" y="192" fill="currentColor" font-size="10" opacity="0.7">separation · fault reporting · heartbeat · supervision</text>

  <g fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity="0.55">
    <path d="M326 206 L326 244"/>
    <rect x="142" y="244" width="368" height="56" rx="6"/>
  </g>
  <text x="158" y="268" fill="currentColor" font-size="12.5" opacity="0.6">오프라인 — Closed-Loop Testing</text>
  <text x="158" y="286" fill="currentColor" font-size="10" opacity="0.5">Isaac Sim · 회귀 리포트 — 런타임 안전 컴포넌트가 아님</text>
</svg>

## 언제 쓸 수 있나

저장소에 레퍼런스 시나리오가 둘 들어 있습니다. proximity는 워크셀 근접 감시입니다. ATL은 Autonomous Trailer Loading, 창고 하역장에서 고정 카메라와 AI 인지가 작업자와 자율 지게차를 함께 감시하는 구성입니다.

둘의 공통점이 도입 조건을 그대로 말해줍니다. 감시할 구역이 고정돼 있고, 천장이나 기둥에 카메라를 달 수 있고, 무엇을 감시할지 미리 적을 수 있는 현장입니다. 옥외를 돌아다니는 장비나 매번 배치가 바뀌는 비정형 환경에서는 이 구조가 애초에 성립하지 않습니다.

조건이 하나 더 있고, 이게 제일 큽니다. 판단 로직은 제품에 들어 있지 않습니다.

> "SDM logic is deployment-specific; integrators implement their own behavior."

Halos가 주는 것은 카메라에서 명령까지 가는 경로와 뼈대입니다. 그 경로 위에서 무엇을 STOP으로 볼지는 통합자가 배포마다 직접 씁니다. 저장소 README도 같은 선을 긋습니다. 프로토타이핑과 통합 개발용이고, 자체 인증된 안전 계층 없이 양산 안전 시스템에 쓰지 말라고 적혀 있습니다. Known Limitations 기준으로 검증된 범위는 지게차 한 대, 이벤트 유형 세 종입니다.

## 무엇이 "인증"되는가

실무에서 제일 먼저 확인하는 칸입니다. 그런데 자료마다 단어가 다릅니다.

IGX Thor 안전 브리프는 개발 프로세스에 대해 "compliant with ISO 26262 up to ASIL D"라고 씁니다. 같은 문서가 실물 실리콘에 대해서는 "random hardware integrity of ASIL B"라고 씁니다. 체계적 고장과 랜덤 하드웨어 고장은 표준이 따로 요구하는 축이고, 헤드라인에 걸리는 쪽은 앞의 D입니다. SIL 3이 붙는 것도 범용 컴퓨트가 아니라 **Safety Island뿐**입니다.

검사 체계도 한 칸씩 밀어서 읽어야 합니다. ANAB이 인정한 것은 NVIDIA Halos AI Systems Inspection Lab을 ISO/IEC 17020 **검사기관**으로 인정한 것이지 제품을 인증한 것이 아닙니다. 파트너가 이 랩을 통과하면 검사 보고서와 검사 증서를 받고, NVIDIA 자신의 표현으로는 그것을 "follow-up certification activities"에 쓰라는 것입니다.

그래서 세 칸이 갈립니다. 검사 프로그램의 인정은 끝났고, Halos 부품의 인증은 진행 중이고, Halos를 쓴 로봇의 인증은 시작도 하지 않았습니다. 마지막 칸은 NVIDIA가 대신 해줄 수 있는 일도 아닙니다. 제가 확인한 범위에서 "certified"라는 단어는 NVIDIA의 Halos 기술 자료에 한 번도 나오지 않습니다. 그 자리를 capable, compatible, compliant, readiness가 채우고 있습니다.

<!-- ⑥ 처음엔 이렇게 생각했다  ★ 자동화 금지 (WRITING.md §6)
     아래는 조사 노트에 적힌 세 가지를 옮긴 것입니다. 본인 이야기로 고쳐 쓰세요. -->

## 처음엔 이렇게 생각했다

자료를 읽기 전에 세운 논지는 "Halos는 안전 상태를 정의하지 않는다"였습니다. 틀렸습니다. 문서에 STOP과 REDUCE와 NORMAL이 있고, 안전 상태를 래치하는 규칙이 있고, 래치를 푸는 3단 핸드셰이크까지 적혀 있습니다. 비어 있는 것은 그 다음 칸이었습니다. 명령을 받은 장비가 물리적으로 무엇을 하는가.

"비상정지 용어가 아예 없다"고 적어둔 것도 틀렸습니다. 저장소 헤더 `pss_protocol.h:75`에 ESTOP이 있습니다. 문서에 안 나올 뿐입니다.

제일 부끄러운 건 세 번째입니다. "NVIDIA가 로봇 표준을 무시한다"고 적어뒀다가, 기술 블로그에서 ISO 25785-1에 active contribution 중이라는 문장을 찾았습니다. 능동 안정 로봇을 다루는 표준입니다. 적합성 주장이 아니라 작성 참여지만, 무시한다는 말은 성립하지 않습니다. 보도자료만 읽고 판단했던 겁니다. ISO 10218-1:2025와 ISO 13482가 자료에 없는 것은 맞습니다.

<!-- ⑦ 아직 모르는 것  ★ 자동화 금지 (WRITING.md §6)
     아래는 조사 노트의 세 항목을 옮긴 것입니다. 본인이 확인 못 한 것으로 고쳐 쓰세요. -->

## 아직 모르는 것

저장소의 명령 수신기 코드는 첫 줄에서 스스로 Simulates라고 밝힙니다. 레퍼런스 데모의 동작이지 제품 기본값이 아닙니다. 거기서 본 타이밍이나 상태 전이는 실제 배포의 값이 아닙니다.

실제 IGX Thor 배포에서 FSI가 이 값들을 어떻게 쓰는지는 공개 자료로 확인하지 못했습니다. Inside-Out 쪽 저장소는 공개돼 있지 않습니다. 온보드 절반은 문서만 보고 쓴 셈입니다.

---

## Reference

| 무엇 | 어디 |
|---|---|
| 블루프린트 저장소 | [NVIDIA/halos-outside-in-safety](https://github.com/NVIDIA/halos-outside-in-safety) — Apache-2.0. ESTOP은 `pss_protocol.h:75` |
| SDM 위임 문장 | [integration/components/decision-maker](https://docs.nvidia.com/halos-outside-in/latest/integration/components/decision-maker.html) |
| IGX Thor 안전 브리프 | [robotics-product-brief-igx-thor-safety (PDF)](https://developer.download.nvidia.com/assets/igx/robotics-product-brief-igx-thor-safety-4473375.pdf) |
| 발표 기술 블로그 | [Inside NVIDIA Halos for Robotics](https://developer.nvidia.com/blog/inside-nvidia-halos-for-robotics-a-full-stack-functional-safety-system-for-physical-ai/) — 2026-06-22 |
| 제품 페이지 | [AI Trust Center — Halos for Robotics](https://www.nvidia.com/en-us/ai-trust-center/halos/robotics/) |
| 검사기관 인정 | [ANAB accredits NVIDIA Halos AI Inspection Lab](https://anab.ansi.org/anab-accredits-nvidia-halos-ai-inspection-lab-advancing-independent-assurance-for-physical-ai-safety/) — ISO/IEC 17020 |
| 제3자 검사 현황 | [TÜV Rheinland 성명](https://www.qualitydigest.com/inside/manufacturing-news/tuv-rheinland-supports-nvidia-functional-safety-certification-expertise) — 2026-07-09, certification readiness |


<!-- ─────────────────────────────────────────
     발행 전 체크 (docs/WRITING.md §7)
     □ 첫 두 줄이 정의문이 아닌가
     □ 숫자·버전·조항이 최소 하나
     □ 틀렸던 이야기가 있는가
     □ 모르는 것을 밝혔는가
     □ 자동차 ↔ 로봇 대비가 한 번 이상
     □ 불릿이 절반을 넘지 않는가
     □ 다음 글 예고가 없는가
     □ grep -rnP '\*\*[^*]*[)\]\.,:;!?]\*\*[가-힣]' src/content/posts/
     ───────────────────────────────────────── -->
