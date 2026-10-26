import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "mindmap · 나를 이해하는 심리 지도",
    short_name: "mindmap",
    description: "정서조절, 방어기제, 성격 5요인, 성인 애착을 공인 심리 척도로 살펴보는 자기이해 도구. 진단이 아니며 모든 데이터는 내 브라우저에만 저장됩니다.",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#e9edf2",
    theme_color: "#15213b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
