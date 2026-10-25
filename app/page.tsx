import Link from "next/link";
import { DemoTerrain } from "@/components/home/demo-terrain";
import { HomeSwitch } from "@/components/home/home-dashboard";
import { Icon } from "@/components/icon";
import { assessmentModules, moduleIds } from "@/data/modules";

function Landing() {
  return <>
    <section className="hero-grid" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">나는 왜 그 순간, 그렇게 반응했을까?</h1>
        <p className="hero-description">네 가지 질문에 답하면 마음의 지형이 등고선 지도로 그려져요.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/questions">시작하기 <Icon name="arrow" size={18} /></Link><Link href="/results?example=1" className="text-link">예시 보기</Link></div>
      </div>
      <div className="map-preview-card"><DemoTerrain /></div>
    </section>
    <section className="dimensions-section" aria-label="질문 모듈">
      <div className="home-module-grid">{moduleIds.map((id) => {
        const assessment = assessmentModules[id];
        return <Link key={id} href={`/questions/${id}`} className={`home-module module-${id}`}>
          <h3><i className="module-dot" aria-hidden="true" />{assessment.title}</h3>
          <p>{assessment.instrument.items.length}문항 · 약 {assessment.estimatedMinutes}분</p>
        </Link>;
      })}</div>
    </section>
    <p className="quiet-note">결과는 경향이며 진단이 아니에요. 응답은 이 브라우저에만 저장돼요.</p>
  </>;
}

export default function HomePage() {
  return <HomeSwitch landing={<Landing />} />;
}
