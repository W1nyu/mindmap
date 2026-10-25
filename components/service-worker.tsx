"use client";

import { useEffect, useState } from "react";

/** 프로덕션에서만 서비스 워커를 등록하고, 오프라인일 때 안내 띠를 보여줍니다. */
export function ServiceWorker() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 등록에 실패해도 온라인 사용에는 영향이 없습니다.
      });
    }
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return <div className="offline-banner" role="status">오프라인이에요. 한 번 열었던 화면과 이 브라우저에 저장된 응답·기록으로 계속 쓸 수 있어요.</div>;
}
