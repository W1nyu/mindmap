"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { breathState, type BreathState } from "@/lib/breathing";

const durations = [1, 2, 3] as const;
const phaseText = { inhale: "코로 천천히 들이쉬어요", exhale: "입으로 길게 내쉬어요", done: "잘 마쳤어요" } as const;

/**
 * 4초 들이쉬기 · 6초 내쉬기 호흡 도우미. 원이 숨에 맞춰 커지고 작아지며,
 * 움직임 줄이기 설정에서는 원이 움직이지 않고 글자와 숫자만 바뀝니다. 아무것도 저장하지 않습니다.
 */
export function BreathingGuide() {
  const [minutes, setMinutes] = useState<(typeof durations)[number]>(2);
  const [state, setState] = useState<BreathState | null>(null);
  const startRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function tick() {
    const next = breathState(performance.now() - startRef.current, minutes * 60_000);
    setState((previous) => (previous && previous.phase === next.phase && previous.secondsLeft === next.secondsLeft && Math.abs(previous.progress - next.progress) < 0.02 ? previous : next));
    if (next.phase !== "done") frameRef.current = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(frameRef.current);
    startRef.current = performance.now();
    tick();
  }

  function stop() {
    cancelAnimationFrame(frameRef.current);
    setState(null);
  }

  const running = state !== null && state.phase !== "done";
  const scale = !state ? 0.55 : state.phase === "inhale" ? 0.55 + 0.45 * state.progress : state.phase === "exhale" ? 1 - 0.45 * state.progress : 0.55;
  return <section id="breathing" className="viz-card breathing" aria-labelledby="breathing-title">
    <div className="viz-heading"><div><span className="eyebrow small">RIGHT NOW</span><h2 id="breathing-title">지금 바로, 길게 내쉬는 호흡</h2></div><span className="subtle-label">4초 들이쉬기 · 6초 내쉬기</span></div>
    <div className="breathing-body">
      <div className="breathing-visual" aria-hidden="true"><span className={`breathing-circle ${state?.phase ?? "idle"}`} style={{ transform: `scale(${scale})` }} /></div>
      <div className="breathing-text">
        <p className="breathing-phase" aria-live="polite">{state ? phaseText[state.phase] : "준비되면 시작을 눌러 주세요"}</p>
        {running && <p className="breathing-count"><strong>{state!.secondsLeft}</strong> · {state!.cycle + 1}번째 숨</p>}
        {state?.phase === "done" && <p className="viz-text">몸의 느낌이 조금이라도 달라졌는지 살펴보세요. 마음 기록에 지금의 강도를 적어 두어도 좋아요.</p>}
        <div className="breathing-controls">
          {!running && <div className="theme-toggle duration-toggle" role="group" aria-label="호흡 시간">{durations.map((value) => <button key={value} type="button" aria-pressed={minutes === value} onClick={() => setMinutes(value)}>{value}분</button>)}</div>}
          {running ? <button type="button" className="button button-secondary" onClick={stop}>멈추기</button> : <button type="button" className="button button-primary" onClick={start}>{state?.phase === "done" ? "다시 하기" : "시작"} <Icon name="leaf" size={15} /></button>}
        </div>
        <p className="viz-caption">어지럽거나 불편하면 바로 멈추고 평소대로 숨 쉬세요.</p>
      </div>
    </div>
  </section>;
}
