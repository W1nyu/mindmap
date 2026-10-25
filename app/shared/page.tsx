import type { Metadata } from "next";
import { SharedView } from "@/components/results/shared-view";

export const metadata: Metadata = { title: "공유받은 마음 지도", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function SharedPage() {
  return <SharedView />;
}
