import assert from "node:assert/strict";
import { test } from "node:test";
import { defenseMechanisms } from "../data/defense-mechanisms";
import { scenarios } from "../data/scenarios";
import { analyzeScenarios, createScenarioSession, parseScenarioSession } from "../lib/scenario-analysis";

const tierOf = (id: string | null) => (id ? defenseMechanisms.find((item) => item.id === id)!.tier : "adaptive");

test("8 scenarios with 5 unique options each, mixing tiers so no scenario is one-sided", () => {
  assert.equal(scenarios.length, 8);
  assert.equal(new Set(scenarios.map((item) => item.id)).size, 8);
  for (const scenario of scenarios) {
    assert.equal(scenario.options.length, 5, scenario.id);
    assert.equal(new Set(scenario.options.map((option) => option.id)).size, 5);
    assert.equal(new Set(scenario.options.map((option) => option.defense)).size, 5, `${scenario.id} repeats a defense`);
    const tiers = new Set(scenario.options.map((option) => tierOf(option.defense)));
    assert.ok(tiers.has("adaptive") && tiers.has("immediate"), scenario.id);
    const adaptiveIndex = scenario.options.findIndex((option) => tierOf(option.defense) === "adaptive");
    assert.ok(adaptiveIndex >= 0);
  }
  const firstAdaptive = scenarios.map((scenario) => scenario.options.findIndex((option) => tierOf(option.defense) === "adaptive"));
  assert.ok(new Set(firstAdaptive).size >= 3, "adaptive options appear in varied positions");
});

test("analysis counts tiers, direct coping and repeated defenses deterministically", () => {
  const choices = Object.fromEntries(scenarios.map((scenario) => {
    const pick = scenario.options.find((option) => option.defense === "intellectualization") ?? scenario.options.find((option) => option.defense === null) ?? scenario.options[0];
    return [scenario.id, pick.id];
  }));
  const profile = analyzeScenarios(choices);
  assert.equal(profile.total, 8);
  assert.equal(profile.tiers.reduce((sum, tier) => sum + tier.count, 0), 8);
  assert.deepEqual(profile.repeated[0], { defense: "intellectualization", count: 4 });
  assert.equal(profile.direct, 2);
  assert.deepEqual(analyzeScenarios(choices), profile);
  assert.throws(() => analyzeScenarios({}));
  assert.throws(() => analyzeScenarios({ ...choices, [scenarios[0].id]: "z" }));
});

test("scenario sessions round-trip and reject tampered data", () => {
  const session = { ...createScenarioSession(), choices: { [scenarios[0].id]: "a" }, currentIndex: 1 };
  assert.deepEqual(parseScenarioSession(JSON.stringify(session)), session);
  for (const bad of [
    { ...session, version: "old" }, { ...session, choices: { nope: "a" } }, { ...session, choices: { [scenarios[0].id]: "z" } },
    { ...session, currentIndex: 8 }, { ...session, completed: true }, { ...session, choices: [] },
  ]) assert.equal(parseScenarioSession(JSON.stringify(bad)), null);
  assert.equal(parseScenarioSession("{"), null);
});

test("tier shares always total 100", () => {
  const choices = Object.fromEntries(scenarios.map((scenario, index) => [scenario.id, scenario.options[(index * 2) % 5].id]));
  const profile = analyzeScenarios(choices);
  assert.equal(profile.tiers.reduce((sum, tier) => sum + tier.share, 0), 100);
});
