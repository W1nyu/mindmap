import assert from "node:assert/strict";
import { test } from "node:test";
import { adviceSituations, adviceTips, defenseCare } from "../data/advice";
import { defenseMechanisms } from "../data/defense-mechanisms";
import { assessmentModules, moduleIds, type FormId, type ModuleId } from "../data/modules";
import { ADVICE_PERSONAL_LIMIT, adviceFor } from "../lib/advice";
import { computeExampleResult, computeModuleResult } from "../lib/module-results";

function resultWith(module: ModuleId, form: FormId, target: (scale: string) => number) {
  const instrument = assessmentModules[module].forms[form].instrument;
  const max = instrument.points - 1;
  return computeModuleResult(module, form, instrument.items.map((item) => {
    const value = target(item.scale);
    return { kind: "likert" as const, questionId: item.id, value: item.reverse ? max - value : value };
  }));
}

test("every advice condition points at a real scale or defense style", () => {
  const styles = ["adaptive", "inhibitory", "immediate"];
  for (const tip of adviceTips) for (const condition of tip.when) {
    const known = assessmentModules[condition.module].scales.some((scale) => scale.id === condition.scale) || (condition.module === "defense" && styles.includes(condition.scale));
    assert.ok(known, `${tip.id}: ${condition.module}.${condition.scale}`);
  }
  assert.equal(new Set(adviceTips.map((tip) => tip.id)).size, adviceTips.length);
});

test("every situation has general advice and every less-adaptive defense has a care practice", () => {
  for (const { id } of adviceSituations) assert.ok(adviceTips.some((tip) => tip.situation === id && tip.when.length === 0), id);
  for (const meta of defenseMechanisms) assert.equal(Boolean(defenseCare[meta.id]), meta.level < 7, meta.id);
});

test("with no results only general advice is shown and every module is waiting", () => {
  for (const situation of adviceFor({})) {
    assert.ok(situation.items.length > 0);
    assert.ok(situation.items.every((item) => !item.personal && item.evidence.length === 0));
  }
  assert.deepEqual(adviceFor({}).find((item) => item.situation === "defense")!.waiting, ["defense"]);
});

test("high impulse brings the STOP skill to the anger tab with its score as evidence", () => {
  const emotion = resultWith("emotion", "brief", (scale) => (scale === "impulse" ? 4 : 0));
  const anger = adviceFor({ emotion }).find((item) => item.situation === "anger")!;
  assert.equal(anger.items[0].id, "anger-impulse-stop");
  assert.match(anger.items[0].evidence[0], /^충동통제곤란 100$/);
  assert.ok(!anger.items.some((item) => item.id === "anger-strength-self-assertion"));
  const calm = adviceFor({ emotion: resultWith("emotion", "brief", () => 0) }).find((item) => item.situation === "anger")!;
  assert.ok(calm.items.some((item) => item.id === "anger-strength-self-assertion"));
});

test("prominent less-adaptive defenses get their own care items; selection is deterministic and capped", () => {
  const defense = resultWith("defense", "deep", (scale) => (["actingOut", "projection"].includes(scale) ? 8 : 0));
  const tab = adviceFor({ defense }).find((item) => item.situation === "defense")!;
  assert.ok(tab.items.some((item) => item.id === "defense:actingOut"));
  assert.ok(tab.items.some((item) => item.id === "defense:projection"));
  const all = Object.fromEntries(moduleIds.map((id) => [id, computeExampleResult(id)]));
  assert.deepEqual(adviceFor(all), adviceFor(all));
  for (const situation of adviceFor(all).filter((item) => item.situation !== "defense")) {
    assert.ok(situation.items.filter((item) => item.personal).length <= ADVICE_PERSONAL_LIMIT);
    assert.deepEqual(situation.waiting, []);
  }
});
