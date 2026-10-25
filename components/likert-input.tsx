import type { LikertOption } from "@/types/assessment";

/** 원 척도의 선택지를 그대로 보여줍니다. 번호는 1부터 표시하고, 내부 값은 0부터입니다. */
export function LikertInput({ questionId, options, value, onChange }: {
  questionId: string;
  options: readonly LikertOption[];
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  const wide = options.length > 5;
  return <fieldset className={`likert-options ${wide ? "wide" : ""}`} style={{ "--count": options.length } as React.CSSProperties} aria-describedby="question-hint">
    <legend className="sr-only">문항에 대한 응답</legend>
    {options.map((option) => <label key={option.value} className={`likert-option ${value === option.value ? "selected" : ""}`}>
      <input type="radio" name={questionId} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      <span className="likert-number">{option.value + 1}</span><span className="likert-label">{option.label}</span>
    </label>)}
  </fieldset>;
}
