/** mindmap 로고: 가운데의 나에서 네 검사(정서조절·방어기제·성격·애착)로 휘어 뻗는 가지. 색은 모듈 토큰을 씁니다. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return <svg className="brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" strokeWidth="5" strokeLinecap="round">
      <path d="M32 32C30 22 22 14 12 13" stroke="var(--module-emotion)" />
      <path d="M32 32c9-3 15-11 17-21" stroke="var(--module-defense)" />
      <path d="M32 32c3 10 11 17 21 18" stroke="var(--module-attachment)" />
      <path d="M32 32c-9 2-16 10-18 20" stroke="var(--module-traits)" />
    </g>
    <circle cx="32" cy="32" r="10" fill="var(--ink)" />
  </svg>;
}
