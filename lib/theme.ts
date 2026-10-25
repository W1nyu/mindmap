export type ThemePreference = "light" | "dark" | "system";
export const THEME_STORAGE_KEY = "selfmap.theme";
export type TextSizePreference = "normal" | "large";
export const TEXT_SIZE_STORAGE_KEY = "selfmap.textSize";

/**
 * 첫 페인트 전에 테마와 글자 크기를 정하는 인라인 스크립트. 저장된 선택(이 기기 전용 편의 설정)이 없으면 기기 설정을 따릅니다.
 * 저장소가 막혀도 기기 설정으로 동작합니다.
 */
export const themeBootScript = `(function(){var p;try{p=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(p!=="light"&&p!=="dark")p="system";var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)");d.dataset.themePref=p;function apply(){d.dataset.theme=d.dataset.themePref==="system"?(m.matches?"dark":"light"):d.dataset.themePref}apply();m.addEventListener("change",function(){if(d.dataset.themePref==="system")apply()});var t;try{t=localStorage.getItem("${TEXT_SIZE_STORAGE_KEY}")}catch(e){}if(t==="large")d.dataset.text="large"})();`;
