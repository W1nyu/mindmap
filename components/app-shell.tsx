"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Icon } from "@/components/icon";
import { isActivePath, mainNav } from "@/components/navigation";
import { useModuleProgress } from "@/components/use-module-progress";

function Brand() {
  return <Link href="/" className="brand" aria-label="mindmap 홈"><BrandMark size={30} /><span className="brand-word">mindmap</span></Link>;
}

/** 지도 완성도: 네 검사의 진행을 가지 색 점으로 보여줍니다. */
function MapProgress() {
  const { ready, modules, completedCount } = useModuleProgress();
  return <Link href="/questions" className="map-progress" aria-label={ready ? `지도 완성도 ${modules.length}개 중 ${completedCount}개` : "지도 완성도"}>
    <span className="map-progress-dots" aria-hidden="true">{modules.map((item) => <i key={item.id} className={`module-${item.id} ${item.completed ? "done" : item.answered > 0 ? "partial" : ""}`} style={item.answered > 0 && !item.completed ? { "--p": `${Math.round((item.answered / item.total) * 100)}%` } as CSSProperties : undefined} />)}</span>
    <span className="map-progress-text">{ready ? `${completedCount}/${modules.length}` : ""}</span>
  </Link>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 이동</a>
      <header className="masthead">
        <div className="masthead-inner">
          <Brand />
          <nav className="masthead-nav" aria-label="주요 메뉴">
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="nav-link">{item.label}</Link>;
            })}
          </nav>
          <MapProgress />
        </div>
      </header>

      <main id="main-content" className="main-content">{children}</main>
      <footer className="page-footer"><Brand /><span>mindmap은 자기이해 도구이며 진단을 제공하지 않습니다. 결과는 지금의 경향이에요.</span></footer>

      <nav className="bottom-nav" aria-label="아래 메뉴">
        {mainNav.map((item) => <Link key={item.href} href={item.href} aria-current={isActivePath(pathname, item.href) ? "page" : undefined}><Icon name={item.icon} size={21} />{item.label}</Link>)}
      </nav>
    </div>
  );
}
