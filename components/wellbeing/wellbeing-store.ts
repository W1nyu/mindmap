"use client";

import { createLocalStore } from "@/lib/local-store";
import { parseChecks, WELLBEING_STORAGE_KEY, type WellbeingCheck } from "@/lib/wellbeing";

/** 웰빙 체크는 시간에 따른 변화를 보기 위한 기록이라 이 기기(localStorage)에 남깁니다. */
export const wellbeingStore = createLocalStore<WellbeingCheck[]>(WELLBEING_STORAGE_KEY, parseChecks, []);
