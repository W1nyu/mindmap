import type { Metadata, Viewport } from "next";
import { Hahmlet, IBM_Plex_Sans_KR } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";
import { themeBootScript } from "@/lib/theme";

// 빌드 시 내려받아 같은 출처에서 제공합니다(런타임 외부 요청 없음). 한글 글리프는 unicode-range 조각으로 필요한 만큼만 받습니다.
const display = Hahmlet({ weight: ["500", "600", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-hahmlet" });
const body = IBM_Plex_Sans_KR({ weight: ["400", "500", "600", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-plex" });

export const metadata: Metadata = {
  title: { default: "SelfMap · 나를 이해하는 심리 지도", template: "%s · SelfMap" },
  description: "상황, 감정, 욕구, 반응과 회복의 연결을 살펴보는 자기이해 공간. 성격 유형이나 진단으로 분류하지 않습니다.",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f5f4f8" }, { media: "(prefers-color-scheme: dark)", color: "#13121a" }],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // data-theme은 첫 페인트 전에 인라인 스크립트가 정하므로 서버 HTML과 다를 수 있습니다.
  return <html lang="ko" className={`${display.variable} ${body.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head><body><ServiceWorker /><AppShell>{children}</AppShell></body></html>;
}
