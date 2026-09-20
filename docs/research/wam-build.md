# World-Action Model을 만들려면 — 자료조사

> 조사일 2026-09-20. 4편(지도 수준) 재료.
> 표기: 표시 없음 = 1차 출처 확인 / **[U]** 미확인 — 사실로 쓰지 말 것
>
> 이 문서의 목적은 **부품 이름과 역할, 갈림길과 그 대가, 어디서 시작하는지**까지입니다.
> 학습 하이퍼파라미터나 연산 규모는 다루지 않습니다.

---

## 0. 한 줄

WAM은 **비디오 생성 모델을 정책으로 바꾼 것**입니다. 만들려면 세 가지를 정해야 합니다 —
어떤 비디오 백본에서 출발할지, 행동을 그 표현 공간에 **어떻게 밀어 넣을지**,
그리고 행동을 **어떻게 되뽑을지**.

NVIDIA의 정의가 범주를 정확히 긋습니다:
> "a policy that starts from a pretrained world-model or video backbone and adapts it to
> represent or predict how the scene changes over time and emit corresponding actions."
> — https://developer.nvidia.com/blog/pretrained-to-imagine-fine-tuned-to-act-the-rise-of-world-action-models/ (2026-06-15)

---

## 1. 시작점 — OpenWAM

**따라 만들려는 사람에게 제일 중요한 출처입니다.** Apache-2.0.

- 저장소 https://github.com/OpenWAM-Official/OpenWAM
- 프로젝트 페이지 https://openwam-official.github.io/
- 논문 https://arxiv.org/abs/2609.07398 (2026-09-07)

저장소 설명: *"turns tightly coupled design choices into modular components and controlled experiments."*

### 세 덩어리

| 이름 | 무엇 |
|---|---|
| **OpenWAM-Infra** | 모델·표현·학습·추론·배포·평가 선택지를 조립하는 모듈형 인프라 |
| **OpenWAM-Study** | 통제 실험. 어느 선택이 왜 이기는지 |
| **OpenWAM-α** | 사전학습 체크포인트. 1인칭 사람 + 로봇 **518.5M 프레임** |

### 디렉터리

`openwam/` 본체 · `configs/` Hydra YAML · `scripts/` 학습·배포·자산 다운로드 ·
`benchmarks/` 평가 환경 · `tests/` · `assets/` 내려받은 모델·데이터·체크포인트

### 파이프라인 5단

```
자산 준비 → 설정(Hydra) → 학습(scratch 또는 파인튜닝) → 배포(WebSocket) → 추론
```

### 고를 수 있는 백본

- **비디오**: Wan2.2-TI2V-5B, Wan2.1-VACE-1.3B, Cosmos-Predict2.5-2B, Cosmos3-Edge
- **시각 인코더**: DINOv3 ViT-B/16, V-JEPA 2.1 ViT-G/16
- **VLM**: Qwen3-VL-2B-Instruct

### 벤치마크

RoboTwin2.0, RoboDojo, RoboDojo-Real, LIBERO, VLABench, EBench, RoboCasa365, RoboCasa_GR1

### 퀵스타트 조합

**DualSystem + JointSelfAttention + Wan2.2-TI2V-5B + LIBERO.**
자산 내려받기 → 디버그 학습 → 체크포인트 배포 → 추론 테스트.

→ **글에 쓸 문장**: 처음 만드는 사람이 실제로 고르는 조합이 저장소에 기본값으로 박혀 있습니다.

---

## 2. 정해야 하는 여섯 가지 — OpenWAM의 설계 축

프로젝트 페이지가 통제 실험으로 비교한 축입니다. **이게 곧 "무엇을 정해야 하는가" 목록입니다.**

| # | 축 | 질문 |
|---|---|---|
| 1 | 아키텍처 | 비디오와 행동을 한 탑에 넣나, 두 탑으로 나누나 |
| 2 | 백본 | 어떤 비디오 생성 모델에서 출발하나 |
| 3 | 시각 표현 | 어떤 인코더, 잠재 차원은 얼마나 |
| 4 | world–action 상호작용 | 두 흐름이 서로를 어떻게 보나 |
| 5 | 데이터 레시피 | 사전학습 혼합 비율 |
| 6 | 디노이징 전략 | 추론에서 언제 몇 번 |

### 결론 셋 (원문)

1. **상속** — *"A sufficiently capable generative backbone and a compact, information-rich visual representation space"*
2. **시너지** — *"Dedicated action capacity and world-to-action visibility are necessary; synchronized denoising performs best."*
3. **확장** — *"One-stage co-training integrates both effectively"* (1인칭 사람 + 로봇 데이터)

그리고 축 4에 대한 핵심 문장:
> *"World–action synergy requires explicit world-to-action information flow during training,
> and synchronized joint denoising at inference."*

---

## 3. 행동을 어디에 끼워 넣나 — 네 가지 답

**여기가 글의 중심입니다.** 같은 문제에 네 팀이 다른 답을 냈고, 대가가 다릅니다.

### 3-A. 잠재 프레임으로 채워 넣기 — Cosmos Policy

https://arxiv.org/abs/2601.16163 (2026-01-22) · 본문 https://arxiv.org/html/2601.16163v1

**아키텍처를 안 고칩니다.** 원문:
> *"we fill each H′×W′×C′ latent volume with normalized and duplicated copies of the robot
> proprioception, action chunk, or value"*
> *"no architectural modifications"* / *"all modalities are jointly modeled through the video
> diffusion learning objective"*

값을 [-1, +1]로 정규화해 잠재 볼륨을 채우고, 기존 이미지 프레임 사이에 **추가 잠재 프레임으로 끼웁니다.**

시퀀스 순서가 **(s, a, s′, V(s′))** 이고, 왼쪽에서 오른쪽으로 자기회귀 디코딩하면
행동·미래 상태·그 상태의 가치가 차례로 나옵니다.

**추론 시 계획** — best-of-N: 행동 후보 여러 개를 뽑고, 월드 모델로 각각의 미래와 가치를 예측해,
가치가 제일 높은 것을 고릅니다. 앙상블은 행동당 월드 모델 **3회**, 미래 상태당 가치 **5회**.

**대가**: 시퀀스가 길어집니다. 계획을 켜면 한 스텝에 모델을 여러 번 돌립니다.
**얻는 것**: 백본을 안 건드려서 구현이 제일 가볍습니다.

### 3-B. 두 탑 + 상호 어텐션 — OpenWAM DualSystem

비디오 DiT 하나, **전용 ActionDiT** 하나. 둘을 **joint self-attention**으로 묶습니다.
**mutual attention mask**로 두 흐름이 서로를 자유롭게 읽되,
잡음 낀 성분과 깨끗한 현재 프레임 앵커는 분리해 둡니다.

**대가**: 파라미터가 늘고 학습이 복잡합니다.
**얻는 것**: 행동 전용 용량. OpenWAM의 결론 2가 이게 필요하다고 말합니다.

### 3-C. 세 단계로 분리 — GE-Act 2.0

https://arxiv.org/abs/2609.05588 (2026-09-04, AgiBot) · 본문 https://arxiv.org/html/2609.05588v1

| 부품 | 입력 | 출력 |
|---|---|---|
| **CoAE** (control-oriented autoencoder) | 프레임 | 프레임당 **24토큰** 잠재 (4×6 격자, 512채널) |
| **SVP** (single-step visual planner) | 다시점 관측 + 고유수용 + 언어 | 미래 시각 잠재 **전체를 한 번의 forward로** |
| **IDM** (inverse dynamics model) | 현재+예측 잠재 + 고유수용 | 행동 시퀀스 |

- CoAE는 픽셀 복원 + **얼린 시각 교사 셋(SigLIP, V-JEPA, DINOv3)** 에 정렬. 정렬 헤드 세 개
- SVP는 conditional MeanFlow로 한 번에 생성. *"one forward evaluation of the learned field maps noise to data"*
  가까운 미래는 조밀한 프레임, 먼 미래는 성긴 프레임으로 같이 예측
- IDM은 **로봇 궤적으로 따로 먼저 학습**합니다. 그래서 *"instruction-free robot trajectories
  such as failed attempts and deployment rollouts"* — **실패한 시도와 배포 롤아웃까지** 재료가 됩니다

**학습 3단**: CoAE 사전학습 → SVP·IDM 각자 사전학습 → **KASO**(Knowledge-Aligned Selective
Optimization)로 공동학습

**대가**: 부품이 셋이라 각각 학습 절차가 있습니다.
**얻는 것**: 각 부품을 다른 데이터로 채울 수 있습니다. 위의 "실패한 시도"가 그 예입니다.

### 3-D. 단일 모델 end-to-end — DreamZero

https://arxiv.org/abs/2602.15922 (2026-02-17) · 본문 https://arxiv.org/html/2602.15922v1

> *"we train a single model end-to-end with joint prediction objective"*

결합을 이렇게 분해합니다 — 관측과 언어로 **비디오를 예측**하고,
예측된 프레임과 고유수용으로 **역동역학이 행동을 뽑습니다.**

---

## 4. 데이터 — 행동 라벨 없는 영상이 재료가 된다

**이게 이 계열이 이긴 이유입니다.**

DreamZero 원문:
> *"we use only the video prediction objective for the cross-embodiment data (no actions),
> while maintaining the joint video-action objective for the AgiBot pretraining data."*

즉 **손실 함수를 데이터 출처마다 바꿉니다.** 로봇 시연에는 비디오+행동 목적을, 사람 영상에는 비디오 목적만.

| 출처 | 규모 | 비고 |
|---|---|---|
| OpenWAM-α | 1인칭 사람 + 로봇 **518.5M 프레임** (논문 기준 약 6,400시간) | 가중치 공개 |
| GE-Act 2.0 공동학습 | **300시간 → 30,000시간** | 100배 실험 |
| DreamZero 이식 | 새 로봇에 **30분 play 데이터** | 제로샷 일반화 유지 |

효과 수치: DreamZero는 다른 로봇·사람 영상만으로 처음 보는 과제 **42% 상대 개선**,
기존 VLA 대비 일반화 **2배 이상**.

---

## 5. 천장 — 만들기 전에 알고 들어갈 숫자

### 5-A. 성공률

GE-Act 2.0, 과제별 파인튜닝 없이 20개 스킬 그룹 100개 조작 과제:

| 하드웨어 | 300시간 | 30,000시간 |
|---|---|---|
| G1-OP | 17.1% | **44.1%** |
| G2-90D | 13.4% | **31.1%** |

**데이터 100배에 2.6배.** 그리고 절반 넘게 실패합니다.

시뮬레이터는 더 좋습니다 — Cosmos Policy가 LIBERO **98.5%**, RoboCasa **67.1%**.

### 5-B. 속도

DreamZero: **14B 오토리그레시브 비디오 디퓨전으로 7Hz 폐루프**. 한 주기 143ms.
그냥 되는 게 아니라 **38배 최적화의 결과**입니다 — 5.7초 → 약 150ms. 세 가지를 합쳤습니다.

1. **비동기 폐루프** — *"the motion controller continuously executes the most recent action chunk
   while inference runs concurrently"*. 추론을 기다리지 않습니다
2. **KV 캐시 + 실측 주입** — 청크 실행 후 *"replace predicted frames with ground-truth
   observations in the KV cache"*. 오차 누적을 끊으면서 캐시를 유지
3. **DreamZero-Flash** — 비디오와 행동의 노이즈 스케줄을 분리. 비디오는 고노이즈 편향,
   행동은 완전 디노이즈. 추론 확산 스텝 **4 → 1**

→ **글에 쓸 문장**: 비동기 실행은 안전 쪽에서 낯익은 구조입니다. 명령이 나오기 전까지
직전 청크를 계속 실행한다는 뜻이고, 그게 최악 반응 지연을 정합니다.

---

## 6. 확인 못한 것 — 인용 금지

1. **[U]** OpenWAM의 각 설계 축 실험 수치 — 프로젝트 페이지의 결론 문장만 확인. 표는 못 봄
2. **[U]** OpenWAM-α의 6,400시간과 518.5M 프레임이 같은 집합인지 — 논문 초록과 저장소 설명을 대조만 함
3. **[U]** GE-Act 2.0의 KASO 세부 — 이름과 위치만 확인
4. **[U]** Cosmos Policy의 best-of-N에서 N 값 — 앙상블 횟수(3회/5회)만 확인
5. **[U]** 각 백본(Wan2.2, Cosmos-Predict2.5)의 라이선스 — OpenWAM 자체는 Apache-2.0
6. **[U]** 학습에 필요한 GPU 규모 — 어느 문서에서도 확인 못 함. **지도 수준이라 다루지 않음**

---

## 7. 글에 쓸 뼈대

```
관측 ─→ [비디오 백본]  ─→ 예측된 미래 잠재 ─→ [행동을 되뽑는 자리] ─→ 관절 명령
              ↑                                        ↑
        어디서 출발하나                          IDM / ActionDiT / 잠재 프레임
```

세 자리 전부에 갈림길이 있고, 4개 팀이 다르게 골랐습니다. 그게 이 글의 내용입니다.
