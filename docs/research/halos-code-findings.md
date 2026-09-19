# Halos Outside-In Safety — 코드에서 확인한 것

> 조사 완료 2026-09-19. **4편 재료.** 3편(소개글)에는 넣지 않는다.
> 대상: `NVIDIA/halos-outside-in-safety` (Apache-2.0).
> 읽은 범위: safety-core 헤더 6개(1,907줄) + 수신기 구현 + closed-loop-testing 테스트.

## 경로 전체

```
카메라 → AI Perception → SafetyEvent          CRC-32 + schemaVersion 8
                       → 융합 → DecisionRequest CRC-32 + schemaVersion 8
                       → SDM 판단
                       → DecisionResponse       무결성 필드 없음
                       → 64바이트 CmdPacket     magic 0xA5 + seq + CRC-32
                       → 장비 측 수신기
                       → 100ms 창 "most conservative wins"
```

`SafetyEvent`와 `DecisionRequest`는 `MessageIntegrity`(schemaVersion + CRC-32)를
구조체 **마지막 멤버로 강제**한다. 타임스탬프는 CLOCK_MONOTONIC이고, 주석에
"설정 가능한 최대 나이보다 오래된 이벤트는 거부해야 한다"고 적혀 있다.
0-5에서 본 black channel 그대로.

되돌아오는 `DecisionResponse`에는 `MessageIntegrity`가 **없다.**
`decisionId`가 요청 ID와 맞는지만 본다 (`NvPSSDecisionResponseMatchesRequest`).

---

## 발견 1 — 같은 바이트, 반대 뜻

두 decision-maker가 같은 64바이트 패킷, 같은 매직 `0xA5`, 같은 CRC 함수를 쓰면서
옵코드 의미가 반대다.

| 바이트 | `decision-makers/proximity/include/proximity_cmd_pkt.h` | `decision-makers/atl/include/atl_cmd_pkt.h` |
|---|---|---|
| `0x02` | `CMD_STOP` — Prevent Operation | `CMD_MUTE` — **Allow** Operation |
| `0x07` | `CMD_NORMAL` — Standard Operation | `CMD_UNMUTE` — **Prevent** Operation |

짝을 잘못 물리면 모든 명령이 뒤집힌 채 CRC는 통과한다.
`cmdPacketCRC32()`는 바이트 0–19와 24–63만 해시한다. Data ID가 없다.

▸ 대비: AUTOSAR E2E 프로파일의 **Data ID** 가 정확히 이걸 막으려고 있다.
  메시지 종류마다 다른 상수를 CRC에 섞어, 다른 메시지가 흘러들면 CRC가 깨지게 한다.

---

## 발견 2 — MUTE의 방향

```
CMD_MUTE   → "MUTE (ALLOW OPERATION)"     → 🟢 Safety muted - Loading allowed
CMD_UNMUTE → "UNMUTE (PREVENT OPERATION)" → 사람이 제한구역에 들어오면
```

ATL = Autonomous Trailer Loading. 지게차 자체 안전이 막고 있는 작업을,
바깥에서 보고 "사람 없다"를 확인한 뒤 **풀어준다.**

- 출처: `skills/hoisa-deploy-profile/references/test_scenario.md`
- NVIDIA 기술 블로그: FSI RTOS가 `temporarily muting onboard safety constraints`
- README: `maximize operational throughput`

즉 레퍼런스 배포의 주력 시나리오가 "안전을 더한다"가 아니라
"안전 제약을 조건부로 푼다"이다.

▸ 4편에서 확인할 것: 기계안전의 **뮤팅(muting)** 은 정식 개념이고
  요구사항이 있다 (IEC 62046 계열 — 독립 센서 2개 이상, 순서 조건, 시간 제한,
  뮤팅 표시등 의무). **이 요구사항들을 원문으로 확인해야 한다. 미검증.**

---

## 발견 3 — 래치가 허용 쪽으로 걸린다

`closed-loop-testing/comm-layer/tests/test_no_tear.py:200`

```python
bridge.publish_command(mk(1, UNMUTE, "UNMUTE"))
bridge.publish_command(mk(2, MUTE,   "MUTE"))
bridge.publish_command(mk(3, NOP,    "NOP"))   # heartbeat: must NOT clear the mute

assert states[2] is True, "MUTE not latched"
assert states[3] is True, "heartbeat wrongly cleared the mute latch"
```

래치는 있다. 래치되는 쪽이 MUTE — 안전이 꺼진 상태다.
새 정보가 없을 때 유지되는 상태가 허용 쪽.

같은 파일 상단 주석(NVBug 6512051)이 반대 방향 고장을 스스로 지목한다:
신선한 UNMUTE 위에 낡은 MUTE가 덮이면 `is_muted=True forever`이고
그건 `a dangerous alarm-suppression` 이라고. torn read는 고쳤고, 래치 극성은 그대로.

---

## 발견 4 — 54.5초

`decision-makers/proximity/udp_cmd_receiver/cmd_rx.cpp`

```c
static constexpr int64_t kUpstreamHbExpectedMs = 5000;   // 하트비트 주기
const int64_t kPeriodMs = 5500;                          // 이후 miss 1회당
static std::atomic<uint32_t> g_maxHbFailures{10U};       // tier-3 임계
```

```
5,000 + 9 × 5,500 = 54,500 ms
```

그 사이 창 평가기는

```cpp
auto cmds = receiver.drainWindow();
if (cmds.empty())
    continue;          // 빈 창이면 직전 상태 유지
```

명령 자체에는 타임아웃이 없다. 하트비트만 본다.
tier-2(active fault)는 32.5초, tier-3에서 `requestStop()` — 수신 **프로세스**가 종료된다.
`--max_hb_failures` 인자(1–255)로 바꿀 수 있고, warnThreshold = max/2.

▸ 비교: ISO 13849 광커튼은 수십 ms 안에 반응해야 한다.

---

## 그 밖에

- **`CMD_NORMAL`이 안전 래치를 해제한다.** `cmd_rx.cpp:479` —
  `CMD_SW_ERROR`로 걸린 `SAFE-STATE LATCHED`를 `CMD_SAFE_RELEASE_ACK` 뿐 아니라
  평범한 `CMD_NORMAL`/`CMD_REDUCE`도 지운다. 3단 핸드셰이크를 일반 명령이 우회.
- **어휘가 두 벌이다.** `pss_protocol.h`의 `RecommendedAction`은
  `ESTOP` / `AUDIO_WARNING` / `VISUAL_WARNING` / `IMPLEMENT_SAFETY_CONTROL` / `NO_ACTION_REQUIRED`.
  실제로 나가는 `CmdPacket`은 `STOP`/`REDUCE`/`NORMAL`. 대응이 어디에도 없고
  `IMPLEMENT_SAFETY_CONTROL`의 뜻은 저장소 전체에 없다.
- **잘 된 것:** `NvPSSDeliveryFailSafe.hpp` — 재시도 예산(1–10, 기본 3),
  응답 타임아웃(100–30,000ms, 기본 2,000), 재시도 윈도우 상한 6,000ms를
  전부 검증 함수로 묶었다. 실패 시 `DELIVERY_ERROR_ACTIVE` → `OperationalMode::ERROR`.
  `CRITICAL` 우선순위는 `OPERATIONAL`의 2.5ms 릴리스 게이트를 건너뛴다.

---

## 반드시 붙여야 할 단서

`cmd_rx.cpp` 첫 줄: `Simulates the humanoid robot's command interpreter.`

**제품이 아니라 레퍼런스 데모다.** 래치는 `std::cout`이고 액추에이터가 없다.
54.5초도 인자로 바뀐다. 이걸 빼고 쓰면 §1의 14번(주장)에 걸린다.

다만 논지는 약해지지 않는다. 문서가
`SDM logic is deployment-specific; integrators implement their own behavior`
라고 말하는 그 경계 너머를 열었더니 데모 기본값이 있었다는 것 자체가 결과다.

---

## 3편에 넣지 않는 이유

3편은 소개글이다(구조 · 왜 · 언제). 위 네 개는 전부 판단이 붙는 재료라
소개글에 넣으면 결론을 먼저 말하는 글이 된다.
그리고 `WRITING.md` §3에 따라 **3편에서 4편을 예고하지 않는다.**
