/*
 * mindmap 서비스 워커: 오프라인에서도 화면을 열 수 있게 합니다.
 * - 페이지 이동: 네트워크 우선, 실패하면 캐시(없으면 홈) → 온라인일 땐 항상 최신 화면
 * - /_next/static, 아이콘: 캐시 우선(파일 이름에 해시가 있어 바뀌지 않음)
 * - /api/ 요청과 다른 출처 요청은 건드리지 않습니다. 사용자 데이터는 캐시하지 않습니다.
 */
const CACHE = "mindmap-v5";
const CORE = ["/", "/questions", "/results", "/check-in",
  "/questions/emotion", "/questions/defense", "/questions/traits", "/questions/attachment"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => (key.startsWith("selfmap-") || key.startsWith("mindmap-")) && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: false })) || (await cache.match(new URL(request.url).pathname)) || (await cache.match("/")) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") event.respondWith(networkFirst(request));
  else if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|webmanifest)$/.test(url.pathname)) event.respondWith(cacheFirst(request));
});
