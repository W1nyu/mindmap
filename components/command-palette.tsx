"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import { explorationNav, extraCommands, supportNav, toolNav } from "@/components/navigation";
import { setTextSize, setThemePreference } from "@/components/theme-toggle";

interface Command {
  id: string;
  group: string;
  label: string;
  icon: IconName;
  hint?: string;
  keywords: string;
  run: (router: ReturnType<typeof useRouter>) => void;
}

const commands: readonly Command[] = [
  ...[...explorationNav, ...toolNav, ...supportNav].map((item) => ({ id: item.href, group: "이동", label: item.label, icon: item.icon, hint: item.hint, keywords: item.keywords ?? "", run: (router: ReturnType<typeof useRouter>) => router.push(item.href) })),
  ...extraCommands.map((item) => ({ id: item.href, group: "바로 하기", label: item.label, icon: item.icon, hint: item.hint, keywords: item.keywords ?? "", run: (router: ReturnType<typeof useRouter>) => router.push(item.href) })),
  { id: "theme-light", group: "화면", label: "밝은 테마로", icon: "sun", keywords: "라이트 테마 밝게", run: () => setThemePreference("light") },
  { id: "theme-dark", group: "화면", label: "어두운 테마로", icon: "moon", keywords: "다크 테마 어둡게", run: () => setThemePreference("dark") },
  { id: "theme-system", group: "화면", label: "기기 설정 테마 따르기", icon: "layers", keywords: "시스템 테마 자동", run: () => setThemePreference("system") },
  { id: "text-large", group: "화면", label: "글자 크게", icon: "type", keywords: "글자 크기 확대 크게 폰트", run: () => setTextSize("large") },
  { id: "text-normal", group: "화면", label: "글자 보통", icon: "type", keywords: "글자 크기 기본 보통 폰트", run: () => setTextSize("normal") },
];

/** 한글 자모가 아니라 글자 단위로, 공백으로 나눈 낱말이 모두 들어 있으면 맞는 것으로 봅니다. */
function matches(command: Command, query: string) {
  const haystack = `${command.label} ${command.hint ?? ""} ${command.keywords}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
}

/** Ctrl/⌘+K 또는 / 로 여는 빠른 이동 창. 열고 닫는 상태는 셸이 가집니다. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const listId = useId();
  const results = useMemo(() => commands.filter((command) => matches(command, query)), [query]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => restoreRef.current?.focus?.();
  }, [open]);

  if (!open) return null;

  function close() {
    setQuery("");
    setActive(0);
    onClose();
  }

  function run(command: Command | undefined) {
    if (!command) return;
    close();
    command.run(router);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(results.length - 1, index + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(0, index - 1)); }
    else if (event.key === "Enter") { event.preventDefault(); run(results[active]); }
    else if (event.key === "Escape") { event.preventDefault(); close(); }
    else if (event.key === "Tab") event.preventDefault();
  }

  return <div className="palette-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="palette" role="dialog" aria-modal="true" aria-label="빠르게 이동" onKeyDown={onKeyDown}>
      <div className="palette-input"><Icon name="search" size={20} />
        <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} placeholder="어디로 갈까요? 예: 기록, 호흡, 어두운" role="combobox" aria-expanded="true" aria-controls={listId} aria-activedescendant={results[active] ? `${listId}-${active}` : undefined} aria-autocomplete="list" />
        <kbd>Esc</kbd>
      </div>
      <ul className="palette-list" id={listId} role="listbox" aria-label="이동할 곳">
        {results.length === 0 && <li className="palette-empty">맞는 곳이 없어요. 다른 낱말로 찾아보세요.</li>}
        {results.map((command, index) => {
          const header = index === 0 || results[index - 1].group !== command.group ? command.group : null;
          return <li key={command.id + command.label} role="presentation">
            {header && <div className="palette-group" role="presentation">{header}</div>}
            <button type="button" id={`${listId}-${index}`} role="option" aria-selected={index === active} className="palette-item" tabIndex={-1} onMouseMove={() => setActive(index)} onClick={() => run(command)}>
              <Icon name={command.icon} size={18} /><span>{command.label}</span>{command.hint && <small>{command.hint}</small>}
            </button>
          </li>;
        })}
      </ul>
      <div className="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> 고르기</span><span><kbd>Enter</kbd> 이동</span><span><kbd>Esc</kbd> 닫기</span></div>
    </div>
  </div>;
}
