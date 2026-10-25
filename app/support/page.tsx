import type { Metadata } from "next";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "도움 받기" };

/** 2026년 10월 기준 국내 공공 상담 연락처. 번호는 바뀔 수 있어 공식 안내 확인을 권합니다. */
const contacts = [
  { name: "자살예방 상담전화", number: "109", note: "24시간 · 자살 생각이 들거나 주변 사람이 걱정될 때" },
  { name: "정신건강 위기상담전화", number: "1577-0199", note: "24시간 · 정신건강 위기 상담과 지역 기관 연계" },
  { name: "청소년 상담전화", number: "1388", note: "24시간 · 청소년과 보호자 상담" },
  { name: "긴급 신고", number: "112 · 119", note: "지금 안전이 위협받는 상황이라면 바로 연락하세요" },
];

const signals = [
  "우울감, 불안, 무기력감이 2주 넘게 거의 매일 이어진다",
  "잠, 식사, 일, 학업, 관계 같은 일상이 눈에 띄게 어려워졌다",
  "나를 해치고 싶거나 사라지고 싶다는 생각이 든다",
  "감정을 견디려고 술이나 다른 물질에 기대는 일이 늘었다",
  "가까운 사람이 요즘 많이 달라 보인다고 걱정한다",
];

export default function SupportPage() {
  return <div className="learn-page">
    <div className="eyebrow"><span className="tiny-line" /> YOU DON&apos;T HAVE TO DO IT ALONE</div>
    <h1 className="page-title">도움 받기</h1>
    <p className="page-description">SelfMap은 자기이해를 돕는 도구일 뿐, 상담이나 치료를 대신할 수 없어요. 마음이 많이 힘들다면 전문가와 이야기하는 것이 가장 좋은 다음 걸음이에요.</p>

    <section className="support-urgent" aria-labelledby="urgent-title">
      <Icon name="heart" size={22} />
      <div><h2 id="urgent-title">지금 많이 힘들다면</h2><p>혼자 견디지 않아도 괜찮아요. 아래 번호는 모두 무료이며, 이름을 밝히지 않고도 상담할 수 있어요.</p></div>
    </section>
    <ul className="contact-grid">{contacts.map((contact) => <li key={contact.name}><span>{contact.name}</span><strong>{contact.number}</strong><small>{contact.note}</small></li>)}</ul>
    <p className="viz-caption">2026년 10월 기준 안내예요. 번호와 운영 시간은 바뀔 수 있으니 보건복지부 등 공식 안내를 함께 확인해 주세요. 해외에 있다면 현지 긴급 번호를 이용하세요.</p>

    <section className="learn-section" aria-labelledby="signals-title"><h2 id="signals-title">전문가와 이야기해 보면 좋은 신호</h2>
      <ul className="learn-list">{signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
      <p className="viz-text">하나라도 해당된다면 가까운 정신건강복지센터, 정신건강의학과, 학교·직장 상담실에 연락해 보세요. 도움을 구하는 것도 이 사이트에서 말하는 ‘성숙한 대처’ 중 하나예요.</p>
    </section>

    <section className="learn-section" aria-labelledby="selfmap-title"><h2 id="selfmap-title">SelfMap 결과를 볼 때</h2>
      <ul className="learn-list">
        <li>결과는 진단이 아니며, 어떤 점수도 정신질환이 있다거나 없다는 뜻이 아니에요.</li>
        <li>결과가 마음을 불편하게 만든다면 잠시 멈추고 쉬어도 괜찮아요. 응답과 결과는 언제든 삭제할 수 있어요.</li>
        <li>상담을 받고 있다면, 결과를 상담자와 함께 살펴보는 대화의 재료로 써 보세요.</li>
      </ul>
    </section>
  </div>;
}
