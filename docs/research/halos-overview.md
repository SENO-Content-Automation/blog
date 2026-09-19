# NVIDIA Halos for Robotics — 자료조사

> 발표 2026-06-22 · 조사일 2026-09-12
> 표기: 표시 없음 = 1차 출처 확인 / **[S]** 2차 출처만 / **[U]** 미확인 — 사실로 쓰지 말 것

---

## ★ 먼저 — 논지를 고쳐야 합니다

원래 세웠던 논지: *"Halos는 안전 상태에 대해 침묵한다"*
**이건 틀렸습니다. 그대로 쓰면 부당한 글이 됩니다.**

Halos는 safe state를 다룹니다. 다만 **명령·래치 프로토콜로** 다룹니다.
`STOP 0x02` / `REDUCE 0x05` / `NORMAL 0x07` 같은 실제 opcode가 있고,
안전 상태를 래치하고 해제하는 핸드셰이크(`CMD_SAFE_RELEASE_REQUEST 0x08` →
`CMD_SAFE_RELEASE_ACK 0x09` → `CMD_UNMUTE`)까지 문서화돼 있습니다.

**진짜 균열은 그 다음 한 줄에 있습니다.**

> **"SDM logic is deployment-specific; integrators implement their own behavior."**
> https://docs.nvidia.com/halos-outside-in/latest/integration/components/decision-maker.html

그리고 문서 어디에도 **`STOP`을 받은 로봇이 물리적으로 무엇을 해야 하는지**가 없습니다.

### 고친 논지

> Halos는 **"멈춰라"를 결정합니다. "어떻게 멈추나"는 로봇 제조사 몫입니다.**
> 지게차에게 그 경계는 평범합니다. Digit에게는 그게 안전 문제의 전부입니다.

"풀스택"은 **수직으로는 사실**입니다(실리콘 → OS → 애플리케이션).
다만 스택이 **명령 경계에서 끝납니다.**

---

## 1. 제품 해부

| 구성요소 | 무엇인가 | 계층 | 온보드/오프보드 | 상태 |
|---|---|---|---|---|
| **IGX Thor** | Thor SoC 기반 SoM, 전용 Functional Safety Island(FSI) 탑재 | 실리콘/보드 | 온보드 | TÜV **검사 중**, 인증 아님 |
| **Halos Core** | 안전 OS. Linux 및 Linux+QNX 구성 | OS | 온보드 | **얼리 액세스** |
| **Halos OS** | 우산 개념: Halos Core + SEP + HSB | OS/미들웨어 | 온보드 | 얼리 액세스 |
| **SEP** (Safety Extensions Package) | HW 오류를 FSI·Safety MCU로 수집·전달. *"Safe State and FuSa State monitoring and heartbeat"* | 미들웨어 | 온보드 | 번들 |
| **HSB** (Holoscan Sensor Bridge) | 센서·액추에이터 이더넷 링크. *"end-to-end IEC 61508 SIL 2 safety protocol"* | I/O | 온보드 + 센서단 | 검사 중 |
| **Outside-In Safety Blueprint** | **외부 인프라 카메라** + AI 에이전트가 로봇 거동을 제어 | 애플리케이션 | **오프보드** | 얼리 액세스, GitHub |

**온보드/오프보드 구분이 가장 깔끔한 축입니다.** Outside-In만 인프라 쪽입니다 —
고정 카메라가 하역장을 감시하는 구조. 즉 **워크셀 안전 아키텍처지 로봇 동역학 아키텍처가 아닙니다.**

Outside-In 내부 파이프라인: SIPP → SAIM(Safety AI Monitor) → PCM → SEI → **SDM(Safety Decision Maker)** → SBB(Safety Black Box) / SUI

출처:
- 제품 페이지 https://www.nvidia.com/en-us/ai-trust-center/halos/robotics/
- 기술 블로그 https://developer.nvidia.com/blog/inside-nvidia-halos-for-robotics-a-full-stack-functional-safety-system-for-physical-ai/
- GitHub https://github.com/NVIDIA/halos-outside-in-safety
- 문서 https://docs.nvidia.com/halos-outside-in/latest/
- IGX 안전 브리프 PDF https://developer.download.nvidia.com/assets/igx/robotics-product-brief-igx-thor-safety-4473375.pdf

---

## 2. 인증 — 정확도의 핵심

### ANAB 인정은 ISO/IEC 17020 **검사기관** 인정입니다. 제품 인증이 아닙니다.

- ANAB이 인정한 것: **NVIDIA Halos AI Systems Inspection Lab** 을 ISO/IEC 17020 검사기관으로.
  ANAB 표현: *"ANAB's first accredited inspection program for the safety of physical AI systems"*
  https://anab.ansi.org/anab-accredits-nvidia-halos-ai-inspection-lab-advancing-independent-assurance-for-physical-ai-safety/

- ★ **NVIDIA 자신의 표현이 가장 인용할 만합니다:**
  > *"The Halos AI Systems Inspection Lab **complements existing certification efforts** by focusing
  > on safer and more secure integration with Halos elements, providing structured documentation
  > outcomes that can be used in **follow-up certification activities**."*

- 통과가 무엇을 뜻하는지, NVIDIA FAQ:
  > *"It means the product has passed rigorous **product documentation inspections by NVIDIA
  > safety and regulatory experts**…"*
  → **NVIDIA가 파트너의 문서를 검사**합니다. 인정된 체계 하에서지만, 제3자 인증은 아닙니다.

- 보도자료: 이 랩이 *"helping partners **prepare** Halos integrations for third-party certification"*

**글에 쓸 3단 구분:**
NVIDIA **검사 프로그램**의 인정(완료, ISO/IEC 17020)
≠ **Halos 부품**의 인증(미완)
≠ Halos를 쓰는 **로봇**의 인증(미완, 그리고 NVIDIA가 할 수 있는 일도 아님)

### 오늘 기준 제3자 평가 현황 — **인증된 것은 없습니다**

TÜV Rheinland가 IGX Thor · Halos OS · Holoscan Sensor Bridge를 IEC 61508 / ISO 13849 대비
**"functional safety certification readiness"** 로 검사 중(2026-07-09).
"readiness"가 핵심 헤지입니다.
https://www.qualitydigest.com/inside/manufacturing-news/tuv-rheinland-supports-nvidia-functional-safety-certification-expertise

생태계 참여 인증기관: UL Solutions, TÜV SÜD, exida, SGS, CertX

### ★ SIL/PL/ASIL — ISO 26262 하던 사람이 잡아낼 지점

IGX Thor 안전 브리프 원문. **개발 프로세스 역량과 랜덤 하드웨어 무결성이 갈라져 있습니다:**

> *"compliant with ISO 26262 up to **ASIL D** and compatible up to IEC 61508 **SIL 3 / SC 3**"*
> ← 하드웨어·소프트웨어 **개발 프로세스**

> *"meets the applicable ISO 26262 requirements for **random hardware integrity of ASIL B**
> and compatible up to IEC 61508 **SIL 2 (SIL 3 for Safety Island)**"*

기술 블로그:
> *"IEC 61508 **SIL 3 capable** Safety Island (FSI)"* — up to 12K DMIPs
> *"ASIL and SIL decomposition (GPU/CPU, GPU/PVA, CCPLEX CPU/FSI CPU)"*
> *"end-to-end IEC 61508 SIL 2 safety protocol"* (HSB)
> *"Over **22,000 safety mechanisms** provide diagnostic coverage"*

**모든 단어가 "capable" · "compatible" · "compliant[개발 표준 대비]" 입니다. "certified"는 한 번도 없습니다.**
헤드라인 SIL 3은 **Safety Island에만** 해당하고, 범용 컴퓨트는 랜덤 하드웨어 무결성 기준
**ASIL B / SIL 2** 입니다. 이 간극은 정당하게 쓸 수 있습니다.

---

## 3. 계보 — 자동차가 먼저, 확인됨

**Halos는 15개월 먼저 자율주행용으로 발표됐습니다. 2025-03-18, GTC.**
https://blogs.nvidia.com/blog/halos-safety-system-autonomous-vehicles

당시 구조: 3계층(기술/개발/연산), 표준 ISO 26262(ASIL D)·ISO/SAE 21434·UNECE.
AI Systems Inspection Lab도 그때 출범(창립 멤버 Ficosa, OMNIVISION, onsemi, Continental).

### ★ "엔지니어링 연" 숫자가 이식(porting) 훅의 결정적 증거입니다

| 시점 | 문구 |
|---|---|
| 2025-03 (자율주행) | *"**15,000+** engineering years invested in vehicle safety"* |
| 2026-06 (로보틱스) | *"Drawing on **18,600+** engineering years of **autonomous vehicle safety development**, NVIDIA Halos for Robotics provides developers with a common safety architecture…"* |

로보틱스 피치가 **자동차 개발 공수를 명시적·수치적으로 상속**합니다.
NVIDIA는 18,600이 무엇을 포함하는지, 어떻게 셌는지, 로봇에 해당하는 비중이 얼마인지 밝히지 않습니다.
**[U]** 두 숫자 모두 산출 방법 미공개.

---

## 4. 간극 — 논지를 공정하게 검증

### Halos가 **말하는** 것 (논지가 양보해야 하는 부분)

Outside-In 심층 문서는 safe state를 **씁니다.** 다만 **지게차**에 대한 래치 신호 상태로서:

> *"When the Safety Decision Maker detects a safety-path fault, it **latches the safe state**:
> it sends `CMD_UNMUTE` (prevent operation) followed by `CMD_SW_ERROR`, and keeps re-asserting that pair."*

> *"Once the Safety Decision Maker latches a safe state, clearing the originating fault does not
> by itself resume normal operation. The latch is released only by a safe-release request…"*

실제 opcode: **STOP `0x02`, REDUCE `0x05`, NORMAL `0x07`** (UDP)
SEP도 *"Safe State and FuSa State monitoring and heartbeat mechanism at various layers"* 수행.

공정하게 덧붙일 것 — 축퇴 모드도 있습니다. SAIM이 *"out-of-distribution inputs, camera blockage,
connectivity drops"* 를 탐지하면 SDM이 *"fall back to a safe operating state"* 합니다.

### Halos가 **말하지 않는** 것 — 진짜 간극

**① 로봇 쪽 반응이 명시적으로 위임됩니다.** 찾은 것 중 가장 중요한 한 문장:
> **"SDM logic is deployment-specific; integrators implement their own behavior."**

문서는 **`STOP`을 받은 로봇이 무엇을 해야 하는지 규정하지 않습니다.**
지게차에는 자명하고, 균형 잡는 이족보행에는 **미해결 제어 문제**입니다.

**② Blueprint README가 양산 안전 사용을 직접 부인합니다** — 원문:
> *"Built for prototyping, evaluation, and integration development — **not for production use in
> safety-related systems without your own certified safety layer.**"*

**③ 용어 부재.** 기술 블로그·제품 페이지·Outside-In 문서·README·IGX 안전 브리프를 통틀어
다음 용어가 **나오지 않습니다**: emergency stop, e-stop, **stop category (0/1/2)**,
protective stop, safety-rated stop, **fall/falling**, **balance**, **legged**,
dynamically stable, power loss, fail-safe, fail-operational.
"Humanoid"는 시장 범위 단어로만 등장(*"industrial robots, humanoids, and autonomous mobile robots"*).

**④ 레퍼런스 사례가 휴머노이드가 아니라 바퀴 달린 지게차입니다.**
> *"Automated Trailer Loading: at a warehouse loading dock, fixed cameras and AI perception
> monitor workers and autonomous forklifts…"*

Known Limitations: **지게차 1대**에 대해서만 검증, 이벤트 유형 3종만 지원, 그리고 —
> *"the forklift controller is a **stimulus generator**: it drives a fixed path and
> **does not consume the safety command**."*
→ **루프가 실제로 닫혀 있지 않습니다.**

**⑤ 보안 관련 실제 발견** (Known Limitations):
> *"The communication layer binds its OPC UA server and its safety command port on all interfaces
> with **no authentication and no source-address filter**."*

### 표준 부재 — 사실이지만 한 가지 정정 필요

보도자료가 드는 표준: IEC 61508 · ISO 13849 · ISO/IEC TR 5469 · ISO 26262. 로봇 전용 표준 없음. 확인됨.

**그런데 기술 블로그는 보도자료보다 더 나갑니다. 이걸 인정하지 않으면 부당한 글이 됩니다:**
- **"active contribution to ISO 25785-1"** — 능동 안정 로봇 표준. **작성 참여**이지 적합성 주장이 아님
- *"ISO/IEC TS 22440, an emerging standard for functional safety and AI"*

**ISO 10218-1:2025 와 ISO 13482 는 확인한 모든 NVIDIA Halos 자료에 없습니다.**
Halos 주변에서 ISO 10218이 언급되는 유일한 곳은 **파트너 NexCOBOT**이 자사 기존 제품을
설명하는 대목(*"SIL2, PLd Cat.3 safety-certified motion modules"*)이고 NVIDIA도 Halos도 아닙니다.

→ **정확한 표현**: *"NVIDIA는 기계류·자동차 기능안전 표준을 인용하고 ISO 25785-1에 기여 중이라고
밝히는데, ISO 10218-1:2025와 ISO 13482는 언급이 없다"*
— *"로봇 표준을 무시한다"* 가 아닙니다.

### 어디를 뒤졌는지 (글에 "찾아봤지만 없었다"를 쓰려면 필요)

nvidianews 보도자료 · investor.nvidia.com · developer.nvidia.com 기술 블로그 ·
ai-trust-center/halos/robotics · ai-trust-center/physical-ai/safety-certification ·
ai-trust-center/halos/autonomous-vehicles · IGX Thor 안전 브리프 PDF ·
Halos Safety Evaluation Framework Tech Brief PDF · GitHub README ·
docs.nvidia.com/halos-outside-in (index, deployment, integration, SDM, glossary,
known limitations, release notes) · ANAB 인정 발표 · TÜV Rheinland 성명 ·
The Robot Report · Futurum 분석 · Koopman·GTC 세션·ISO 10218/13482/25785 타깃 검색

⚠️ 방법론 한계: nvidia.com 도메인에 대한 `curl`이 프록시에 막혀서, "없음" 판정은
기계적 grep이 아니라 **항목별 질의를 통한 강한 추론**입니다.

---

## 5. Agility Robotics / Digit

**검증 가능한 Agility 발언은 NVIDIA 보도자료 안의 CEO 인용뿐입니다.**
agilityrobotics.com 자체 발표는 찾지 못했습니다 **[U]** — NVIDIA 주도 메시징이라는 신호.

> **Peggy Johnson, CEO, Agility Robotics:** *"For humanoids to deliver value at scale, safety has
> to be built into the robot and validated across the entire system."*
> *"Partnering with NVIDIA to implement and optimize the Halos for Robotics system extends our
> leadership in responsible automation…"*

**단계:** IGX Thor와 Halos Core를 Digit에 통합 중, 제3자 인증에 앞서 Inspection Lab에 참여 예정 **[S]**
→ **개발·검증 단계입니다. 출하도, 인증도, 배포도 아닙니다.**
두 인용 모두 *왜 안전이 중요한지*에 대한 당위이고, 기술적 메커니즘을 설명하지 않습니다.

---

## 6. 독립·비판적 보도 — 얇습니다. 그 자체가 발견입니다

보도가 거의 전부 보도자료 재생산이었습니다(AIwire, Engineering.com, Interesting Engineering,
Fox News, Robot Report, Humanoids Daily, Manufacturing Digital).

- **Philip Koopman의 Halos 논평 없음.** 특정해서 찾았으나 2026-09-12 기준 없음 **[U]**
- **Olivier Blanchard (Futurum, 2026-07-07)** — 온건하게 신중, 비판적이진 않음.
  열린 질문: *"whether robotics developers and industrial operators will converge around a common
  safety architecture."* / *"onboard sensors alone may not always provide sufficient visibility."*
  검사와 인증을 정확히 구분함. https://futurumgroup.com/insights/how-nvidia-is-building-a-critical-safety-layer-for-physical-ai/

### 논지를 본인보다 잘 말해주는 학술 자료

둘 다 Halos를 언급하지 않습니다. 그래서 **NVIDIA 비판의 근거가 아니라 물리의 독립적 방증**입니다.
이 구분을 지켜서 인용해야 합니다.

**arXiv 2608.02809** (Ding, Cui, Wang, Wen, 2026-08-03) — 이 글 최고의 인용:
> *"the safe state of a legged robot is an **actively-controlled state**, which violates the
> **fail-passive assumption** underlying ISO 13849-1 / EN 60204-1: removing power from a walking
> biped causes an uncontrolled fall, so classical de-energization is itself a hazard.
> We term this the **fail-passive gap**."*
> *"…its certifiable Reaction subsystem is contactor-based power removal (**Stop Category 0**) —
> **exactly the element a balancing humanoid cannot have.**"*

저자들은 Unitree G1 EDU 셀에서 검증했고, *"the G1's onboard compute is not safety-rated hardware"*,
*"We deliberately do not claim end-to-end certified PL e / SIL 3"* 라고 명시합니다.

**arXiv 2603.22703** (PRISM, CMU RI + Siemens):
> *"for humanoid robots, abruptly cutting power can itself cause catastrophic failures; instead,
> an emergency stop must execute a **predefined fallback controller**"*

**실무자 목소리** — SecuRESafe, 2025-11-25, ISO 25785-1에 대해:
> *"What if it's moving and you shut it down mid-step? Humanoid robots are actively balancing
> themselves; just as you would fall if you 'froze' mid-step, so too will a humanoid robot fall down"*

---

## 7. 경쟁·대안 — 짧게

동급의 *풀스택*(AI 컴퓨트 + 안전 OS + 검사 체계) 번들을 내놓은 곳은 없습니다.
그리고 거명된 대부분이 **경쟁자가 아니라 NVIDIA 파트너**입니다.

- **안전 MCU 진영** — Renesas(SIL3 인증 RA/RX), Infineon, TI, NXP. *실제로 인증된* 안전 MCU를
  공급하지만 AI 컴퓨트는 아님. TI와 Infineon 모두 NVIDIA**와 함께** 휴머노이드 작업 발표 **[S]**
- **기계류 안전 진영** — Pilz, Siemens(fail-safe S7-1500 / PROFIsafe).
  fail-passive gap 논문이 인증된 외부 체인으로 쓴 게 Siemens. 성숙하고 인증됐지만
  **설계상 fail-passive** — 이족보행에는 바로 그게 한계
- **NexCOBOT** — SIL2 / PL d Cat.3 인증 모션 모듈, ISO 10218-1 지향.
  **오늘 기준 Halos보다 실제 인증은 더 많이 갖고 있음.** 단 부품 범위. Halos 랩에 합류
- **자체 개발** — 로봇 제조사들이 safe-stop을 각자 풀고 있고 공개된 표준 해법 없음 **[U]**

**정직한 경쟁 구도:** NVIDIA의 진짜 새로움은 실리콘이 아니라 **인정받은 검사 체계**와
생태계 중력(43개 멤버)입니다. 그건 진짜 최초이고 방어 가능합니다.
동시에 **기술적 해결이 아니라 제도적 혁신**이라는 점도 사실입니다.

---

## 글에 쓸 공정한 프레이밍 (제안)

1. **Halos는 자기가 다루는 계층에서는 실질적입니다.** SIL 3 capable Safety Island,
   SIL 2 센서 프로토콜, 얼리 액세스 안전 OS, 그리고 진짜 최초인 ANAB 인정 검사 프로그램.
2. **아직 인증된 것은 없습니다.** "certification readiness", "capable", "compatible",
   "early access" 가 전체를 관통하는 단어이고, **NVIDIA는 자사 기술 문서에서 꽤 조심스럽습니다.**
   과장은 대부분 헤드라인에 있지 기술 문서에 있지 않습니다.
3. **"풀스택"은 수직으로는 사실**입니다(실리콘 → OS → 애플리케이션).
   다만 스택이 **명령 경계에서 끝납니다.** Halos는 로봇이 멈춰야 한다고 *결정*하고,
   *어떻게* 멈추는지는 로봇 제조사 소유입니다.
4. **지게차에게 그 경계는 평범합니다. Digit에게는 그게 안전 문제 전부입니다.**
   그리고 바로 그 문제를 위해 쓰이는 표준 ISO 25785-1은 NVIDIA 자료에 딱 한 번,
   적합성이 아니라 **기여**로 등장합니다.
