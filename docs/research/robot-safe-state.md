# Safety Architecture 1편 자료조사 — 로봇에게 "안전 상태"란 무엇인가

> 조사일 2026-09-12. 표기: **[V]** 1차 출처에서 직접 확인 / **[S]** 신뢰할 만한 2차 출처만 / **[U] 미확인 — 사실로 쓰지 말 것**

---

## 결론 먼저 — 논지를 한 번 교정해야 합니다

원래 세웠던 논지는 *"기능안전의 토대가 로봇에 그대로 안 넘어온다"* 였습니다.
조사해보니 **한쪽으로는 너무 세고, 다른 쪽으로는 약합니다.**

- IEC 61508-4의 safe state 정의에 붙은 NOTE가 **"계속 제어해야만 유지되는 안전 상태"를 이미 인정**합니다.
- ISO 26262-10 제12장이 **"가용성 자체가 안전 요구사항인 경우"** 를 이미 다룹니다.

즉 **개념은 넘어옵니다.** 안 넘어오는 건 **구현 계층**입니다 — IEC 60204-1의 정지 범주,
ISO 13849/61800의 STO 중심 안전기능, 그리고 "전원을 끊은 상태가 종착점"이라는 기계류 가정.

정의는 충분히 일반적인데 **공구상자가 안 따라옵니다.** 이게 IEEE 보고서(p.35)와
arXiv 2608.02809가 각자의 말로 하고 있는 이야기이기도 합니다.

---

## 1. safe state 정의

### IEC 61508-4:2010, 3.1.13 — [V]

> **safe state** — *"state of the EUC when safety is achieved"*

붙어 있는 NOTE가 이 글의 핵심 인용입니다 — [V]

> *"In going from a potentially hazardous condition to the final safe state, the EUC may
> have to go through a number of intermediate safe states. **For some situations a safe
> state exists only so long as the EUC is continuously controlled.** Such continuous
> control may be for a short or an indefinite period of time."*

출처: https://cdn.standards.iteh.ai/samples/14798/71c3e73affad46d29d424c00916f7bf8/IEC-61508-4-2010.pdf
교차확인(NTNU 교재): https://www.ntnu.edu/documents/624876/1277590549/chapt10-sis.pdf/a64fb480-4515-45a7-ac70-9e7c72453fa8

### ISO 26262-1:2018, 3.131 — 조항번호 [V] / 문구 [S]

- **조항번호 3.131 확인됨**: 공식 프리뷰 PDF의 3.19(common mode failure) 항목 안에
  *"…the system (3.163) is switched into a safe state (3.131)"* 교차참조가 있습니다. [V]
  https://cdn.standards.iteh.ai/samples/68383/4e26ddadc54a4198bed652afe29669fa/ISO-26262-1-2018.pdf
- **정의 문구 자체는 무료 프리뷰에 없습니다**(3.24에서 잘림). 2차 출처 둘이 일치: [S]
  > *"operating mode, in case of a failure, of an item without an unreasonable level of risk"*
  - https://webthesis.biblio.polito.it/22663/1/tesi.pdf (Polito 학위논문 §2.1)
  - https://piembsystech.com/iso-26262-part-1-vocabulary/

### ISO 26262-1:2011 (1판) — 전문 확인 가능 [V]

프리뷰에서 **직접 읽은 문구**라 인용해도 안전합니다.
https://cdn.standards.iteh.ai/samples/43464/2ef3807bc0db4366bd007c71548cd96d/ISO-26262-1-2011.pdf

- **1.34 emergency operation** — *"degraded functionality from the state in which a fault
  (1.42) occurred **until the transition to a safe state (1.102) is achieved** as defined in
  the warning and degradation concept (1.140)"*
- **1.21 degradation** — *"strategy for providing safety by design after the occurrence of failures"*

→ 비상운전을 **안전 상태로 가는 다리**로 취급합니다. 대체물이 아니라요.
휴머노이드에서 깨지는 게 정확히 이 가정입니다.

---

## 2. 정지 범주 — 여기가 실제 균열입니다

### IEC 60204-1:2016+AMD1:2021, 9.2.2 "Categories of stop functions"

조항번호·제목 [V] (본문은 유료) —
https://cdn.standards.iteh.ai/samples/18875/90805b617b194c79a353f317536a34d5/IEC-60204-1-2016.pdf

범주 문구 [S] (Doug Nix, Machinery Safety 101 / Schneider FA122781):

| 범주 | 내용 |
|---|---|
| **Category 0** | *"stopping by immediate removal of power to the machine actuators (uncontrolled stop)"* |
| **Category 1** | *"a controlled stop with power available to the machine actuators to achieve the stop, **and then removal of power** when the stop is achieved"* |
| **Category 2** | *"a controlled stop **with power left available** to the machine actuators"* |

- 비상정지는 **Cat 0 또는 Cat 1만 허용**, Cat 2는 불가 [S]
  (해당 조항번호는 [U] 미확인)

### ★ 이 글에서 가장 날카로운 한 줄

Cat 0은 안전을 **구동의 부재**로 정의하고, Cat 1은 **정지까지만 구동하고 그 다음 전원 차단**으로
정의합니다. **둘 다 전원이 끊긴 상태로 끝납니다.** *"정지 자체가 능동적으로 유지되기 때문에
구동을 무한히 유지한다"* 는 범주가 없습니다.

전원을 유지하는 유일한 범주가 Cat 2인데, **그게 바로 비상정지에서 금지된 범주입니다.**

> 균형을 잡는 휴머노이드의 유일한 안전 정지는 구조적으로 Cat 2 정지이고,
> Cat 2는 기계류 표준이 비상 상황에서 금지한 단 하나의 범주다.

드라이브 레벨 대응 [S]: IEC 61800-5-2 **STO → Cat 0**, **SS1 → Cat 1**, **SS2 → Cat 2**

### ISO 10218-1:2025 — 3판, 2025-02-05 발행 [V]

https://www.iso.org/standard/73933.html · 목차 [V]:
https://cdn.standards.iteh.ai/samples/73933/b5387b20934848a48b4518c9b2e5455d/ISO-10218-1-2025.pdf

관련 조항: **5.1.8 Position holding** · **5.1.10 Power loss or change** ·
**5.4 Stopping functions**(5.4.2 비상정지 / 5.4.3 보호정지 / 5.4.4 통상정지) ·
**5.5.5 Monitored-standstill** · 5.5.6 정지시간 제한 · 5.5.7 정지거리 제한 ·
**5.8 Movement without drive power** · 5.10 협동 운전 · Annex H 정지시간·거리 측정

- 용어 변경 [S]: *"'Safety rated-monitored stop' has been renamed **'monitored standstill'**
  for technical accuracy"* — https://www.automate.org/robotics/blogs/updated-iso-10218-faq
  → 인증 대상이 "정지됨"이 아니라 **"정지 상태(standstill)"** 임을 표준이 스스로 인정한 셈.
  휴померノ이드는 능동 구동 중에만 monitored standstill일 수 있습니다.
- **5.1.8 Position holding** 과 **5.4** 본문이 이 글의 승부처인데 **둘 다 유료** [U]

### ISO/TS 15066:2016, 5.4.1 — [V] 직접 읽음

> *"Any detected failure in the safety-related parts of the control system shall result in a
> **protective stop**"*

https://cdn.standards.iteh.ai/samples/62996/37daa360128440ccbc94e9782c9e1748/ISO-TS-15066-2016.pdf

→ **고장 ⟹ 정지.** 정지가 생존 가능한지에 대한 조건이 전혀 없습니다.
이 글이 공격하는 가정의 가장 깔끔한 진술입니다.

---

## 3. ISO 13482 — 정의가 다릅니다

https://cdn.standards.iteh.ai/samples/53820/5ddca453a6d141e5a558f4f791ea3229/ISO-13482-2014.pdf [V]

- **3.9 safe state** — *"condition of a personal care robot where it does not present an
  impending hazard"*
  → ISO 26262가 **운전 모드(operating mode)** 로 정의하는 것과 달리 **상태(condition)** 로
  정의하고, **전원 차단을 전혀 언급하지 않습니다.** "임박한 위험을 주지 않는다"는
  능동적으로 균형을 잡는 로봇도 만족할 수 있습니다.
  **기존 로봇 표준 중 정의 단계에서 fail-passive 가정을 안 깔고 있는 유일한 사례**입니다.
- 3.17 protective stop / 3.14 mobile servant / 3.15 physical assistant / 3.16 person carrier [V]
- 본문 조항(5.3.3.1, 5.4.1, 5.10.3.1, 5.10.4.1)은 비공식 전문에서만 확인 [S] — 인용 전 검증 필요
- 개정 중, prEN ISO 13482 초안 존재 [S] / 정확한 단계·발행예정일 [U]

### ★ ISO/TR 23482-2:2019, 5.2 — 표준기구가 직접 한 말 [V]

https://cdn.standards.iteh.ai/samples/71627/34d1ddc1271d43c48fe2755a876f69b4/ISO-TR-23482-2-2019.pdf

> *"Due to the closer interaction with humans, **the protective stop is not considered the
> only option to achieve a safe state.** More flexibility can be reached when the robot
> adjusts its speed to the distance and the relative speed of obstacles. To guarantee safe
> interaction, safety functions such as safety-related speed control and obstacle avoidance
> can be applied."*

이 글 논지를 표준 문서가 그대로 말해주는 최고의 인용입니다.

---

## 4. 멈추는 게 위험한 휴머노이드 — 연구 계보

| 연구 | 내용 | 상태 |
|---|---|---|
| **UKEMI** (IROS 2002) Fujiwara 외 | 유도 낙법에서 출발. 엉덩이·무릎으로 착지, 웅크려 충격 에너지 감소. 보호 낙하의 시조 | [V] http://www.cs.cmu.edu/~cga/falling/ukemi.pdf |
| **Goswami 외** (Auton. Robots 36(3):199–223, 2014) | 어떻게 넘어지냐가 아니라 **어디로** 넘어지냐를 바꿈. 스텝 + 관성 조형으로 낙하 방향 변경. NAO H25 | [V] DOI 10.1007/s10514-013-9343-2 |
| **Subburaman 외** (RAS 166:104443, 2023) | 낙하 예측·제어·복구 서베이 | [V] https://discovery.ucl.ac.uk/id/eprint/10172356/1/J17__Subburaman__2023__RAS.pdf |
| **SafeFall** arXiv **2511.18509** (2025-11-23) | GRU 낙하 예측기 + RL 손상완화 정책. Unitree G1에서 접촉력 −68.3%, 관절토크 −78.4% | [V] ⚠️ **로봇 하드웨어 보호**가 목적이지 사람 안전이 아님. 과장 금지 |
| **Robot Crash Course** arXiv **2511.10635** | 지정한 최종 자세로 부드럽게 넘어지기 | [V] |
| ★ **Safe-Stoppability Monitors** arXiv **2603.22703** (2026-03-24, CMU RI + Siemens) | 아래 인용 참조 | [V] |
| **Humanoid Safe Stop via Learned Stoppability Value** arXiv **2609.02358** (2026-09-02) | 정지를 reach-avoid 문제로. 정지 가능성 추정기 둘이 모두 가능하다 할 때만 정지에 커밋, **아니면 댐핑으로 폴백**. 179,650 OOD 초기조건에서 96.4% | [V] |

### arXiv 2603.22703 초록 — 직접 인용 [V]

> *"Emergency stop (E-stop) mechanisms are the de facto standard for robot safety. However,
> for humanoid robots, **abruptly cutting power can itself cause catastrophic failures**;
> instead, an emergency stop must execute a predefined fallback controller that preserves
> balance and drives the robot toward a **minimum-risk condition**."*

**서사 제안:** UKEMI(2002) → Goswami(2014) → 서베이(2023)가 *"잘 넘어지기"* 계보.
SafeFall/Crash Course(2025)가 그 학습판. **Safe-Stoppability(2026)가 개념적으로 새로운 수**입니다 —
*"어떻게 잘 넘어지나"* 를 묻던 것을 *"여기서 정지가 도달 가능하기는 한가"* 로 바꿨습니다.
그건 **안전 상태 도달가능성** 질문이고, 곧 자동차의 FTTI 질문을 균형 기계에 옮긴 것입니다.
여기서 ISO 26262로 다시 건너올 수 있습니다.

---

## 5. "안전 상태가 없다" — 표준계가 이미 아는 문제

### IEEE Humanoid Study Group, *A Pathway Study For Future Humanoid Standards* (2025-09) [V]

https://www.therobotreport.com/wp-content/uploads/2025/09/IEEE-Humanoid-Report-of-Future-Standards-Development.pdf

- **p.35**: *"For humanoids, even with all the joints braked and powered off, which is a very
  conventional safe state for fixed manipulators, **the robot is not necessarily in a safe
  state.**"* / *"it must be assumed that a locked pose is unstable."*
- **p.35**: 기존 표준들은 *"an unwritten assumption that the base of the robots being
  considered is either fixed or has a statically stable base. Due to this, **none of these
  specialized safety standards apply to humanoids.**"*
- **p.11**: *"Bipedal robots, by design, operate in states of managed instability."*
- **p.9**: *"If there is a catastrophic failure, the 60+ kg machine is likely to tumble or
  slump to the ground, trapping anything underneath, including pets, toddlers, or the elderly."*
- **pp.27–28 — 정지 범주 대체안 제안**(이 글 질문에 대한 직접적 답):
  - **Level 0** 전 부품 즉시 전원 차단
  - **Level 1** 브레이크로 총 에너지 수동적 소산
  - **Level 2** 로봇이 **웅크려서** 위험 면적 축소
  - **Level 3** 안전한 상태로 가도록 **계획하고 행동**
  - **Level 3-1** 전원 상실 후에도 안전 동작을 위한 전력 유지
  - **Level 4** 부품 고장·전원 상실이 주변 사람을 위험에 빠뜨리지 않도록 운용

### ISO/CD 25785-1 — 바로 이 문제를 위해 쓰이는 중인 표준 [V]

https://www.iso.org/standard/91469.html

*"Robotics — Safety requirements for **dynamically stable** industrial mobile robots
(legged, wheeled, or other forms of locomotion) — Part 1: Robots"*
ISO/TC 299 · 단계 **30.60**(의견수렴 종료) **2026-07-08**

> 범위: *"safety requirements for industrial mobile robots with **actively controlled
> stability**…"*

**"actively controlled stability"가 표준계가 이 문제에 붙인 이름입니다.**
그 이름으로 정의된 신규 프로젝트가 TC 299에 존재한다는 것 자체가 논지의 최강 근거입니다.
다만 **초안은 비공개** [U] — 이 글에서 가장 값진 문서인데 읽을 수 없습니다.

### arXiv 2608.02809 (2026-08-03) — 학계의 가장 명확한 진술 [V]

*Toward Certified Functional Safety for Industrial Humanoid Robots: **The Fail-Passive Gap**
and a Feasibility Study* — https://arxiv.org/abs/2608.02809

> 초록: *"the **safe state of a legged robot is an actively-controlled state**, which
> **violates the fail-passive assumption** underlying ISO 13849-1 / EN 60204-1."*
> §I: *"removing power from a walking biped produces an uncontrolled fall, which is itself a
> hazard. The safe state is instead a controlled, actively balanced standstill — an
> **active safe state**."*

⚠️ **용어 주의**: 이 논문의 조어는 **"fail-passive gap" / "active safe state"** 이지
"fail-operational"이 아닙니다. 한국어 글에서 fail-operational을 쓰면 그건 자동차에서 건너온
**본인 프레이밍**입니다. 휴머노이드 문헌 자체의 용어는 *active safe state*.

### SAE J3016 minimal risk condition [S]

MRC가 *"stable, stopped"* 조건. **J3016 8.5.iii** — *"The minimal risk condition depends on
both the vehicle condition and its operating environment… could follow a **degraded mode
strategy** that considers the relative risks of continuing operation, pulling off the road,
or stopping in place."* (Koopman J3016 User Guide 경유 [S], 조항번호 [U])

→ **MRC는 "정지"가 고정된 상태가 아니라 위험을 저울질한 선택임을 자동차가 인정한 것**이고,
휴머노이드 논문(2603.22703)이 *"minimum-risk condition"* 이라는 정확히 같은 표현을 씁니다.
두 세계를 잇는 실제 용어 다리입니다.

---

## 확인 못한 것 — 사실로 쓰지 말 것

1. ISO 26262-1:**2018** "emergency operation" 조항번호 (2011판 1.34는 확인됨)
2. ISO 26262-1:2018 **FTTI** 조항번호 — 출처 충돌 (3.61 vs 3.62, 둘 다 2차)
3. ISO 26262-1:2018 EOTTI·degradation 조항번호
4. ISO 26262-3:2018 7.4.2.x 요구사항 수준 조항
5. IEC 60204-1에서 비상정지를 Cat 0/1로 제한하는 조항번호
6. IEC 61800-5-2 STO/SS1/SS2 조항번호
7. SAE J3016 3.16 / 8.5.iii (Koopman 가이드 경유만)
8. ISO 13482 본문 조항번호 — 비공식 전문 출처
9. **ISO 10218-1:2025 5.1.8 / 5.4 본문** ← 논지의 승부처인데 유료
10. **ISO/CD 25785-1 초안 내용** ← 가장 값진 문서인데 비공개
11. UL 4600 — 공개 투표본에 safe state / MRC / fail-operational 용어가 안 나옴. **이 글에서 빼는 게 낫습니다**
12. **어떤 발행된 로봇 표준도 fail-operational을 의무화한다고 말하는 근거를 찾지 못했습니다.**
    가장 가까운 것이 ISO 26262-10 제12장(자동차, 그것도 *지침*)과 작성 중인 ISO/CD 25785-1.
    → *"로봇에서 fail-operational이 요구된다"* 는 문장은 **현재 근거 없음**

---

## 유료 구매가 필요한 것

요구사항 문구를 인용하려면 **ISO 10218-1:2025, ISO 13482:2014, IEC 60204-1:2016** 세 건을
사야 합니다. ISO 무료 프리뷰는 전부 5장 이전에서 끊깁니다. 지금 확보한 것은 **구조와 제목뿐**입니다.
