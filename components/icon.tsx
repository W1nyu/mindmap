import type { CSSProperties } from "react";

export type IconName = "map" | "arrow" | "spark" | "grid" | "question" | "leaf" | "shield" | "check" | "chevron" | "pen" | "book" | "heart" | "download" | "trash" | "clock"
  | "search" | "more" | "close" | "home" | "mountain" | "sun" | "moon" | "compass" | "layers" | "calendar" | "wind" | "share" | "type" | "pulse";
const paths: Record<IconName, string> = {
  map: "M3 5 9 3l6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  question: "M9 9a3 3 0 1 1 4.2 2.75c-.75.33-1.2 1.07-1.2 1.9V14m0 3.5v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  leaf: "M20 3C8 3 3 8 4 15c1 6 10 6 13-1 2-4 3-8 3-11ZM4 21l10-11",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
  check: "m5 12 4 4L19 6",
  chevron: "m9 5 7 7-7 7",
  pen: "M4 20h4L19 9l-4-4L4 16v4Zm11-15 4 4",
  book: "M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15ZM5 19.5A1.5 1.5 0 0 0 6.5 21H19",
  heart: "M12 20s-7.5-4.6-9-9.2C2 7.6 4.3 5 7 5c2 0 3.4 1.2 5 3 1.6-1.8 3-3 5-3 2.7 0 5 2.6 4 5.8-1.5 4.6-9 9.2-9 9.2Z",
  download: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  trash: "M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  close: "M6 6l12 12M18 6 6 18",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z",
  mountain: "m2 20 7-11 4 6 3-4 6 9H2Zm7-11 1.6 2.5",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4",
  moon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  calendar: "M4 6h16v14H4V6Zm0 4h16M8 3v4m8-4v4",
  wind: "M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8",
  share: "M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 3v12m-4-8 4-4 4 4",
  type: "M4 7V5h16v2M12 5v14m-4 0h8",
  pulse: "M3 12h4l2.5-6 4 12 2.5-6H21",
};

export function Icon({ name, size = 20, style, className }: { name: IconName; size?: number; style?: CSSProperties; className?: string }) {
  const strokeWidth = name === "more" ? 3 : 1.7;
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}><path d={paths[name]} /></svg>;
}
