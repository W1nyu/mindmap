import type { Metadata } from "next";
import Link from "next/link";
import { DefenseFinder } from "@/components/defense-finder";
import { Icon } from "@/components/icon";
import { defenseMechanisms, defenseTiers } from "@/data/defense-mechanisms";
import { attachmentMeta } from "@/data/attachment";
import { attachmentIntro, defenseIntro, learnLimits, references, traitIntro } from "@/data/learn";
import { traitMeta } from "@/data/traits";

export const metadata: Metadata = { title: "방어기제 사전" };

export default function LearnPage() {
  return <div className="learn-page">
    <div className="eyebrow"><span className="tiny-line" /> LEARN</div>
    <h1 className="page-title">방어기제 사전</h1>
    <p className="page-description">마음이 나를 지키는 15가지 방식, 성격 5요인, 관계 애착의 두 차원을 정리했어요. 결과를 읽다가 낯선 이름이 나오면 여기서 찾아보세요.</p>

    <nav className="learn-toc" aria-label="사전 목차">
      <a href="#what">방어기제란?</a>{defenseTiers.map((tier) => <a key={tier.id} href={`#${tier.id}`}>{tier.name}</a>)}<a href="#traits">성격 5요인</a><a href="#attachment">관계 애착</a><a href="#limits">한계와 참고문헌</a><Link href="/learn/quiz" className="toc-quiz">방어기제 찾기 연습 →</Link>
    </nav>

    <DefenseFinder />

    <section id="what" className="learn-section"><h2>방어기제란?</h2>{defenseIntro.map((paragraph) => <p key={paragraph} className="viz-text">{paragraph}</p>)}</section>

    {defenseTiers.map((tier) => <section key={tier.id} id={tier.id} className={`learn-section tier-${tier.id}`} aria-labelledby={`${tier.id}-title`}>
      <div className="learn-tier-head"><span className="tier-pill"><i aria-hidden="true" />수준 {tier.level}</span><h2 id={`${tier.id}-title`}>{tier.name}</h2><p className="learn-academic">학술 명칭: {tier.academicName}</p></div>
      <p className="viz-text">{tier.description}</p>
      <div className="learn-grid">{defenseMechanisms.filter((item) => item.tier === tier.id).map((item) => <article key={item.id} id={`defense-${item.id}`} className="learn-card">
        <h3>{item.name} <small>{item.englishName}</small></h3>
        <p className="highlight-summary">{item.summary}</p>
        <dl className="highlight-details">
          <div><dt>지켜 주는 것</dt><dd>{item.protects}</dd></div>
          <div><dt>생길 수 있는 비용</dt><dd>{item.cost}</dd></div>
          <div><dt>일상의 예</dt><dd>{item.example}</dd></div>
          <div className="growth"><dt>한 걸음 더</dt><dd>{item.growth}</dd></div>
        </dl>
      </article>)}</div>
    </section>)}

    <section id="traits" className="learn-section"><h2>성격 5요인</h2>{traitIntro.map((paragraph) => <p key={paragraph} className="viz-text">{paragraph}</p>)}
      <div className="learn-grid">{traitMeta.map((trait) => <article key={trait.id} className="learn-card"><h3>{trait.name}</h3><p className="trait-description">{trait.description}</p>
        <dl className="highlight-details"><div><dt>{trait.lowPole} 쪽의 강점</dt><dd>{trait.lowStrength}</dd></div><div><dt>{trait.highPole} 쪽의 강점</dt><dd>{trait.highStrength}</dd></div></dl>
      </article>)}</div>
    </section>

    <section id="attachment" className="learn-section"><h2>관계 애착의 두 차원</h2>{attachmentIntro.map((paragraph) => <p key={paragraph} className="viz-text">{paragraph}</p>)}
      <div className="learn-grid">{attachmentMeta.map((axis) => <article key={axis.id} className="learn-card"><h3>{axis.name}</h3><p className="trait-description">{axis.description}</p>
        <dl className="highlight-details"><div><dt>낮은 편일 때</dt><dd>{axis.low}</dd></div><div><dt>높은 편일 때</dt><dd>{axis.high}</dd></div></dl>
      </article>)}</div>
    </section>

    <section id="limits" className="learn-section"><h2>한계와 참고문헌</h2>
      <ul className="learn-list">{learnLimits.map((item) => <li key={item}>{item}</li>)}</ul>
      <ol className="reference-list">{references.map((item) => <li key={item}>{item}</li>)}</ol>
    </section>

    <div className="closing-note"><Icon name="leaf" size={18} /><p>15개 사례로 방어기제를 구분하는 연습을 해 보거나, 내 방식을 알아보려면 방어기제 프로필에 응답해 보세요.</p><Link href="/learn/quiz">찾기 연습 시작 <Icon name="arrow" size={17} /></Link></div>
  </div>;
}
