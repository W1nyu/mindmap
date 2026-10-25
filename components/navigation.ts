import type { IconName } from "@/components/icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const mainNav: readonly NavItem[] = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/questions", label: "검사", icon: "question" },
  { href: "/results", label: "결과", icon: "layers" },
  { href: "/check-in", label: "상태 체크", icon: "pulse" },
];

export function isActivePath(pathname: string, href: string) {
  const path = href.split(/[?#]/)[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
