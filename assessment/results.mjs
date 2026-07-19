// Commercial Readiness Assessment — RESULTS copy (interpretations + recommendations).
//
// This is website-facing language. It is deliberately separate from engine.mjs so
// the scoring engine can be reused (advisor mode, GTMology, benchmarking) without
// inheriting any of this copy. The UI joins engine output (by id/classification)
// to the text below.
//
// House rules: no person or company named except Jason; no em dashes.

// What each classification means, in prose (generic band definition).
export const CLASSIFICATION_SUMMARY = {
  Built:   'The condition holds and would survive a test.',
  Forming: 'It is real but not yet dependable. It works when the right people are in the room.',
  Assumed: 'The company believes this is true but has not established it on evidence.',
  Absent:  'The condition does not yet exist. It is being run on hope, or on a person.',
};

// Dimension-specific interpretation of each classification. The classification is
// shared (Forming means the same band everywhere), but what that band MEANS for a
// given condition is not: a Forming Positioning is a different problem than a
// Forming Fit. The ladder shows these, so each rung reads for its own condition
// rather than repeating a generic line. Copy, not engine.
export const DIMENSION_INTERPRETATION = {
  commercialTruth: {
    Built:   'You know, on evidence, who controls the budget and the pain that opens it, and that knowledge does not live in one person’s memory.',
    Forming: 'You have a real read on the buyer, but it still leans on your best people rather than on tested evidence.',
    Assumed: 'You hold a confident theory of who buys and why, but it has not been checked against real buyers recently.',
    Absent:  'Who actually buys, and the pain that moves them, is still a guess, and the company is aimed at whoever it inherited from its first deals.',
  },
  positioning: {
    Built:   'The promise is sharp enough to repel the wrong buyer as clearly as it attracts the right one, and it holds under pressure.',
    Forming: 'The promise is becoming distinct, but it may still broaden under commercial pressure.',
    Assumed: 'You believe the positioning is clear, but it would still fit several other companies without changing a word.',
    Absent:  'The promise is broad enough to feel safe, which leaves every deal re-explaining what you are.',
  },
  repeatability: {
    Built:   'Deals close without running through one person, and a new hire can reach productivity from a defined motion rather than a star.',
    Forming: 'The motion works, but the harder deals still depend on particular people to carry them.',
    Assumed: 'You describe winning as a process, but the results still trace back to one or two indispensable people.',
    Absent:  'Every meaningful deal runs through one person, and the forecast would not survive their absence.',
  },
  fit: {
    Built:   'The motion matches how the buyer actually decides, and the risks that make them hesitate at the end have been engineered away.',
    Forming: 'The motion reflects parts of the buyer’s decision process, but not dependably enough to prevent avoidable stalls.',
    Assumed: 'You believe the motion fits the buyer, but stalls still get filed under timing or budget rather than the real risk.',
    Absent:  'The motion is built for the buyer you wish you had, and deals freeze near the finish for reasons you have not named.',
  },
  adaptability: {
    Built:   'The company changes its playbook on evidence, and the judgment that wins lives in the organization, not in a few heads.',
    Forming: 'The company can adapt, but the learning still concentrates in a few people rather than becoming shared capability.',
    Assumed: 'You believe the company keeps learning, but the playbook mostly changes only when a crisis forces it.',
    Absent:  'The company changes only under pressure, and what its best people know would leave with them.',
  },
};

// The governing principle of the result. The total is secondary; the shape leads.
export const SHAPE_OVER_TOTAL =
  'The total is worth less than the shape. A company does not fail commercially because its average was low. It fails at the weakest condition highest in the order.';

// Used when a strong lower condition sits on a weak higher one.
export const FALSE_STRENGTH =
  'A strong, repeatable motion built on an Assumed Commercial Truth is not a strength. It is a faster way to the wrong place.';

// "First thing to build" guidance, per dimension. Shown only for the first
// condition below Built. This is the recommendation layer, not the engine.
export const DIMENSION_GUIDANCE = {
  commercialTruth: {
    whyFirst: 'Nothing below this can be trusted until it is settled. Positioning, motion and everything after are built on an answer to who buys and why. Get this wrong and the rest is built well on the wrong foundation.',
    risk: 'A company that has not established Commercial Truth is usually aiming its whole commercial system at the wrong person: the one who admires the product rather than the one who feels the pain and controls the budget.',
    whatItMeans: 'Establishing Commercial Truth means going to the market and learning, on evidence, who actually pulls out the budget and the exact pressure that makes them do it. Not the internal theory. The buyer’s own words.',
    effectBelow: 'Until this is true, a strong score anywhere below it is not a strength. A repeatable motion built on an assumed Commercial Truth is a faster way to the wrong place.',
  },
  positioning: {
    whyFirst: 'With Commercial Truth in place, positioning is the first thing the market actually meets. A motion cannot be repeatable if the promise underneath it is generic, because every deal starts by re-explaining what you are.',
    risk: 'Positioning broad enough to feel safe attracts no one in particular. It leaves the sales team re-inventing the pitch on every call, which is the opposite of a system.',
    whatItMeans: 'Sharpening positioning means choosing who you are for and who you are not for, in language specific enough that the wrong buyer rejects it on sight. If everyone is a fit, nobody is convinced.',
    effectBelow: 'A repeatable motion aimed through a blurry promise repeats the wrong conversation. Fix the promise before you scale the motion that carries it.',
  },
  repeatability: {
    whyFirst: 'With truth and positioning settled, repeatability is what turns them into a company rather than a person. This is the condition most often mistaken for strength while it is actually a dependency.',
    risk: 'When every meaningful deal runs through one person, the results look like a machine right up until that person is stretched or gone. That is a dependency wearing an engine’s clothes.',
    whatItMeans: 'Building repeatability means pulling the winning motion out of one head and into a system: a defined path a new person can run and get most of it right, a reason you win stated as process rather than personality.',
    effectBelow: 'Adaptability cannot help a motion that only one person can run. Make the motion transferable before you ask the organization to keep improving it.',
  },
  fit: {
    whyFirst: 'A motion can be repeatable and still be repeatably wrong. Fit is where the motion meets how the buyer actually decides, including the risks that make them hesitate at the very end.',
    risk: 'When a motion does not fit the real decision, deals stall near the finish and get filed under timing or budget. The company follows up and waits, and the risk hiding underneath is never removed.',
    whatItMeans: 'Improving Fit means learning why deals actually stall, accounting for everyone the buyer must convince internally, and engineering away the specific risk that makes them freeze, rather than pushing harder.',
    effectBelow: 'The company can keep learning, but if the motion does not fit the buyer, it will keep learning the wrong lesson. Align the motion to the decision first.',
  },
  adaptability: {
    whyFirst: 'Adaptability is the last condition because it decides whether everything above it keeps working after the people who built it are gone. It is the difference between a system the company owns and one it rents from a few people.',
    risk: 'A company that only changes under crisis, or whose judgment lives in a few heads, has an engine that stops improving the moment those people leave. Documentation is not the same as transferred judgment.',
    whatItMeans: 'Building Adaptability means the learning leaves individual heads and becomes organizational: the playbook changes on evidence, held in pencil not Sharpie, and the company keeps getting better without any one person present.',
    effectBelow: 'This is the top of the ladder. With it in place, the conditions beneath it are not just true today, they stay true as the company grows and turns over.',
  },
};

// Overall descriptor derived from the engine's readyThrough / allBuilt.
export function overallStateText(profile) {
  if (profile.allBuilt) return 'Self-assessed as a commercially ready engine';
  const n = profile.readyThrough;
  if (n === 0) return 'Readiness is not yet established at the first condition';
  if (n === 1) return 'Readiness holds through the first condition';
  return 'Readiness holds through the first ' + n + ' conditions';
}

// Framing for the strongest condition. Relative strength, not verified capability.
export function strongestText(names, tied) {
  if (tied) {
    return 'Your responses point to more than one condition as your relative strength: ' +
      names.join(' and ') + '. They scored the same, which is worth noting rather than resolving.';
  }
  return 'Your responses suggest ' + names[0] + ' is your relative strength. Treat it as a strength you can lean on, not as capability the market has yet confirmed.';
}

// The honest reading of the whole result.
export const WHAT_THIS_MEANS = [
  'This is a self-assessment. It reflects the participant’s current view, not proof.',
  'If leaders would answer differently, that disagreement is itself diagnostic and worth surfacing.',
  'Evidence may confirm the score or challenge it.',
  'The next stage of diagnosis tests this result against real customers, the pipeline, the actual motion, and how the organization behaves without its key people.',
];

// When every condition is Built.
export const ALL_BUILT = {
  headline: 'Your responses indicate a commercially ready engine.',
  body: 'This is a strong result, and it is a self-assessment, not a verdict. Test it against external evidence: real buyers, the pipeline, the forecast under absence. Reassess periodically, because readiness erodes as a company grows and turns over.',
};
