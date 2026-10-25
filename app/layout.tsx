import type { Metadata, Viewport } from "next";
import { Hahmlet, IBM_Plex_Sans_KR } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

// 빌드 시 내려받아 같은 출처에서 제공합니다(런타임 외부 요청 없음). 한글 글리프는 unicode-range 조각으로 필요한 만큼만 받습니다.
const display = Hahmlet({ weight: ["500", "600", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-hahmlet" });
const body = IBM_Plex_Sans_KR({ weight: ["400", "500", "600", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-plex" });

export const metadata: Metadata = {
  title: { default: "SelfMap · 나를 이해하는 심리 지도", template: "%s · SelfMap" },
  description: "정서조절, 방어기제, 성격 5요인, 성인 애착을 공인 심리 척도로 측정해 보여주는 자기이해 도구. 진단이 아닙니다.",
};

export const viewport: Viewport = {
  themeColor: "#f5f4f8",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko" className={`${display.variable} ${body.variable}`}><body><ServiceWorker /><AppShell>{children}</AppShell></body></html>;
}
