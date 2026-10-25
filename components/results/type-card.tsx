import Link from "next/link";
import { Icon } from "@/components/icon";
import { assessmentModules, moduleIds } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { typeCard, type TypeCard } from "@/lib/profile-types";

/** 유형 한 장. 이름 · 학술 명칭 · 한 줄 설명 · 정한 기준을 보여줍니다. */
export function TypeCardView({ card, href, large }: { card: TypeCard; href?: string; large?: boolean }) {
  return <article className={`type-card module-${card.module} ${large ? "large" : ""}`}>
    <span className="type-card-module"><i aria-hidden="true" />{assessmentModules[card.module].title}</span>
    <h3>{card.name}</h3>
    <p className="type-card-academic">{card.academic}</p>
    <p className="type-card-summary">{card.summary}</p>
    <p className="type-card-basis">{card.basis}</p>
    {href && <Link className="text-link" href={href}>자세히 <Icon name="chevron" size={13} /></Link>}
  </article>;
}

/** 마친 모듈의 유형 카드를 모아 보여줍니다. 네 모듈을 모두 마치면 한 줄 요약을 붙입니다. */
export function TypeCardDeck({ results, example }: { results: ModuleResults; example: boolean }) {
  const cards = moduleIds.flatMap((id) => (results[id] ? [typeCard(results[id]!)] : []));
  if (cards.length === 0) return null;
  const complete = cards.length === moduleIds.length;
  return <section className="type-deck" aria-labelledby="type-deck-title">
    <div className="section-heading"><div><h2 id="type-deck-title">나의 유형 카드</h2><p>{complete ? cards.map((card) => card.name).join(" · ") : `${cards.length}개 검사 완료 · 나머지 검사를 마치면 카드가 채워져요.`}</p></div></div>
    <div className="type-grid">
      {cards.map((card) => <TypeCardView key={card.module} card={card} href={`/results/${card.module}${example ? "?example=1" : ""}`} />)}
      {moduleIds.filter((id) => !results[id]).map((id) => <Link key={id} href={`/questions/${id}`} className="type-card empty"><span className="type-card-module">{assessmentModules[id].title}</span><h3>?</h3><p className="type-card-summary">검사를 마치면 열려요</p></Link>)}
    </div>
    <p className="viz-caption">유형은 지금 응답을 연구에서 쓰는 분류 기준에 대어 붙인 이름이에요. 고정된 성격이 아니며, 시기와 관계에 따라 바뀔 수 있어요.</p>
  </section>;
}
