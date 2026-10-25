import Link from "next/link";
import { DemoTerrain } from "@/components/home/demo-terrain";
import { HomeSwitch } from "@/components/home/home-dashboard";
import { Icon } from "@/components/icon";
import { PatternFlow } from "@/components/pattern-flow";
import { assessmentModules, moduleIds } from "@/data/modules";

const startPaths = [
  { title: "가볍게 2분", time: "약 2분", href: "/questions/attachment", steps: ["관계 애착 경향 12문항", "지형도에 첫 봉우리 두 개"], text: "부담 없이 하나만 해 보고 싶을 때" },
  { title: "기본 코스", time: "약 15분", href: "/questions/traits", steps: ["성격 5요인 → 반응 패턴 → 방어기제", "지형도와 모듈 간 연결 해석"], text: "성향과 반응, 방어 방식을 한 번에" },
  { title: "한 주 동안 깊이", time: "하루 5분 × 7일", href: "/questions", steps: ["네 모듈과 상황 반응 살펴보기", "매일 마음 기록, 주말에 주간 돌아보기"], text: "설문 속 나와 일상 속 나를 함께 보고 싶을 때" },
];

const tools = [
  { href: "/journal", icon: "pen" as const, title: "마음 기록", text: "반응이 컸던 순간을 상황부터 회복까지 흐름으로 적어요." },
  { href: "/check-in", icon: "pulse" as const, title: "마음 상태 체크", text: "WHO-5 웰빙 지표로 최근 2주의 상태를 재고, 2주마다 변화를 봐요." },
  { href: "/practice", icon: "leaf" as const, title: "실천 카드", text: "결과와 연결된 2–15분짜리 작은 연습을 골라요." },
  { href: "/results/history", icon: "clock" as const, title: "기록과 변화", text: "결과를 저장해 두고 시간이 지나 다시 비교해요." },
  { href: "/learn", icon: "book" as const, title: "방어기제 사전", text: "15가지 방어기제의 뜻, 기능, 대가, 예시를 살펴봐요." },
];

function Landing() {
  return <>
    <section className="hero-grid" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="soft-tag"><Icon name="mountain" size={15} /> 진단 대신, 나의 지형을 그려요</span>
        <h1 id="hero-title">나는 왜 그 순간, 그렇게 반응했을까?</h1>
        <p className="hero-description">반응 패턴, 방어기제, 성격 경향, 관계 애착. 네 가지 질문에 답하면 내 마음에서 자주 솟아오르는 곳이 등고선 지도로 그려져요.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/questions">첫 질문 시작하기 <Icon name="arrow" size={18} /></Link><Link href="/results?example=1" className="text-link">예시 지형도 자세히 보기 <Icon name="chevron" size={15} /></Link></div>
        <div className="hero-meta"><span><Icon name="check" size={15} /> 유형으로 분류하지 않아요</span><span><Icon name="check" size={15} /> 가입 없이, 응답은 내 브라우저에만</span></div>
      </div>
      <div className="map-preview-card">
        <div className="card-heading"><h2>샘플 응답으로 그린 지형도</h2><span className="example-badge">예시</span></div>
        <p className="map-note" style={{ paddingTop: 4, paddingBottom: 10 }}>봉우리가 높을수록 그 경향이 응답에 자주 드러났다는 뜻이에요. 눌러서 살펴보세요.</p>
        <DemoTerrain />
      </div>
    </section>
    <section className="principles-grid" aria-label="SelfMap이 바라보는 방식">
      <article className="principle"><span className="principle-icon"><Icon name="map" size={21} /></span><div><h3>유형보다, 나의 패턴</h3><p>어떤 사람인지 정하기보다 어떤 상황에서 어떻게 반응하는지 살펴봐요.</p></div></article>
      <article className="principle"><span className="principle-icon"><Icon name="layers" size={21} /></span><div><h3>강점과 부담을 함께</h3><p>같은 경향이 힘이 되기도, 부담이 되기도 해요. 양쪽을 나란히 보여드려요.</p></div></article>
      <article className="principle"><span className="principle-icon"><Icon name="leaf" size={21} /></span><div><h3>반응 너머, 회복까지</h3><p>감정이 올라오는 순간부터 다시 관점을 넓히는 과정까지 함께 봐요.</p></div></article>
    </section>
    <section className="dimensions-section" aria-labelledby="paths-title"><div className="section-heading"><div><h2 id="paths-title">어떻게 시작할까요?</h2><p>언제든 멈추고 이어갈 수 있어요. 응답은 탭을 닫을 때까지 보관돼요.</p></div></div>
      <div className="start-paths">{startPaths.map((path) => <Link key={path.title} href={path.href} className="start-path"><span className="dimension-number">{path.time}</span><h3>{path.title}</h3><p>{path.text}</p><ol>{path.steps.map((step) => <li key={step}>{step}</li>)}</ol><span className="text-link">시작하기 <Icon name="arrow" size={15} /></span></Link>)}</div>
    </section>
    <section className="dimensions-section" aria-labelledby="modules-title"><div className="section-heading"><div><h2 id="modules-title">네 가지 시선, 하나의 지도</h2><p>원하는 모듈부터 자유롭게. 마친 모듈마다 지도의 한 지역이 채워져요.</p></div></div>
      <div className="home-module-grid">{moduleIds.map((id) => { const assessment = assessmentModules[id]; return <Link key={id} href={`/questions/${id}`} className={`home-module module-${id}`}><span className="dimension-number" style={{ display: "flex", alignItems: "center", gap: 8 }}><i style={{ width: 10, height: 10, borderRadius: 99, background: "var(--module-color)" }} />{assessment.instrument.items.length}문항 · 약 {assessment.estimatedMinutes}분</span><h3>{assessment.title}</h3><p>{assessment.description}</p><span className="text-link">시작하기 <Icon name="arrow" size={15} /></span></Link>; })}</div>
    </section>
    <section className="pattern-section" aria-labelledby="flow-title"><div className="section-heading"><div><h2 id="flow-title">반응에는 맥락이 있어요</h2><p>한 번의 반응을 단정하지 않고, 그 앞뒤의 흐름을 함께 살펴봅니다. 아래는 이해를 돕는 예시예요.</p></div></div><PatternFlow /></section>
    <section className="dimensions-section" aria-labelledby="tools-title"><div className="section-heading"><div><h2 id="tools-title">지도를 그린 다음에</h2></div></div>
      <div className="home-tools">{tools.map((tool) => <Link key={tool.href} href={tool.href}><Icon name={tool.icon} size={21} /><strong>{tool.title}</strong><span>{tool.text}</span></Link>)}</div>
    </section>
    <div className="closing-note"><Icon name="leaf" size={20} /><p>나를 바꾸기 전에, 먼저 나를 이해하는 시간.</p><Link href="/questions">질문 모듈 보기 <Icon name="arrow" size={16} /></Link></div>
  </>;
}

export default function HomePage() {
  return <HomeSwitch landing={<Landing />} />;
}
