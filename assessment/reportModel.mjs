// Commercial Readiness Assessment: the shared REPORT MODEL.
//
// One normalized object assembled from the frozen engine (scoring) and the
// frozen report intelligence (interpretation copy). The website report render
// (app.mjs resultsHTML) and the client-side PDF (pdf.mjs) both consume THIS,
// so there is a single source of truth and no copy or logic can drift between
// the two outputs.
//
// This file adds NO new copy and NO new scoring. It only gathers what already
// exists into a stable shape.
//
// House rule: no em dashes or en dashes anywhere. Regular hyphens only.

import { DIMENSIONS, DIMENSION_ORDER } from './content.mjs';
import { computeProfile } from './engine.mjs';
import {
  tierOf, DBT, PLATEAU, UNLOCKS, NARRATIVE, CONDITION,
  FAILURE_PATTERN, execSummary, synthesizeConstraints, MONDAY, BUILDING_ENGINE,
} from './report.mjs';

// Assemble the full, normalized report model from a set of answers.
//   answers: { commercialTruth:[1..5]x5, ... } (the frozen shape)
//   ctx:     { company, role, stage, ... } (optional presentation context)
//   date:    a preformatted date string (optional; defaults to today, long US)
export function buildReportModel(answers, ctx = {}, date) {
  const profile = computeProfile(answers);
  const dims = profile.dimensions; // in frozen order

  let priorityIndex = dims.findIndex((x) => x.classification !== 'Built');
  if (priorityIndex < 0) priorityIndex = dims.length - 1;
  const overallBand = profile.allBuilt ? 'Built' : dims[priorityIndex].classification;

  const strongId = profile.strongestIds[0];
  const strongIndex = DIMENSION_ORDER.indexOf(strongId);
  const strongIsReal = ['Built', 'Forming'].includes(dims[strongIndex].classification);

  const priorityDim = DIMENSIONS[priorityIndex];
  const strongDim = DIMENSIONS[strongIndex];

  const conditions = dims.map((x, i) => {
    const d = DIMENSIONS[i];
    const tier = tierOf(x.classification);
    return {
      index: i,
      id: d.id,
      name: d.name,
      definition: d.definition,
      score: x.score,
      classification: x.classification,
      tier,
      isPriority: i === priorityIndex && !profile.allBuilt,
      isStrongest: i === strongIndex && strongIsReal,
      dbtTag: DBT[d.id].tag,
      dbtLine: DBT[d.id].line,
      narrative: NARRATIVE[d.id][tier],
      plateau: PLATEAU[d.id],
      unlocks: UNLOCKS[d.id].slice(),
    };
  });

  const dateStr = date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const meta = [ctx.role, ctx.stage, dateStr].filter(Boolean).join('  ·  ');

  const pc = CONDITION[priorityDim.id];
  const sc = CONDITION[strongDim.id];

  return {
    // header
    company: ctx.company || '',
    role: ctx.role || '',
    stage: ctx.stage || '',
    date: dateStr,
    meta,
    // headline result
    total: profile.total,
    overallBand,
    allBuilt: profile.allBuilt,
    readyThrough: profile.readyThrough,
    // key conditions
    priorityIndex,
    priorityId: priorityDim.id,
    priorityName: priorityDim.name,
    strongIndex,
    strongId: strongDim.id,
    strongName: strongDim.name,
    strongIsReal,
    priorityHead: profile.allBuilt ? 'Where to focus next' : 'What you build first',
    // sections
    conditions,
    executiveSummary: execSummary({
      band: overallBand, priorityName: priorityDim.name, strongName: strongDim.name,
      total: profile.total, readyThrough: profile.readyThrough, allBuilt: profile.allBuilt,
    }),
    constraints: synthesizeConstraints(profile),
    failurePattern: FAILURE_PATTERN[overallBand],
    priority: {
      name: priorityDim.name,
      whyFirst: pc.whyFirst,
      conversations: pc.conversations,
      notYet: pc.notYet,
    },
    strongest: { name: strongDim.name, strongRead: sc.strongRead },
    evidence: pc.evidence.slice(),
    whatNotToDo: pc.whatNotToDo.slice(),
    firstThreeWeeks: {
      week1: MONDAY[priorityDim.id].week1,
      week2: MONDAY[priorityDim.id].week2,
      week3: MONDAY[priorityDim.id].week3,
    },
    buildingTheEngine: {
      lead: BUILDING_ENGINE.lead,
      body: BUILDING_ENGINE.body,
      steps: BUILDING_ENGINE.steps.map((s) => ({ k: s.k, d: s.d })),
      close: BUILDING_ENGINE.close,
    },
  };
}

// Filename: Gain-Advisory-Commercial-Readiness-Profile-[Company].pdf
// Company is sanitized to a safe, readable slug. No company -> no suffix.
export function sanitizeCompany(name) {
  return String(name == null ? '' : name)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^A-Za-z0-9]+/g, '-')                    // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, '')                            // trim hyphens
    .slice(0, 60);
}

export function reportFilename(model) {
  const base = 'Gain-Advisory-Commercial-Readiness-Profile';
  const slug = sanitizeCompany(model && model.company);
  return slug ? `${base}-${slug}.pdf` : `${base}.pdf`;
}
