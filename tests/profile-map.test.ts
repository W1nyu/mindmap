import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentModules, moduleIds, type ModuleId } from "../data/modules";
import type { ModuleResults } from "../lib/integration";
import { computeExampleResult, computeModuleResult } from "../lib/module-results";
import { profileGroups, profileLinks } from "../lib/profile-map";

const allExamples = (): ModuleResults => Object.fromEntries(moduleIds.map((id) => [id, computeExampleResult(id)]));

/** 척도별로 같은 원응답(0부터)을 주고, 역채점 문항은 반대로 답해 의도한 점수 방향을 만듭니다. */
function resultWith(module: ModuleId, target: (scale: string) => number) {
  const instrument = assessmentModules[module].forms.brief.instrument;
  const max = instrument.points - 1;
  return computeModuleResult(module, "brief", instrument.items.map((item) => {
    const value = target(item.scale);
    return { kind: "likert" as const, questionId: item.id, value: item.reverse ? max - value : value };
  }));
}

test("every module becomes one group in a fixed order; rows are the computed scores", () => {
  const results = allExamples();
  const groups = profileGroups(results);
  assert.deepEqual(groups.map((group) => group.module), [...moduleIds]);
  assert.deepEqual(groups.map((group) => group.rows.length), [6, 3, 5, 2]);
  const emotion = results.emotion!;
  for (const scale of emotion.profile.result.scales) {
    const row = groups[0].rows.find((item) => item.scale === scale.scale)!;
    assert.deepEqual([row.score, row.mean], [scale.score, scale.mean]);
  }
  const defense = results.defense!;
  if (defense.module === "defense") {
    for (const tier of defense.profile.tiers) assert.equal(groups[1].rows.find((row) => row.scale === tier.tier)!.score, tier.score);
  }
  assert.ok(groups[3].rows.every((row) => row.reference !== undefined));
});

test("modules without a result stay as empty groups", () => {
  const groups = profileGroups({ traits: computeExampleResult("traits") });
  assert.deepEqual(groups.map((group) => group.done), [false, false, true, false]);
  assert.deepEqual(groups.map((group) => group.slots), [6, 3, 5, 2]);
  assert.deepEqual(profileLinks({ traits: computeExampleResult("traits") }, groups), []);
});

test("a matched cross-test rule links the two indicators it is based on", () => {
  const results: ModuleResults = {
    attachment: resultWith("attachment", (scale) => (scale === "attachmentAnxiety" ? 6 : 0)),
    emotion: resultWith("emotion", (scale) => (scale === "impulse" ? 4 : 0)),
  };
  const links = profileLinks(results, profileGroups(results));
  const link = links.find((item) => item.ruleId === "anxious-impulse");
  assert.ok(link);
  assert.deepEqual([link.from, link.to].sort(), ["attachment:attachmentAnxiety", "emotion:impulse"]);
  assert.equal(link.kind, "pattern");
  const ids = new Set(profileGroups(results).flatMap((group) => group.rows.map((row) => row.id)));
  for (const item of links) assert.ok(ids.has(item.from) && ids.has(item.to) && item.from !== item.to);
});
