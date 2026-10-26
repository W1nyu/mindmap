"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icon";
import { isActivePath, mainNav } from "@/components/navigation";
import { useModuleProgress } from "@/components/use-module-progress";

function Brand() {
  return <Link href="/" className="brand" aria-label="mindmap 홈"><BrandMark /><span className="brand-word">mind<span>map</span></span></Link>;
}

/** 지도 완성도: 네 모듈의 진행을 칸으로 보여줍니다. */
function MapProgress() {
  const { ready, modules, completedCount } = useModuleProgress();
  return <div className="map-progress" aria-live="polite">
    <div className="map-progress-head">지도 완성도 <span>{ready ? `${completedCount} / ${modules.length}` : "…"}</span></div>
    <div className="map-progress-segments" aria-hidden="true">{modules.map((item) => <i key={item.id} className={item.completed ? "done" : item.answered > 0 ? "partial" : ""} style={item.answered > 0 && !item.completed ? { "--p": `${Math.round((item.answered / item.total) * 100)}%` } as React.CSSProperties : undefined} />)}</div>
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 이동</a>
      <aside className="sidebar" aria-label="사이드바">
        <div className="brand-block"><Brand /><p className="brand-caption">나를 이해하는 심리 지도</p></div>
        <nav aria-label="주요 메뉴">
          {mainNav.map((item) => {
            const active = isActivePath(pathname, item.href);
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`nav-link ${active ? "active" : ""}`}><Icon name={item.icon} size={19} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <MapProgress />
      </aside>

      <header className="mobile-header"><Brand /></header>

      <div className="main-shell">
        <main id="main-content" className="main-content">{children}</main>
        <footer className="page-footer"><span>mindmap은 자기이해 도구이며 진단을 제공하지 않습니다.</span></footer>
      </div>

      <nav className="bottom-nav" aria-label="아래 메뉴">
        {mainNav.map((item) => <Link key={item.href} href={item.href} aria-current={isActivePath(pathname, item.href) ? "page" : undefined}><Icon name={item.icon} size={21} />{item.label}</Link>)}
      </nav>
    </div>
  );
}
