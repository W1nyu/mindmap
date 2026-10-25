import type { LikertResponse, LikertValue, ScoreEvidence } from "./psychology";

/** 모든 검사가 공유하는 문항 계약입니다. `scale`은 검사마다 다른 척도 ID입니다. */
export interface LikertItem<S extends string = string> {
  id: string;
  kind: "likert";
  text: string;
  scale: S;
  reverse: boolean;
  weight: number;
}

export interface LikertOption {
  /** 0부터 시작하는 내부 값. 화면에는 value + origin을 보여줍니다. */
  value: LikertValue;
  label: string;
}

export interface LikertInstrument<S extends string = string> {
  id: string;
  version: string;
  /** 응답 선택지 수(원 척도 그대로: IPIP·DERS 5점, ECR 7점, DSQ 9점) */
  points: number;
  /** 선택지 이름. 길이는 points와 같습니다. */
  options: readonly LikertOption[];
  /** 원 척도의 첫 번호(대부분 1, DMRS-SR-30은 0). 화면 표시와 평균 단위에만 씁니다. */
  origin: number;
  scaleIds: readonly S[];
  items: readonly LikertItem<S>[];
}

export interface ScaleScore<S extends string = string> {
  scale: S;
  /** 0–100으로 옮긴 점수 */
  score: number;
  /** 원 척도 단위(origin부터)의 문항 평균, 소수 둘째 자리 */
  mean: number;
  weightedSum: number;
  weightSum: number;
  evidence: readonly ScoreEvidence[];
}

export interface InstrumentResult<S extends string = string> {
  source: "computed";
  instrumentId: string;
  instrumentVersion: string;
  scoringVersion: string;
  points: number;
  /** 원 척도의 첫 번호 */
  origin: number;
  responseCount: number;
  scales: readonly ScaleScore<S>[];
}

export interface ScaleMeta<S extends string = string> {
  id: S;
  name: string;
  shortName: string;
  description: string;
}

/** 점수 구간. 0–100 위의 네 구간입니다. */
export type ScoreBand = "rare" | "sometimes" | "often" | "prominent";

/** 응답 스타일 참고 정보. 결과를 무효화하지 않고 해석 주의만 안내합니다. */
export interface ResponseQuality {
  responseCount: number;
  /** 0–1로 옮긴 원응답 평균 */
  meanRaw: number;
  allIdentical: boolean;
  highAgreement: boolean;
  lowAgreement: boolean;
  /** 역채점 문항이 있는 척도의 정·역방향 응답 불일치 평균(0–1). 역채점 문항이 없으면 null */
  reverseGap: number | null;
  inconsistentReverse: boolean;
}

export type { LikertResponse, LikertValue };
