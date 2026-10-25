import { reactionSteps } from "@/data/demo";
import { Icon } from "@/components/icon";

export function PatternFlow() {
  return <ol className="pattern-flow" aria-label="상황에서 회복까지의 예시 흐름">{reactionSteps.map((step, index) => <li key={step.label}><div className={`flow-step ${index === 5 ? "recovery" : ""}`}><span>{String(index + 1).padStart(2, "0")} · {step.label}</span><strong>{step.text}</strong></div>{index < reactionSteps.length - 1 && <Icon name="chevron" size={16} />}</li>)}</ol>;
}
