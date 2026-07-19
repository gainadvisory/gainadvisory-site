// Tests for the shared report model and PDF filename logic.
// Run: node --test  (from the assessment/ directory)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildReportModel, reportFilename, sanitizeCompany } from './reportModel.mjs';
import { computeProfile } from './engine.mjs';
import { DIMENSIONS, DIMENSION_ORDER } from './content.mjs';
import {
  tierOf, DBT, PLATEAU, UNLOCKS, NARRATIVE, CONDITION,
  FAILURE_PATTERN, execSummary, synthesizeConstraints, MONDAY, BUILDING_ENGINE,
} from './report.mjs';

// Build 5 answers (each 1..5) that sum to a target dimension score (5..25).
function scoreToAnswers(s) {
  const base = Math.max(1, Math.min(5, Math.floor(s / 5)));
  const arr = [base, base, base, base, base];
  let rem = s - base * 5;
  for (let i = 0; i < arr.length && rem !== 0; i++) {
    const room = rem > 0 ? 5 - arr[i] : 1 - arr[i];
    const step = rem > 0 ? Math.min(room, rem) : Math.max(room, rem);
    arr[i] += step; rem -= step;
  }
  return arr;
}
function answersFor(scores) {
  const out = {};
  for (const id of DIMENSION_ORDER) out[id] = scoreToAnswers(scores[id]);
  return out;
}

// A representative "Assumed" profile: Commercial Truth is the first non-Built.
const ASSUMED = answersFor({ commercialTruth: 12, positioning: 16, repeatability: 12, fit: 16, adaptability: 20 });
// A "Forming" profile: everything Built until Fit, which is Forming.
const FORMING = answersFor({ commercialTruth: 22, positioning: 21, repeatability: 20, fit: 16, adaptability: 15 });
// Priority moves to Positioning (Commercial Truth is Built).
const PRIORITY_POSITIONING = answersFor({ commercialTruth: 22, positioning: 12, repeatability: 16, fit: 16, adaptability: 20 });
// Strongest is Positioning (highest score), priority is Commercial Truth.
const STRONG_POSITIONING = answersFor({ commercialTruth: 12, positioning: 25, repeatability: 14, fit: 14, adaptability: 14 });
// Everything Built.
const ALL_BUILT = answersFor({ commercialTruth: 24, positioning: 23, repeatability: 22, fit: 21, adaptability: 20 });

test('model contains all five conditions in frozen order', () => {
  const m = buildReportModel(ASSUMED, {}, 'July 19, 2026');
  assert.equal(m.conditions.length, 5);
  assert.deepEqual(m.conditions.map((c) => c.id), DIMENSION_ORDER);
  assert.deepEqual(m.conditions.map((c) => c.name), DIMENSIONS.map((d) => d.name));
});

test('scores in the model match the engine exactly', () => {
  const p = computeProfile(ASSUMED);
  const m = buildReportModel(ASSUMED);
  assert.equal(m.total, p.total);
  m.conditions.forEach((c, i) => {
    assert.equal(c.score, p.dimensions[i].score);
    assert.equal(c.classification, p.dimensions[i].classification);
  });
});

test('Assumed profile: overall band and first priority', () => {
  const m = buildReportModel(ASSUMED);
  assert.equal(m.overallBand, 'Assumed');
  assert.equal(m.priorityId, 'commercialTruth');
  assert.equal(m.priorityName, 'Commercial Truth');
  assert.equal(m.priorityHead, 'What you build first');
});

test('Forming profile: first priority is Fit', () => {
  const m = buildReportModel(FORMING);
  assert.equal(m.overallBand, 'Forming');
  assert.equal(m.priorityId, 'fit');
});

test('first priority is the first-non-Built in sequence, not the lowest score', () => {
  // Repeatability (16) scores higher than nothing here; positioning (12) is the
  // first below Built, so it is the priority even though others may be lower.
  const m = buildReportModel(PRIORITY_POSITIONING);
  assert.equal(m.priorityId, 'positioning');
});

test('strongest condition tracks the highest score', () => {
  const m = buildReportModel(STRONG_POSITIONING);
  assert.equal(m.strongId, 'positioning');
  assert.equal(m.strongName, 'Positioning');
});

test('all-Built profile', () => {
  const m = buildReportModel(ALL_BUILT);
  assert.equal(m.allBuilt, true);
  assert.equal(m.overallBand, 'Built');
  assert.equal(m.priorityHead, 'Where to focus next');
  assert.ok(m.conditions.every((c) => c.classification === 'Built'));
});

test('classification values are only the four frozen bands', () => {
  for (const answers of [ASSUMED, FORMING, PRIORITY_POSITIONING, STRONG_POSITIONING, ALL_BUILT]) {
    const m = buildReportModel(answers);
    for (const c of m.conditions) assert.ok(['Built', 'Forming', 'Assumed', 'Absent'].includes(c.classification));
  }
});

test('no copy drift: model text is the shared report.mjs source', () => {
  const answers = ASSUMED;
  const p = computeProfile(answers);
  const m = buildReportModel(answers, {}, 'July 19, 2026');
  // per-condition copy
  m.conditions.forEach((c) => {
    assert.equal(c.dbtTag, DBT[c.id].tag);
    assert.equal(c.dbtLine, DBT[c.id].line);
    assert.equal(c.plateau, PLATEAU[c.id]);
    assert.deepEqual(c.unlocks, UNLOCKS[c.id]);
    assert.equal(c.narrative, NARRATIVE[c.id][tierOf(c.classification)]);
  });
  // composed copy
  assert.deepEqual(m.executiveSummary, execSummary({
    band: m.overallBand, priorityName: m.priorityName, strongName: m.strongName,
    total: m.total, readyThrough: m.readyThrough, allBuilt: m.allBuilt,
  }));
  assert.deepEqual(m.constraints, synthesizeConstraints(p));
  assert.equal(m.failurePattern, FAILURE_PATTERN[m.overallBand]);
  assert.equal(m.priority.whyFirst, CONDITION[m.priorityId].whyFirst);
  assert.deepEqual(m.evidence, CONDITION[m.priorityId].evidence);
  assert.deepEqual(m.whatNotToDo, CONDITION[m.priorityId].whatNotToDo);
  assert.equal(m.strongest.strongRead, CONDITION[m.strongId].strongRead);
  assert.equal(m.firstThreeWeeks.week1, MONDAY[m.priorityId].week1);
  assert.equal(m.firstThreeWeeks.week3, MONDAY[m.priorityId].week3);
  assert.equal(m.buildingTheEngine.close, BUILDING_ENGINE.close);
  assert.deepEqual(m.buildingTheEngine.steps, BUILDING_ENGINE.steps);
});

test('filename sanitization and fallback', () => {
  assert.equal(reportFilename({ company: 'Northwind Payments' }), 'Gain-Advisory-Commercial-Readiness-Profile-Northwind-Payments.pdf');
  assert.equal(reportFilename({ company: 'Acme, Inc.' }), 'Gain-Advisory-Commercial-Readiness-Profile-Acme-Inc.pdf');
  assert.equal(reportFilename({ company: '  //weird**name//  ' }), 'Gain-Advisory-Commercial-Readiness-Profile-weird-name.pdf');
  assert.equal(reportFilename({ company: '' }), 'Gain-Advisory-Commercial-Readiness-Profile.pdf');
  assert.equal(reportFilename({}), 'Gain-Advisory-Commercial-Readiness-Profile.pdf');
  assert.equal(reportFilename(null), 'Gain-Advisory-Commercial-Readiness-Profile.pdf');
});

test('sanitizeCompany strips accents and caps length', () => {
  assert.equal(sanitizeCompany('Café Solutions'), 'Cafe-Solutions');
  assert.ok(sanitizeCompany('x'.repeat(200)).length <= 60);
});

test('long company name does not break the filename', () => {
  const m = buildReportModel(ASSUMED, { company: 'The Exceptionally Long Company Name Holdings International LLC' });
  const fn = reportFilename(m);
  assert.ok(fn.startsWith('Gain-Advisory-Commercial-Readiness-Profile-'));
  assert.ok(fn.endsWith('.pdf'));
});

test('PDF and model modules make no network calls (fully client-side)', () => {
  for (const f of ['pdf.mjs', 'reportModel.mjs']) {
    const src = readFileSync(new URL('./' + f, import.meta.url), 'utf8');
    assert.equal(/\bfetch\s*\(/.test(src), false, f + ' must not call fetch');
    assert.equal(/XMLHttpRequest/.test(src), false, f + ' must not use XMLHttpRequest');
    assert.equal(/WebSocket/.test(src), false, f + ' must not use WebSocket');
    assert.equal(/https?:\/\/(?!\/)/.test(src.replace(/gainadvisory\.com/g, '')), false, f + ' must not reference remote URLs');
  }
});
