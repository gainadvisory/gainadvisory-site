// Commercial Readiness Assessment — scoring ENGINE (pure functions).
//
// Computation only: score, classification, first priority, strongest condition.
// No DOM, no side effects, and NO interpretation copy (that lives in results.mjs)
// and NO question/definition text (that lives in content.mjs). The output is
// ids + numbers + classifications, so the engine can be reused by anything
// (website, advisor mode, GTMology) without inheriting website language.

import { DIMENSION_ORDER } from './content.mjs';

// Classification bands: computational thresholds only, no prose.
export const BANDS = [
  { id: 'Built',   min: 20, max: 25 },
  { id: 'Forming', min: 14, max: 19 },
  { id: 'Assumed', min: 8,  max: 13 },
  { id: 'Absent',  min: 5,  max: 7  },
];

// Sum a dimension's five answers -> 5..25. Each answer must be an integer 1..5.
export function scoreDimension(answers) {
  if (!Array.isArray(answers) || answers.length !== 5) {
    throw new Error('scoreDimension expects exactly five answers');
  }
  return answers.reduce((sum, a) => {
    const n = Number(a);
    if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('each answer must be an integer 1..5');
    return sum + n;
  }, 0);
}

// Classify a dimension score (5..25) -> "Built" | "Forming" | "Assumed" | "Absent".
export function classify(dimensionScore) {
  const band = BANDS.find((b) => dimensionScore >= b.min && dimensionScore <= b.max);
  if (!band) throw new Error('dimension score out of range (5..25): ' + dimensionScore);
  return band.id;
}

// answersByDim: { commercialTruth:[1..5]x5, ... } -> { id: {score, classification} }
export function scoreAll(answersByDim) {
  const out = {};
  for (const id of DIMENSION_ORDER) {
    const score = scoreDimension(answersByDim[id]);
    out[id] = { score, classification: classify(score) };
  }
  return out;
}

export function totalScore(scores) {
  return DIMENSION_ORDER.reduce((sum, id) => sum + scores[id].score, 0); // 25..125
}

// The load-bearing rule: the first condition IN SEQUENCE that is not Built,
// never the numerically lowest by default. Returns a dimension id, or null.
export function firstPriority(scores) {
  return DIMENSION_ORDER.find((id) => scores[id].classification !== 'Built') || null;
}

// How far readiness holds before the first gap (0..5). Readiness is sequential.
export function readyThrough(scores) {
  let n = 0;
  for (const id of DIMENSION_ORDER) {
    if (scores[id].classification === 'Built') n += 1; else break;
  }
  return n;
}

// Highest-scoring dimension(s). ids has more than one entry on a tie, so the
// caller can explain the tie rather than pick one arbitrarily.
export function strongest(scores) {
  const max = Math.max(...DIMENSION_ORDER.map((id) => scores[id].score));
  const ids = DIMENSION_ORDER.filter((id) => scores[id].score === max);
  return { ids, score: max, tied: ids.length > 1 };
}

export function allBuilt(scores) {
  return DIMENSION_ORDER.every((id) => scores[id].classification === 'Built');
}

// The full computed model the UI renders from. Ids, numbers, classifications and
// booleans only. No names, no definitions, no interpretation copy. Callers join
// content.mjs (names/definitions) and results.mjs (interpretations) by id.
export function computeProfile(answersByDim) {
  const scores = scoreAll(answersByDim);
  const priorityId = firstPriority(scores);
  const strong = strongest(scores);
  return {
    total: totalScore(scores),          // 25..125
    allBuilt: allBuilt(scores),
    readyThrough: readyThrough(scores), // 0..5
    priorityId,                         // dimension id, or null when all Built
    strongestIds: strong.ids,           // one id, or several on a tie
    strongestScore: strong.score,
    strongestTied: strong.tied,
    dimensions: DIMENSION_ORDER.map((id) => ({
      id,
      score: scores[id].score,
      classification: scores[id].classification,
      isPriority: id === priorityId,
      isStrongest: strong.ids.includes(id),
    })),
  };
}
