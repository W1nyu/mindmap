import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentModules } from "../data/modules";
import { computeExampleResult, computeModuleResult, moduleResponses } from "../lib/module-results";
import { decodeShare, encodeShare } from "../lib/share";

test("share links round-trip completed modules and rescore identically", () => {
  const answers = { defense: moduleResponses(computeExampleResult("defense")), attachment: moduleResponses(computeExampleResult("attachment")) };
  const fragment = encodeShare(answers);
  assert.ok(fragment.startsWith("s1.d-selfmap-defense-45-v1-"));
  assert.ok(fragment.length < 200);
  const decoded = decodeShare(`#${fragment}`);
  assert.ok(decoded);
  assert.deepEqual(Object.keys(decoded).sort(), ["attachment", "defense"]);
  assert.deepEqual(computeModuleResult("defense", decoded.defense!), computeExampleResult("defense"));
  assert.deepEqual(computeModuleResult("attachment", decoded.attachment!), computeExampleResult("attachment"));
});

test("incomplete or empty input cannot be encoded", () => {
  assert.throws(() => encodeShare({}));
  assert.throws(() => encodeShare({ traits: moduleResponses(computeExampleResult("traits")).slice(1) }));
});

test("tampered, old-version, wrong-length or duplicate fragments are rejected", () => {
  const good = encodeShare({ traits: moduleResponses(computeExampleResult("traits")) });
  const digits = good.split("-").pop()!;
  const bad = [
    "", "#", "s2." + good.slice(3), good.replace("selfmap-traits-20-v1", "selfmap-traits-20-v0"),
    good.slice(0, -1), `${good}0`, good.replace(digits, digits.replace(/.$/, "5")), `${good}~${good.slice(3)}`,
    "s1.x-selfmap-traits-20-v1-" + digits, "s1." + "0".repeat(3000),
  ];
  for (const fragment of bad) assert.equal(decodeShare(fragment), null, fragment.slice(0, 40));
  assert.equal(assessmentModules.traits.instrument.items.length, digits.length);
});
