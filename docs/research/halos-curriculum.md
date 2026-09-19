# Halos 학습 커리큘럼

> 목표: *"Halos가 안전을 어떻게 설계했는가"* 를 **남에게 그림으로 설명할 수 있는 수준**까지.
> 총 8~10시간. 3~4회에 나눠도 됩니다.
>
> 원칙 — **자료를 데이터가 흐르는 순서로 읽습니다.**
> 카메라 → 인지 → 이벤트 통합 → 판단 → 명령 → 로봇.
> 글의 논지가 **마지막 화살표**에 있으니, 거기까지 순서대로 가는 게 가장 빠릅니다.

**저장소**: `D:\halos-outside-in-safety` (Apache-2.0, 실제 C++/Python 소스)
**이 커리큘럼의 척추는 이 저장소입니다.** 문서만 읽으면 보도자료 수준에서 끝납니다.

---

# 0단계 — 기능안전 어휘 (2시간) ★ 여기가 전체 해상도를 정합니다

Halos 문서는 **기능안전 용어로 쓰여 있습니다.** 그 용어를 모르면 문장이 읽히긴 하는데
**무슨 주장을 하고 있는지가 안 보입니다.** 특히 *"ASIL D compliant인데 random hardware
integrity는 ASIL B"* 같은 문장은 어휘를 알면 **결정적인 정보**고 모르면 **그냥 스펙 나열**입니다.

여기만 제대로 하면 2·5단계는 거의 저절로 읽힙니다.

---

## 0-1. 기능안전이란 무엇을 하는 일인가

한 문장으로 — **"이 물건이 고장 나도 사람이 안 다치게" 를 증명 가능한 형태로 만드는 일**입니다.

두 부분으로 나눠서 보세요.

- **"고장 나도"** — 고장을 없애겠다는 게 아닙니다. 고장은 납니다. **고장이 났을 때 위험한
  결과로 이어지지 않게** 하는 겁니다.
- **"증명 가능한 형태로"** — 이게 진짜 핵심입니다. 안전하게 만드는 것과, 안전함을 **문서로
  논증하는 것**은 다른 일이고, 표준이 요구하는 건 후자입니다.

그래서 기능안전 표준은 대부분 **무엇을 만들라**가 아니라 **무엇을 증명하고 어떻게 기록하라**입니다.
Halos가 "Inspection Lab"이라는 **문서 검사 기관**을 만든 이유도 여기 있습니다(5단계).

---

## 0-2. ASIL — 위험에 등급을 매긴다

**ASIL = Automotive Safety Integrity Level.** ISO 26262(자동차 기능안전)가 정한 위험 등급입니다.

```
QM  <  A  <  B  <  C  <  D        ← D가 가장 엄격
```

**QM**(Quality Management)은 "안전 요구사항 없음, 일반 품질관리로 충분"이라는 뜻입니다.

### 등급은 기능마다 매깁니다. 제품이 아니라 기능입니다.

세 가지를 조합해서 정합니다. 이걸 **HARA**(Hazard Analysis and Risk Assessment)라고 합니다.

| 축 | 질문 | 범위 |
|---|---|---|
| **S** (Severity) | 이 고장이 나면 얼마나 다치나 | S0~S3 |
| **E** (Exposure) | 그 상황에 얼마나 자주 놓이나 | E0~E4 |
| **C** (Controllability) | 사람이 피할 수 있나 | C0~C3 |

예를 들어 **주행 중 조향 상실**은 크게 다치고(S3), 주행은 늘 하고(E4), 피하기 어렵습니다(C3)
→ **ASIL D**. 반면 **파워윈도우 오작동**은 → 보통 **QM**.

> **로봇에 옮겨 생각해보세요.** 휴머노이드가 사람 옆에서 넘어지는 것은 S와 C가 얼마일까요?
> 그리고 **지금 그 등급을 매기는 절차가 로봇 업계에 있나요?**
> — 이 질문을 들고 다니시면 3·4단계가 다르게 읽힙니다.

---

## 0-3. ★ 고장은 두 종류다 — 이 절이 가장 중요합니다

ISO 26262(와 IEC 61508)는 고장을 **성격이 완전히 다른 둘**로 나눕니다.
**이걸 모르면 Halos 스펙을 절대 못 읽습니다.**

| | **체계적 고장** (systematic) | **랜덤 하드웨어 고장** (random HW) |
|---|---|---|
| 정체 | **사람이 설계를 잘못함** | **물리 현상** |
| 예 | 요구사항 누락, 코딩 실수, 잘못된 가정 | 비트 플립, 트랜지스터 열화, 우주선(cosmic ray), 납땜 균열 |
| 재현성 | **같은 조건이면 100% 재현** | **확률적.** 언제 날지 모름 |
| 소프트웨어는? | **소프트웨어 고장은 전부 여기** | 소프트웨어에는 랜덤 고장이 없음 |
| 막는 법 | **개발 프로세스** — 리뷰, 정적분석, 테스트 커버리지, 요구사항 추적성 | **진단 회로** — 락스텝, ECC, BIST, 워치독 |
| 측정 | **정성적** (프로세스를 얼마나 엄격히 지켰나) | **정량적** (숫자가 나옴) |

### 왜 굳이 나누나

**대책이 완전히 다르기 때문입니다.**

같은 "잘못된 출력"이라도,
- **코드에 버그가 있어서** 나온 거라면 → 리뷰와 테스트를 더 해야 합니다. 회로를 두 개 달아도
  **둘 다 똑같이 틀립니다.**
- **비트가 뒤집혀서** 나온 거라면 → 리뷰를 백 번 해도 못 막습니다. **ECC나 이중화**가 필요합니다.

그래서 표준이 두 축을 따로 요구하고, **스펙도 두 축을 따로 표기합니다.**

---

## 0-4. 랜덤 고장은 숫자로 잰다

랜덤 쪽은 정량적이라 **등급마다 숫자 목표**가 있습니다. (ISO 26262-5, 8~9장)

| 지표 | 무엇을 재나 | ASIL B | ASIL C | ASIL D |
|---|---|---|---|---|
| **SPFM** | 단일점 고장을 **잡아내는 비율** | ≥90% | ≥97% | ≥99% |
| **LFM** | 숨어 있던 고장을 **잡아내는 비율** | ≥60% | ≥80% | ≥90% |
| **PMHF** | **시간당 위험 고장 확률** | <10⁻⁷/h | <10⁻⁷/h | **<10⁻⁸/h** |

- **SPFM**(Single-Point Fault Metric) — 한 방에 위험으로 가는 고장 중 몇 %를 진단이 잡아내나
- **LFM**(Latent Fault Metric) — 당장은 티가 안 나다가 다른 고장과 겹칠 때 터지는 것 중 몇 %
- **PMHF**(Probabilistic Metric for random HW Failures) — 전체를 확률로 합산한 값

**PMHF에서 B와 D는 10배 차이**입니다. 이 숫자 하나만 기억해도 0-5절이 풀립니다.

---

## 0-5. 그래서 그 문장을 해독하면

IGX Thor 안전 브리프의 두 문장을 나란히 놓습니다.

> ① *"compliant with ISO 26262 up to **ASIL D** and compatible up to IEC 61508 SIL 3 / **SC 3**"*
> ② *"meets the applicable ISO 26262 requirements for **random hardware integrity of ASIL B**
> and compatible up to IEC 61508 **SIL 2 (SIL 3 for Safety Island)**"*

①은 **체계적 축**, ②는 **랜덤 축**입니다. 번역하면:

> **"D등급 프로세스로 개발했습니다. 다만 실리콘이 물리적으로 고장 났을 때
> 그걸 잡아내는 능력은 B등급입니다."**

**모순이 아닙니다. 서로 다른 두 축입니다.** 그리고 이건 **정상적이고 정직한 표기**입니다 —
범용 SoC에 ASIL D 하드웨어 무결성을 요구하는 건 비현실적이니까요.

**중요한 건 여기서 따라 나오는 결론입니다.** ASIL D 안전 기능을 이 칩 **하나로는** 구현할 수
없습니다. 하드웨어 무결성이 모자랍니다. 그래서 스펙에 "분해(decomposition)"가 같이 나옵니다(0-8).

> 이 해독이 글의 ④ 섹션 전체를 지탱합니다. 그리고 **독자 대부분은 이 두 문장을 구분 못 합니다.**

---

## 0-6. SIL / PL / ASIL — 같은 것을 재는 세 개의 자

표준이 업종별로 갈라져 있어서 **이름이 셋**입니다.

| 척도 | 표준 | 대상 | 범위 |
|---|---|---|---|
| **SIL** (Safety Integrity Level) | **IEC 61508** | 모든 산업의 조상 격 | 1~4 |
| **PL** (Performance Level) | **ISO 13849** | **기계류** — 산업로봇, 공장 설비 | a~e |
| **ASIL** | **ISO 26262** | **자동차** | A~D |

대략의 대응입니다. **정확한 환산은 아닙니다** — 산출 방식이 달라서 일대일로 안 맞습니다.

```
SIL 1  ≈  PL b/c
SIL 2  ≈  PL d   ≈  ASIL B
SIL 3  ≈  PL e   ≈  ASIL C/D
```

### Halos가 셋을 동시에 인용하는 이유

로봇은 **기계류**(ISO 13849)인데, 부품은 **자동차**(ISO 26262)에서 왔고,
둘의 공통 조상이 **IEC 61508**이기 때문입니다. 삼중 인용이 허세가 아니라 **실제 상황**입니다.

### SC — 61508이 체계적 축에 붙인 이름

IEC 61508은 **체계적 축을 별도 이름으로 부릅니다 — SC(Systematic Capability), 1~4.**

IGX 스펙의 `"SIL 3 / SC 3"`이 바로 그겁니다. **61508은 두 축을 아예 다른 기호로 표기하고,
NVIDIA는 그 표기법을 정확히 썼습니다.** 0-5의 ASIL D / ASIL B 분리와 **완전히 같은 구조**입니다.

→ **NVIDIA는 조심스럽게 씁니다.** 과장은 대부분 보도자료 헤드라인에 있지 기술 문서에 없습니다.
글에서 이 점을 인정해야 공정해집니다.

---

## 0-7. 블랙 채널 — 못 믿는 선로 위에서 안전 통신하기

**문제:** 이더넷은 안전하지 않습니다. 패킷이 사라지고, 순서가 바뀌고, 지연되고, 복제되고, 깨집니다.

**두 가지 길이 있습니다.**
1. 이더넷 자체를 안전하게 만든다 → 사실상 불가능하고 비쌈
2. **선로를 못 믿는 물건으로 취급하고, 양 끝에서 검사한다** ← 이게 **블랙 채널**

### 방법은 단순합니다

보내는 쪽이 메시지마다 **일련번호 + 타임스탬프 + CRC + 송신자 ID**를 붙입니다.
받는 쪽이 검사합니다.

| 증상 | 무엇으로 잡나 |
|---|---|
| 유실 | 일련번호가 건너뜀 |
| 복제·순서 뒤바뀜 | 일련번호가 되돌아감 |
| 지연 | 타임스탬프가 너무 오래됨 |
| 손상 | CRC 불일치 |
| 엉뚱한 송신자 | ID 불일치 |

**하나라도 틀리면 안전 반응.** 선로가 무슨 짓을 하든 **양 끝에서 잡힙니다.**
그래서 **"end-to-end"** 입니다.

자동차의 **AUTOSAR E2E Protection**, 공장의 **PROFIsafe**가 전부 같은 원리입니다.
HSB의 *"end-to-end IEC 61508 SIL 2 safety protocol"* 도 같은 계열입니다.

> **3단계에서 이게 코드로 보입니다.** `NvPSDGatewayContract.hpp`에 **epoch + 송신 시퀀스 번호
> + 패킷 길이 검증**이 들어 있습니다. 프로토콜 이름만 안 붙어 있을 뿐 같은 물건입니다.

---

## 0-8. 분해 — 모자란 등급을 나눠서 채우기

0-5에서 "칩 하나로는 ASIL D가 안 된다"고 했습니다. 그럼 어떻게 하나.

**요구 등급을 둘로 쪼개서, 서로 독립인 두 경로에 나눠 겁니다.** 이걸 **분해**라고 합니다.
ISO 26262의 ASIL 분해, IEC 61508의 유사 기법이 있습니다.

거칠게 말하면 — *하나가 틀려도 다른 하나가 잡아주면, 둘을 합쳐 더 높은 등급을 주장할 수 있다.*

**단, 절대 조건이 하나 있습니다 — 두 경로가 진짜로 독립이어야 합니다.**
같은 전원, 같은 클럭, 같은 설계자, 같은 소프트웨어를 공유하면 **같이 죽습니다.**
이걸 **공통원인 고장**(common cause failure)이라고 하고, 기능안전에서 가장 자주 무너지는 지점입니다.

IGX Thor 스펙의 이 문구가 바로 그겁니다:
> *"ASIL and SIL decomposition (GPU/CPU, GPU/PVA, CCPLEX CPU/FSI CPU)"*

**범용 컴퓨트(CCPLEX)와 안전 섬(FSI)을 독립 경로로 놓고 나눠 걸겠다**는 선언입니다.

---

## 0단계 자가 점검

아래 다섯에 답할 수 있으면 다음 단계로 가세요. **막히면 그 절로 돌아가세요.**

1. 소프트웨어에는 왜 "랜덤 고장"이 없나?
2. `"ASIL D compliant"`와 `"random hardware integrity ASIL B"`가 왜 모순이 아닌가?
3. PMHF 기준으로 ASIL B와 D는 몇 배 차이인가?
4. 이더넷을 안전하게 만들지 않고도 안전 통신을 하는 방법은?
5. 분해를 쓸 때 반드시 확인해야 하는 조건 하나는?

---
---

# 1단계 — 전체 지형 (1시간)

**질문: 무엇을 하겠다는 물건이고, 무엇을 안 하겠다고 스스로 밝혔나?**

읽을 것 (저장소 안, 짧습니다):

1. `whitepaper/halos-outside-in-safety.md` ← **가장 먼저. 5KB밖에 안 됩니다**
2. `SAFETY_NOTICE.md`
3. `README.md`

## 잡아야 할 것

**① "outside-in"의 정의** — 워크셀을 **바깥에서** 관찰합니다. 고정 카메라가 하역장을 봅니다.
→ **로봇에 달린 센서가 아닙니다.** 이 한 가지가 아키텍처 전체 성격을 정합니다.

**② 런타임은 둘뿐입니다** — **AI Perception**(인지) + **Safety Core**(판단·전송).
Closed-Loop Testing은 런타임이 아니라 **오프라인 하네스**입니다.

**③ 경계 선언** (화이트페이퍼 원문):
> *"vision-based AI perception detects scene state and events; **Safety Core decides how
> those events affect the configured safety behavior**."*

**④ ★ inside-out은 어디 있나 — 이 질문의 답**

NVIDIA는 **"inside-out"이라는 말을 안 씁니다.** 대응 표현은 **"onboard"** 입니다.
README: Outside-In은 *"extends robot perception **beyond onboard sensors**"*.

| | 무엇 | 공개 여부 |
|---|---|---|
| **온로봇** (= inside-out에 해당) | IGX Thor, Halos Core, SEP, HSB | **비공개.** 얼리 액세스, 제품 브리프 수준 |
| **오프로봇** | Outside-In Safety Blueprint | **Apache-2.0 전체 공개** |

그리고 화이트페이퍼의 이 문장을 놓치지 마세요:
> *"a compact decision such as whether the equipment should remain muted or
> **return to its onboard safety behavior**"*

→ **Outside-In은 로봇의 자체 안전 거동을 껐다 켤 뿐입니다.** 그 "onboard safety behavior"가
무엇인지는 **전제로 두고** 들어갑니다. Halos Outside-In이 제공하는 게 아닙니다.

**즉 "안전을 어떻게 설계했는가"에서 로봇 쪽 설계가 정확히 비공개 부분입니다.**

**⑤ "What This Repository Does Not Provide"** 목록을 통째로 옮겨 적어두세요.
인증된 안전 기능 아님 / 안전 사례 아님 / 자격인정된 인지 모델 아님 / 장비 수준 보호조치의
대체물 아님. **글에서 공정성을 담보하는 자리입니다.**

**통과 기준:** 런타임 블록 다이어그램을 종이에 그릴 수 있다. 어디까지가 NVIDIA 몫이고
어디부터가 통합업체 몫인지 손가락으로 짚을 수 있다.

---

# 2단계 — 플랫폼 계층 (1.5시간)

**질문: 안전 하드웨어가 실제로 무엇을 제공하나?**

읽을 것:
- **IGX Thor 안전 제품 브리프 (PDF, 무료)**
  https://developer.download.nvidia.com/assets/igx/robotics-product-brief-igx-thor-safety-4473375.pdf
- 기술 블로그
  https://developer.nvidia.com/blog/inside-nvidia-halos-for-robotics-a-full-stack-functional-safety-system-for-physical-ai/

## 잡아야 할 것

**FSI (Functional Safety Island)** — SoC 안의 독립 안전 코어. up to 12K DMIPs, SIL 3 capable.
→ **자동차의 락스텝 코어 / 안전 MCU 동반칩**에 대응시키면 바로 이해됩니다.

**SEP** (Safety Extensions Package) — HW 오류 수집 → FSI·Safety MCU로 전달,
*"Safe State and FuSa State monitoring and heartbeat"*

**Halos Core** — 온로봇 안전 OS. NVIDIA 설명이 결정적입니다:
> *"the next generation of NVIDIA **DriveOS** and certified to automotive safety standards"*

구성: Linux 런타임 + SEP + **Edge Safety Link**(안전 통신 프로토콜) + FSI RTOS + Safety MCU 펌웨어.
→ **DriveOS 혈통이라는 게 "자동차에서 왔다"는 논지의 또 하나의 증거**입니다.

> ⚠️ **이름 주의** — `Halos Core`(온로봇 안전 OS)와 `Safety Core`(저장소 안 컴포넌트)는
> **다른 물건**입니다. 기술 블로그에는 "Safety Core"라는 말이 아예 안 나옵니다.

**분해 구조** — *"ASIL and SIL decomposition (GPU/CPU, GPU/PVA, CCPLEX CPU/FSI CPU)"*
→ **0-8에서 배운 그것**입니다.

**★ 0-5를 여기서 써먹으세요.** 두 문장을 나란히 놓고 보면 이제 다르게 읽힐 겁니다.
그리고 **전체 문서에서 "certified"가 한 번도 안 나옵니다** — capable / compatible / compliant뿐입니다.

**통과 기준:** "Halos는 SIL 3이다"라는 문장이 왜 부정확한지 세 문장으로 설명할 수 있다.

---

# 3단계 — 런타임 데이터 경로 (2~3시간, 코드) ★ 핵심

**질문: 카메라에서 명령까지 어떻게 흘러가나?**

파이프라인: **SIPP → SAIM → PCM → SEI → SDM → SBB**

읽을 순서 (전부 `safety-core/` 아래):

| 순서 | 파일 | 무엇을 보나 |
|---|---|---|
| 1 | `components/ai-monitor/include/sai_common.h` | **SAIM** — AI 인지 자체를 감시. OOD 입력·카메라 가림·연결 끊김 |
| 2 | `components/event-integrator/daemon/include/NvPSSSafetyEventManager.hpp` | 이벤트 수명주기 |
| 3 | `components/event-integrator/daemon/include/NvPSSSafetyEventFusion.hpp` | **시간 축 융합** — 단발 검출을 어떻게 결정으로 바꾸나 |
| 4 | `components/event-integrator/daemon/include/pss_protocol.h` | **EventType / 명령 정의.** `ESTOP`이 75행에 있습니다 |
| 5 | `components/protocols/decision-maker-gateway/include/NvPSDGatewayContract.hpp` | **게이트웨이 계약** ← 아래 참조 |
| 6 | `components/event-integrator/daemon/include/NvPSSDeliveryFailSafe.hpp` | **전달 실패 시 거동** |
| 7 | `decision-makers/proximity/`, `decision-makers/atl/` | 실제 판단 로직 두 종 |
| 8 | `components/safecomm/`, `components/black-box/` | 안전 통신, 블랙박스 기록 |

## ★ 5번 게이트웨이 계약

`NvPSDGatewayAddMandatoryEventTypes()` — **모든 SDM 클라이언트가 반드시 구독해야 하는
이벤트**를 강제로 끼워 넣습니다: `SW_FAIL`, `PSS_STATUS_NOOP`, 센서 건전성
(`SENSOR_INVALID` / `SENSOR_VALID`). 주석이 이유를 밝힙니다 —
*"Sensor-health evidence must reach valid SDM clients"*.

그리고 패킷에 **epoch + 송신 시퀀스 번호 + 길이 검증**이 있습니다.
→ **0-7의 블랙 채널 E2E 보호 그대로입니다.**

## ★ 6번 DeliveryFailSafe

`NvPSSDeliveryState`, `NvPSSDeliveryFailureReason`, `response_timeout`,
재시도 예산 × 응답 타임아웃으로 계산되는 재시도 창 —
**"판단은 내렸는데 전달이 안 되면?"** 에 대한 답입니다.
자동차에서 FTTI 예산을 쪼개던 것과 같은 종류의 설계입니다.

**통과 기준:** 카메라 프레임 하나가 `CMD_STOP`이 되기까지 거치는 단계를 순서대로 말할 수 있다.
중간에 어느 컴포넌트가 죽으면 무슨 일이 일어나는지 답할 수 있다.

---

# 4단계 — 경계 (1시간, 코드) ★ 글의 논지가 사는 곳

**질문: 로봇이 `STOP`을 받으면 실제로 무엇을 하나?**

**단 한 파일입니다.**

```
safety-core/decision-makers/proximity/udp_cmd_receiver/cmd_rx.cpp
```

파일 헤더 주석이 스스로를 이렇게 소개합니다 —
> *"**Simulates the humanoid robot's command interpreter.**"*

매핑:

```
Any CMD_SW_ERROR               →  FAULT SAFE STATE / ALARM
Any CMD_STOP / CMD_HW_ERROR    →  ESTOP
Any CMD_REDUCE (no STOP/error) →  SLOW DOWN
All CMD_NORMAL                 →  NORMAL OPERATION
Empty window                   →  hold previous action
```

100ms 평가 창, **"most conservative wins"** 정책, 상류 하트비트 기대값 5,000ms.

## 여기서 멈춰서 오래 보세요

`CMD_STOP`이 **`"ESTOP"`이라는 문자열로 매핑됩니다.** 그 ESTOP이 물리적으로 무엇인지는
이 파일에도, 저장소 어디에도 없습니다. **휴머노이드 명령 해석기를 시뮬레이션한다면서,
해석 결과가 라벨입니다.**

문서의 이 문장과 겹쳐 읽으세요:
> *"SDM logic is deployment-specific; **integrators implement their own behavior**."*

**이게 글의 척추입니다.** 지게차에게 ESTOP은 자명합니다. 균형 잡는 이족보행에게 ESTOP은
미해결 제어 문제입니다. 그리고 그 경계가 **소스 코드에 그어져 있습니다** —
남의 주장이 아니라 본인이 파일을 열어 확인한 사실로 쓸 수 있습니다.

**통과 기준:** "Halos의 풀스택은 어디서 끝나는가"에 파일 이름과 줄 번호로 답할 수 있다.

---

# 5단계 — 인증 체계 (1시간)

**질문: ANAB 인정이 정확히 무엇을 인정한 것인가?**

읽을 것:
- ANAB 발표 https://anab.ansi.org/anab-accredits-nvidia-halos-ai-inspection-lab-advancing-independent-assurance-for-physical-ai-safety/
- NVIDIA Halos 로보틱스 제품 페이지의 FAQ 섹션

## 잡아야 할 3단 구분

| 층위 | 상태 | 근거 |
|---|---|---|
| NVIDIA **검사 프로그램**의 인정 (ISO/IEC 17020) | **완료** | ANAB |
| Halos **부품**의 인증 | **미완** | TÜV는 *"certification **readiness**"* 검사 중 |
| Halos를 쓰는 **로봇**의 인증 | **미완**, NVIDIA가 할 수 있는 일도 아님 | — |

NVIDIA FAQ 원문:
> *"passed rigorous product documentation inspections **by NVIDIA safety and regulatory experts**"*

→ **NVIDIA가 파트너 문서를 검사합니다.** 인정된 체계 안에서지만 제3자 인증은 아닙니다.
NVIDIA 자신도 *"helping partners **prepare** for third-party certification"* 이라고 씁니다.

**용어 하나만 더** — **ISO/IEC 17020**(검사기관)과 **ISO/IEC 17065**(제품 인증기관)는
다른 물건입니다. 0-1에서 말한 *"증명 가능한 형태로 만드는 일"* 의 제도적 장치가 이겁니다.

---

# 6단계 (선택) — 직접 돌려보기

여기까지 하면 `WRITING.md` §2의 **"실제 비용"** 신호가 생깁니다 —
*"돌려보는 데 이틀 걸렸습니다"* 같은 문장은 해본 사람만 씁니다.

- `deployments/profiles/` — base / SIL 프로파일
- `closed-loop-testing/` — Isaac Sim + forklift-controller + regression-reporter
- `tools/srr-debug-viewer` — 결과 뷰어

**재밌는 것 하나** — 저장소에 **NVIDIA가 만든 Claude Code 스킬**이 들어 있습니다:
`skills/hoisa-deploy-profile/`, `skills/hoisa-generate-regression-report/`.
배포와 회귀 리포트 생성을 에이전트로 돌리라고 넣어둔 겁니다.
실용적으로도 쓸모 있고, **글에 한 줄 넣을 만한 디테일**이기도 합니다.

⚠️ Isaac Sim과 IGX 하드웨어가 필요할 수 있습니다. **시간이 많이 듭니다.**
글 마감이 이번 주면 6단계는 빼고 3·4단계 코드 읽기만으로 충분합니다.

---

# 최소 경로 (시간이 없으면)

**0단계 → 1단계 → 4단계 → 2단계**, 이 순서로 **5시간**.

0단계는 건너뛸 수 없습니다. 그게 나머지 전부의 해상도를 정합니다.
3단계 코드 전체 읽기는 글의 ① 섹션을 두껍게 해주지만, 논지 자체는 0·1·4·2로 섭니다.

---

# 공부하면서 채워둘 것

읽으면서 아래를 메모해두면 글이 거의 저절로 나옵니다.

- [ ] 런타임 블록 다이어그램 (내 손으로 그린 것) → 글의 ① 섹션 그림
- [ ] 카메라 → `CMD_STOP` 경로의 단계 목록 → 글의 ① 섹션 본문
- [ ] **내가 처음에 잘못 알았던 것** → `WRITING.md` §3-4 필수 항목
- [ ] **아직 모르는 것** → §3-6 필수 항목. 지금 후보: 비공개 IGX 통합 문서에
      로봇측 반응 규정이 있는지
- [ ] 자동차에서 같은 문제를 어떻게 불렀는지
      (FSI↔락스텝, 게이트웨이↔AUTOSAR E2E, DeliveryFailSafe↔FTTI 예산)
      → **§2가 말하는 "당신만 쓸 수 있는 문장"**

---

# 독자도 0단계가 필요합니다

**SeongYong 님이 걸린 자리는 독자도 걸립니다.** 독자는 로봇 SW 하는 사람들이고,
ASIL·SIL·PL을 모르는 게 정상입니다.

**글의 ① 섹션이 0-3(두 축)과 0-6(세 개의 자)을 먼저 풀어주지 않으면
④의 인증 이야기가 통째로 안 읽힙니다.** 다만 0단계 전체를 글에 넣으면 교과서가 됩니다.

→ **넣을 것**: 두 축(체계적 vs 랜덤), 그리고 SIL/PL/ASIL이 같은 것의 세 이름이라는 것.
→ **뺄 것**: HARA의 S·E·C, SPFM/LFM 계산, 분해의 세부.

`WRITING.md`의 *"필요한 만큼만 넣고 나머지는 본인 공부로 남긴다"* 가 이 경우입니다.
