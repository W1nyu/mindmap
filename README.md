# SelfMap

반응 패턴, 방어기제, 성격 경향, 관계 애착을 하나의 마음 지형도로 보여주는 자기이해 도구입니다. 진단이나 고정된 성격 유형을 제공하지 않으며, 모든 점수는 결정론적 코드로만 계산합니다.

배포: https://mindmap-mu-seven.vercel.app

## 실행

Node.js 20.9 이상. API 키와 DB 없이 실행됩니다.

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run smoke -- http://localhost:3000
```

## 화면

| 경로 | 기능 |
| --- | --- |
| `/` | 처음: 소개와 예시 지형도. 응답 기록이 있으면 대시보드(지형도, 모듈 진행, 요즘의 상태) |
| `/questions`, `/questions/[module]` | 모듈 고르기, 0–4 응답(숫자 키·Enter) |
| `/results` | 마음 지형도, 강점과 살펴볼 점, 모듈별 요약. `?example=1`은 고정 예시 응답 |
| `/results/[module]` | 모듈 상세 결과와 점수의 확실도, 계산 근거 |
| `/check-in` | 마음 상태 체크(WHO-5): 0–100 점수, 다섯 영역, 시간에 따른 변화 |

밝은 테마 하나만 씁니다.

## 모듈

| 모듈 | 문항 | 근거 |
| --- | --- | --- |
| 반응 패턴 | 32 | SelfMap 자체 문항, 8차원 |
| 방어기제 프로필 | 45 | Vaillant 방어 위계, DSM-IV 방어기능척도, DMRS(Perry, 1990) 7단계. 문항은 자체 작성 |
| 성격 5요인 경향 | 20 | IPIP Mini-IPIP 한국어 각색 |
| 관계 애착 경향 | 12 | 성인 애착 2차원 모델(Brennan 외, 1998; Fraley 외, 2000) 참고, 자체 작성 |
| 마음 상태 체크 | 5 | WHO-5 웰빙 지표(WHO, 1998; Topp 외, 2015), SelfMap 한국어 표현 |

## 채점

```text
공통 Likert 엔진 (lib/likert-engine.ts)
응답 0–4, 역채점 4 − 응답
척도 점수 = round(100 × Σ(가중치 × 채점값) / (4 × Σ가중치))
```

- 방어 수준 점수: 해당 수준 문항 평균. 7단계 위계: 단계의 몫 = 단계 점수 합 ÷ 전체 합, 점수 가중 평균 수준 = Σ(단계 × 점수) ÷ Σ점수(1–7, 참고 지표)
- 점수의 확실도: 문항 점수 표준편차 SD, 범위 = 점수 ± (SD ÷ √문항 수) × 25. 프로필 높이(평균)·퍼짐(표준편차)
- WHO-5: 원점수 × 4, 구간 ≤28 · 29–50 · ≥51, 직전 대비 10점 이상을 의미 있는 변화로 표시
- 응답 패턴 참고: 모든 응답 동일, 평균 3.5 이상/0.5 이하, 정·역방향 문항 불일치 시 해석 주의 안내

## 저장

| 데이터 | 위치 |
| --- | --- |
| 모듈별 설문 응답 | sessionStorage (탭을 닫을 때까지) |
| 마음 상태 체크 | localStorage `selfmap.wellbeing.v1` |

서버나 외부 API로 아무것도 전송하지 않습니다.

## 구조

```text
data/        문항, 척도 메타데이터, 해석 문구 (계산 없음)
lib/         likert-engine, scoring, defense-analysis, defense-levels, trait-analysis, attachment-analysis,
             integration, terrain, balance, precision, wellbeing (순수 함수)
components/  questionnaire, module-hub, charts/, results/, wellbeing/, home/
app/         App Router 경로, globals.css
tests/       node:test 단위 테스트
```
