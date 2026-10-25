"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/command-palette";
import { Icon } from "@/components/icon";
import { explorationNav, isActivePath, supportNav, toolNav, type NavItem } from "@/components/navigation";
import { TextSizeToggle, ThemeQuickButton, ThemeToggle } from "@/components/theme-toggle";
import { useModuleProgress } from "@/components/use-module-progress";
import { assessmentModules } from "@/data/modules";

const bottomTabs: readonly NavItem[] = [
  explorationNav[0],
  explorationNav[1],
  { ...explorationNav[2], label: "지형도" },
  toolNav[0],
];

function Brand() {
  return <Link href="/" className="brand" aria-label="SelfMap 홈"><span className="brand-mark"><Icon name="mountain" size={19} /></span>SelfMap</Link>;
}

/** 지도 완성도: 네 모듈의 진행을 칸으로 보여주고, 다음에 할 모듈을 하나 권합니다. */
function MapProgress() {
  const { ready, modules, completedCount } = useModuleProgress();
  const next = modules.find((item) => !item.completed && item.answered > 0) ?? modules.find((item) => !item.completed);
  return <div className="map-progress" aria-live="polite">
    <div className="map-progress-head">지도 완성도 <span>{ready ? `${completedCount} / ${modules.length}` : "…"}</span></div>
    <div className="map-progress-segments" aria-hidden="true">{modules.map((item) => <i key={item.id} className={item.completed ? "done" : item.answered > 0 ? "partial" : ""} style={item.answered > 0 && !item.completed ? { "--p": `${Math.round((item.answered / item.total) * 100)}%` } as React.CSSProperties : undefined} />)}</div>
    {ready && (next
      ? <><p>{next.answered > 0 ? `${assessmentModules[next.id].title} ${next.answered}/${next.total} 응답 중` : `다음 지역: ${assessmentModules[next.id].title} · 약 ${assessmentModules[next.id].estimatedMinutes}분`}</p><Link href={`/questions/${next.id}`}>{next.answered > 0 ? "이어서 하기" : "시작하기"} <Icon name="chevron" size={13} /></Link></>
      : <><p>네 지역이 모두 그려졌어요.</p><Link href="/results">지형도 보기 <Icon name="chevron" size={13} /></Link></>)}
  </div>;
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActivePath(pathname, item.href);
  return <Link href={item.href} aria-current={active ? "page" : undefined} className={`nav-link ${active ? "active" : ""}`}><Icon name={item.icon} size={19} /><span>{item.label}</span></Link>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetPath, setSheetPath] = useState(pathname);
  if (sheetPath !== pathname) {
    // 페이지를 옮기면 더보기 시트를 닫습니다.
    setSheetPath(pathname);
    setSheetOpen(false);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setPaletteOpen(true);
      } else if (event.key === "Escape") {
        setSheetOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const moreActive = [...toolNav.slice(1), ...supportNav, explorationNav[3]].some((item) => isActivePath(pathname, item.href));

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 이동</a>
      <aside className="sidebar" aria-label="사이드바">
        <Brand />
        <p className="brand-caption">나를 이해하는 심리 지도</p>
        <button type="button" className="palette-trigger" onClick={() => setPaletteOpen(true)} aria-keyshortcuts="Control+K"><Icon name="search" size={17} /><span>빠르게 이동</span><kbd>Ctrl K</kbd></button>
        <nav aria-label="주요 메뉴">
          <div className="nav-label">탐색</div>
          {explorationNav.map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}
          <div className="nav-label">도구</div>
          {toolNav.map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}
          <div className="nav-label">안심</div>
          {supportNav.map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}
        </nav>
        <MapProgress />
        <div className="sidebar-footer"><ThemeToggle /><TextSizeToggle /><span className="version">가입 없이 · 응답은 이 브라우저에만 저장</span></div>
      </aside>

      <header className="mobile-header">
        <Brand />
        <div className="mobile-header-actions">
          <button type="button" className="icon-button" onClick={() => setPaletteOpen(true)} aria-label="빠르게 이동"><Icon name="search" size={19} /></button>
          <ThemeQuickButton />
        </div>
      </header>

      <div className="main-shell">
        <main id="main-content" className="main-content">{children}</main>
        <footer className="page-footer"><span>SelfMap은 자기이해를 돕는 도구이며, 심리·의학적 진단을 제공하지 않습니다. 마음이 많이 힘들 때는 <Link href="/support" className="inline-link">도움 받기</Link>를 확인해 주세요.</span><span>© SelfMap</span></footer>
      </div>

      <nav className="bottom-nav" aria-label="아래 메뉴">
        {bottomTabs.map((item) => <Link key={item.href} href={item.href} aria-current={isActivePath(pathname, item.href) ? "page" : undefined}><Icon name={item.icon} size={21} />{item.label}</Link>)}
        <button type="button" aria-expanded={sheetOpen} aria-controls="more-sheet" aria-current={moreActive && !sheetOpen ? "page" : undefined} onClick={() => setSheetOpen((open) => !open)}><Icon name="grid" size={21} />더보기</button>
      </nav>

      {sheetOpen && <div className="more-sheet" id="more-sheet" onClick={(event) => { if (event.target === event.currentTarget) setSheetOpen(false); }}>
        <div className="more-sheet-panel" role="dialog" aria-modal="true" aria-label="더보기 메뉴">
          <div className="more-sheet-handle" />
          <MapProgress />
          <h2>도구</h2>
          <div className="more-sheet-grid">{[explorationNav[3], ...toolNav.slice(1), ...supportNav].map((item) => <Link key={item.href} href={item.href} aria-current={isActivePath(pathname, item.href) ? "page" : undefined}><Icon name={item.icon} size={22} />{item.label}</Link>)}</div>
          <h2>화면</h2>
          <ThemeToggle />
          <TextSizeToggle />
          <button type="button" className="button button-secondary" style={{ width: "100%" }} onClick={() => setSheetOpen(false)}>닫기</button>
        </div>
      </div>}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
