import type { LikertOption } from "@/types/assessment";

/** 원 척도의 선택지를 그대로 보여줍니다. 번호는 원 척도의 첫 번호(origin)부터 표시하고, 내부 값은 0부터입니다. */
/** "자주·많이"는 가운뎃점 뒤에서만 줄을 바꿉니다. */
const Phrases = ({ text }: { text: string }) => <>{text.split(/(?<=·)/).map((part, index) => <span key={index} className="likert-phrase">{part}</span>)}</>;

/** "거의 항상 (91–100%)"처럼 괄호 보충 설명은 다음 줄에 통째로 둡니다. */
function OptionLabel({ label }: { label: string }) {
  const match = /^(.*?)\s*(\(.+\))$/.exec(label);
  return <span className="likert-label"><span><Phrases text={match ? match[1] : label} /></span>{match && <small className="likert-detail">{match[2]}</small>}</span>;
}

export function LikertInput({ questionId, options, origin, value, onChange }: {
  questionId: string;
  options: readonly LikertOption[];
  origin: number;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  const wide = options.length > 5;
  return <>
  <fieldset className={`likert-options ${wide ? "wide" : ""}`} style={{ "--count": options.length } as React.CSSProperties} aria-describedby="question-hint">
    <legend className="sr-only">문항에 대한 응답</legend>
    {options.map((option) => <label key={option.value} className={`likert-option ${value === option.value ? "selected" : ""}`}>
      <input type="radio" name={questionId} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      <span className="likert-number">{option.value + origin}</span><OptionLabel label={option.label} />
    </label>)}
  </fieldset>
  {wide && <p className="likert-ends" aria-hidden="true"><span>{origin} {options[0].label}</span><span>{options.length - 1 + origin} {options[options.length - 1].label}</span></p>}
  </>;
}
