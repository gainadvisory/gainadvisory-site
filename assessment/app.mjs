// Commercial Readiness Assessment — UI application.
// Joins engine (computation) + content (questions) + results (copy). No methodology
// or scoring lives here; this is presentation and flow only.

import { DIMENSIONS, DIMENSION_ORDER, RESPONSE_OPTIONS } from './content.mjs';
import { computeProfile } from './engine.mjs';
import {
  CLASSIFICATION_SUMMARY, DIMENSION_INTERPRETATION, SHAPE_OVER_TOTAL, FALSE_STRENGTH, DIMENSION_GUIDANCE,
  overallStateText, strongestText, WHAT_THIS_MEANS, ALL_BUILT,
} from './results.mjs';

const byId = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]));
const STORAGE_KEY = 'cra_v1';
const REVIEW_EMAIL = 'jason@gainadvisory.com';
const params = new URLSearchParams(location.search);
const FACILITATED = params.get('mode') === 'facilitated';
const SOURCE = (params.get('source') || '').slice(0, 40);

const app = document.getElementById('app');

// ---- helpers ----------------------------------------------------------------
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function track(name, data) { try { if (window.va) window.va('event', { name, ...(data || {}) }); } catch (e) {} }
function announce(msg) { let r = document.getElementById('cra-live'); if (r) r.textContent = msg; }

function todayLabel() {
  try { return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch (e) { return ''; }
}

// ---- state ------------------------------------------------------------------
const emptyAnswers = () => Object.fromEntries(DIMENSION_ORDER.map((id) => [id, [null, null, null, null, null]]));
let state = { screen: 'intro', dimIndex: 0, answers: emptyAnswers(), context: {}, startedAt: null, date: null };

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      screen: state.screen, dimIndex: state.dimIndex, answers: state.answers,
      context: state.context, startedAt: state.startedAt, date: state.date,
    }));
  } catch (e) {}
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.answers) return null;
    // shape-guard: ensure every dimension has a 5-slot array
    const answers = emptyAnswers();
    for (const id of DIMENSION_ORDER) if (Array.isArray(s.answers[id]) && s.answers[id].length === 5) answers[id] = s.answers[id];
    return { screen: s.screen, dimIndex: s.dimIndex | 0, answers, context: s.context || {}, startedAt: s.startedAt, date: s.date };
  } catch (e) { return null; }
}
function clearSaved() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }
function hasAnyAnswer() { return DIMENSION_ORDER.some((id) => state.answers[id].some((a) => a != null)); }
function dimComplete(id) { return state.answers[id].every((a) => a != null); }
function allComplete() { return DIMENSION_ORDER.every(dimComplete); }
function answeredCount(id) { return state.answers[id].filter((a) => a != null).length; }

// ---- navigation -------------------------------------------------------------
function go(screen, dimIndex) {
  state.screen = screen;
  if (dimIndex != null) state.dimIndex = dimIndex;
  save(); render();
}

// ---- render dispatcher ------------------------------------------------------
function render() {
  const fns = { intro: renderIntro, context: renderContext, assess: renderAssess, review: renderReview, results: renderResults };
  app.innerHTML = '<div id="cra-live" class="visually-hidden" role="status" aria-live="polite"></div>' + (fns[state.screen] || renderIntro)();
  wire();
  // focus the primary heading for keyboard + screen-reader users
  const h = app.querySelector('[data-focus]') || app;
  if (h.focus) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); }
  window.scrollTo(0, 0);
}

// ---- screens ----------------------------------------------------------------
function renderIntro() {
  const resumable = hasAnyAnswer() && !allComplete();
  return `
  <div class="wrap section">
    <p class="eyebrow">Commercial Readiness Assessment</p>
    <h1 class="cra" data-focus tabindex="-1">Does your company own a commercial engine, or does it own a few people?</h1>
    ${FACILITATED ? '' : `
    <p class="lead">This measures whether your company has a commercial engine it owns, or revenue that still depends on particular people. It is written for founders and executives running an early or growth-stage company.</p>
    <p class="lead">Twenty five questions across five conditions. Seven to ten minutes. The goal is an accurate score, not a high one, and the five conditions are read in sequence, because a weakness high in the order caps everything beneath it. Your answers are self reported. They are a diagnostic starting point, not proof.</p>`}
    ${FACILITATED ? '<p class="lead">Twenty five questions across five conditions, read in sequence. The goal is an accurate read, not a high score.</p>' : ''}
    ${resumable ? `<div class="email-box"><strong>You have an assessment in progress.</strong> <div class="btn-row"><button class="btn btn-primary" data-act="resume">Resume where you left off</button><button class="btn btn-ghost" data-act="restart">Start over</button></div></div>` : ''}
    <div class="btn-row">
      <button class="btn btn-primary" data-act="begin">Begin the assessment</button>
      <a class="btn btn-ghost" href="/#method">Learn about Commercial by Design</a>
    </div>
  </div>`;
}

const STAGE_OPTS = ['', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C or later', 'Bootstrapped', 'Profitable / self-funded'];
const ARR_OPTS = ['', 'Pre-revenue', 'Under $1M', '$1M to $5M', '$5M to $20M', '$20M to $50M', 'Over $50M'];
const EMP_OPTS = ['', '1 to 10', '11 to 50', '51 to 200', '201 to 500', 'Over 500'];
const FOUNDER_OPTS = ['', 'Yes, the founder still leads most of it', 'Partly', 'No, a team runs it'];

function selectField(name, label, opts, value) {
  return `<div><label class="fl" for="f_${name}">${esc(label)}</label>
    <select class="ti" id="f_${name}" name="${name}">${opts.map((o) => `<option value="${esc(o)}"${o === value ? ' selected' : ''}>${o === '' ? 'Prefer not to say' : esc(o)}</option>`).join('')}</select></div>`;
}
function renderContext() {
  const c = state.context || {};
  return `
  <div class="wrap section">
    <p class="eyebrow">Optional context</p>
    <h2 class="cra" data-focus tabindex="-1">A little context sharpens the result.</h2>
    <p class="lead">All optional. These help interpret your answers. You can skip every one.</p>
    <form id="ctx" novalidate>
      <div class="form-grid">
        <div class="full"><label class="fl" for="f_company">Company name</label><input class="ti" id="f_company" name="company" value="${esc(c.company)}" autocomplete="organization"></div>
        <div><label class="fl" for="f_participant">Your name</label><input class="ti" id="f_participant" name="participant" value="${esc(c.participant)}" autocomplete="name"></div>
        <div><label class="fl" for="f_role">Your role</label><input class="ti" id="f_role" name="role" value="${esc(c.role)}"></div>
        ${selectField('stage', 'Company stage', STAGE_OPTS, c.stage)}
        ${selectField('arr', 'Annual recurring revenue', ARR_OPTS, c.arr)}
        ${selectField('employees', 'Employees', EMP_OPTS, c.employees)}
        <div><label class="fl" for="f_industry">Industry</label><input class="ti" id="f_industry" name="industry" value="${esc(c.industry)}"></div>
        <div class="full">${selectField('founderLed', 'Does the founder still lead most commercial activity?', FOUNDER_OPTS, c.founderLed).replace('<div>', '').replace(/<\/div>$/, '')}</div>
      </div>
      <div class="btn-row between">
        <button type="button" class="btn btn-ghost" data-act="back-intro">Back</button>
        <span>
          <button type="button" class="btn btn-secondary" data-act="skip-context">Skip</button>
          <button type="submit" class="btn btn-primary">Continue</button>
        </span>
      </div>
    </form>
  </div>`;
}

function renderAssess() {
  const dim = DIMENSIONS[state.dimIndex];
  const answers = state.answers[dim.id];
  const pct = Math.round(((state.dimIndex) / DIMENSIONS.length) * 100);
  const qHtml = dim.questions.map((q, qi) => {
    const opts = RESPONSE_OPTIONS.map((o) => {
      const sel = answers[qi] === o.value;
      return `<label class="opt${sel ? ' sel' : ''}">
        <input type="radio" name="q_${qi}" value="${o.value}"${sel ? ' checked' : ''}>
        <span class="dot" aria-hidden="true"></span><span class="otext">${esc(o.label)}</span></label>`;
    }).join('');
    return `<fieldset class="q" data-qi="${qi}">
      <legend class="qtext">${qi + 1}. ${esc(q)}</legend>
      <div class="opts" role="radiogroup" aria-label="Response for question ${qi + 1}">${opts}</div>
    </fieldset>`;
  }).join('');
  return `
  <div class="wrap section">
    <div class="progress"><span class="progress-label">Condition ${state.dimIndex + 1} of ${DIMENSIONS.length}</span>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>
    <div class="dim-head">
      <div class="n">Condition ${dim.order} of 5</div>
      <h2 class="cra" data-focus tabindex="-1" style="margin:4px 0 6px">${esc(dim.name)}</h2>
      <p class="muted" style="margin:0">${esc(dim.definition)}</p>
    </div>
    <form id="assessForm">${qHtml}
      <p class="field-error" id="assessError" style="display:none" role="alert">Please answer every question before continuing.</p>
      <div class="btn-row between">
        <button type="button" class="btn btn-ghost" data-act="prev-dim">Back</button>
        <button type="submit" class="btn btn-primary">${state.dimIndex === DIMENSIONS.length - 1 ? 'Review answers' : 'Next condition'}</button>
      </div>
    </form>
  </div>`;
}

function renderReview() {
  const rows = DIMENSIONS.map((d) => {
    const done = dimComplete(d.id);
    return `<div class="review-row${done ? '' : ' incomplete'}">
      <span><span class="rl">${d.order}. ${esc(d.name)}</span></span>
      <span style="display:flex;align-items:center;gap:14px">
        <span class="rs">${done ? 'Complete' : answeredCount(d.id) + ' of 5 answered'}</span>
        <button class="btn btn-ghost" data-act="edit" data-dim="${d.order - 1}">Edit</button>
      </span></div>`;
  }).join('');
  const ready = allComplete();
  return `
  <div class="wrap section">
    <p class="eyebrow">Review</p>
    <h2 class="cra" data-focus tabindex="-1">One look before the profile.</h2>
    <p class="lead">You can return to any condition. When all five are complete, generate your readiness profile.</p>
    <div class="review-list">${rows}</div>
    <div class="btn-row between">
      <button class="btn btn-ghost" data-act="prev-dim">Back</button>
      <button class="btn btn-primary" data-act="generate"${ready ? '' : ' disabled'}>Generate readiness profile</button>
    </div>
    ${ready ? '' : '<p class="field-error" style="margin-top:12px">Complete every condition to generate the profile.</p>'}
  </div>`;
}

function renderResults() {
  const profile = computeProfile(state.answers);
  const c = state.context || {};
  track('results_viewed', { source: SOURCE || undefined });

  // 1 Header
  const header = `
    <p class="eyebrow">Commercial Readiness Profile</p>
    ${c.company ? `<h1 class="cra" data-focus tabindex="-1" style="margin-bottom:6px">${esc(c.company)}</h1>` : `<h1 class="cra" data-focus tabindex="-1" style="margin-bottom:6px">Your Commercial Readiness Profile</h1>`}
    <p class="muted" style="margin:0">${esc(todayLabel())}${c.participant ? ' &middot; ' + esc(c.participant) : ''}</p>`;

  // 2 Readiness Profile (state dominant, total subordinate)
  const readiness = `
    <div class="rsec" style="border-top:0;padding-top:26px">
      <div class="rp-total">${profile.total} of 125</div>
      <div class="rp-state">${esc(overallStateText(profile))}</div>
      <p class="rp-principle">${esc(SHAPE_OVER_TOTAL)}</p>
    </div>`;

  // 3 Five-Dimension Sequence (ordered ladder; break-point shown, full profile below stays visible)
  let rungs = '';
  profile.dimensions.forEach((d, i) => {
    if (i === profile.readyThrough && profile.readyThrough > 0 && !profile.allBuilt) {
      rungs += `<div class="breakline">Readiness holds through the ${profile.readyThrough === 1 ? 'first condition' : 'first ' + profile.readyThrough + ' conditions'}. The conditions below still count, and rest on the next one.</div>`;
    }
    const meta = byId[d.id];
    rungs += `<div class="rung${d.isPriority ? ' priority' : ''}">
      <div class="idx">${meta.order}</div>
      <div>
        <div class="rname">${esc(meta.name)}</div>
        <div class="rdef">${esc(meta.definition)}</div>
        <div class="rmeaning">${esc(DIMENSION_INTERPRETATION[meta.id][d.classification])}</div>
        ${d.isPriority ? '<div class="starthere">Start here</div>' : ''}
        ${d.isStrongest && !d.isPriority ? '<div class="strong-tag">Relative strength</div>' : ''}
      </div>
      <div class="rright"><span class="rscore">${d.score} / 25</span><span class="badge ${d.classification}">${d.classification}</span></div>
    </div>`;
  });
  const ladder = `<div class="rsec"><p class="eyebrow">The five conditions, in sequence</p><div class="ladder">${rungs}</div></div>`;

  // 4 First Thing to Build (dominant) OR all-Built variant
  let build = '';
  if (profile.allBuilt) {
    build = `<div class="build-block"><p class="eyebrow">The read</p>
      <h2>${esc(ALL_BUILT.headline)}</h2>
      <p class="para">${esc(ALL_BUILT.body)}</p></div>`;
  } else {
    const g = DIMENSION_GUIDANCE[profile.priorityId];
    const pd = profile.dimensions.find((d) => d.id === profile.priorityId);
    // false-strength note only when a lower condition scores higher than the priority
    const laterHigher = profile.dimensions.some((d) => byId[d.id].order > byId[profile.priorityId].order && d.score > pd.score);
    build = `<div class="build-block"><p class="eyebrow">First thing to build</p>
      <h2>${esc(byId[profile.priorityId].name)}</h2>
      <div class="cls">${pd.classification} &middot; ${pd.score} of 25</div>
      <p class="para">${esc(g.whyFirst)}</p>
      <p class="para"><b>The risk right now.</b> ${esc(g.risk)}</p>
      <p class="para"><b>What building it means.</b> ${esc(g.whatItMeans)}</p>
      <p class="para"><b>What it does for the rest.</b> ${esc(g.effectBelow)}</p>
      ${laterHigher ? `<p class="false-strength">${esc(FALSE_STRENGTH)}</p>` : ''}</div>`;
  }

  // 5 Strongest Condition
  const strongNames = profile.strongestIds.map((id) => byId[id].name);
  const strong = `<div class="rsec"><p class="eyebrow">Strongest condition</p>
    <p class="lead" style="margin-bottom:0">${esc(strongestText(strongNames, profile.strongestTied))}</p></div>`;

  // 6 What This Means
  const means = `<div class="rsec"><p class="eyebrow">What this result is, and is not</p>
    <ul>${WHAT_THIS_MEANS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;

  // 7 Recommended Next Step
  const next = `<div class="rsec"><p class="eyebrow">Recommended next step</p>
    <p class="lead">Use this result as the starting point for a focused conversation about what your company should build first, and in what order.</p></div>`;

  // 8 CTA + handling
  const cta = `<div class="rsec" style="border-top:0;padding-top:8px">
    <div class="next-ctas">
      <a class="btn btn-primary" href="/#close" data-act="review-cta">Schedule a Commercial Readiness Review</a>
      <a class="btn btn-secondary" href="/#method">Read Commercial by Design</a>
    </div>
    <div class="handling">
      <button class="btn btn-ghost" data-act="print">Print or save</button>
      <button class="btn btn-ghost" data-act="copy">Copy summary</button>
      <button class="btn btn-ghost" data-act="restart">Start over</button>
    </div>
    <div class="email-box">
      <strong>Want the detailed read sent over, or a conversation?</strong>
      <p class="muted" style="margin:8px 0 0;font-size:14px">Optional. Your result is not stored anywhere. Adding your email opens your own mail app with the summary, addressed to Gain Advisory.</p>
      <form id="emailForm" style="margin-top:12px">
        <label class="fl" for="f_email">Business email</label>
        <input class="ti" id="f_email" name="email" type="email" placeholder="you@company.com" autocomplete="email">
        <label class="consent"><input type="checkbox" id="f_consent" required> I would like Gain Advisory to see this result and follow up. I understand nothing is stored on this site.</label>
        <div class="btn-row" style="margin-top:12px"><button class="btn btn-secondary" type="submit">Send my result to Gain Advisory</button></div>
      </form>
    </div>
    <p class="copied" id="copied" style="display:none;color:var(--blue);font-size:14px;margin-top:10px" role="status">Summary copied.</p>
  </div>`;

  return `<div class="wrap-wide section" id="results-root">${header}${readiness}${ladder}${build}${strong}${means}${next}${cta}</div>`;
}

// ---- summary text (for copy + email) ---------------------------------------
function summaryText() {
  const p = computeProfile(state.answers);
  const c = state.context || {};
  const lines = [];
  lines.push('Commercial Readiness Profile');
  if (c.company) lines.push('Company: ' + c.company);
  if (c.participant) lines.push('Participant: ' + c.participant);
  lines.push('Date: ' + todayLabel());
  lines.push('');
  lines.push(overallStateText(p) + '  (total ' + p.total + ' of 125)');
  lines.push('');
  p.dimensions.forEach((d) => {
    lines.push(byId[d.id].name + ': ' + d.classification + ' (' + d.score + '/25)' +
      (d.isPriority ? '  <- first thing to build' : '') + (d.isStrongest ? '  (relative strength)' : ''));
  });
  lines.push('');
  if (p.priorityId) lines.push('First thing to build: ' + byId[p.priorityId].name);
  else lines.push('All five conditions self-assessed as Built. Test against external evidence.');
  lines.push('');
  lines.push('This is a self-assessment, not proof. Next step: a focused Commercial Readiness Review.');
  return lines.join('\n');
}

// ---- event wiring -----------------------------------------------------------
function wire() {
  app.querySelectorAll('[data-act]').forEach((btn) => btn.addEventListener('click', onAction));
  const ctx = document.getElementById('ctx');
  if (ctx) ctx.addEventListener('submit', (e) => { e.preventDefault(); readContext(ctx); go('assess', 0); });
  const af = document.getElementById('assessForm');
  if (af) {
    af.addEventListener('change', (e) => {
      const t = e.target; if (t && t.name && t.name.indexOf('q_') === 0) {
        const qi = +t.name.slice(2); state.answers[DIMENSIONS[state.dimIndex].id][qi] = +t.value;
        // reflect selection styling without a full re-render
        af.querySelectorAll(`fieldset[data-qi="${qi}"] .opt`).forEach((l) => l.classList.toggle('sel', l.querySelector('input').checked));
        save();
      }
    });
    af.addEventListener('submit', (e) => { e.preventDefault(); onAssessSubmit(); });
  }
  const ef = document.getElementById('emailForm');
  if (ef) ef.addEventListener('submit', onEmailSubmit);
}

function readContext(form) {
  const fd = new FormData(form); const c = {};
  for (const [k, v] of fd.entries()) c[k] = String(v).trim().slice(0, 120);
  state.context = c; save();
}

function onAssessSubmit() {
  const dim = DIMENSIONS[state.dimIndex];
  if (!dimComplete(dim.id)) {
    const err = document.getElementById('assessError'); if (err) { err.style.display = 'block'; announce('Please answer every question before continuing.'); }
    return;
  }
  track('dimension_completed', { dimension: dim.id, index: state.dimIndex });
  if (state.dimIndex === DIMENSIONS.length - 1) go('review');
  else go('assess', state.dimIndex + 1);
}

function onAction(e) {
  const act = e.currentTarget.getAttribute('data-act');
  switch (act) {
    case 'begin':
      if (!state.startedAt) { state.startedAt = Date.now(); state.date = todayLabel(); track('assessment_started', { facilitated: FACILITATED || undefined, source: SOURCE || undefined }); }
      go('context'); break;
    case 'resume': go(hasAnyAnswer() ? (allComplete() ? 'review' : 'assess') : 'context'); break;
    case 'restart': e.preventDefault(); restart(); break;
    case 'back-intro': go('intro'); break;
    case 'skip-context': go('assess', 0); break;
    case 'prev-dim':
      if (state.screen === 'review') go('assess', DIMENSIONS.length - 1);
      else if (state.dimIndex === 0) go('context');
      else go('assess', state.dimIndex - 1);
      break;
    case 'edit': go('assess', +e.currentTarget.getAttribute('data-dim')); break;
    case 'generate':
      if (allComplete()) { track('assessment_completed', { source: SOURCE || undefined }); go('results'); }
      break;
    case 'print': track('report_printed'); window.print(); break;
    case 'copy': doCopy(); break;
    case 'review-cta': track('readiness_review_clicked', { source: SOURCE || undefined }); break; // href navigates
    default: break;
  }
}

function restart() {
  if (!confirm('Start over? This clears your saved answers.')) return;
  track('assessment_restarted');
  clearSaved();
  state = { screen: 'intro', dimIndex: 0, answers: emptyAnswers(), context: {}, startedAt: null, date: null };
  render();
}

async function doCopy() {
  const text = summaryText();
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e2) {} document.body.removeChild(ta);
  }
  const c = document.getElementById('copied'); if (c) { c.style.display = 'block'; announce('Summary copied.'); setTimeout(() => { c.style.display = 'none'; }, 2500); }
}

function onEmailSubmit(e) {
  e.preventDefault();
  const email = (document.getElementById('f_email').value || '').trim();
  const consent = document.getElementById('f_consent').checked;
  if (!email || !consent) { announce('Enter your email and confirm consent to send.'); return; }
  track('email_result_requested');
  const c = state.context || {};
  const subject = 'Commercial Readiness Assessment result' + (c.company ? ' — ' + c.company : '');
  const body = summaryText() + '\n\nFrom: ' + email + (c.company ? '\nCompany: ' + c.company : '') + (SOURCE ? '\nSource: ' + SOURCE : '');
  window.location.href = 'mailto:' + REVIEW_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

// ---- boot -------------------------------------------------------------------
const saved = load();
if (saved) state = { ...state, ...saved };
// A resumed session lands on intro (which offers Resume) unless mid-results.
if (state.screen === 'results' && !allComplete()) state.screen = 'intro';
track('assessment_viewed', { facilitated: FACILITATED || undefined, source: SOURCE || undefined });
render();
