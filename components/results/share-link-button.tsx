"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { moduleIds } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { moduleResponses } from "@/lib/module-results";
import { encodeShare, type SharedAnswers } from "@/lib/share";

/**
 * 상담자나 가까운 사람과 결과를 함께 보기 위한 링크. 응답은 URL의 # 뒤에만 담겨 서버로 전송되지 않지만,
 * 링크를 받은 사람은 결과를 볼 수 있으므로 만들기 전에 한 번 더 확인합니다.
 */
export function ShareLinkButton({ results }: { results: ModuleResults }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");
  const completed = moduleIds.filter((id) => results[id]);

  function create() {
    const answers: SharedAnswers = Object.fromEntries(completed.map((id) => [id, moduleResponses(results[id]!)]));
    const url = `${window.location.origin}/shared#${encodeShare(answers)}`;
    setLink(url);
    navigator.clipboard?.writeText(url).then(() => setStatus("링크를 클립보드에 복사했어요."), () => setStatus("아래 링크를 직접 복사해 주세요."));
  }

  if (!open) return <button type="button" className="button button-secondary no-print" onClick={() => setOpen(true)}><Icon name="share" size={17} /> 함께 보기 링크</button>;
  return <section className="viz-card share-card no-print" aria-labelledby="share-title">
    <h2 id="share-title">공유 링크 만들기</h2>
    <p className="viz-text">완료한 {completed.length}개 모듈의 <strong>응답</strong>이 링크의 # 뒤에 담겨요. 이 부분은 서버로 전송되지 않고, 링크를 연 사람의 브라우저에서만 결과가 계산돼요. 다만 <strong>링크를 가진 사람은 누구나 결과를 볼 수 있고</strong>, 메신저나 메일로 보내면 그 서비스에 링크가 남을 수 있어요. 믿을 수 있는 사람에게만 보내 주세요.</p>
    {link ? <><input className="share-input" readOnly value={link} onFocus={(event) => event.currentTarget.select()} aria-label="공유 링크" />{status && <p className="saved-note" role="status">{status}</p>}</>
      : <div className="hero-actions"><button type="button" className="button button-primary" onClick={create}>이해했어요, 링크 만들기 <Icon name="arrow" size={15} /></button><button type="button" className="text-link" onClick={() => setOpen(false)}>취소</button></div>}
  </section>;
}
