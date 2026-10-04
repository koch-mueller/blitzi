"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
require("../model.js");

const model = global.window.BlitziModel;

const lowestState = {
  activity: "low",
  location: "city",
  area: "small",
  height: "low",
  material: "solid",
  occupancy: "occasional",
  equipment: 0,
  surgeProtection: false,
  valueBand: "under-200"
};

test("lowest selections produce a zero demo score", () => {
  const assessment = model.buildAssessment(lowestState);
  assert.equal(assessment.rawScore, 0);
  assert.equal(assessment.score, 0);
  assert.equal(assessment.level.key, "low");
});

test("highest selections produce the documented maximum", () => {
  const assessment = model.buildAssessment({
    activity: "high",
    location: "elevated",
    area: "very-large",
    height: "high",
    material: "thatch",
    occupancy: "five-plus",
    equipment: 20,
    surgeProtection: false,
    valueBand: "over-800"
  });

  assert.equal(assessment.rawScore, 109);
  assert.equal(assessment.maximum, 109);
  assert.equal(assessment.score, 100);
  assert.equal(assessment.level.key, "elevated");
});

test("surge protection lowers the demo score by five raw points", () => {
  const withoutProtection = model.buildAssessment({ ...lowestState, activity: "high" });
  const withProtection = model.buildAssessment({ ...lowestState, activity: "high", surgeProtection: true });
  assert.equal(withoutProtection.rawScore - withProtection.rawScore, 5);
});

test("equipment input is validated", () => {
  assert.throws(
    () => model.buildAssessment({ ...lowestState, equipment: -1 }),
    /Anzahl technischer Anlagen/
  );
  assert.throws(
    () => model.buildAssessment({ ...lowestState, equipment: 1.5 }),
    /Anzahl technischer Anlagen/
  );
});

test("unknown option values are rejected", () => {
  assert.throws(
    () => model.buildAssessment({ ...lowestState, material: "unknown" }),
    /Ungültiger Wert/
  );
});

test("state survives a URL-fragment round trip", () => {
  const encoded = model.encodeState({ ...lowestState, equipment: 2, surgeProtection: true });
  const decoded = model.decodeState(encoded);
  assert.deepEqual(decoded, { ...lowestState, equipment: 2, surgeProtection: true });
});
