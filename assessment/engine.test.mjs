// Node test suite for the Commercial Readiness scoring engine.
// Run: node engine.test.mjs
import {
  scoreDimension, classify, scoreAll, totalScore, firstPriority,
  readyThrough, strongest, allBuilt, computeProfile,
} from './engine.mjs';
import { DIMENSIONS, DIMENSION_ORDER, QUESTION_HELP } from './content.mjs';
import * as engineNS from './engine.mjs';
import { DIMENSION_GUIDANCE, DIMENSION_INTERPRETATION, CLASSIFICATION_SUMMARY, overallStateText } from './results.mjs';

let passed = 0, failed = 0;
function ok(name, cond) { if (cond) { passed++; } else { failed++; console.log('  FAIL:', name); } }
function eq(name, got, want) { ok(name + ' (got ' + JSON.stringify(got) + ')', JSON.stringify(got) === JSON.stringify(want)); }

// helper: five answers (1..5) summing to `target` (5..25)
function dim(target) {
  const a = [1, 1, 1, 1, 1]; let r = target - 5, i = 0;
  while (r > 0) { if (a[i] < 5) { a[i]++; r--; } i = (i + 1) % 5; }
  return a;
}
function answers(map) { const o = {}; for (const id of DIMENSION_ORDER) o[id] = dim(map[id]); return o; }

// ---- content integrity: exactly 5 dimensions, 5 questions each, right order ----
eq('five dimensions', DIMENSIONS.length, 5);
eq('order is load-bearing', DIMENSION_ORDER, ['commercialTruth', 'positioning', 'repeatability', 'fit', 'adaptability']);
ok('every dimension has exactly 5 questions', DIMENSIONS.every((d) => d.questions.length === 5));
eq('25 questions total', DIMENSIONS.reduce((n, d) => n + d.questions.length, 0), 25);

// ---- scoreDimension ----
eq('all-1 dimension = 5', scoreDimension([1, 1, 1, 1, 1]), 5);
eq('all-5 dimension = 25', scoreDimension([5, 5, 5, 5, 5]), 25);
eq('mixed = 15', scoreDimension([3, 3, 3, 3, 3]), 15);
ok('rejects 6-item', (() => { try { scoreDimension([1, 1, 1, 1, 1, 1]); return false; } catch { return true; } })());
ok('rejects out-of-range answer', (() => { try { scoreDimension([1, 1, 1, 1, 6]); return false; } catch { return true; } })());

// ---- classification boundaries (5,7,8,13,14,19,20,25) ----
eq('5 -> Absent', classify(5), 'Absent');
eq('7 -> Absent', classify(7), 'Absent');
eq('8 -> Assumed', classify(8), 'Assumed');
eq('13 -> Assumed', classify(13), 'Assumed');
eq('14 -> Forming', classify(14), 'Forming');
eq('19 -> Forming', classify(19), 'Forming');
eq('20 -> Built', classify(20), 'Built');
eq('25 -> Built', classify(25), 'Built');

// ---- total ----
eq('all-1 total = 25', totalScore(scoreAll(answers({ commercialTruth: 5, positioning: 5, repeatability: 5, fit: 5, adaptability: 5 }))), 25);
eq('all-5 total = 125', totalScore(scoreAll(answers({ commercialTruth: 25, positioning: 25, repeatability: 25, fit: 25, adaptability: 25 }))), 125);

// ---- PRIORITY SEQUENCING (the load-bearing rule) ----
// Prompt's example: CT 11 (Assumed), Pos 18 (Forming), Rep 7 (Absent), Fit 15 (Forming), Adapt 9 (Assumed)
// Priority must be Commercial Truth, NOT the numerically lowest (Repeatability at 7).
{
  const s = scoreAll(answers({ commercialTruth: 11, positioning: 18, repeatability: 7, fit: 15, adaptability: 9 }));
  eq('example: firstPriority is commercialTruth (not lowest repeatability)', firstPriority(s), 'commercialTruth');
  ok('example: Assumed CT (11) outranks Absent Repeatability (7)', firstPriority(s) === 'commercialTruth' && s.repeatability.classification === 'Absent');
}
// Built CT lets Positioning become the priority.
eq('Built CT -> priority Positioning', firstPriority(scoreAll(answers({ commercialTruth: 22, positioning: 12, repeatability: 7, fit: 9, adaptability: 9 }))), 'positioning');
// Built CT + Positioning -> Repeatability becomes the priority.
eq('Built CT+Pos -> priority Repeatability', firstPriority(scoreAll(answers({ commercialTruth: 22, positioning: 21, repeatability: 12, fit: 25, adaptability: 9 }))), 'repeatability');
// Built through Repeatability -> Fit.
eq('Built CT+Pos+Rep -> priority Fit', firstPriority(scoreAll(answers({ commercialTruth: 22, positioning: 21, repeatability: 20, fit: 13, adaptability: 25 }))), 'fit');
// Built through Fit -> Adaptability.
eq('Built through Fit -> priority Adaptability', firstPriority(scoreAll(answers({ commercialTruth: 22, positioning: 21, repeatability: 20, fit: 20, adaptability: 13 }))), 'adaptability');
// All Built -> no priority.
eq('all Built -> priority null', firstPriority(scoreAll(answers({ commercialTruth: 20, positioning: 22, repeatability: 24, fit: 20, adaptability: 25 }))), null);

// ---- readyThrough ----
eq('CT not Built -> readyThrough 0', readyThrough(scoreAll(answers({ commercialTruth: 13, positioning: 25, repeatability: 25, fit: 25, adaptability: 25 }))), 0);
eq('first two Built -> readyThrough 2', readyThrough(scoreAll(answers({ commercialTruth: 20, positioning: 20, repeatability: 13, fit: 25, adaptability: 25 }))), 2);
eq('all Built -> readyThrough 5', readyThrough(scoreAll(answers({ commercialTruth: 20, positioning: 20, repeatability: 20, fit: 20, adaptability: 20 }))), 5);

// ---- allBuilt + strongest (incl. tie) ----
ok('allBuilt true when all >=20', allBuilt(scoreAll(answers({ commercialTruth: 20, positioning: 21, repeatability: 22, fit: 23, adaptability: 24 }))));
ok('allBuilt false with one gap', !allBuilt(scoreAll(answers({ commercialTruth: 20, positioning: 21, repeatability: 19, fit: 23, adaptability: 24 }))));
{
  const st = strongest(scoreAll(answers({ commercialTruth: 25, positioning: 25, repeatability: 10, fit: 10, adaptability: 10 })));
  ok('strongest returns both tied ids + tied flag', st.ids.length === 2 && st.score === 25 && st.tied === true);
}

// ---- computeProfile end to end (prompt's example); engine returns ids/numbers only ----
{
  const p = computeProfile(answers({ commercialTruth: 11, positioning: 18, repeatability: 7, fit: 15, adaptability: 9 }));
  eq('profile.priorityId = commercialTruth', p.priorityId, 'commercialTruth');
  eq('profile.total = 60', p.total, 11 + 18 + 7 + 15 + 9);
  ok('profile marks the priority dimension', p.dimensions.find((d) => d.id === 'commercialTruth').isPriority);
  ok('engine output carries NO copy (no whyFirst/name/definition on dimensions)',
    p.dimensions.every((d) => d.whyFirst === undefined && d.name === undefined && d.definition === undefined));
}

// ---- separation of concerns: interpretation copy lives in results.mjs, not the engine ----
ok('guidance exists for every dimension in results', DIMENSION_ORDER.every((id) => DIMENSION_GUIDANCE[id] && DIMENSION_GUIDANCE[id].whyFirst));
ok('classification summary covers all four bands', ['Built', 'Forming', 'Assumed', 'Absent'].every((b) => typeof CLASSIFICATION_SUMMARY[b] === 'string'));
// dimension-specific interpretations: every dimension x every band, and genuinely distinct (not generic)
const BANDS4 = ['Built', 'Forming', 'Assumed', 'Absent'];
ok('interpretation exists for every dimension x band (5x4)',
  DIMENSION_ORDER.every((id) => BANDS4.every((b) => typeof DIMENSION_INTERPRETATION[id]?.[b] === 'string' && DIMENSION_INTERPRETATION[id][b].length > 20)));
BANDS4.forEach((b) => {
  const texts = DIMENSION_ORDER.map((id) => DIMENSION_INTERPRETATION[id][b]);
  ok(`${b} interpretations are dimension-specific (all distinct)`, new Set(texts).size === DIMENSION_ORDER.length);
});
ok('interpretations do not fall back to the generic band summary',
  DIMENSION_ORDER.every((id) => BANDS4.every((b) => DIMENSION_INTERPRETATION[id][b] !== CLASSIFICATION_SUMMARY[b])));
eq('overallStateText for all-Built',
  overallStateText(computeProfile(answers({ commercialTruth: 20, positioning: 20, repeatability: 20, fit: 20, adaptability: 20 }))),
  'Self-assessed as a commercially ready engine');

// ---- question help (content layer): all 25 present, sized, distinct, no engine leak ----
const wc = (s) => String(s).trim().split(/\s+/).length;
ok('help exists for every dimension', DIMENSION_ORDER.every((id) => Array.isArray(QUESTION_HELP[id])));
eq('help has 5 entries per dimension', DIMENSION_ORDER.map((id) => (QUESTION_HELP[id] || []).length), [5, 5, 5, 5, 5]);
{
  const all = DIMENSION_ORDER.flatMap((id) => QUESTION_HELP[id] || []);
  eq('25 help entries total', all.length, 25);
  ok('every help entry is a non-empty string', all.every((h) => typeof h === 'string' && h.trim().length > 0));
  ok('every help entry is roughly 30 to 80 words', all.every((h) => wc(h) >= 30 && wc(h) <= 80));
  ok('all 25 help entries are distinct (not one repeated guidance)', new Set(all).size === 25);
  // help must map 1:1 to the 25 scored questions
  ok('help count matches scored-question count', all.length === DIMENSIONS.reduce((n, d) => n + d.questions.length, 0));
}
// Pencil, not Sharpie explanation is present and explains the phrase
{
  const idx = DIMENSIONS.find((d) => d.id === 'adaptability').questions.findIndex((q) => q.includes('Pencil, not Sharpie'));
  ok('a question references Pencil, not Sharpie', idx >= 0);
  ok('its help explains the phrase as a testable hypothesis',
    QUESTION_HELP.adaptability[idx].includes('Pencil, not Sharpie means the motion is treated as a testable hypothesis'));
}
// separation: help copy lives in content, never in the scoring engine
ok('engine.mjs does not export QUESTION_HELP', engineNS.QUESTION_HELP === undefined);
ok('engine profile output carries no help text', (() => {
  const p = engineNS.computeProfile(answers({ commercialTruth: 15, positioning: 15, repeatability: 15, fit: 15, adaptability: 15 }));
  return p.dimensions.every((d) => d.help === undefined && d.questionHelp === undefined);
})());

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
