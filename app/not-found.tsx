import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return <div className="empty-state">
    <h1 className="page-title">지도에 없는 길이에요</h1>
    <p className="page-description">주소가 바뀌었거나 잘못 입력된 것 같아요. 홈이나 마음 지형도에서 다시 시작해 보세요. <kbd>Ctrl</kbd> <kbd>K</kbd>로 원하는 화면을 바로 찾을 수도 있어요.</p>
    <div className="hero-actions"><Link href="/" className="button button-primary">홈으로 <Icon name="arrow" size={17} /></Link><Link href="/results" className="text-link">마음 지형도 <Icon name="chevron" size={14} /></Link></div>
  </div>;
}
