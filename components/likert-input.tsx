import { likertOptions } from "@/data/questions";
import type { LikertValue } from "@/types/psychology";

export function LikertInput({ questionId, value, onChange }: {
  questionId: string;
  value: LikertValue | undefined;
  onChange: (value: LikertValue) => void;
}) {
  return <fieldset className="likert-options" aria-describedby="question-hint">
    <legend className="sr-only">질문에 대한 동의 정도</legend>
    {likertOptions.map((option) => <label key={option.value} className={`likert-option ${value === option.value ? "selected" : ""}`}>
      <input type="radio" name={questionId} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      <span className="likert-number">{option.value}</span><span>{option.label}</span>
    </label>)}
  </fieldset>;
}
