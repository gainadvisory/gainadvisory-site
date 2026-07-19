// Commercial Readiness Assessment: redesigned UI (Gain Advisory).
//
// This is the PRESENTATION layer only. It wires the FROZEN engine (engine.mjs)
// and FROZEN content (content.mjs: questions + approved help) into the approved
// redesign from `Commercial Readiness Assessment.dc.html`. The DC/support.js
// runtime is not used; this is a plain ES module rendering into #app.
//
// What is real (frozen product), not design placeholder:
//   - the five conditions, their order, and the 25 questions        -> content.mjs
//   - the response scale (Never..Consistently) and 1..5 mapping     -> content.mjs
//   - scoring, the four bands (Built/Forming/Assumed/Absent),
//     first-non-Built priority, strongest condition                 -> engine.mjs
//   - the "What this means" help copy                               -> content.mjs QUESTION_HELP
// The redesign's presentation copy (condition sub, first-priority / strongest
// reads, overall body, and the static screen copy) is kept from the .dc.html.
//
// House rule: no em dashes or en dashes anywhere. Regular hyphens only.

import { DIMENSIONS, DIMENSION_ORDER, RESPONSE_OPTIONS, QUESTION_HELP } from './content.mjs';
import { computeProfile } from './engine.mjs';
import { buildReportModel } from './reportModel.mjs';
// The client-side PDF module (pdf.mjs) and its font/jsPDF assets are imported
// dynamically, only when the visitor clicks Download PDF, so nothing here loads
// them up front.

// ---------------------------------------------------------------------------
// Design presentation copy (from the approved .dc.html). Kept verbatim.
// ---------------------------------------------------------------------------

// Visual treatment per frozen band. Warm accent is reserved for Absent (risk).
const BAND_STYLE = {
  Built: { color: '#0B1D33', tint: '#E7EBF1', bar: '#0B1D33' },
  Forming: { color: '#1E4FA1', tint: '#EEF3FB', bar: '#1E4FA1' },
  Assumed: { color: '#3A6BB0', tint: '#EEF3FB', bar: '#5D9BD4' },
  Absent: { color: '#B0603F', tint: '#FBF0EC', bar: '#C46B5A' },
};

const NUM = ['01', '02', '03', '04', '05'];

// ---------------------------------------------------------------------------
// State + persistence
// ---------------------------------------------------------------------------
const LS_KEY = 'cra_v2';
const emptyAnswers = () => Object.fromEntries(DIMENSION_ORDER.map((id) => [id, [null, null, null, null, null]]));

let state = {
  screen: 'intro', // intro | context | assessment | review | results
  ci: 0,           // 0..4
  answers: emptyAnswers(),
  open: {},        // help panels open, key `${dimId}:${qi}`
  ctx: { company: '', role: '', stage: '', arr: '', founder: '' },
  email: '',
  consent: true,
  returnToReview: false, // set when a condition is opened via Edit on the review screen
};

// The most recently rendered report model, reused by the Download PDF handler so
// the PDF is guaranteed to match exactly what is on screen.
let lastModel = null;

function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ screen: state.screen, ci: state.ci, answers: state.answers, ctx: state.ctx })); } catch (e) { /* private mode */ }
}
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s && typeof s === 'object') {
      const answers = emptyAnswers();
      if (s.answers) for (const id of DIMENSION_ORDER) if (Array.isArray(s.answers[id])) answers[id] = s.answers[id].map((v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? v : null)).slice(0, 5);
      state.answers = answers;
      if (s.ctx && typeof s.ctx === 'object') state.ctx = { ...state.ctx, ...s.ctx };
      if (Number.isInteger(s.ci) && s.ci >= 0 && s.ci <= 4) state.ci = s.ci;
      if (typeof s.screen === 'string') state.screen = s.screen;
    }
  } catch (e) { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function dimDone(id) { return state.answers[id].every((v) => v != null); }
function answeredCount(id) { return state.answers[id].filter((v) => v != null).length; }
function allComplete() { return DIMENSION_ORDER.every((id) => dimDone(id)); }
function anyAnswer() { return DIMENSION_ORDER.some((id) => state.answers[id].some((v) => v != null)); }

function track(name, data) { try { if (window.va) window.va('event', { name, ...(data || {}) }); } catch (e) { /* ignore */ } }
function announce(msg) { const el = document.getElementById('cra-live'); if (el) el.textContent = msg; }

const app = document.getElementById('app');

function go(screen) {
  // Leaving the assessment for the review or the start clears the edit round-trip.
  if (screen === 'review' || screen === 'intro') state.returnToReview = false;
  state.screen = screen;
  save();
  render();
  window.scrollTo(0, 0);
}

// ---------------------------------------------------------------------------
// Shared chrome
// ---------------------------------------------------------------------------
function logo(size, dark) {
  const wordColor = dark ? '#fff' : '#0B1D33';
  const subColor = dark ? '#8FA0B4' : '#5B6B7C';
  const sub = size <= 16 ? 0 : (dark ? 7.5 : 8);
  return `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1">
    <span style="font-family:'Syne',sans-serif;font-weight:800;letter-spacing:-0.02em;font-size:${size}px;color:${wordColor};line-height:1;white-space:nowrap">G<span style="font-weight:400;color:#5D9BD4">[</span><span style="color:#5D9BD4">AI</span><span style="font-weight:400;color:#5D9BD4">]</span>N</span>
    ${sub ? `<span style="font-family:'DM Sans',sans-serif;font-weight:400;font-size:${sub}px;letter-spacing:.3em;text-transform:uppercase;color:${subColor};margin-top:.55em;text-align:center;padding-left:.3em">Advisory</span>` : ''}
  </span>`;
}

function header() {
  return `<header class="cra-noprint" style="border-bottom:1px solid #EEF0F3;background:rgba(251,251,249,.9);backdrop-filter:blur(8px);position:sticky;top:0;z-index:20">
    <div style="max-width:1140px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:20px">
      ${logo(22, false)}
      <span style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8B8677">Commercial Readiness Assessment</span>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="cra-noprint" style="background-color:#0B1D33;background-image:linear-gradient(rgba(11,29,51,.95),rgba(11,29,51,.975)),url('/assets/wood-wall.png');background-size:cover;background-position:center;background-blend-mode:multiply;color:#fff;margin-top:auto">
    <div style="max-width:1140px;margin:0 auto;padding:30px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap">
      ${logo(16, true)}
      <span style="font-family:'Inter',sans-serif;font-size:13px;color:#8FA0B4">Gain Advisory, Builder of Commercial Engines</span>
      <a class="cra-link" href="https://www.gainadvisory.com/" style="font-family:'Inter',sans-serif;font-size:13px;color:#AEBED0;text-decoration:none">gainadvisory.com</a>
    </div>
  </footer>`;
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------
function introHTML() {
  const rows = DIMENSIONS.map((d, i) => `
    <div style="display:grid;grid-template-columns:auto 1fr auto;gap:clamp(16px,3vw,32px);align-items:baseline;padding:20px 4px;border-bottom:1px solid #E2E6EA">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(16px,1.6vw,19px);color:#C7CDD4;width:2ch">${NUM[i]}</div>
      <div>
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(19px,2.2vw,26px);letter-spacing:-0.015em;color:#0B1D33">${esc(d.name)}</div>
        <div style="font-family:'Inter',sans-serif;font-size:15px;line-height:1.5;color:#5B6B7C;margin-top:6px;max-width:62ch">${esc(d.definition)}</div>
      </div>
      <div style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8B8677;white-space:nowrap">5 questions</div>
    </div>`).join('');
  const resumable = anyAnswer() && !allComplete();
  return `<section style="max-width:1140px;margin:0 auto;padding:clamp(52px,9vw,120px) 24px clamp(60px,9vw,120px)">
    <div class="cra-two" style="display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:clamp(36px,6vw,88px);align-items:start">
      <div>
        <div style="max-width:24ch">
          <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#1E4FA1">The entry diagnostic</div>
          <h1 data-focus tabindex="-1" style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(32px,5vw,64px);line-height:1.04;letter-spacing:-0.03em;color:#0B1D33;margin:22px 0 0;text-wrap:balance">Every company believes it&nbsp;has&nbsp;a commercial engine.</h1>
        </div>
        <p style="font-family:'Syne',sans-serif;font-weight:600;font-size:clamp(20px,2.6vw,30px);line-height:1.3;letter-spacing:-0.01em;color:#1E4FA1;margin:26px 0 0;max-width:30ch;text-wrap:balance">Most have a few people the engine cannot run without.</p>
      </div>
      <div style="padding-top:clamp(8px,3vw,54px)">
        <p style="font-family:'Inter',sans-serif;font-size:clamp(16px,1.5vw,18.5px);line-height:1.64;color:#3A4654;margin:0;max-width:46ch">This assessment tells the two apart. It shows where commercial capability genuinely belongs to the company, and where growth still depends on individual judgment, memory, and relationships.</p>
        <div style="height:1px;background:#E2E6EA;margin:28px 0"></div>
        <div style="display:flex;flex-wrap:wrap;gap:26px 40px">
          <div><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#0B1D33">25</div><div style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8B8677;margin-top:4px">Questions</div></div>
          <div><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#0B1D33">5</div><div style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8B8677;margin-top:4px">Conditions</div></div>
          <div><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#0B1D33">7-10</div><div style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8B8677;margin-top:4px">Minutes</div></div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.6;color:#5B6B7C;margin:26px 0 0;max-width:46ch">The five conditions are read in sequence, because a weakness high in the order caps everything beneath it. The goal is an accurate score, not a high one. Answers are self-reported: a diagnostic starting point, not proof.</p>
      </div>
    </div>
    <div style="margin-top:clamp(48px,7vw,88px)">
      <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8B8677;margin-bottom:18px">What gets measured, in order</div>
      <div style="border-top:1px solid #E2E6EA">${rows}</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:22px;margin-top:clamp(40px,6vw,64px)">
      <button class="cra-dark" data-action="begin" style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#fff;background:#0B1D33;border:none;padding:15px 30px;border-radius:7px;cursor:pointer;transition:background .18s ease">${resumable ? 'Resume the assessment' : 'Begin the assessment'}</button>
      ${resumable ? '<button class="cra-ghost" data-action="restart" style="font-family:\'Inter\',sans-serif;font-weight:500;font-size:15px;color:#5B6B7C;background:none;border:none;cursor:pointer">Start over</button>' : ''}
      <a class="cra-link" href="https://www.gainadvisory.com/#method" style="font-family:'Inter',sans-serif;font-weight:500;font-size:15px;color:#1E4FA1;text-decoration:none">Learn about Commercial by Design</a>
    </div>
  </section>`;
}

function ctxSelect(field, label, badge, options) {
  const opts = options.map(([v, t]) => `<option value="${esc(v)}"${state.ctx[field] === v ? ' selected' : ''}>${esc(t)}</option>`).join('');
  return `<label style="display:block">
    <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5B6B7C;display:flex;align-items:center;gap:8px">${esc(label)}${badge ? ' <span style="font-family:\'DM Sans\',sans-serif;font-size:9px;letter-spacing:.08em;color:#1E4FA1;background:#EEF3FB;border-radius:4px;padding:2px 6px">Sharpens result</span>' : ''}</span>
    <select data-field="${field}" style="width:100%;margin-top:10px;padding:13px 14px;border:1px solid #D9DEE4;border-radius:8px;background:#fff;font-size:15px;color:#14202F">${opts}</select>
  </label>`;
}

function contextHTML() {
  const c = state.ctx;
  return `<section style="max-width:940px;margin:0 auto;padding:clamp(44px,7vw,84px) 24px clamp(60px,9vw,110px)">
    <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#1E4FA1">Calibration</div>
    <h2 data-focus tabindex="-1" style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(28px,4.2vw,46px);line-height:1.06;letter-spacing:-0.02em;color:#0B1D33;margin:16px 0 0;max-width:20ch">The same score means different things at different stages.</h2>
    <p style="font-family:'Inter',sans-serif;font-size:clamp(16px,1.5vw,18px);line-height:1.62;color:#3A4654;margin:20px 0 0;max-width:58ch">These answers do not change your score. They calibrate how it is read, so your result is understood against your company's stage, market, and operating reality rather than in the abstract. Two fields make the profile materially sharper; the rest are optional.</p>
    <div style="margin-top:clamp(34px,5vw,52px);display:flex;flex-direction:column;gap:26px">
      <div class="cra-ctx2" style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
        ${ctxSelect('stage', 'Company stage', true, [['', 'Select one'], ['Pre-revenue', 'Pre-revenue'], ['Early revenue', 'Early revenue, finding repeatability'], ['Scaling', 'Scaling a proven motion'], ['Established', 'Established, optimizing']])}
        <label style="display:block">
          <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5B6B7C;display:flex;align-items:center;gap:8px">Your role <span style="font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.08em;color:#1E4FA1;background:#EEF3FB;border-radius:4px;padding:2px 6px">Sharpens result</span></span>
          <input data-field="role" value="${esc(c.role)}" placeholder="e.g. Founder, CEO, CCO" style="width:100%;margin-top:10px;padding:13px 14px;border:1px solid #D9DEE4;border-radius:8px;background:#fff;font-size:15px;color:#14202F">
        </label>
      </div>
      <div style="height:1px;background:#EEF0F3"></div>
      <div style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B8677">Optional context</div>
      <div class="cra-ctx2" style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
        <label style="display:block">
          <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5B6B7C">Company name</span>
          <input data-field="company" value="${esc(c.company)}" placeholder="Appears on your report" autocomplete="organization" style="width:100%;margin-top:10px;padding:13px 14px;border:1px solid #D9DEE4;border-radius:8px;background:#fff;font-size:15px;color:#14202F">
        </label>
        ${ctxSelect('arr', 'Annual recurring revenue', false, [['', 'Prefer not to say'], ['Pre-revenue', 'Pre-revenue'], ['<$1M', 'Under $1M'], ['$1M-$5M', '$1M - $5M'], ['$5M-$20M', '$5M - $20M'], ['$20M+', '$20M+']])}
      </div>
      <label style="display:block">
        <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5B6B7C">Does a single person still lead most commercial activity?</span>
        <select data-field="founder" style="width:100%;margin-top:10px;padding:13px 14px;border:1px solid #D9DEE4;border-radius:8px;background:#fff;font-size:15px;color:#14202F;max-width:420px">
          ${[['', 'Prefer not to say'], ['Yes, entirely', 'Yes, entirely'], ['Mostly', 'Mostly'], ['Shared', 'Shared across a team'], ['No', 'No, it runs without them']].map(([v, t]) => `<option value="${esc(v)}"${c.founder === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="cra-noprint" style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:clamp(40px,6vw,56px);padding-top:26px;border-top:1px solid #E2E6EA">
      <button class="cra-ghost" data-action="back-intro" style="font-family:'Inter',sans-serif;font-weight:500;font-size:15px;color:#5B6B7C;background:none;border:none;cursor:pointer;padding:8px 0">&larr; Back</button>
      <div style="display:flex;align-items:center;gap:22px">
        <button class="cra-ghost" data-action="skip" style="font-family:'Inter',sans-serif;font-weight:500;font-size:15px;color:#5B6B7C;background:none;border:none;cursor:pointer">Skip for now</button>
        <button class="cra-dark" data-action="start" style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#fff;background:#0B1D33;border:none;padding:14px 28px;border-radius:7px;cursor:pointer;transition:background .18s ease">Continue</button>
      </div>
    </div>
  </section>`;
}

// One row of the agreement scale. Layout only inline; colours + selected state
// live in injected CSS so nothing fights inline specificity (the earlier blank-
// cell bug was inline background beating the selected class).
function cellBase(idx) {
  const first = idx === 0, last = idx === 4;
  const radius = `border-radius:${first ? '8px 8px 0 0' : last ? '0 0 8px 8px' : '0'};`;
  return `display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:14px 16px;cursor:pointer;border:1px solid #E2E6EA;${radius}margin-top:${first ? '0' : '-1px'};position:relative;z-index:1;transition:all .16s ease;`;
}

function railHTML() {
  return DIMENSIONS.map((d, i) => {
    const done = dimDone(d.id);
    const active = i === state.ci;
    const dotBg = active ? 'background:#0B1D33;color:#fff;' : done ? 'background:#1E4FA1;color:#fff;' : 'background:#fff;color:#8B8677;border:1px solid #D9DEE4;';
    const dotText = done && !active ? '✓' : String(i + 1);
    const nameColor = active ? '#0B1D33' : done ? '#3A4654' : '#8B8677';
    return `<button class="cra-rail-btn" data-action="rail" data-idx="${i}" aria-current="${active ? 'step' : 'false'}" style="display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:${active ? '#F1F4F8' : 'transparent'};border:none;border-radius:9px;padding:11px 12px;cursor:pointer;transition:background .16s ease">
      <span style="flex:0 0 auto;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;${dotBg}">${dotText}</span>
      <span style="text-align:left;min-width:0"><span style="display:block;font-family:'Syne',sans-serif;font-weight:700;font-size:15px;letter-spacing:-0.01em;color:${nameColor}">${esc(d.name)}</span></span>
    </button>`;
  }).join('');
}

function assessmentHTML() {
  const d = DIMENSIONS[state.ci];
  const help = QUESTION_HELP[d.id] || [];
  const questions = d.questions.map((q, qi) => {
    const val = state.answers[d.id][qi];
    const answered = val != null;
    const key = `${d.id}:${qi}`;
    const open = !!state.open[key];
    const cells = RESPONSE_OPTIONS.map((o, idx) => `<button class="cra-cell" role="radio" aria-checked="${val === o.value}" aria-label="${esc(o.label)}" data-action="answer" data-dim="${d.id}" data-qi="${qi}" data-val="${o.value}" style="${cellBase(idx)}"><span class="cra-clabel" style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:14.5px;pointer-events:none">${esc(o.label)}</span><span class="cra-check" aria-hidden="true" style="flex:0 0 auto;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;pointer-events:none">✓</span></button>`).join('');
    return `<div class="cra-card${answered ? ' answered' : ''}" data-card="${key}" style="background:#fff;border:1px solid #EEF0F3;border-left:3px solid #E2E6EA;border-radius:12px;padding:clamp(20px,2.5vw,26px);transition:border-color .2s ease">
      <div style="display:flex;gap:14px;align-items:baseline">
        <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#C7CDD4;flex:0 0 auto">${qi + 1}</span>
        <p style="font-family:'Inter',sans-serif;font-size:clamp(16px,1.6vw,19px);line-height:1.5;color:#0B1D33;margin:0;font-weight:500">${esc(q)}</p>
      </div>
      <div style="padding-left:29px;margin-top:14px">
        <button class="cra-help${open ? ' open' : ''}" data-action="help" data-key="${key}" aria-expanded="${open}" aria-controls="help-${d.id}-${qi}" style="display:inline-flex;align-items:center;gap:8px;white-space:nowrap;font-family:'Inter',sans-serif;font-weight:500;font-size:13px;color:#1E4FA1;background:#fff;border:1px solid #E2E6EA;border-radius:20px;padding:6px 14px 6px 11px;cursor:pointer;transition:all .16s ease">
          <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:11px;color:#1E4FA1">i</span>
          <span data-help-label>${open ? 'Hide' : 'How true is this today?'}</span>
        </button>
        <div id="help-${d.id}-${qi}" role="region" aria-label="How true is this today" ${open ? '' : 'hidden'} style="margin-top:12px;border-left:2px solid #1E4FA1;background:#F4F7FC;border-radius:0 8px 8px 0;padding:14px 18px">
          <p style="font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.6;color:#3A4654;margin:0">${esc(help[qi] || '')}</p>
        </div>
        <div class="cra-scale" role="radiogroup" aria-label="Response for question ${qi + 1}" style="display:flex;gap:6px;margin-top:16px">${cells}</div>
      </div>
    </div>`;
  }).join('');

  const ac = answeredCount(d.id);
  const allAns = ac === 5;
  const prevLabel = state.ci === 0 ? '← Calibration' : '← Previous condition';
  const nextLabel = state.ci === 4 ? 'Review answers' : 'Next condition';
  return `<section style="max-width:1140px;margin:0 auto;padding:0 24px">
    <div class="cra-two" style="display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:clamp(28px,4vw,60px);align-items:start">
      <aside class="cra-rail" style="position:sticky;top:64px;height:calc(100vh - 64px);display:flex;flex-direction:column;justify-content:center;padding:40px 24px 40px 0;border-right:1px solid #EEF0F3">
        <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8B8677">Read in sequence</div>
        <div style="margin-top:20px;display:flex;flex-direction:column">${railHTML()}</div>
        <div style="margin-top:26px;padding-top:20px;border-top:1px solid #EEF0F3;font-family:'Inter',sans-serif;font-size:12.5px;line-height:1.55;color:#8B8677;max-width:34ch">A weakness high in the order caps everything beneath it. Answer for what the company does in practice, not what it intends.</div>
      </aside>
      <div style="padding:clamp(36px,5vw,64px) 0 clamp(60px,8vw,100px)">
        <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#1E4FA1">Condition ${NUM[state.ci]} of 5</div>
        <h2 data-focus tabindex="-1" style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(28px,4vw,44px);line-height:1.04;letter-spacing:-0.02em;color:#0B1D33;margin:12px 0 0">${esc(d.name)}</h2>
        <p style="font-family:'Inter',sans-serif;font-size:clamp(16px,1.5vw,18px);line-height:1.55;color:#5B6B7C;margin:14px 0 0;max-width:60ch">${esc(d.definition)}</p>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:clamp(30px,4vw,46px)">${questions}</div>
        <div class="cra-noprint" style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:clamp(36px,5vw,52px)">
          <button class="cra-ghost" data-action="prev" style="font-family:'Inter',sans-serif;font-weight:500;font-size:15px;color:#5B6B7C;background:none;border:none;cursor:pointer;padding:8px 0">${prevLabel}</button>
          <div style="display:flex;align-items:center;gap:18px">
            <span id="cra-answered" style="font-family:'DM Sans',sans-serif;font-size:12.5px;color:#8B8677">${ac} of 5 answered</span>
            <button id="cra-next" class="cra-dark" data-action="${state.returnToReview ? 'to-review' : 'next'}" style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#fff;background:${allAns ? '#0B1D33' : '#9AA6B4'};border:none;padding:13px 26px;border-radius:7px;cursor:pointer;transition:background .18s ease">${state.returnToReview ? 'Back to review' : nextLabel}</button>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function reviewHTML() {
  const rows = DIMENSIONS.map((d, i) => {
    const done = dimDone(d.id);
    return `<div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:18px;align-items:center;padding:20px 22px;border-bottom:1px solid #EEF0F3">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:15px;color:#C7CDD4;width:2ch">${NUM[i]}</span>
      <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(17px,1.9vw,21px);letter-spacing:-0.01em;color:#0B1D33">${esc(d.name)}</span>
      <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;color:${done ? '#1E4FA1' : '#B0603F'}">${done ? 'Complete' : 'Incomplete'}</span>
      <button class="cra-edit" data-action="edit" data-idx="${i}" style="font-family:'Inter',sans-serif;font-weight:600;font-size:13.5px;color:#1E4FA1;background:none;border:none;cursor:pointer">Edit</button>
    </div>`;
  }).join('');
  const ready = allComplete();
  return `<section style="max-width:820px;margin:0 auto;padding:clamp(52px,8vw,100px) 24px clamp(60px,9vw,110px)">
    <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#1E4FA1">Review</div>
    <h2 data-focus tabindex="-1" style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(28px,4.2vw,46px);line-height:1.05;letter-spacing:-0.02em;color:#0B1D33;margin:16px 0 0;max-width:18ch">One look before the profile.</h2>
    <p style="font-family:'Inter',sans-serif;font-size:clamp(16px,1.5vw,18px);line-height:1.6;color:#5B6B7C;margin:18px 0 0;max-width:54ch">You can return to any condition. When all five are complete, generate your readiness profile.</p>
    <div style="margin-top:clamp(34px,5vw,48px);border:1px solid #E2E6EA;border-radius:14px;overflow:hidden;background:#fff">${rows}</div>
    <div class="cra-noprint" style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:32px">
      <button class="cra-ghost" data-action="back-review" style="font-family:'Inter',sans-serif;font-weight:500;font-size:15px;color:#5B6B7C;background:none;border:none;cursor:pointer;padding:8px 0">&larr; Back</button>
      <button class="${ready ? 'cra-dark' : ''}" data-action="generate" ${ready ? '' : 'aria-disabled="true"'} style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#fff;background:${ready ? '#0B1D33' : '#9AA6B4'};border:none;padding:14px 28px;border-radius:7px;cursor:${ready ? 'pointer' : 'not-allowed'}">Generate readiness profile</button>
    </div>
  </section>`;
}

// section eyebrow + heading used across the report body
function rsHead(eyebrow, heading, sub) {
  return `<div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#1E4FA1">${esc(eyebrow)}</div>
    <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(21px,2.6vw,30px);line-height:1.1;letter-spacing:-0.015em;color:#0B1D33;margin:12px 0 0">${esc(heading)}</h3>
    ${sub ? `<p style="font-family:'Inter',sans-serif;font-size:14px;line-height:1.55;color:#5B6B7C;margin:10px 0 0;max-width:64ch">${esc(sub)}</p>` : ''}`;
}
const RP = 'font-family:\'Inter\',sans-serif;font-size:clamp(15px,1.5vw,17px);line-height:1.68;color:#3A4654;margin:14px 0 0;max-width:70ch';
const RLABEL = 'font-family:\'DM Sans\',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8B8677;margin:18px 0 0';

function resultsHTML() {
  // Single shared source: the website report and the client-side PDF both read
  // this exact model (assembled from the frozen engine + frozen report copy).
  const model = buildReportModel(state.answers, state.ctx);
  lastModel = model;

  const overallBand = model.overallBand;
  const total = model.total;
  const obs = BAND_STYLE[overallBand];
  const priorityDim = { id: model.priorityId, name: model.priorityName };
  const strongDim = { name: model.strongName };
  const priorityHead = model.priorityHead;
  const meta = esc(model.meta);

  // ---- at-a-glance ladder ----
  const ladder = model.conditions.map((c) => {
    const bs = BAND_STYLE[c.classification];
    const pct = Math.max(6, Math.round(((c.score - 5) / 20) * 100));
    const isPriority = c.isPriority;
    const isStrong = c.isStrongest && !isPriority;
    const tag = isPriority ? 'First priority' : (isStrong ? 'Strongest' : '');
    const tagStyle = isPriority
      ? 'font-family:\'DM Sans\',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;padding:3px 9px;border-radius:5px;color:#B0603F;background:#FBF0EC'
      : 'font-family:\'DM Sans\',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;padding:3px 9px;border-radius:5px;color:#1E4FA1;background:#EEF3FB';
    return `<div style="padding:20px 4px;border-bottom:1px solid #E2E6EA;${isPriority ? 'background:linear-gradient(90deg,#FCF6F3,transparent 60%);' : ''}">
      <div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:clamp(12px,2.2vw,22px);align-items:center">
        <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:#C7CDD4;width:2ch">${NUM[c.index]}</span>
        <div style="min-width:0">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(17px,2vw,22px);letter-spacing:-0.01em;color:#0B1D33">${esc(c.name)}</span>
            ${tag ? `<span style="${tagStyle}">${tag}</span>` : ''}
          </div>
          <div style="height:6px;border-radius:4px;background:#EEF0F3;margin-top:10px;overflow:hidden;max-width:360px"><span style="display:block;height:100%;width:${pct}%;background:${bs.bar};border-radius:4px"></span></div>
        </div>
        <span style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#8FA0B4;white-space:nowrap">${c.score}<span style="font-size:11px;color:#C7CDD4"> / 25</span></span>
        <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;white-space:nowrap;color:${bs.color};background:${bs.tint};padding:6px 12px;border-radius:6px">${c.classification}</span>
      </div>
    </div>`;
  }).join('');

  // ---- condition-by-condition deep dive ----
  // Each block teaches the discipline (D2BT), reads the condition at its tier,
  // names why companies plateau here, then shows what building it unlocks.
  const deep = model.conditions.map((c) => {
    const bs = BAND_STYLE[c.classification];
    const isPriority = c.isPriority;
    const unlocks = c.unlocks.map((u) => `<li style="display:flex;gap:9px;align-items:baseline;font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.5;color:#3A4654;margin:0 0 8px"><span style="flex:0 0 auto;color:#1E4FA1;font-weight:700;font-size:13px">&#10003;</span><span>${esc(u)}</span></li>`).join('');
    return `<div class="cra-keep" style="padding:clamp(24px,3.4vw,36px) 0;border-top:1px solid #EEF0F3">
      <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap">
        <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#C7CDD4">${NUM[c.index]}</span>
        <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(19px,2.2vw,25px);letter-spacing:-0.01em;color:#0B1D33">${esc(c.name)}</span>
        <span style="font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#1E4FA1;border:1px solid #CFDDF0;padding:4px 10px;border-radius:20px">${esc(c.dbtTag)}</span>
        <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:${bs.color};background:${bs.tint};padding:5px 11px;border-radius:6px">${c.classification}</span>
        <span style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#8FA0B4">${c.score} / 25</span>
        ${isPriority ? '<span style="font-family:\'DM Sans\',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;padding:3px 9px;border-radius:5px;color:#B0603F;background:#FBF0EC">First priority</span>' : ''}
      </div>
      <p style="font-family:'Inter',sans-serif;font-size:14px;line-height:1.55;color:#5B6B7C;margin:12px 0 0;max-width:70ch;font-style:italic">${esc(c.dbtLine)}</p>
      <p style="${RP}">${esc(c.narrative)}</p>
      <div style="margin-top:20px;border-left:2px solid #C7CDD4;padding:2px 0 2px 16px">
        <div style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8B8677">Why companies plateau here</div>
        <p style="font-family:'Inter',sans-serif;font-size:clamp(15px,1.5vw,16.5px);line-height:1.6;color:#3A4654;margin:8px 0 0;max-width:68ch">${esc(c.plateau)}</p>
      </div>
      <div style="${RLABEL}">What building this unlocks</div>
      <ul style="list-style:none;margin:12px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:2px 28px">${unlocks}</ul>
    </div>`;
  }).join('');

  // ---- composed intelligence (all from the shared model) ----
  const summary = model.executiveSummary
    .map((para) => `<p style="${RP}">${esc(para)}</p>`).join('');
  const pc = { whyFirst: model.priority.whyFirst, conversations: model.priority.conversations, notYet: model.priority.notYet };
  const sc = { strongRead: model.strongest.strongRead };
  const constraints = model.constraints
    .map((t) => `<li style="font-family:'Inter',sans-serif;font-size:clamp(15px,1.5vw,17px);line-height:1.6;color:#3A4654;margin:0 0 12px;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#C46B5A;font-weight:700">&rsaquo;</span>${esc(t)}</li>`).join('');
  const evidenceList = model.evidence.map((t) => `<li style="font-family:'Inter',sans-serif;font-size:clamp(15px,1.5vw,17px);line-height:1.6;color:#3A4654;margin:0 0 12px;padding-left:20px;position:relative"><span style="position:absolute;left:0;color:#1E4FA1;font-weight:700">&rsaquo;</span>${esc(t)}</li>`).join('');
  const notList = model.whatNotToDo.map((t) => `<li style="font-family:'Inter',sans-serif;font-size:clamp(15px,1.5vw,17px);line-height:1.6;color:#3A4654;margin:0 0 12px;padding-left:22px;position:relative"><span style="position:absolute;left:0;color:#B0603F;font-weight:700">&times;</span>${esc(t)}</li>`).join('');
  const steps = model.buildingTheEngine.steps.map((s, i) => `<div style="display:flex;gap:14px;align-items:baseline;padding:12px 0${i ? ';border-top:1px solid rgba(255,255,255,.12)' : ''}">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#5D9BD4;flex:0 0 auto;width:8ch">${esc(s.k)}</span>
      <span style="font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.55;color:#AEBED0">${esc(s.d)}</span>
    </div>`).join('');

  return `<section style="max-width:900px;margin:0 auto;padding:clamp(40px,6vw,72px) 24px clamp(60px,9vw,110px)">
    <div class="cra-print" style="background:#fff;border:1px solid #E2E6EA;border-radius:16px;overflow:hidden">

      <!-- masthead -->
      <div style="background-color:#0B1D33;color:#fff;padding:clamp(30px,5vw,52px) clamp(28px,5vw,52px)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap">
          <div>
            <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#5D9BD4">Commercial Readiness Profile</div>
            <div data-focus tabindex="-1" style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(20px,2.4vw,26px);letter-spacing:-0.01em;margin-top:10px">${esc(state.ctx.company || 'Your company')}</div>
            <div style="font-family:'Inter',sans-serif;font-size:13.5px;color:#8FA0B4;margin-top:6px">${meta}</div>
          </div>
          ${logo(20, true)}
        </div>
        <div style="height:1px;background:rgba(255,255,255,.14);margin:clamp(24px,4vw,36px) 0"></div>
        <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:clamp(24px,5vw,56px)">
          <div>
            <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8FA0B4">Overall readiness</div>
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(34px,6vw,60px);line-height:1.02;letter-spacing:-0.025em;margin:10px 0 0">${overallBand}</div>
          </div>
          <div style="padding-bottom:8px">
            <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8FA0B4">Overall score</div>
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(26px,4vw,40px);line-height:1;letter-spacing:-0.02em;margin:10px 0 0;color:${obs.bar === '#0B1D33' ? '#fff' : obs.bar}">${total}<span style="font-size:.5em;color:#8FA0B4;font-weight:700"> / 125</span></div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;line-height:1.55;color:#8FA0B4;margin:16px 0 0;max-width:62ch">Overall readiness is set by the first condition that is not yet Built, the one that caps everything beneath it. The score is the aggregate across all five conditions. It supports the classification; it does not replace it.</p>
      </div>

      <div style="padding:clamp(28px,5vw,48px)">

        <!-- executive summary -->
        ${rsHead('Executive summary', 'What this profile says about your company')}
        ${summary}

        <!-- five conditions at a glance -->
        <div style="margin-top:clamp(38px,5vw,56px)">
          ${rsHead('The five conditions', 'Scored in order', 'Read top to bottom. Each condition rests on the one above it, so a gap high in the order caps everything below.')}
          <div style="border-top:1px solid #E2E6EA;margin-top:22px">${ladder}</div>
        </div>

        <!-- condition by condition -->
        <div style="margin-top:clamp(38px,5vw,56px)">
          ${rsHead('Condition by condition', 'What each score actually means')}
          <div style="margin-top:8px">${deep}</div>
        </div>

        <!-- what you build first -->
        <div class="cra-keep" style="margin-top:clamp(38px,5vw,56px);border:1px solid #E2E6EA;border-radius:16px;overflow:hidden">
          <div style="background:#FCF6F3;border-bottom:1px solid #F0E3DD;padding:clamp(22px,3vw,30px)">
            <div style="font-family:'DM Sans',sans-serif;font-weight:600;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#B0603F">${priorityHead}</div>
            <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(22px,2.8vw,32px);line-height:1.08;letter-spacing:-0.015em;color:#0B1D33;margin:10px 0 0">${esc(priorityDim.name)}</h3>
            <p style="${RP};margin-top:10px">${esc(pc.whyFirst)}</p>
          </div>
          <div style="padding:clamp(22px,3vw,30px)">
            <div style="${RLABEL};margin-top:0">The conversation to have</div>
            <p style="${RP};margin-top:6px">${esc(pc.conversations)}</p>
            <div style="${RLABEL}">What should not happen yet</div>
            <p style="${RP};margin-top:6px">${esc(pc.notYet)} Strengthening anything lower in the order right now creates very little leverage, because it rests on ${esc(priorityDim.name)} above it.</p>
          </div>
        </div>

        <!-- if I walked in Monday morning -->
        <div class="cra-keep" style="margin-top:clamp(28px,4vw,40px);border:1px solid #E2E6EA;border-radius:16px;padding:clamp(24px,3.4vw,36px);background:#FAFBFC">
          ${rsHead('The first three weeks', 'If we walked into your company on Monday', 'This is how the work on ' + priorityDim.name + ' would actually begin. Not a plan on a page. The first three weeks in the building.')}
          <div style="margin-top:22px;display:flex;flex-direction:column;gap:2px">
            ${[['Week one', model.firstThreeWeeks.week1], ['Week two', model.firstThreeWeeks.week2], ['Week three', model.firstThreeWeeks.week3]].map(([wk, txt], i) => `
              <div style="display:grid;grid-template-columns:auto 1fr;gap:clamp(14px,2.4vw,26px);align-items:baseline;padding:${i ? '20px' : '2px'} 0 20px;${i ? 'border-top:1px solid #EEF0F3' : ''}">
                <div style="font-family:'DM Sans',sans-serif;font-weight:600;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#1E4FA1;white-space:nowrap;padding-top:3px">${wk}</div>
                <p style="font-family:'Inter',sans-serif;font-size:clamp(15px,1.5vw,16.5px);line-height:1.62;color:#3A4654;margin:0;max-width:66ch">${esc(txt)}</p>
              </div>`).join('')}
          </div>
        </div>

        <!-- strongest condition -->
        <div class="cra-keep" style="margin-top:clamp(28px,4vw,40px);border:1px solid #E2E6EA;border-radius:16px;padding:clamp(22px,3vw,30px);border-top:3px solid #1E4FA1">
          <div style="font-family:'DM Sans',sans-serif;font-weight:600;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#1E4FA1">Your strongest condition</div>
          <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(20px,2.4vw,27px);letter-spacing:-0.015em;color:#0B1D33;margin:10px 0 0">${esc(strongDim.name)}</h3>
          <p style="${RP};margin-top:10px">${esc(sc.strongRead)}</p>
        </div>

        <!-- commercial constraints -->
        <div style="margin-top:clamp(38px,5vw,56px)">
          ${rsHead('Commercial constraints', 'The bottlenecks this profile reveals', 'Not a re-listing of scores. These are the binding constraints on growth, read across the whole system.')}
          <ul style="list-style:none;margin:22px 0 0;padding:0">${constraints}</ul>
        </div>

        <!-- common failure pattern -->
        <div class="cra-keep" style="margin-top:clamp(38px,5vw,56px)">
          ${rsHead('Common failure pattern', 'Where companies like this usually go wrong')}
          <p style="${RP}">${esc(model.failurePattern)}</p>
        </div>

        <!-- what not to do -->
        <div style="margin-top:clamp(38px,5vw,56px)">
          ${rsHead('What not to do next', 'The wrong problem is the tempting one')}
          <p style="${RP}">Founders almost always solve the most visible problem rather than the first one. With ${esc(priorityDim.name)} as the gap, the following moves feel productive and quietly make things worse:</p>
          <ul style="list-style:none;margin:20px 0 0;padding:0">${notList}</ul>
        </div>

        <!-- evidence to collect -->
        <div style="margin-top:clamp(38px,5vw,56px)">
          ${rsHead('Evidence to collect next', 'Gather proof before you rebuild the motion')}
          <p style="${RP}">These are not tasks. They are the specific commercial evidence that turns ${esc(priorityDim.name)} from an assumption into an evidence-backed condition the company can operate from:</p>
          <ul style="list-style:none;margin:20px 0 0;padding:0">${evidenceList}</ul>
        </div>
      </div>

      <!-- building the engine (D2BT) -->
      <div class="cra-keep" style="background-color:#0B1D33;background-image:linear-gradient(rgba(11,29,51,.95),rgba(11,29,51,.972)),url('/assets/wood-wall.png');background-size:cover;background-position:center;background-blend-mode:multiply;color:#fff;padding:clamp(30px,5vw,52px)">
        <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#5D9BD4">Building the engine</div>
        <p style="font-family:'Syne',sans-serif;font-weight:600;font-size:clamp(18px,2.2vw,26px);line-height:1.28;letter-spacing:-0.01em;margin:14px 0 0;max-width:46ch">${esc(model.buildingTheEngine.lead)}</p>
        <p style="font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.62;color:#AEBED0;margin:16px 0 0;max-width:64ch">${esc(model.buildingTheEngine.body)}</p>
        <div style="margin-top:24px;border-top:1px solid rgba(255,255,255,.14);padding-top:8px">${steps}</div>
        <p style="font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.62;color:#AEBED0;margin:18px 0 0;max-width:64ch">${esc(model.buildingTheEngine.close)}</p>
      </div>
    </div>

    <div class="cra-noprint" style="margin-top:26px;border:1px solid #E2E6EA;border-radius:16px;background:#fff;padding:clamp(24px,4vw,38px)">
      <div class="cra-ctx2" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(22px,4vw,44px);align-items:start">
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#1E4FA1">Where this goes next</div>
          <h3 style="font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(21px,2.4vw,28px);line-height:1.12;letter-spacing:-0.015em;color:#0B1D33;margin:12px 0 0;max-width:24ch">This is the first cut. The full diagnosis is where the engine gets built.</h3>
          <p style="font-family:'Inter',sans-serif;font-size:14px;line-height:1.6;color:#5B6B7C;margin:14px 0 0;max-width:46ch">This profile came from twenty-five answers. The real work reads your calls, your pipeline, and your buyers, and turns the priority above into an engine the company owns. Send this over and we will show you how we got here, and what the next layer reveals.</p>
        </div>
        <div id="cra-emailcol">
          <label style="display:block">
            <span style="font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#5B6B7C">Business email</span>
            <input data-field="email" value="${esc(state.email)}" type="email" placeholder="you@company.com" style="width:100%;margin-top:10px;padding:13px 14px;border:1px solid #D9DEE4;border-radius:8px;background:#fff;font-size:15px;color:#14202F">
          </label>
          <label style="display:flex;gap:10px;align-items:flex-start;margin-top:16px;cursor:pointer">
            <input type="checkbox" data-field="consent" ${state.consent ? 'checked' : ''} style="margin-top:3px;width:16px;height:16px;accent-color:#1E4FA1;flex:0 0 auto">
            <span style="font-family:'Inter',sans-serif;font-size:13px;line-height:1.5;color:#5B6B7C">I would like Gain Advisory to see this result and follow up. I understand nothing is stored on this site.</span>
          </label>
          <button id="cra-send" data-action="send" style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#fff;background:${state.email && state.consent ? '#0B1D33' : '#9AA6B4'};border:none;padding:13px 24px;border-radius:7px;margin-top:18px;cursor:${state.email && state.consent ? 'pointer' : 'not-allowed'};transition:background .18s ease">Send my result to Gain Advisory</button>
        </div>
      </div>
    </div>

    <div class="cra-noprint" style="margin-top:32px">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px">
        <button id="cra-pdf" class="cra-dark" data-action="pdf" aria-label="Download your Commercial Readiness Profile as a PDF" style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#fff;background:#0B1D33;border:none;padding:14px 26px;border-radius:7px;cursor:pointer;transition:background .18s ease">Download PDF</button>
        <button class="cra-outline" data-action="print" style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#0B1D33;background:#fff;border:1px solid #D9DEE4;padding:13px 24px;border-radius:7px;cursor:pointer;transition:border-color .18s ease">Print report</button>
        <a class="cra-link" href="https://www.gainadvisory.com/#close" style="font-family:'Inter',sans-serif;font-weight:600;font-size:15px;color:#1E4FA1;text-decoration:none">See how we got here &rarr;</a>
        <button class="cra-ghost" data-action="restart" style="font-family:'Inter',sans-serif;font-weight:500;font-size:15px;color:#5B6B7C;background:none;border:none;cursor:pointer;margin-left:auto">Start over</button>
      </div>
      <div id="cra-pdfmsg" role="status" style="margin-top:12px"></div>
    </div>
  </section>`;
}

function screenHTML() {
  switch (state.screen) {
    case 'context': return contextHTML();
    case 'assessment': return assessmentHTML();
    case 'review': return reviewHTML();
    case 'results': return resultsHTML();
    default: return introHTML();
  }
}

function render() {
  app.innerHTML = `<div style="min-height:100vh;display:flex;flex-direction:column">${header()}<main style="flex:1">${screenHTML()}</main>${footer()}</div>`;
  const h = app.querySelector('[data-focus]');
  if (h && h.focus) h.focus({ preventScroll: true });
}

// ---------------------------------------------------------------------------
// Interaction: one delegated handler per event type (attached once)
// ---------------------------------------------------------------------------
function onAnswer(btn) {
  const dim = btn.getAttribute('data-dim');
  const qi = +btn.getAttribute('data-qi');
  const val = +btn.getAttribute('data-val');
  state.answers[dim][qi] = val;
  save();
  track('question_answered', { dimension: dim, index: qi, value: val });
  const card = app.querySelector(`[data-card="${dim}:${qi}"]`);
  if (card) {
    card.classList.add('answered');
    card.querySelectorAll('.cra-cell').forEach((c) => c.setAttribute('aria-checked', String(+c.getAttribute('data-val') === val)));
  }
  const ac = answeredCount(dim);
  const lbl = document.getElementById('cra-answered');
  if (lbl) lbl.textContent = `${ac} of 5 answered`;
  const nextBtn = document.getElementById('cra-next');
  if (nextBtn) nextBtn.style.background = ac === 5 ? '#0B1D33' : '#9AA6B4';
  if (ac === 5) { announce(`${DIMENSIONS[state.ci].name} complete.`); track('condition_completed', { dimension: dim }); }
}

function onHelp(btn) {
  const key = btn.getAttribute('data-key');
  const nowOpen = !state.open[key];
  state.open[key] = nowOpen;
  btn.setAttribute('aria-expanded', String(nowOpen));
  btn.classList.toggle('open', nowOpen);
  const label = btn.querySelector('[data-help-label]');
  if (label) label.textContent = nowOpen ? 'Hide' : 'How true is this today?';
  const panel = document.getElementById('help-' + key.replace(':', '-'));
  if (panel) panel.hidden = !nowOpen;
}

// Deliver the result to Gain Advisory. Primary path is a real send through the
// site's Formspree endpoint (same one the homepage contact form uses), so the
// summary reaches the shared inbox with the visitor's email as reply-to. If that
// request fails, fall back to opening a prefilled mail draft.
const FORM_ENDPOINT = 'https://formspree.io/f/xpqbjpqg';

function resultSummary() {
  const profile = computeProfile(state.answers);
  const dims = profile.dimensions;
  let priorityIdx = dims.findIndex((x) => x.classification !== 'Built');
  if (priorityIdx < 0) priorityIdx = dims.length - 1;
  const overallBand = profile.allBuilt ? 'Built' : dims[priorityIdx].classification;
  const strongName = DIMENSIONS[DIMENSION_ORDER.indexOf(profile.strongestIds[0])].name;
  const perLine = dims.map((x, i) => `- ${DIMENSIONS[i].name}: ${x.classification}`).join('\n');
  const lines = [
    'Overall readiness: ' + overallBand, '',
    'First priority: ' + DIMENSIONS[priorityIdx].name,
    'Strongest condition: ' + strongName, '',
    'By condition:', perLine, '',
  ];
  if (state.ctx.company) lines.push('Company: ' + state.ctx.company);
  if (state.ctx.role) lines.push('Role: ' + state.ctx.role);
  if (state.ctx.stage) lines.push('Stage: ' + state.ctx.stage);
  return { subject: 'Commercial Readiness result - ' + (state.ctx.company || 'company'), body: lines.join('\n') };
}

function emailMessage(color, text) {
  let el = document.getElementById('cra-emailmsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cra-emailmsg';
    el.setAttribute('role', 'status');
    el.style.marginTop = '14px';
    const btn = document.getElementById('cra-send');
    if (btn && btn.parentNode) btn.parentNode.appendChild(el); else return;
  }
  el.innerHTML = `<span style="font-family:'Inter',sans-serif;font-size:13.5px;line-height:1.5;color:${color}">${esc(text)}</span>`;
}

function emailSuccess() {
  const btn = document.getElementById('cra-send');
  if (btn) { btn.textContent = '✓ Sent'; btn.disabled = true; btn.style.background = '#1E4FA1'; btn.style.cursor = 'default'; btn.removeAttribute('data-action'); }
  emailMessage('#1E4FA1', 'Your Commercial Readiness Profile has been sent successfully.');
  announce('Your Commercial Readiness Profile has been sent successfully.');
}

function emailError() {
  const btn = document.getElementById('cra-send');
  if (btn) { btn.disabled = false; btn.textContent = 'Send my result to Gain Advisory'; btn.style.background = state.email && state.consent ? '#0B1D33' : '#9AA6B4'; btn.style.cursor = 'pointer'; }
  // Never dead-end a lead: on failure, offer a prefilled mail draft carrying the
  // full profile, with the visitor's address as the reply-to line.
  const { subject, body } = resultSummary();
  const mailBody = body + '\nReply to: ' + (state.email || '');
  const href = 'mailto:hello@gainadvisory.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(mailBody);
  emailMessage('#B0603F', 'That did not go through. ');
  const el = document.getElementById('cra-emailmsg');
  const span = el && el.querySelector('span');
  if (span) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = 'Email your profile to Gain Advisory instead.';
    a.setAttribute('style', "font-family:'Inter',sans-serif;font-size:13.5px;color:#1E4FA1;text-decoration:underline");
    span.appendChild(a);
  }
  announce('Submission failed. A prefilled email is available as a fallback.');
}

function sendResult() {
  if (!(state.email && state.consent)) return;
  const btn = document.getElementById('cra-send');
  const { subject, body } = resultSummary();
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; btn.style.cursor = 'default'; }
  const data = new FormData();
  data.append('email', state.email);
  data.append('_subject', subject);
  data.append('message', body);
  data.append('_gotcha', '');
  track('email_result_requested', {});
  fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
    .then((r) => { if (!r.ok) throw new Error('bad response'); track('email_result_sent', {}); emailSuccess(); })
    .catch(() => { track('email_result_failed', {}); emailError(); });
}

// Download the report as a real PDF, generated entirely in the browser. The PDF
// module and its jsPDF + font assets are dynamically imported here, on first
// click only. Duplicate clicks are ignored while a generation is in flight.
function pdfMessage(color, text) {
  const el = document.getElementById('cra-pdfmsg');
  if (el) el.innerHTML = `<span style="font-family:'Inter',sans-serif;font-size:13.5px;line-height:1.5;color:${color}">${esc(text)}</span>`;
}

async function onDownloadPdf(btn) {
  if (btn.getAttribute('aria-busy') === 'true') return; // duplicate-click guard
  const original = btn.textContent;
  btn.setAttribute('aria-busy', 'true');
  btn.disabled = true;
  btn.style.cursor = 'default';
  btn.style.background = '#4C5A6C';
  btn.textContent = 'Preparing PDF...';
  pdfMessage('#5B6B7C', 'Preparing your report. This runs entirely in your browser and may take a moment.');
  announce('Preparing your PDF.');
  track('report_pdf_requested', {});
  try {
    const model = lastModel || buildReportModel(state.answers, state.ctx);
    const mod = await import('./pdf.mjs');
    await mod.downloadReportPDF(model);
    pdfMessage('#1E4FA1', 'Your PDF has downloaded.');
    announce('Your PDF has downloaded.');
    track('report_pdf_downloaded', {});
  } catch (err) {
    pdfMessage('#B0603F', 'The PDF could not be generated. Please try again, or use Print report.');
    announce('PDF generation failed. Please try again or use Print report.');
    track('report_pdf_failed', {});
  } finally {
    btn.removeAttribute('aria-busy');
    btn.disabled = false;
    btn.style.cursor = 'pointer';
    btn.style.background = '#0B1D33';
    btn.textContent = original;
  }
}

function restart() {
  state.answers = emptyAnswers();
  state.open = {};
  state.ci = 0;
  state.screen = 'intro';
  save();
  render();
  window.scrollTo(0, 0);
  announce('Assessment reset.');
}

function onClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn || !app.contains(btn)) return;
  const action = btn.getAttribute('data-action');
  switch (action) {
    case 'begin': track('assessment_started', {}); go('context'); break;
    case 'back-intro': go('intro'); break;
    case 'skip': track('context_skipped', {}); go('assessment'); break;
    case 'start': go('assessment'); break;
    case 'answer': onAnswer(btn); break;
    case 'help': onHelp(btn); break;
    case 'rail': state.ci = +btn.getAttribute('data-idx'); go('assessment'); break;
    case 'prev':
      if (state.ci === 0) { go('context'); } else { state.ci -= 1; go('assessment'); }
      break;
    case 'next':
      if (state.ci === 4) { go('review'); } else { state.ci += 1; go('assessment'); }
      break;
    case 'edit': state.ci = +btn.getAttribute('data-idx'); state.returnToReview = true; go('assessment'); break;
    case 'to-review': go('review'); break;
    case 'back-review': state.ci = 4; go('assessment'); break;
    case 'generate': if (allComplete()) { track('profile_generated', {}); go('results'); } break;
    case 'pdf': onDownloadPdf(btn); break;
    case 'print': track('report_printed', {}); window.print(); break;
    case 'send': sendResult(); break;
    case 'restart': restart(); break;
    default: break;
  }
}

function onFieldInput(e) {
  const el = e.target.closest('[data-field]');
  if (!el) return;
  const f = el.getAttribute('data-field');
  if (f === 'consent') return; // handled on change
  if (f === 'email') {
    state.email = el.value;
    const b = document.getElementById('cra-send');
    if (b) { const ok = state.email && state.consent; b.style.background = ok ? '#0B1D33' : '#9AA6B4'; b.style.cursor = ok ? 'pointer' : 'not-allowed'; }
    return;
  }
  if (f in state.ctx) { state.ctx[f] = el.value; save(); }
}

function onFieldChange(e) {
  const el = e.target.closest('[data-field]');
  if (!el) return;
  const f = el.getAttribute('data-field');
  if (f === 'consent') {
    state.consent = el.checked;
    const b = document.getElementById('cra-send');
    if (b) { const ok = state.email && state.consent; b.style.background = ok ? '#0B1D33' : '#9AA6B4'; b.style.cursor = ok ? 'pointer' : 'not-allowed'; }
    return;
  }
  if (f in state.ctx) { state.ctx[f] = el.value; save(); }
}

// keyboard: arrow keys move within a scale radiogroup
function onKeydown(e) {
  const cell = e.target.closest && e.target.closest('.cra-cell');
  if (!cell) return;
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  const group = cell.parentElement;
  const cells = [...group.querySelectorAll('.cra-cell')];
  let idx = cells.indexOf(cell);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') idx = Math.max(0, idx - 1);
  else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') idx = Math.min(cells.length - 1, idx + 1);
  else if (e.key === 'Home') idx = 0;
  else if (e.key === 'End') idx = cells.length - 1;
  e.preventDefault();
  const target = cells[idx];
  target.focus();
  onAnswer(target);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function injectStyles() {
  const s = document.createElement('style');
  s.id = 'cra-style';
  s.textContent = `
    .cra-scale{display:flex;flex-direction:column}
    .cra-cell{background:#fff;color:#5B6B7C}
    .cra-cell:hover{border-color:#0B1D33;color:#0B1D33;z-index:2}
    .cra-cell[aria-checked="true"]{background:#0B1D33;color:#fff;border-color:#0B1D33;z-index:2}
    .cra-cell[aria-checked="true"] .cra-clabel{font-weight:600}
    .cra-check{opacity:0;transition:opacity .16s ease}
    .cra-cell[aria-checked="true"] .cra-check{opacity:1}
    .cra-card.answered{border-color:#DCE2EA;border-left-color:#0B1D33}
    .cra-dark:hover{background:#16305a}
    .cra-outline:hover{border-color:#0B1D33}
    .cra-ghost:hover{color:#0B1D33}
    .cra-link:hover{color:#123163}
    .cra-edit:hover{color:#123163}
    .cra-rail-btn:hover{background:#F1F4F8}
    .cra-help.open{background:#EEF3FB;border-color:#CADAF0}
    .cra-help:hover{border-color:#CADAF0}
  `;
  document.head.appendChild(s);
}

function boot() {
  injectStyles();
  load();
  // guard: never land on a report that cannot be computed
  if (state.screen === 'results' && !allComplete()) state.screen = anyAnswer() ? 'review' : 'intro';
  app.addEventListener('click', onClick);
  app.addEventListener('input', onFieldInput);
  app.addEventListener('change', onFieldChange);
  app.addEventListener('keydown', onKeydown);
  render();
  track('assessment_viewed', {});
}

boot();
