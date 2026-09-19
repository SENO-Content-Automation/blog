---
title: "NVIDIA Halos — 안전 감시를 로봇 바깥에 두는 구조"
description: ""
pubDate: 2026-09-19
category: safety-architecture
tags: ["product-analysis", "machine-safety"]
draft: true
---

<!-- ══════════════════════════════════════════════════════════
     3편 작업 지시서 — 목차는 합의됨, 본문만 채우면 됨
     추가 조사 불필요. 재료는 전부 docs/research/ 에 있음.

     논지 한 줄:
       Halos for Robotics는 로봇의 안전 감시를 로봇이 아니라
       작업장 인프라에 둔 구조다. 그래서 쓸 수 있는 현장과
       없는 현장이 갈린다.

     목표 분량 ~3,350자 / 7분
     ⚠ 코드에서 나온 발견(MUTE 방향·54.5초·옵코드 충돌·래치 극성)은
       전부 4편 몫. 이 글에 넣지 말 것. 예고도 하지 말 것(WRITING.md §3).
     ══════════════════════════════════════════════════════════ -->


<!-- ① 훅  ~200자  ★ 자동화 금지 (WRITING.md §6)
     2026년 6월 22일 공개.
     구성 요소 목록에 로봇에 올라가는 게 없다는 사실 하나로 시작.
     카메라도 연산 장치도 작업장에 설치됨.
     정의문으로 시작하지 말 것. -->


## 왜 바깥인가

<!-- ② ~450자  ★뼈대 — WRITING.md §3의 "왜 이게 지금 나왔나"
     · 온보드 인지에는 등급을 매길 수 없다
       — 학습된 가중치에 요구사항 추적과 구조적 커버리지를 만들 방법이 없음
     · 고정 카메라는 다르다 — 시야 고정, 조명 통제, 검증할 장면이 유한

     ▸ 자동차↔로봇 대비 (★ 자동화 금지, 글당 최소 1회):
       도로에는 카메라를 못 단다. 공장 벽에는 단다.
       로봇 안전에는 자동차에 없는 선택지가 하나 더 있다. -->


## 무엇으로 되어 있나

<!-- ③ ~800자 + 아래 다이어그램
     표 하나로:
       IGX Thor       Thor SoC + FSI + 안전 MCU
       Halos Core     OS 층 (Linux / Linux+QNX)
       AI Perception  VSS 블루프린트 — 교체 가능한 부품
       Safety Core    이벤트 통합 · 판단 · 명령 전송
       Edge Safety Link / HSB
       Closed-Loop Testing   Isaac Sim — 런타임 컴포넌트 아님 -->

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

<!-- ④ ~700자
     맞는 곳:  고정 워크셀, 카메라 설치 가능, 감시 대상이 정해진 구역 안
     레퍼런스 시나리오 둘:
        · proximity — 근접 감시
        · ATL (Autonomous Trailer Loading) — 자율 트레일러 적재
     안 맞는 곳: 옥외 이동, 비정형 환경, 카메라 설치 불가

     ▸ 도입 조건 하나 더:
       판단 로직(SDM)은 배포마다 통합자가 구현한다.
       Halos가 주는 건 경로와 뼈대지 정책이 아니다.
       (원문: "SDM logic is deployment-specific;
                integrators implement their own behavior.") -->


## 무엇이 "인증"되는가

<!-- ⑤ ~550자  ★ 실무 독자가 제일 먼저 확인하는 것
     단어가 전부 다르다는 게 요지. 원문 표현 그대로 인용할 것.
       · "compliant with ISO 26262 up to ASIL D"      ← 개발 프로세스가
       · "random hardware integrity of ASIL B"         ← SoC 자체는
         (Safety Island는 IEC 61508 SIL 3)
       · Halos AI Systems Inspection Lab
         = ANAB 인정 ISO/IEC 17020 검사기관. 제품 인증 기관이 아님
       · 고객이 받는 것: inspection report + inspection certificate.
         최종 인증은 별도 기관에서.
     "certified"라는 단어는 문서 어디에도 나오지 않는다. -->


## 처음엔 이렇게 생각했다

<!-- ⑥ ~350자  ★ 자동화 금지 (WRITING.md §6)
     조사 과정에서 실제로 틀렸던 것 — 본인 것으로 바꿔 써도 됨:

     | 처음 생각 | 실제 |
     | "Halos는 안전 상태를 정의하지 않는다"
       → 정의한다. STOP/REDUCE/NORMAL, 래치, SAFE_RELEASE 3단 핸드셰이크까지.
         비어 있는 건 그 다음 — 명령을 받은 장비가 물리적으로 무엇을 하는가
     | "Halos에 비상정지 용어가 없다"
       → pss_protocol.h:75 에 ESTOP이 있다. 문서에 없을 뿐
     | "NVIDIA가 로봇 표준을 무시한다"
       → 기술 블로그에 ISO 25785-1 "active contribution"이 적혀 있다.
         ISO 10218-1:2025 과 ISO 13482 가 빠진 건 맞다

     세 번째가 제일 쓸모 있음 — 자료만 읽고 판단했다가
     원문에서 반대 문장을 찾은 경우 -->


## 아직 모르는 것

<!-- ⑦ ~300자  ★ 자동화 금지 (WRITING.md §6)
     · 저장소의 수신기 코드는 스스로 "Simulates"라고 밝힌다. 제품 기본값이 아님
     · 실제 IGX Thor 배포에서 FSI가 이 값들을 어떻게 쓰는지는 공개 자료로 확인 못 함
     · Inside-Out 쪽 저장소는 공개돼 있지 않음 -->


---

## 참고

<!-- ⑧ 1차 출처만. 파일:줄번호까지.
     - NVIDIA/halos-outside-in-safety (Apache-2.0)
     - IGX Thor 안전 제품 브리프
     - NVIDIA 기술 블로그 (2026-06-22) -->


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
