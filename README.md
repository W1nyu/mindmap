# SelfMap

정서조절, 방어기제, 성격 5요인, 성인 애착을 공인 심리 척도로 측정해 통합 프로필과 유형 카드로 보여주는 자기이해 도구입니다. 진단을 제공하지 않고, 유형은 연구의 분류 기준에 따른 지금의 경향으로만 보여주며, 모든 점수는 결정론적 코드로 계산합니다.

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
| `/` | 처음: 소개와 예시 프로필. 기록이 있으면 대시보드(통합 프로필, 네 검사 진행, 요즘의 상태) |
| `/questions` | 검사 고르기: 모듈마다 간편 검사와 심층 검사 |
| `/questions/[module]?form=brief\|deep` | 원 척도 그대로의 선택지(5·7·9점), 숫자 키·Enter |
| `/results` | 나의 유형 카드, 통합 프로필 바퀴(지표 하나가 부채꼴 하나, 길이 = 점수, 가운데 곡선 = 함께 두드러진 지표의 연결), 강점과 살펴볼 점. `?example=1`은 고정 예시 응답 |
| `/results/[module]?form=` | 유형 카드, 모듈 상세 차트, 점수의 확실도, 계산 근거(원 척도 평균) |
| `/check-in` | 마음 상태 체크(WHO-5): 오늘·이번 주 단위로 기록, 다섯 영역, 시간에 따른 변화 |

밝은 테마 하나만 씁니다.

## 검사

모든 검사는 논문으로 발표된 공인 척도이며, 척도 이름은 한국판 척도의 표기를 따릅니다. 출처, 확인한 원문, 사용 조건, 용어, 유형 분류 기준은 [docs/instruments.md](docs/instruments.md)에 있습니다.

| 모듈 | 간편 | 심층 | 응답 |
| --- | --- | --- | --- |
| 정서조절 | DERS-18 | DERS-36 | 5점 |
| 방어기제 | DSQ-40 | DSQ-60 | 9점 |
| 성격 5요인 | BFI-2-S | BFI-2 (15개 하위 측면) | 5점 |
| 성인 애착 | ECR-S | ECR-R | 7점 |
| 상태 체크 | WHO-5 | — | 6점 |

## 채점

```text
공통 Likert 엔진 (lib/likert-engine.ts)
응답 0 … (선택지 수 − 1), 화면에는 1부터 표시
역채점 = (선택지 수 − 1) − 응답
척도 평균 = 원 척도 단위(1 … 선택지 수)의 문항 평균
0–100 점수 = (평균 − 1) ÷ (선택지 수 − 1) × 100
```

- 방어 스타일: DSQ-40은 Andrews 외(1993)의 세 요인, DSQ-60은 DMRS 단계(7 성숙 · 5–6 신경증적 · 1–4 미성숙)로 묶음
- DMRS 7단계: 단계의 몫 = 단계 방어 점수 합 ÷ 전체 합, 가중 평균 수준 = Σ(단계 × 점수) ÷ Σ점수(참고 지표)
- 점수의 확실도: 문항 점수 표준편차 SD, 범위 = 점수 ± (SD ÷ √문항 수) × 100 ÷ (선택지 수 − 1)
- WHO-5: 원점수 × 4, 구간 ≤28 · 29–50 · ≥51, 같은 기간끼리 10점 이상 변화를 ‘큰 변화’로 표시. 같은 날 같은 기간으로 다시 하면 그날 기록을 바꿈
- 응답 패턴 참고: 모든 응답 동일, 거의 모두 최고·최저, 정·역방향 문항 불일치 시 해석 주의 안내

## 저장

| 데이터 | 위치 |
| --- | --- |
| 검사 응답(모듈 × 간편·심층) | localStorage `selfmap.v3.{module}.{form}` |
| 마음 상태 체크 | localStorage `selfmap.wellbeing.v1` |

서버나 외부 API로 아무것도 전송하지 않습니다. 응답은 이 브라우저에 남으며 결과 화면에서 지울 수 있습니다.

## 구조

```text
data/        문항, 척도 메타데이터, 해석 문구 (계산 없음)
lib/         likert-engine, emotion/defense/trait/attachment-analysis, defense-levels, profile-types,
             integration, profile-map, balance, precision, wellbeing (순수 함수)
components/  questionnaire, module-hub, charts/, results/, wellbeing/, home/
app/         App Router 경로, globals.css
tests/       node:test 단위 테스트
```
