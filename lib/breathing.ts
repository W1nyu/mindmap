export interface BreathPattern {
  inhaleMs: number;
  exhaleMs: number;
}

/** 내쉬는 숨을 더 길게 하는 기본 호흡(4초 들이쉬기, 6초 내쉬기). */
export const LONG_EXHALE: BreathPattern = { inhaleMs: 4000, exhaleMs: 6000 };

export interface BreathState {
  phase: "inhale" | "exhale" | "done";
  /** 현재 단계에서 남은 초(올림) */
  secondsLeft: number;
  /** 0부터 세는 현재 호흡 회차 */
  cycle: number;
  /** 현재 단계의 진행률 0–1 */
  progress: number;
}

/** 순수 함수: 경과 시간과 전체 길이로 현재 호흡 단계를 계산합니다. 전체 길이를 넘으면 done. */
export function breathState(elapsedMs: number, totalMs: number, pattern: BreathPattern = LONG_EXHALE): BreathState {
  const cycleMs = pattern.inhaleMs + pattern.exhaleMs;
  const elapsed = Math.max(0, elapsedMs);
  if (elapsed >= totalMs) return { phase: "done", secondsLeft: 0, cycle: Math.floor(totalMs / cycleMs), progress: 1 };
  const cycle = Math.floor(elapsed / cycleMs);
  const within = elapsed - cycle * cycleMs;
  if (within < pattern.inhaleMs) {
    return { phase: "inhale", secondsLeft: Math.ceil((pattern.inhaleMs - within) / 1000), cycle, progress: within / pattern.inhaleMs };
  }
  const exhaleElapsed = within - pattern.inhaleMs;
  return { phase: "exhale", secondsLeft: Math.ceil((pattern.exhaleMs - exhaleElapsed) / 1000), cycle, progress: exhaleElapsed / pattern.exhaleMs };
}
