import type { ReactNode } from "react";

/** 페이지 머리말: 첫 화면과 같은 밤의 지도 면. aside는 오른쪽(좁은 화면에서는 아래)에, children은 제목 아래에 놓입니다. */
export function PageHero({ title, description, top, aside, children, className = "" }: {
  title: ReactNode;
  description?: ReactNode;
  top?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return <section className={`page-hero ${aside ? "has-aside" : ""} ${className}`}>
    <div className="page-hero-copy">
      {top}
      <h1 className="page-title">{title}</h1>
      {description && <div className="page-hero-description">{description}</div>}
    </div>
    {aside && <div className="page-hero-aside">{aside}</div>}
    {children && <div className="page-hero-body">{children}</div>}
  </section>;
}
