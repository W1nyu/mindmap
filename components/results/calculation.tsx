import { assessmentModules } from "@/data/modules";
import type { ModuleResult } from "@/lib/module-results";

const formulas: Record<ModuleResult["module"], string> = {
  emotion: "하위척도 점수 = 문항 평균(1–5, 역채점은 6 − 응답). DERS 총점 = 모든 문항 합. 점수가 높을수록 그 영역의 조절이 어렵다는 뜻이에요.",
  defense: "방어 점수 = 두 문항의 평균(1–9, 역채점 없음). 스타일 점수 = 속한 방어 점수의 평균. 7단계 위계의 가중 평균 = Σ(단계 × 방어 점수) ÷ Σ방어 점수.",
  traits: "요인 점수 = 문항 평균(1–5, 역채점은 6 − 응답). 백분위가 아니며 다른 사람과 비교한 값이 아니에요.",
  attachment: "차원 점수 = 문항 평균(1–7, 역채점은 8 − 응답). 유형은 두 평균을 공개된 ECR-R 표본 평균과 비교해 나눠요(ECR-RS는 저자가 ECR-R의 9문항판으로 안내).",
};

/** 점수 계산 근거: 원 척도 단위의 평균과 0–100 점수, 문항별 응답을 그대로 보여줍니다. */
export function Calculation({ result }: { result: ModuleResult }) {
  const assessment = assessmentModules[result.module];
  const form = assessment.forms[result.form];
  const position = new Map(form.instrument.items.map((item, index) => [item.id, index + 1]));
  const name = (scale: string) => assessment.scales.find((item) => item.id === scale)?.name ?? scale;
  const points = form.instrument.points;
  return <>
    <h2>점수는 이렇게 계산해요</h2>
    <p>{formulas[result.module]} 0–100 점수 = (평균 − 1) ÷ {points - 1} × 100.</p>
    {result.module === "emotion" && <p>DERS 총점 {result.profile.total.sum}점 (범위 {result.profile.total.min}–{result.profile.total.max}).</p>}
    <p>{form.name} ({form.citation}) · 응답 {result.profile.result.responseCount}개 · {points}점 척도 · 채점 {result.profile.result.scoringVersion}</p>
    <details className="score-evidence"><summary>척도별 계산 내역 · {result.profile.result.scales.length}개</summary>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="척도별 계산 근거 표"><table><caption className="sr-only">척도별 문항 번호, 응답, 평균, 점수</caption><thead><tr><th scope="col">척도</th><th scope="col">문항(응답→채점)</th><th scope="col">평균</th><th scope="col">점수</th></tr></thead><tbody>
        {result.profile.result.scales.map((scale) => <tr key={scale.scale}><th scope="row">{name(scale.scale)}</th><td>{scale.evidence.map((item) => `${position.get(item.questionId)}번(${item.rawValue + 1}${item.reverse ? `→${item.scoredValue + 1}` : ""})`).join(" · ")}</td><td>{scale.mean.toFixed(2)}</td><td>{scale.score}</td></tr>)}
      </tbody></table></div>
    </details>
  </>;
}
