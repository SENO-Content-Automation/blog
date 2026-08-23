---
title: "AI Act (EU) 2024/1689 와 한국 로봇 관련성"
description: "AI Act가 우리 로봇에 언제 걸리는지, 걸린다면 어느 경로로 걸리는지 알아보고자 한다"
pubDate: 2026-08-23
category: standards
tags: ["eu-regulation"]
draft: true
---

## 이 문서에서 다루는 범위

AI Act 적용 단계는 아래와 같이 나눌 수 있습니다.

<svg viewBox="0 0 720 232" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="AI Act 대응 다섯 단계 중 이 글이 다루는 앞의 두 단계">
  <title>AI Act 적용 다섯 단계와 이 글의 범위</title>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="8" y="26" width="210" height="62" rx="6"/>
    <rect x="234" y="26" width="210" height="62" rx="6"/>
  </g>
  <g fill="currentColor" font-size="14">
    <text x="24" y="52">[1] 왜 우리한테 걸리는가</text>
    <text x="250" y="52">[2] 어느 칸에 들어가는가</text>
  </g>
  <g fill="currentColor" font-size="12" opacity="0.7">
    <text x="24" y="72">적용 범위 · CE 체계</text>
    <text x="250" y="72">고위험 판정</text>
    <text x="470" y="61">← 이 글</text>
  </g>
  <g opacity="0.5">
    <line x1="8" y1="112" x2="712" y2="112" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5"/>
  </g>
  <text x="360" y="106" fill="currentColor" font-size="12" text-anchor="middle" opacity="0.85">고위험이 아니면 여기서 끝난다</text>
  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.55">
    <rect x="8" y="134" width="210" height="62" rx="6"/>
    <rect x="234" y="134" width="210" height="62" rx="6"/>
    <rect x="460" y="134" width="210" height="62" rx="6"/>
  </g>
  <g fill="currentColor" font-size="14" opacity="0.55">
    <text x="24" y="160">[3] 무엇을 갖추나</text>
    <text x="250" y="160">[4] 무엇으로 증명하나</text>
    <text x="476" y="160">[5] 누가 확인하나</text>
  </g>
  <g fill="currentColor" font-size="12" opacity="0.45">
    <text x="24" y="180">제3장 제2절</text>
    <text x="250" y="180">정합표준</text>
    <text x="476" y="180">적합성평가 · 인증기관</text>
  </g>
</svg>

이 글은 **고위험 판정까지**, 앞의 두 단계만 다룹니다. 판정이 나와야 [3]부터가 정해지기 때문입니다.

그리고 한국에서 로봇을 개발한다면 [1]~[2] 다음에 질문이 하나 더 남습니다 — **수출하지 않으면 상관없는 이야기인가.** 이것도 마지막에 함께 다루었습니다.

---

## ① AI Act는 무엇을 하는 법인가

**AI Act = [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng).** 이 법의 주요 발상은 **AI를 용도별 위험 수준으로 나누고, 칸마다 다른 무게의 의무를 거는 것**입니다.

| 칸 | 무엇 | 의무 |
|---|---|---|
| **금지** ([제5조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5)) | 사회적 점수화, 특정 생체인식 등 | 시장 출시 자체가 불가 |
| **고위험** ([제6조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6)) | 안전이나 기본권에 실질적 영향을 주는 것 | 가장 무거움. 관리체계 전반 |
| **투명성 의무** ([제50조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50)) | 챗봇, 딥페이크 등 | "AI와 상호작용 중"임을 알릴 것 |
| **그 외** | 나머지 대부분 | 별도 의무 없음 |

*법이 "네 칸"이라고 선언한 것은 아니고, 제5조·제6조·제50조가 건 의무를 묶어본 것입니다.*

이 법이 우리한테 걸리는 기준은 제조사의 국적이나 공장 위치가 아닙니다. [제2조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-2)가 정하는 것은 **그 시스템이 EU 시장에 놓이는가**입니다. 한국에서 만들고 한국에서 조립해도 EU에 내놓는 순간 EU 제조사와 같은 의무를 지게 됩니다.

의무를 지는 주체는 [제3조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3)가 나눕니다. 자기 이름이나 상표로 시장에 내놓는 쪽이 **제공자(provider)**, 그것을 자기 권한 아래에서 쓰는 쪽이 **배포자(deployer)**이고, 로봇을 만들어 파는 회사는 제공자입니다.

---

## ② 우리 로봇이 고위험인가

### 고위험이 되는 경로는 둘입니다

[제6조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6)가 고위험을 정의하는데, 1항과 2항이 서로 다른 경로를 하나씩 정합니다. **둘 중 하나만 해당해도 고위험**입니다.

- **1항** — 그 AI가 **이미 제품안전 규제를 받는 제품**에 실려 있고, 그 제품이 제3자 인증을 받아야 하는 경우
- **2항** — 그 AI가 **정해진 용도 목록**에 해당하는 경우

각 항이 참조하는 부속서는 종류가 다릅니다. [**부속서 I**](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-1)은 기계류·완구·승강기·의료기기 같은 **EU 제품안전법을 나열한 법률 목록**이고, [**부속서 III**](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3)은 채용·교육·법집행 같은 **쓰임새를 나열한 용도 목록**입니다. 즉 1항은 "이 제품을 규율하는 법이 목록에 있는가"를, 2항은 "이 시스템의 쓰임새가 목록에 있는가"를 묻습니다.

<svg viewBox="0 0 720 336" width="100%" style="max-width:720px;height:auto;display:block;margin:1.5rem 0" role="img" aria-label="제6조 1항과 2항이 각각 정하는 두 개의 고위험 판정 경로. 둘 중 하나만 해당해도 고위험">
  <title>고위험이 되는 두 경로 — 둘 중 하나만 해당해도 고위험</title>
  <defs>
    <marker id="aiact-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="270" y="6" width="180" height="40" rx="6"/>
  </g>
  <text x="360" y="31" fill="currentColor" font-size="14" text-anchor="middle">우리 AI 시스템</text>
  <g stroke="currentColor" stroke-width="1.2" fill="none">
    <path d="M360 46 L360 64 M175 64 L545 64"/>
    <path d="M175 64 L175 80" marker-end="url(#aiact-arrow)"/>
    <path d="M545 64 L545 80" marker-end="url(#aiact-arrow)"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="20" y="84" width="310" height="34" rx="6"/>
    <rect x="390" y="84" width="310" height="34" rx="6"/>
  </g>
  <g fill="currentColor" font-size="13" text-anchor="middle">
    <text x="175" y="106">제6조 1항 — 제품에 실린 AI</text>
    <text x="545" y="106">제6조 2항 — 용도로 정해진 AI</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1" opacity="0.75">
    <rect x="20" y="134" width="310" height="50" rx="6"/>
    <rect x="20" y="212" width="310" height="50" rx="6"/>
    <rect x="390" y="134" width="310" height="50" rx="6"/>
  </g>
  <g fill="currentColor" font-size="12.5" text-anchor="middle">
    <text x="175" y="154">ⓐ 부속서 I의 법이 적용되는 제품의</text>
    <text x="175" y="172">안전부품인가</text>
    <text x="175" y="202" font-size="12" opacity="0.8">AND</text>
    <text x="175" y="232">ⓑ 그 제품이 제3자 적합성평가</text>
    <text x="175" y="250">대상인가</text>
    <text x="545" y="154">부속서 III에 열거된</text>
    <text x="545" y="172">용도인가</text>
    <text x="545" y="204" font-size="12" opacity="0.7">채용 · 교육 · 법집행 등</text>
  </g>
  <text x="360" y="278" fill="currentColor" font-size="11.5" text-anchor="middle" opacity="0.85">둘 중 하나만 해당해도</text>
  <g stroke="currentColor" stroke-width="1.2" fill="none">
    <path d="M175 262 L175 284 M545 184 L545 284 M175 284 L545 284"/>
    <path d="M360 284 L360 292" marker-end="url(#aiact-arrow)"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="270" y="292" width="180" height="40" rx="6"/>
  </g>
  <text x="360" y="317" fill="currentColor" font-size="14" text-anchor="middle">고위험 (high-risk)</text>
</svg>

### 1항 — 조건 두 개를 충족해야 합니다

- **ⓐ** 그 AI가 부속서 I에 열거된 법의 적용을 받는 제품의 안전부품이거나, AI 자체가 그런 제품일 것
- **ⓑ** 그 제품이 **제3자 적합성평가**(제조자 자기인증이 아니라 인증기관이 확인하는 것)를 받도록 요구될 것

그래서 **ⓐ만으로는 고위험이 아닙니다.** 자기인증으로 [CE](https://single-market-economy.ec.europa.eu/single-market/ce-marking_en)를 붙일 수 있는 제품이면, AI가 들어 있어도 1항의 고위험이 아닙니다. "AI 넣었으니 고위험"은 성립하지 않습니다.

그리고 ⓑ를 결정하는 것은 AI Act가 아닙니다. **그 제품을 규율하는 법**, 로봇이면 [기계류규정 (EU) 2023/1230](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng)이 정합니다. 이 규정은 제3자 평가가 강제되는 고위험 기계류 목록을 따로 갖고 있는데, 여기에 **머신러닝으로 자기진화하는 거동을 가지면서 안전기능을 수행하는 안전부품**이 들어 있습니다 ([정리](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation)). 이 목록에 걸리면 자기인증이 막히고, 그 순간 ⓑ가 충족됩니다.

그래서 **이 목록에 들어가는지**, 결국 우리 로봇이 고위험인지를 가르는 질문은 **"AI를 쓰는가"가 아니라 "AI가 안전기능을 맡는가"**입니다. 같은 모델이라도 별도 안전계층 아래에 놓여 명령이 걸러지면 답이 달라집니다. 법 문제로 시작했는데 아키텍처 문제로 되돌아옵니다.

### 언제부터인가

| 대상 | 적용일 |
|---|---|
| 제6조 **1항** — 제품에 실린 AI (로봇) | **2028-08-02** |
| 제6조 **2항** — 용도로 정해진 AI | 2027-12-02 |
| 투명성 의무 ([제50조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50)) | 2026-08-02 (적용 중) |

1항은 원래 2027년 8월이었는데 [Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng)로 1년 미뤄졌습니다. 근거 조문은 [제113조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-113)입니다.

---

## ③ 그럼 수출하지 않으면 상관없을까요

### 고객사와 발주처를 통해 먼저 내려옵니다

우리가 EU에 직접 팔지 않아도, 우리 모듈을 넣은 장비를 만드는 회사가 EU에 팔면 요구는 위에서 내려옵니다.

AI Act는 이걸 명시적으로 다룹니다. [제25조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-25)가 가치사슬을 따라 책임을 배분하면서, **고위험 시스템 제공자와 부품·도구를 공급한 제3자가 필요한 정보와 기술적 접근을 서면 합의로 정하도록** 하고 있습니다. 완제품 쪽이 고위험 의무를 지면 그 이행에 필요한 것들이 계약서를 타고 부품 공급사로 내려온다는 뜻입니다.

### 한국은 어디까지 와 있나

한국에도 AI 법은 있습니다. [**인공지능 발전과 신뢰 기반 조성 등에 관한 기본법**](https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5%EB%B0%9C%EC%A0%84%EA%B3%BC%EC%8B%A0%EB%A2%B0%EA%B8%B0%EB%B0%98%EC%A1%B0%EC%84%B1%EB%93%B1%EC%97%90%EA%B4%80%ED%95%9C%EA%B8%B0%EB%B3%B8%EB%B2%95)이 [2026년 1월 22일 시행](https://www.shinkim.com/kor/media/newsletter/3114)됐고, EU의 "고위험"에 대응하는 개념이 **고영향 인공지능**입니다.

고영향 AI는 법에 열거된 영역에서 활용될 때 성립합니다 — 에너지 공급, 먹는물 생산, 보건의료, **의료기기·디지털의료기기의 개발과 이용**(「의료기기법」·「디지털의료제품법」), 원자력시설 관리, 범죄 수사용 생체인식 분석, 채용·대출 심사, **교통수단·교통시설·교통체계의 주요 작동과 운영**(「교통안전법」), 공공기관 의사결정, 학생 평가, 그리고 대통령령으로 정하는 영역 ([정리](https://zdnet.co.kr/view/?no=20241226170834)).

목록을 보면 EU의 용도 축(부속서 III)과 제품법 참조 축(부속서 I)이 **한 목록 안에 섞여** 있습니다. 의료기기와 교통은 실제로 제품 규제법을 인용합니다. 다만 로봇을 만드는 입장에서는 두 가지가 다릅니다.

**첫째, 기계류를 가리키는 항목이 없습니다.** 의료기기와 교통수단은 있지만 산업용 로봇이나 협동로봇이 들어갈 자리는 열거되어 있지 않습니다.

**둘째, 목록에 들어가도 인증 트랙이 열리지 않습니다.** EU 1항은 "그 제품이 제3자 적합성평가 대상인가"를 조건으로 걸어 제품안전법의 인증 절차와 맞물립니다. 한국법에는 그 연결이 없습니다. 고영향에 해당하면 사업자가 스스로 확인하고(과기정통부에 확인을 요청할 수 있습니다), 위험관리·설명·이용자 보호 방안을 세워 공개하는 구조입니다. 인증기관이 확인하는 절차는 없습니다.

| 항목 | EU AI Act | 한국 (2026-08 현재) |
|---|---|---|
| 걸리는 축 | 용도 + **제품 안전부품** | 열거된 영역 — 의료기기·교통 등 제품법 인용 포함, **기계류는 없음** |
| AI가 안전기능을 맡을 때 | 제3자 적합성평가 강제 | 인증 트랙 없음 (사업자 자체 확인) |
| 위험관리체계 | 의무 | 안전성·신뢰성 확보조치 (하위법령) |
| 학습데이터 거버넌스 | 의무 | 편향 관련 직접 규정 공백 |
| 자동 로그 기록 | 의무 | 명시 없음 |
| 중대사고 보고 | 의무 | 명시 없음 |

국내 로봇 인증 제도가 지금 다루는 것도 기계적 안전과 설치 환경이고, **"AI가 안전기능을 수행하면 제3자 인증이 강제된다"는 트리거는 어디에도 없습니다.**

---

## 마무리

지금까지 AI Act가 우리 로봇에 어떤 경로로 걸리는지, 그리고 수출하지 않아도 그 요구가 어떻게 도착하는지 알아봤습니다.

미래의 한국 로봇 안전 분야에 대해 지도를 그려보는 시간이 되었으면 합니다.

다음에는 이 글의 마지막 갈림길이었던 "AI가 안전기능을 맡는가" 쪽 — 안전계층을 어디에 어떻게 두는지 — 을 이야기해볼까 합니다.

다음에 더 좋은 글로 찾아뵙겠습니다. 감사합니다.

---

## Reference

| 질문 | 열어야 할 곳 |
|---|---|
| 우리 AI가 고위험인가 | [제6조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6) |
| 어떤 제품안전법이 대상인가 | [부속서 I](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-1) |
| 용도로 걸리는 목록은 | [부속서 III](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3) |
| 금지·투명성 의무는 | [제5조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5) · [제50조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50) |
| 고위험이면 무엇을 갖추나 | [제3장 제2절](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-8) |
| 제공자·배포자, 역외 제공자의 공인대리인 | [제3조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3) · [제16조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-16) · [제22조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-22) |
| 부품 공급사에게 무엇이 요구되나 | [제25조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-25) |
| 언제부터인가 · 왜 바뀌었나 | [제113조](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-113) · [Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng) |
| 우리 제품이 제3자 평가 대상인가 | [기계류규정 (EU) 2023/1230](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng) |
| 국내 의무는 | [인공지능 기본법 원문](https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5%EB%B0%9C%EC%A0%84%EA%B3%BC%EC%8B%A0%EB%A2%B0%EA%B8%B0%EB%B0%98%EC%A1%B0%EC%84%B1%EB%93%B1%EC%97%90%EA%B4%80%ED%95%9C%EA%B8%B0%EB%B3%B8%EB%B2%95) · [시행 정리](https://www.shinkim.com/kor/media/newsletter/3114) |

법 전문은 [AI Act 원문](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng)에 있습니다.
