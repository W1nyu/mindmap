// 실행 중인 서버에 대한 빠른 점검: node scripts/smoke.mjs [기본 http://localhost:3000]
// 브라우저나 추가 의존성 없이 fetch만 씁니다. 실제 AI 호출은 하지 않습니다.
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const pages = [
  "/", "/questions", "/questions/reaction", "/questions/defense", "/questions/traits", "/questions/attachment",
  "/results", "/results?example=1", "/results/reaction", "/results/defense", "/results/traits", "/results/attachment",
  "/results/history", "/shared", "/scenarios", "/journal", "/review", "/check-in", "/practice", "/learn", "/learn/quiz", "/support", "/my-data",
];
const missing = ["/questions/unknown", "/results/unknown", "/nope"];
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const path of pages) {
  const response = await fetch(base + path);
  check(response.status === 200, `${path} → ${response.status}`);
  check(response.headers.get("x-content-type-options") === "nosniff", `${path} missing nosniff`);
  const html = await response.text();
  check(html.includes("진단"), `${path} lacks the non-diagnostic notice`);
}
for (const path of missing) {
  const response = await fetch(base + path);
  check(response.status === 404, `${path} should be 404, got ${response.status}`);
}

const manifest = await (await fetch(`${base}/manifest.webmanifest`)).json();
check(manifest.short_name === "SelfMap" && manifest.icons?.length >= 2, "manifest incomplete");
const sw = await fetch(`${base}/sw.js`);
check(sw.status === 200 && /no-store/.test(sw.headers.get("cache-control") ?? ""), "sw.js must be served uncached");

const explain = await (await fetch(`${base}/api/explain`)).json();
check(typeof explain.enabled === "boolean", "/api/explain GET shape");
const invalid = await fetch(`${base}/api/explain`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
check(explain.enabled ? invalid.status === 400 : invalid.status === 404, `/api/explain POST invalid → ${invalid.status}`);

if (failures.length) {
  console.error(`✖ ${failures.length} problem(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`✔ ${pages.length} pages, ${missing.length} 404s, manifest, service worker and API checks passed against ${base}`);
