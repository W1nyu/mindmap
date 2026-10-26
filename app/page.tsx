import Link from "next/link";
import { DemoProfile } from "@/components/home/demo-profile";
import { HomeSwitch } from "@/components/home/home-dashboard";
import { MindAtlas } from "@/components/home/mind-atlas";
import { assessmentModules, formIds, formLabels, moduleIds } from "@/data/modules";

const steps = [
  { title: "궁금한 검사부터", text: "네 검사는 따로 볼 수 있어요. 간편 검사는 3–5분이면 끝나요." },
  { title: "원 척도 그대로 답하기", text: "논문에 실린 문항과 선택지를 그대로 씁니다. 정답은 없어요." },
  { title: "지도로 돌려받기", text: "지표 사이의 연결, 지금의 유형, 강점과 살펴볼 점을 함께 보여줘요." },
];

function Landing() {
  return <>
    <section className="atlas-hero" aria-labelledby="hero-title">
      <div className="atlas-copy">
        <h1 id="hero-title">나는 왜 그 순간,<br />그렇게 반응했을까?</h1>
        <p>정서조절, 방어기제, 성격, 애착. 연구에서 쓰는 네 가지 척도로 내 마음의 지도를 그려 보세요.</p>
        <div className="atlas-actions">
          <Link className="button button-bright" href="/questions">검사 시작하기</Link>
          <Link className="atlas-example" href="/results?example=1">예시 결과 보기</Link>
        </div>
      </div>
      <div className="atlas-figure"><MindAtlas /></div>
      <p className="atlas-foot">가지를 누르면 그 검사로 바로 가요. 로그인 없이, 응답은 이 브라우저에만 남아요.</p>
    </section>

    <section className="branches" aria-labelledby="branches-title">
      <h2 id="branches-title">네 갈래의 검사</h2>
      <p className="branches-lead">하나만 해도 결과를 볼 수 있고, 둘 이상 하면 지표 사이의 연결이 보여요.</p>
      <div className="branch-list">{moduleIds.map((id) => {
        const assessment = assessmentModules[id];
        return <article key={id} className={`branch module-${id}`}>
          <svg className="branch-stroke" viewBox="0 0 40 120" aria-hidden="true"><path d="M6 0C6 50 34 60 34 120" /></svg>
          <div>
            <h3>{assessment.title}</h3>
            <p>{assessment.tagline}</p>
            <ul className="branch-forms">{formIds.map((form) => {
              const meta = assessment.forms[form];
              return <li key={form}><Link href={`/questions/${id}?form=${form}`}><strong>{formLabels[form]}</strong><span>{meta.instrument.items.length}문항, 약 {meta.estimatedMinutes}분</span></Link></li>;
            })}</ul>
          </div>
        </article>;
      })}</div>
    </section>

    <section className="preview-band" aria-labelledby="preview-title">
      <div className="preview-text">
        <h2 id="preview-title">결과는 한 장의 바퀴로</h2>
        <p>부채꼴 하나가 지표 하나예요. 바깥으로 길수록 점수가 높고, 가운데 곡선은 함께 두드러진 지표를 이어요. 아래 그림은 고정된 예시 응답을 같은 계산식으로 채점한 것이에요.</p>
        <Link className="button button-secondary" href="/results?example=1">예시 결과 자세히 보기</Link>
      </div>
      <div className="preview-figure"><DemoProfile /></div>
    </section>

    <section className="steps-band" aria-labelledby="steps-title">
      <h2 id="steps-title">이렇게 진행돼요</h2>
      <ol className="steps">{steps.map((step, index) => <li key={step.title}><span className="step-number">{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
    </section>

    <p className="quiet-note">결과는 지금의 경향이며 진단이 아니에요. 시기와 관계에 따라 달라질 수 있어요.</p>
  </>;
}

export default function HomePage() {
  return <HomeSwitch landing={<Landing />} />;
}
