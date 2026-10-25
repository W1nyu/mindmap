import type { LikertResponse, LikertValue, ScoreEvidence } from "./psychology";

/** 모든 Likert 모듈이 공유하는 문항 계약입니다. `scale`은 모듈마다 다른 척도 ID입니다. */
export interface LikertItem<S extends string = string> {
  id: string;
  kind: "likert";
  text: string;
  scale: S;
  reverse: boolean;
  weight: number;
}

export interface LikertInstrument<S extends string = string> {
  id: string;
  version: string;
  scaleIds: readonly S[];
  items: readonly LikertItem<S>[];
}

export interface ScaleScore<S extends string = string> {
  scale: S;
  score: number;
  weightedSum: number;
  weightSum: number;
  evidence: readonly ScoreEvidence[];
}

export interface InstrumentResult<S extends string = string> {
  source: "computed";
  instrumentId: string;
  instrumentVersion: string;
  scoringVersion: string;
  responseCount: number;
  scales: readonly ScaleScore<S>[];
}

export interface ScaleMeta<S extends string = string> {
  id: S;
  name: string;
  shortName: string;
  description: string;
}

export interface LikertOption {
  value: LikertValue;
  label: string;
}

/** 점수 구간. 평균 응답 1·2·3의 경계와 일치합니다. */
export type ScoreBand = "rare" | "sometimes" | "often" | "prominent";

/** 응답 스타일 참고 정보. 결과를 무효화하지 않고 해석 주의만 안내합니다. */
export interface ResponseQuality {
  responseCount: number;
  meanRaw: number;
  allIdentical: boolean;
  highAgreement: boolean;
  lowAgreement: boolean;
  /** 역채점 문항이 있는 척도의 정·역방향 응답 불일치 평균(0–1). 역채점 문항이 없으면 null */
  reverseGap: number | null;
  inconsistentReverse: boolean;
}

export type { LikertResponse, LikertValue };
