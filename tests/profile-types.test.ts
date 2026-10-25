import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentModules, type FormId, type ModuleId } from "../data/modules";
import { computeModuleResult } from "../lib/module-results";
import { typeCard } from "../lib/profile-types";

/** 척도 ID → 원응답(0부터)을 정해 모든 문항에 같은 값으로 답합니다. 역채점 문항은 반대로 답해 의도한 방향을 만듭니다. */
function resultWith(module: ModuleId, form: FormId, target: (scale: string) => number) {
  const instrument = assessmentModules[module].forms[form].instrument;
  const max = instrument.points - 1;
  return computeModuleResult(module, form, instrument.items.map((item) => {
    const value = target(item.scale);
    return { kind: "likert" as const, questionId: item.id, value: item.reverse ? max - value : value };
  }));
}

test("attachment types split on the published ECR-R sample means", () => {
  const card = (anxiety: number, avoidance: number) => typeCard(resultWith("attachment", "deep", (scale) => (scale === "attachmentAnxiety" ? anxiety : avoidance))).name;
  assert.equal(card(1, 1), "안정형"); // 평균 2, 2
  assert.equal(card(5, 1), "몰입형"); // 6, 2
  assert.equal(card(1, 5), "거부형"); // 2, 6
  assert.equal(card(5, 5), "두려움형");
  assert.equal(typeCard(resultWith("attachment", "brief", () => 0)).name, "안정형");
});

test("defense type follows the style with the highest DSQ mean", () => {
  const brief = resultWith("defense", "brief", (scale) => (["sublimation", "humor", "anticipation", "suppression"].includes(scale) ? 8 : 2));
  assert.equal(typeCard(brief).name, "성숙한 방어 우세");
  const immature = resultWith("defense", "brief", (scale) => (["projection", "actingOut", "denial"].includes(scale) ? 8 : 0));
  assert.equal(typeCard(immature).name, "미성숙한 방어 우세");
  const deep = resultWith("defense", "deep", (scale) => (["intellectualization", "isolation", "undoing"].includes(scale) ? 8 : 1));
  assert.equal(typeCard(deep).name, "신경증적 방어 우세");
});

test("emotion type is calm when every DERS area is low, otherwise named after the highest area", () => {
  assert.equal(typeCard(resultWith("emotion", "brief", () => 0)).name, "정서조절 양호");
  assert.equal(typeCard(resultWith("emotion", "deep", (scale) => (scale === "impulse" ? 4 : 1))).name, "충동통제곤란 우세");
});

test("trait types match the closest personality prototype, or none when the profile is flat", () => {
  const resilient = resultWith("traits", "deep", (scale) => (scale === "neuroticism" ? 0 : 3));
  assert.equal(typeCard(resilient).name, "탄력형");
  const over = resultWith("traits", "brief", (scale) => (scale === "neuroticism" ? 4 : scale === "extraversion" ? 0 : 2));
  assert.equal(typeCard(over).name, "과잉통제형");
  const under = resultWith("traits", "brief", (scale) => (scale === "conscientiousness" || scale === "agreeableness" ? 0 : 3));
  assert.equal(typeCard(under).name, "과소통제형");
  assert.equal(typeCard(resultWith("traits", "brief", () => 2)).name, "원형 미분류");
});
