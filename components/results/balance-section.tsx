import { Icon } from "@/components/icon";
import { assessmentModules } from "@/data/modules";
import { strengthsAndCare } from "@/lib/balance";
import type { ModuleResults } from "@/lib/integration";

const sourceName = (source: string) => (source === "cross" ? "모듈 간 연결" : assessmentModules[source as keyof typeof assessmentModules].title);

/** 강점과 살펴볼 점을 같은 무게로 나란히 보여줍니다. */
export function BalanceSection({ results }: { results: ModuleResults }) {
  const { strengths, care } = strengthsAndCare(results);
  if (strengths.length === 0 && care.length === 0) return null;
  return <section aria-labelledby="balance-title">
    <div className="section-heading"><div><h2 id="balance-title">강점과 살펴볼 점</h2></div></div>
    <div className="balance-grid">
      <div className="balance-col strength"><h3><Icon name="leaf" size={19} />강점</h3>
        {strengths.length ? <ul className="balance-list">{strengths.slice(0, 3).map((item) => <li key={item.id}><strong>{item.title}</strong><p>{item.text}</p><small>{sourceName(item.source)}</small></li>)}</ul> : <p className="viz-text">모듈을 더 마치면 이곳이 채워져요.</p>}
      </div>
      <div className="balance-col care"><h3><Icon name="compass" size={19} />살펴볼 점</h3>
        {care.length ? <ul className="balance-list">{care.slice(0, 3).map((item) => <li key={item.id}><strong>{item.title}</strong><p>{item.text}</p><small>{sourceName(item.source)}</small></li>)}</ul> : <p className="viz-text">지금 응답에서는 특별히 눈에 띄는 부담 신호가 없어요.</p>}
      </div>
    </div>
  </section>;
}
