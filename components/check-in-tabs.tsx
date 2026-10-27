"use client";

import { useState } from "react";
import { EmotionStateCheckApp } from "@/components/emotion-state/emotion-state-check";
import { PageHero } from "@/components/page-hero";
import { WellbeingCheckApp } from "@/components/wellbeing/wellbeing-check";

const tabs = [
  { id: "wellbeing", label: "오늘의 웰빙", scale: "WHO-5, 5문장", text: "오늘 하루의 웰빙을 0–100으로 기록해요." },
  { id: "emotion", label: "지금의 정서조절", scale: "S-DERS, 21문장", text: "지금 이 순간 감정을 얼마나 받아들이고 다룰 수 있는지 기록해요." },
] as const;

export function CheckInTabs() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("wellbeing");
  return <>
    <PageHero title="마음 상태 체크" className="checkin-hero"
      description={<p>성향 검사와 달리 날마다 달라지는 상태를 기록해요. 같은 체크를 여러 번 하면 변화가 선으로 보여요. 진단이 아니에요.</p>}>
      <div className="checkin-choice" role="group" aria-label="체크 종류">{tabs.map((item) => <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>
        <strong>{item.label}</strong><small>{item.scale}</small><span>{item.text}</span>
      </button>)}</div>
    </PageHero>
    {tab === "wellbeing" ? <WellbeingCheckApp /> : <EmotionStateCheckApp />}
  </>;
}
