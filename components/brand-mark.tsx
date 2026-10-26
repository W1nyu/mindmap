/** mindmap 로고: 가운데의 나에서 네 검사(정서조절·방어기제·성격·애착)로 뻗는 가지. 색은 모듈 토큰을 씁니다. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return <svg className="brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="18" fill="var(--primary)" />
    <g fill="none" stroke="var(--on-primary)" strokeWidth="3" strokeLinecap="round" opacity=".7">
      <path d="M32 32C27 29 23 24 18 19" />
      <path d="M32 32c5-4 9-9 15-14" />
      <path d="M32 32c4 5 9 10 15 14" />
      <path d="M32 32c-5 4-9 9-14 13" />
    </g>
    <circle cx="18" cy="19" r="6" fill="var(--module-emotion)" />
    <circle cx="47" cy="18" r="5" fill="var(--module-defense)" />
    <circle cx="47" cy="46" r="6" fill="var(--module-attachment)" />
    <circle cx="18" cy="45" r="4.5" fill="var(--module-traits)" />
    <circle cx="32" cy="32" r="7.5" fill="var(--on-primary)" />
  </svg>;
}
