"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Icon } from "@/components/icon";
import { defenseMechanisms, defenseMeta } from "@/data/defense-mechanisms";
import { emotionOptions, JOURNAL_LIMITS, needOptions } from "@/data/journal";
import Link from "next/link";
import { useModuleResult } from "@/components/results/use-module-result";
import { compareDefenseSources, createEntry, emptyFilter, filterEntries, journalStats, sortEntries, type CountItem, type JournalEntry, type JournalFilter, type JournalStats } from "@/lib/journal";
import { scaleScores } from "@/lib/integration";
import type { DefenseId } from "@/types/defense";
import { EmotionFlow, MomentGrid } from "./emotion-flow";
import { JournalForm } from "./journal-form";
import { MoodCalendar } from "./mood-calendar";
import { ReflectionCard } from "./reflection-card";
import { downloadJson, journalStore, localDateStamp, newEntryId } from "./journal-store";

const emotionLabel = (id: string) => emotionOptions.find((item) => item.id === id)?.label ?? id;
const needLabel = (id: string) => needOptions.find((item) => item.id === id)?.label ?? id;
const dateLabel = (iso: string) => new Date(iso).toLocaleString("ko-KR", { month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });

function CountBars<T extends string>({ title, items, label, total }: { title: string; items: readonly CountItem<T>[]; label: (id: T) => string; total: number }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return <div className="count-block"><h3>{title}</h3>{items.length === 0 ? <p className="viz-caption">아직 기록이 없어요.</p> :
    <ul className="count-bars">{items.slice(0, 6).map((item) => <li key={item.id} data-tip={`${label(item.id)} · ${item.count}회 / 기록 ${total}개`}><span>{label(item.id)}</span><span className="count-track" aria-hidden="true"><span style={{ width: `${(item.count / max) * 100}%` }} /></span><strong>{item.count}</strong></li>)}</ul>}</div>;
}

function StatsPanel({ stats }: { stats: JournalStats }) {
  const chartData = stats.daily.map((day) => ({ ...day, label: `${Number(day.date.slice(5, 7))}/${Number(day.date.slice(8, 10))}` }));
  return <section className="viz-card" aria-labelledby="journal-stats-title">
    <div className="viz-heading"><div><span className="eyebrow small">PATTERNS</span><h2 id="journal-stats-title">기록에서 보이는 흐름</h2></div><span className="subtle-label">고정된 집계 · 해석은 내 몫이에요</span></div>
    <dl className="stat-tiles">
      <div><dt>기록</dt><dd>{stats.count}<small>개</small></dd></div>
      <div><dt>평균 강도</dt><dd>{stats.averageIntensity ?? "—"}<small>/ 10</small></dd></div>
      <div><dt>가라앉은 정도</dt><dd>{stats.averageDrop === null ? "—" : `${stats.averageDrop > 0 ? "−" : ""}${Math.abs(stats.averageDrop)}`}<small>{stats.recordedAfter ? `${stats.recordedAfter}개 기준` : "나중 강도 기록 없음"}</small></dd></div>
    </dl>
    {chartData.length >= 2 && <figure className="journal-chart">
      <LineChart responsive data={chartData} style={{ width: "100%", aspectRatio: 2.6, maxHeight: 260 }} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--line-strong)" }} />
        <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fill: "var(--muted)", fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value, name) => [`${value} / 10`, name]} contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line name="기록 당시 강도(일 평균)" dataKey="intensity" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
        <Line name="가라앉은 뒤 강도" dataKey="after" stroke="var(--tier-immediate)" strokeWidth={2} strokeDasharray="5 4" connectNulls dot={{ r: 4, fill: "var(--tier-immediate)", stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
      </LineChart>
      <figcaption className="viz-caption">날짜별 평균 강도(UTC 날짜 기준). 아래 막대와 기록 목록에서 같은 내용을 글로 볼 수 있어요.</figcaption>
    </figure>}
    <div className="count-grid">
      <CountBars title="자주 기록한 감정" items={stats.emotions} label={emotionLabel} total={stats.count} />
      <CountBars title="그때 바랐던 것" items={stats.needs} label={needLabel} total={stats.count} />
      <CountBars title="알아차린 방어 방식" items={stats.defenses} label={(id) => defenseMeta(id).name} total={stats.count} />
      <DefenseSources stats={stats} />
    </div>
  </section>;
}

/** 설문에서 답한 방어와 실제 기록에서 알아차린 방어를 나란히 보여줍니다. */
function DefenseSources({ stats }: { stats: JournalStats }) {
  const { state, result } = useModuleResult("defense", false);
  if (!state.ready) return null;
  if (!result) return <div className="count-block"><h3>설문과 기록 비교</h3><p className="viz-caption">방어기제 프로필을 마치면, 설문에서 자주 쓴다고 답한 방어와 기록에서 알아차린 방어를 비교해 드려요. <Link className="inline-link" href="/questions/defense">프로필 시작</Link></p></div>;
  if (stats.defenses.length === 0) return <div className="count-block"><h3>설문과 기록 비교</h3><p className="viz-caption">기록에서 ‘떠오르는 방어 방식’을 고르면 설문 결과와 비교할 수 있어요.</p></div>;
  const comparison = compareDefenseSources(scaleScores(result), stats.defenses);
  const names = (ids: readonly DefenseId[]) => ids.length ? ids.map((id) => defenseMeta(id).name).join(" · ") : "없음";
  return <div className="count-block source-compare"><h3>설문과 기록 비교</h3>
    <dl>
      <div><dt>양쪽 모두</dt><dd>{names(comparison.both)}</dd></div>
      <div><dt>설문에서만 (50점 이상)</dt><dd>{names(comparison.profileOnly)}</dd></div>
      <div><dt>기록에서만</dt><dd>{names(comparison.journalOnly)}</dd></div>
    </dl>
    <p className="viz-caption">기록에서만 보이는 방어는 설문에서 스스로 알아차리기 어려웠던 방식일 수 있고, 설문에서만 보이는 방어는 아직 기록할 기회가 없었을 수 있어요.</p>
  </div>;
}

function EntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const steps = [
    ["상황", entry.situation], ["생각", entry.thought],
    ["감정", `${entry.emotions.map(emotionLabel).join(" · ")} (${entry.intensity}/10)`],
    ["욕구", entry.need ? needLabel(entry.need) : ""], ["행동", entry.action],
    ["방어", entry.defenses.map((id) => defenseMeta(id).name).join(" · ")],
    ["회복", [entry.recovery, entry.afterIntensity !== null ? `지금 강도 ${entry.afterIntensity}/10` : ""].filter(Boolean).join(" · ")],
  ].filter(([, text]) => text);
  return <article className="entry-card">
    <div className="entry-head"><time dateTime={entry.createdAt}>{dateLabel(entry.createdAt)}</time>{confirming
      ? <span className="entry-confirm">이 기록을 지울까요? <button type="button" className="text-link danger" onClick={onDelete}>지우기</button><button type="button" className="text-link" onClick={() => setConfirming(false)}>취소</button></span>
      : <button type="button" className="text-link" onClick={() => setConfirming(true)} aria-label="이 기록 삭제"><Icon name="trash" size={14} /></button>}</div>
    <ol className="entry-flow">{steps.map(([label, text]) => <li key={label}><span>{label}</span><p>{text}</p></li>)}</ol>
  </article>;
}

/** 감정·방어·글자로 기록을 좁혀 봅니다. 필터는 저장하지 않습니다. */
function EntryFilter({ filter, onChange, shown, total }: { filter: JournalFilter; onChange: (filter: JournalFilter) => void; shown: number; total: number }) {
  const active = filter.emotion || filter.defense || filter.text.trim();
  return <div className="entry-filter" role="search" aria-label="기록 찾기">
    <input type="search" value={filter.text} placeholder="상황·생각·행동에서 찾기" aria-label="기록에서 찾을 글자" onChange={(event) => onChange({ ...filter, text: event.target.value })} />
    <select value={filter.emotion ?? ""} aria-label="감정으로 거르기" onChange={(event) => onChange({ ...filter, emotion: (event.target.value || null) as JournalFilter["emotion"] })}>
      <option value="">모든 감정</option>{emotionOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
    <select value={filter.defense ?? ""} aria-label="방어 방식으로 거르기" onChange={(event) => onChange({ ...filter, defense: (event.target.value || null) as JournalFilter["defense"] })}>
      <option value="">모든 방어 방식</option>{defenseMechanisms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    {active && <span className="filter-count" role="status">{total}개 중 {shown}개 <button type="button" className="text-link" onClick={() => onChange(emptyFilter)}>필터 지우기</button></span>}
  </div>;
}

export function JournalApp() {
  const store = journalStore.useValue();
  const [confirmAll, setConfirmAll] = useState(false);
  const [filter, setFilter] = useState<JournalFilter>(emptyFilter);
  const entries = store.value;
  const visible = useMemo(() => filterEntries(entries, filter), [entries, filter]);
  const stats = useMemo(() => journalStats(entries), [entries]);
  if (!store.ready) return <p role="status">기록을 불러오고 있어요.</p>;

  return <div className="journal-layout">
    <div className="journal-main">
      <ReflectionCard />
      <JournalForm onSave={(draft) => journalStore.set(sortEntries([createEntry(draft, newEntryId(), new Date()), ...entries]).slice(0, JOURNAL_LIMITS.maxEntries))} />
      {entries.length >= 3 && <section className="viz-card" aria-labelledby="links-title">
        <div className="viz-heading"><div><h2 id="links-title">기록 속 연결</h2><p className="viz-caption" style={{ marginTop: 2 }}>내가 고른 선택만 센 고정된 집계예요. 의미는 내가 붙이는 거예요.</p></div></div>
        <div className="pattern-grid"><EmotionFlow entries={entries} /><div><h3 style={{ fontSize: 15, marginBottom: 10 }}>언제 기록했나</h3><MomentGrid entries={entries} /></div></div>
      </section>}
      <section aria-labelledby="entries-title">
        <div className="section-heading"><div><span className="eyebrow small">ENTRIES</span><h2 id="entries-title">나의 기록 {entries.length > 0 ? `${entries.length}개` : ""}</h2></div>
          {entries.length > 0 && <div className="session-actions"><button type="button" className="text-link" onClick={() => downloadJson(`selfmap-journal-${localDateStamp()}.json`, { format: "selfmap-journal", version: 1, exportedAt: new Date().toISOString(), entries })}><Icon name="download" size={14} /> JSON 내보내기</button><button type="button" className="text-link" onClick={() => setConfirmAll(true)}>전체 삭제</button></div>}
        </div>
        {confirmAll && <div className="reset-confirmation" role="group" aria-label="기록 전체 삭제 확인"><p>이 기기에 저장된 마음 기록 {entries.length}개를 모두 지울까요? 되돌릴 수 없어요. 필요하면 먼저 내보내기를 해 두세요.</p><div className="session-actions"><button type="button" className="button button-primary" onClick={() => { journalStore.clear(); setConfirmAll(false); }}>모두 삭제</button><button type="button" className="text-link" onClick={() => setConfirmAll(false)}>취소</button></div></div>}
        {store.invalid && <p className="form-message" role="status">저장된 기록의 형식을 읽지 못해 빈 기록으로 시작했어요.</p>}
        {entries.length > 2 && <EntryFilter filter={filter} onChange={setFilter} shown={visible.length} total={entries.length} />}
        {entries.length === 0 ? <p className="viz-text">아직 기록이 없어요. 마음이 크게 움직였던 순간 하나를 위 양식에 적어 보세요.</p>
          : visible.length === 0 ? <p className="viz-text">조건에 맞는 기록이 없어요.</p>
          : <div className="entry-list">{visible.map((entry) => <EntryCard key={entry.id} entry={entry} onDelete={() => journalStore.set(entries.filter((item) => item.id !== entry.id))} />)}</div>}
      </section>
    </div>
    <aside className="journal-side"><StatsPanel stats={stats} />{entries.length > 0 && <section className="viz-card" aria-labelledby="journal-calendar-title"><div className="viz-heading"><h2 id="journal-calendar-title">기록한 날</h2><span className="subtle-label">최근 12주 · 칸의 진하기는 기록 수</span></div><MoodCalendar entries={entries} /></section>}<Link className="week-link" href="/review"><Icon name="clock" size={15} /> 주간 돌아보기에서 한 주씩 모아 보기</Link><p className="quiet-note"><Icon name="shield" size={16} /> 기록은 이 기기 브라우저(localStorage)에만 저장되고 서버로 전송되지 않아요.{store.available ? "" : " 지금은 저장할 수 없어 새로고침하면 사라져요."}</p></aside>
  </div>;
}
