import Link from "next/link";
import { DemoProfile } from "@/components/home/demo-profile";
import { HomeSwitch } from "@/components/home/home-dashboard";
import { Icon, type IconName } from "@/components/icon";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";

const moduleIcons: Record<ModuleId, IconName> = { emotion: "wind", defense: "shield", traits: "compass", attachment: "heart" };

const steps = [
  { title: "검사 고르기", text: "네 검사 중 궁금한 것부터. 간편 검사는 3–5분이면 끝나요." },
  { title: "원 척도 그대로 답하기", text: "논문에 실린 문항과 선택지를 그대로 써요. 정답은 없어요." },
  { title: "나의 지도 보기", text: "지표 사이의 연결, 지금의 유형, 강점과 살펴볼 점을 함께 보여줘요." },
];

const principles: { icon: IconName; title: string; text: string }[] = [
  { icon: "book", title: "공인 척도", text: "연구로 검증된 척도의 원 문항과 채점 기준을 따라요." },
  { icon: "check", title: "같은 답이면 같은 점수", text: "점수는 정해진 계산식으로만 내요. AI가 점수를 만들지 않아요." },
  { icon: "leaf", title: "내 브라우저에만", text: "응답은 서버로 보내지 않고 이 기기에만 저장돼요." },
];

function Landing() {
  const briefMinutes = moduleIds.reduce((sum, id) => sum + assessmentModules[id].forms.brief.estimatedMinutes, 0);
  return <>
    <section className="hero-grid" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="soft-tag"><Icon name="spark" size={14} />공인 심리 척도 네 가지로 그리는 마음 지도</span>
        <h1 id="hero-title">나는 왜 그 순간,<br />그렇게 반응했을까?</h1>
        <p className="hero-description">정서조절, 방어기제, 성격, 애착을 측정하고 지표 사이의 연결과 지금의 유형을 한 장의 지도로 보여줘요.</p>
        <div className="hero-actions"><Link className="button button-primary button-large" href="/questions">무료로 시작하기 <Icon name="arrow" size={18} /></Link><Link href="/results?example=1" className="text-link">예시 결과 보기 <Icon name="chevron" size={14} /></Link></div>
        <div className="hero-meta"><span><Icon name="clock" size={16} />간편 검사 모두 약 {briefMinutes}분</span><span><Icon name="leaf" size={16} />로그인 없음</span><span><Icon name="compass" size={16} />진단이 아닌 경향</span></div>
      </div>
      <div className="hero-visual"><div className="map-preview-card"><DemoProfile /></div></div>
    </section>

    <section className="dimensions-section" aria-labelledby="modules-title">
      <div className="section-heading"><div><h2 id="modules-title">네 갈래의 검사</h2><p>하나만 해도 결과를 볼 수 있고, 모두 하면 지표 사이의 연결까지 보여요.</p></div></div>
      <div className="home-module-grid">{moduleIds.map((id) => {
        const assessment = assessmentModules[id];
        const { brief, deep } = assessment.forms;
        return <Link key={id} href={`/questions/${id}`} className={`home-module module-${id}`}>
          <span className="home-module-icon"><Icon name={moduleIcons[id]} size={20} /></span>
          <h3>{assessment.title}</h3>
          <p>{assessment.tagline}</p>
          <span className="home-module-meta">간편 {brief.instrument.items.length}문항 · 심층 {deep.instrument.items.length}문항<Icon name="arrow" size={16} /></span>
        </Link>;
      })}</div>
    </section>

    <section className="pattern-section" aria-labelledby="steps-title">
      <div className="section-heading"><div><h2 id="steps-title">이렇게 진행돼요</h2></div></div>
      <ol className="steps">{steps.map((step, index) => <li key={step.title}><span className="step-number">{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
    </section>

    <section className="principles-grid" aria-label="원칙">{principles.map((item) => <div key={item.title} className="principle">
      <span className="principle-icon"><Icon name={item.icon} size={20} /></span>
      <div><h3>{item.title}</h3><p>{item.text}</p></div>
    </div>)}</section>
    <p className="quiet-note">결과는 지금의 경향이며 진단이 아니에요. 시기와 관계에 따라 달라질 수 있어요.</p>
  </>;
}

export default function HomePage() {
  return <HomeSwitch landing={<Landing />} />;
}
