import Link from "next/link";
import { DemoProfile } from "@/components/home/demo-profile";
import { HomeSwitch } from "@/components/home/home-dashboard";
import { Icon } from "@/components/icon";
import { assessmentModules, moduleIds } from "@/data/modules";

function Landing() {
  return <>
    <section className="hero-grid" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">나는 왜 그 순간, 그렇게 반응했을까?</h1>
        <p className="hero-description">연구와 상담 현장에서 쓰는 네 가지 심리 척도로 나를 측정하고, 지표 사이의 연결과 나의 유형을 보여줘요.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/questions">시작하기 <Icon name="arrow" size={18} /></Link><Link href="/results?example=1" className="text-link">예시 보기</Link></div>
      </div>
      <div className="map-preview-card"><DemoProfile /></div>
    </section>
    <section className="dimensions-section" aria-label="검사">
      <div className="home-module-grid">{moduleIds.map((id) => {
        const assessment = assessmentModules[id];
        return <Link key={id} href={`/questions/${id}`} className={`home-module module-${id}`}>
          <h3><i className="module-dot" aria-hidden="true" />{assessment.title}</h3>
          <p>간편 {assessment.forms.brief.instrument.items.length}문항 · 심층 {assessment.forms.deep.instrument.items.length}문항</p>
        </Link>;
      })}</div>
    </section>
    <p className="quiet-note">결과는 경향이며 진단이 아니에요. 응답은 이 브라우저에만 저장돼요.</p>
  </>;
}

export default function HomePage() {
  return <HomeSwitch landing={<Landing />} />;
}
