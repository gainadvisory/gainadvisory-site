// Commercial Readiness Assessment: client-side PDF generation.
//
// Generates the report entirely in the visitor's browser as a real vector PDF
// with selectable text. No server, no serverless function, no headless browser,
// no print dialog, no external service, no screenshots. It reads the SAME shared
// report model (reportModel.mjs) the website report uses, so the two never drift.
//
// jsPDF (vendored UMD) and the four subset brand fonts (the site's own Inter and
// Syne, converted to embeddable TTF) are dynamically imported on first use only,
// so nothing here is loaded until the visitor clicks Download PDF.
//
// House rule: no em dashes or en dashes anywhere. Regular hyphens only.

import { reportFilename } from './reportModel.mjs';

// US Letter portrait, points.
const PW = 612, PH = 792;
const M = 54;                 // side margins
const TOP = 56, BOT = 54;     // content top / bottom
const W = PW - M * 2;         // content width (504)
const PAGE_BOTTOM = PH - BOT; // 738
const FOOTER_Y = PH - 34;

// Brand palette (matches the website report).
const C = {
  navy: [11, 29, 51],
  blue: [30, 79, 161],
  lightblue: [93, 155, 212],
  ink: [20, 32, 47],
  body: [58, 70, 84],
  muted: [91, 107, 124],
  faint: [139, 134, 119],
  hair: [226, 230, 234],
  tint: [238, 243, 251],
  warm: [176, 96, 63],
  warmtint: [251, 240, 236],
  white: [255, 255, 255],
  softbg: [250, 251, 252],
  navytint: [143, 160, 180],
};

let generating = false;

// Load jsPDF (UMD side effect -> globalThis.jspdf) plus the four font modules,
// all on demand.
async function loadDeps() {
  const [, i4, i6, s7, s8] = await Promise.all([
    import('./vendor/jspdf.umd.min.js'),
    import('./vendor/font-inter-400.mjs'),
    import('./vendor/font-inter-600.mjs'),
    import('./vendor/font-syne-700.mjs'),
    import('./vendor/font-syne-800.mjs'),
  ]);
  const jsPDF = globalThis.jspdf && globalThis.jspdf.jsPDF;
  if (!jsPDF) throw new Error('jsPDF failed to load');
  return { jsPDF, fonts: [i4, i6, s7, s8] };
}

// Build the PDF document from the shared model and return a Blob.
export async function buildReportBlob(model) {
  const { jsPDF, fonts } = await loadDeps();
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });

  // Register the brand fonts. Syne 700 -> 'Syne'/normal, Syne 800 -> 'Syne'/bold.
  for (const f of fonts) { doc.addFileToVFS(f.file, f.b64); doc.addFont(f.file, f.family, f.style); }

  let y = TOP;

  // --- primitives -----------------------------------------------------------
  const setFont = (fam, style, size, color) => {
    doc.setFont(fam, style); doc.setFontSize(size); doc.setTextColor(color[0], color[1], color[2]);
  };
  const newPage = () => { doc.addPage(); y = TOP; };
  const ensure = (h) => { if (y + h > PAGE_BOTTOM) newPage(); };
  const wrap = (str, maxw) => doc.splitTextToSize(String(str == null ? '' : str), maxw);
  const heightOf = (str, size, leading, maxw) => wrap(str, maxw).length * size * leading;

  // Flowing paragraph: breaks line by line across pages.
  function para(str, o = {}) {
    const x = o.x ?? M, size = o.size ?? 10, leading = o.leading ?? 1.5;
    const color = o.color ?? C.body, fam = o.fam ?? 'Inter', style = o.style ?? 'normal';
    const maxw = o.maxw ?? W, opts = { baseline: 'top' };
    if (o.gapBefore) y += o.gapBefore;
    setFont(fam, style, size, color);
    const lineH = size * leading;
    for (const ln of wrap(str, maxw)) { ensure(lineH); doc.text(ln, x, y, opts); y += lineH; }
    if (o.gapAfter != null) y += o.gapAfter;
  }

  // Uppercase letterspaced eyebrow label.
  function eyebrow(str, o = {}) {
    const x = o.x ?? M, size = o.size ?? 8, color = o.color ?? C.blue;
    if (o.gapBefore) y += o.gapBefore;
    ensure(size * 1.4);
    setFont('Inter', 'bold', size, color);
    doc.text(String(str).toUpperCase(), x, y, { baseline: 'top', charSpace: 1.1 });
    y += size * 1.4 + (o.gapAfter ?? 0);
  }

  // Section head: eyebrow + Syne heading (+ optional sub). Kept together.
  function sectionHead(eb, title, sub) {
    const titleLines = wrap(title, W);
    const titleSize = 19;
    let need = 8 * 1.4 + 10 + titleLines.length * titleSize * 1.1;
    if (sub) need += 10 + heightOf(sub, 10, 1.5, W);
    ensure(need + 6);
    eyebrow(eb, { gapAfter: 10 });
    setFont('Syne', 'bold', titleSize, C.ink);
    for (const ln of titleLines) { doc.text(ln, M, y, { baseline: 'top' }); y += titleSize * 1.1; }
    if (sub) { y += 10; para(sub, { size: 10, color: C.muted, leading: 1.5, maxw: W, gapAfter: 0 }); }
  }

  function hr(color = C.hair, gap = 16) {
    y += gap; ensure(1);
    doc.setDrawColor(color[0], color[1], color[2]); doc.setLineWidth(0.6);
    doc.line(M, y, M + W, y); y += gap;
  }

  // Small drawn check (no glyph dependency), then text. Used for unlock lists.
  function checkItem(str, x, colw) {
    const size = 9.5, leading = 1.42, lineH = size * leading;
    const lines = wrap(str, colw - 16);
    ensure(lines.length * lineH);
    const top = y;
    doc.setDrawColor(C.blue[0], C.blue[1], C.blue[2]); doc.setLineWidth(1.1);
    doc.lines([[2.4, 2.4], [4.4, -6.6]], x, top + 5.2);
    setFont('Inter', 'normal', size, C.body);
    let yy = top;
    for (const ln of lines) { doc.text(ln, x + 12, yy, { baseline: 'top' }); yy += lineH; }
    y = top + lines.length * lineH;
  }

  // Two-column check grid (unlocks). Font is set up front so line wrapping used
  // for measurement (measureCheckGrid) matches what is actually drawn.
  function checkGrid(items) {
    const gap = 22, colw = (W - gap) / 2;
    const rowGap = 6;
    setFont('Inter', 'normal', 9.5, C.body);
    for (let i = 0; i < items.length; i += 2) {
      const left = items[i], right = items[i + 1];
      const leftLines = wrap(left, colw - 16).length;
      const rightLines = right ? wrap(right, colw - 16).length : 0;
      const rowH = Math.max(leftLines, rightLines) * 9.5 * 1.42;
      ensure(rowH + rowGap);
      const rowTop = y;
      checkItem(left, M, colw);
      const afterLeft = y;
      if (right) { y = rowTop; checkItem(right, M + colw + gap, colw); }
      y = Math.max(afterLeft, y) + rowGap;
    }
  }

  // Height of one grid row (row i/i+1), using the exact wrap/leading of checkGrid.
  function checkRowHeight(items, i) {
    const gap = 22, colw = (W - gap) / 2, rowGap = 6;
    setFont('Inter', 'normal', 9.5, C.body);
    const l = wrap(items[i], colw - 16).length;
    const r = items[i + 1] ? wrap(items[i + 1], colw - 16).length : 0;
    return Math.max(l, r) * 9.5 * 1.42 + rowGap;
  }

  // Total height of the whole two-column grid (all rows), matching checkGrid.
  function measureCheckGrid(items) {
    let h = 0;
    for (let i = 0; i < items.length; i += 2) h += checkRowHeight(items, i);
    return h;
  }

  // Marker list (filled dot or drawn x), single column.
  function markerList(items, kind) {
    const size = 10, leading = 1.5, lineH = size * leading;
    for (const it of items) {
      const lines = wrap(it, W - 18);
      ensure(lines.length * lineH + 6);
      const top = y;
      if (kind === 'x') {
        doc.setDrawColor(C.warm[0], C.warm[1], C.warm[2]); doc.setLineWidth(1.1);
        doc.lines([[5, 5]], M + 1, top + 3.6); doc.lines([[5, -5]], M + 1, top + 8.6);
      } else {
        const col = kind === 'warm' ? C.warm : C.blue;
        doc.setFillColor(col[0], col[1], col[2]);
        doc.circle(M + 3, top + 5.2, 1.5, 'F');
      }
      setFont('Inter', 'normal', size, C.body);
      let yy = top;
      for (const ln of lines) { doc.text(ln, M + 14, yy, { baseline: 'top' }); yy += lineH; }
      y = top + lines.length * lineH + 6;
    }
  }

  // The G[AI]N wordmark, drawn as vector text so it is always sharp.
  function drawLogo(x, yTop, size, dark) {
    const wordColor = dark ? C.white : C.navy;
    const brk = dark ? C.lightblue : C.blue;
    setFont('Syne', 'bold', size, wordColor);
    let cx = x;
    const seg = (ch, color) => {
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(ch, cx, yTop, { baseline: 'top' });
      cx += doc.getTextWidth(ch);
    };
    seg('G', wordColor); seg('[', brk); seg('AI', brk); seg(']', brk); seg('N', wordColor);
    const total = cx - x;
    setFont('Inter', 'bold', size * 0.3, dark ? C.navytint : C.muted);
    doc.text('ADVISORY', x + total / 2, yTop + size * 1.02, { baseline: 'top', charSpace: 2, align: 'center' });
    return total;
  }

  // --- page 1 masthead (full-bleed navy band) -------------------------------
  function masthead() {
    const padX = M, padTop = 44;
    const companyLines = wrap(model.company || 'Your company', W - 120);
    const noteText = 'Overall readiness is set by the first condition that is not yet Built, the one that caps everything beneath it. The score is the aggregate across all five conditions. It supports the classification; it does not replace it.';
    // measure band height
    let h = padTop;
    h += 11 * 1.4 + 8;                     // eyebrow
    h += companyLines.length * 22 * 1.05 + 8; // company
    h += 12 * 1.4 + 22;                    // meta + gap
    h += 0.8 + 24;                         // hairline + gap
    h += 40 + 18;                          // readiness row
    h += heightOf(noteText, 9, 1.5, W) + 24; // note + bottom pad
    // draw band
    doc.setFillColor(C.navy[0], C.navy[1], C.navy[2]);
    doc.rect(0, 0, PW, h, 'F');
    // logo top-right
    drawLogo(PW - M - 96, padTop - 4, 17, true);
    // content
    y = padTop;
    setFont('Inter', 'bold', 11, C.lightblue);
    doc.text('COMMERCIAL READINESS PROFILE', padX, y, { baseline: 'top', charSpace: 1.2 });
    y += 11 * 1.4 + 8;
    setFont('Syne', 'bold', 22, C.white);
    for (const ln of companyLines) { doc.text(ln, padX, y, { baseline: 'top' }); y += 22 * 1.05; }
    y += 8;
    setFont('Inter', 'normal', 12, C.navytint);
    doc.text(model.meta || '', padX, y, { baseline: 'top' });
    y += 12 * 1.4 + 22;
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.8); doc.setGState(new doc.GState({ opacity: 0.16 }));
    doc.line(padX, y, PW - M, y); doc.setGState(new doc.GState({ opacity: 1 }));
    y += 24;
    // readiness + score row
    const rowTop = y;
    setFont('Inter', 'bold', 10, C.navytint);
    doc.text('OVERALL READINESS', padX, rowTop, { baseline: 'top', charSpace: 1.1 });
    setFont('Syne', 'bold', 34, C.white);
    doc.text(model.overallBand, padX, rowTop + 16, { baseline: 'top' });
    const scoreX = padX + 250;
    setFont('Inter', 'bold', 10, C.navytint);
    doc.text('OVERALL SCORE', scoreX, rowTop, { baseline: 'top', charSpace: 1.1 });
    setFont('Syne', 'bold', 30, C.lightblue);
    doc.text(String(model.total), scoreX, rowTop + 18, { baseline: 'top' });
    const tw = doc.getTextWidth(String(model.total));
    setFont('Inter', 'bold', 14, C.navytint);
    doc.text(' / 125', scoreX + tw + 3, rowTop + 30, { baseline: 'top' });
    y = rowTop + 40 + 18;
    setFont('Inter', 'normal', 9, C.navytint);
    for (const ln of wrap(noteText, W)) { doc.text(ln, padX, y, { baseline: 'top' }); y += 9 * 1.5; }
    y = h + 26;
  }

  // --- condition rows (the five, at a glance) -------------------------------
  function ladder() {
    const num = ['01', '02', '03', '04', '05'];
    doc.setDrawColor(C.hair[0], C.hair[1], C.hair[2]); doc.setLineWidth(0.6);
    ensure(6); doc.line(M, y, M + W, y);
    for (const c of model.conditions) {
      ensure(46);
      const top = y + 14;
      setFont('Syne', 'bold', 13, [199, 205, 212]);
      doc.text(num[c.index], M, top, { baseline: 'top' });
      setFont('Syne', 'bold', 15, C.ink);
      doc.text(c.name, M + 26, top - 1, { baseline: 'top' });
      let nx = M + 26 + doc.getTextWidth(c.name) + 10;
      if (c.isPriority) nx = drawTag('First priority', nx, top - 2, C.warm, C.warmtint);
      else if (c.isStrongest) nx = drawTag('Strongest', nx, top - 2, C.blue, C.tint);
      // score + classification right-aligned
      const clsColor = classColor(c.classification);
      setFont('Inter', 'bold', 10, clsColor.text);
      const clsW = doc.getTextWidth(c.classification) + 16;
      pill(c.classification, M + W - clsW, top - 3, clsColor.text, clsColor.bg);
      setFont('Inter', 'bold', 10, [143, 160, 180]);
      const st = `${c.score} / 25`;
      doc.text(st, M + W - clsW - 12 - doc.getTextWidth(st), top, { baseline: 'top' });
      // progress bar
      const barY = top + 16, barW = 300;
      doc.setFillColor(238, 240, 243); doc.roundedRect(M + 26, barY, barW, 5, 2.5, 2.5, 'F');
      const pct = Math.max(0.06, (c.score - 5) / 20);
      const bc = barColor(c.classification);
      doc.setFillColor(bc[0], bc[1], bc[2]); doc.roundedRect(M + 26, barY, barW * pct, 5, 2.5, 2.5, 'F');
      y = top + 30;
      doc.setDrawColor(C.hair[0], C.hair[1], C.hair[2]); doc.setLineWidth(0.6);
      doc.line(M, y, M + W, y);
    }
  }

  function drawTag(text, x, yTop, textColor, bg) {
    setFont('Inter', 'bold', 8, textColor);
    const w = doc.getTextWidth(text.toUpperCase()) + 12;
    doc.setFillColor(bg[0], bg[1], bg[2]); doc.roundedRect(x, yTop, w, 13, 3, 3, 'F');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(text.toUpperCase(), x + 6, yTop + 3.4, { baseline: 'top', charSpace: 0.6 });
    return x + w + 8;
  }
  function pill(text, x, yTop, textColor, bg) {
    const w = doc.getTextWidth(text) + 16;
    doc.setFillColor(bg[0], bg[1], bg[2]); doc.roundedRect(x, yTop, w, 15, 3.5, 3.5, 'F');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(text, x + 8, yTop + 4, { baseline: 'top' });
  }
  function classColor(cls) {
    if (cls === 'Built') return { text: C.navy, bg: [231, 235, 241] };
    if (cls === 'Forming') return { text: C.blue, bg: C.tint };
    if (cls === 'Assumed') return { text: [58, 107, 176], bg: C.tint };
    return { text: C.warm, bg: C.warmtint };
  }
  function barColor(cls) {
    if (cls === 'Built') return C.navy;
    if (cls === 'Forming') return C.blue;
    if (cls === 'Assumed') return C.lightblue;
    return [196, 107, 90];
  }

  // --- condition by condition ----------------------------------------------
  function conditionBlock(c) {
    const num = ['01', '02', '03', '04', '05'];
    // keep the heading rows + dbt line + first two narrative lines together
    const headNeed = 22 + heightOf(c.dbtLine, 9, 1.42, W) + 8 + 10 * 1.5 * 2;
    ensure(headNeed + 18);
    y += 18;
    doc.setDrawColor(C.hair[0], C.hair[1], C.hair[2]); doc.setLineWidth(0.6);
    doc.line(M, y, M + W, y); y += 16;
    // header row
    setFont('Syne', 'bold', 13, [199, 205, 212]);
    doc.text(num[c.index], M, y + 1, { baseline: 'top' });
    setFont('Syne', 'bold', 18, C.ink);
    doc.text(c.name, M + 26, y - 1, { baseline: 'top' });
    let hx = M + 26 + doc.getTextWidth(c.name) + 10;
    // DBT tag (outline pill)
    setFont('Inter', 'bold', 8, C.blue);
    const dtW = doc.getTextWidth(c.dbtTag.toUpperCase()) + 12;
    doc.setDrawColor(207, 221, 240); doc.setLineWidth(0.8); doc.roundedRect(hx, y, dtW, 13, 6.5, 6.5, 'S');
    doc.setTextColor(C.blue[0], C.blue[1], C.blue[2]);
    doc.text(c.dbtTag.toUpperCase(), hx + 6, y + 3.4, { baseline: 'top', charSpace: 0.6 });
    hx += dtW + 8;
    const cc = classColor(c.classification);
    setFont('Inter', 'bold', 10, cc.text);
    hx = (() => { pill(c.classification, hx, y - 1, cc.text, cc.bg); return hx + doc.getTextWidth(c.classification) + 16 + 8; })();
    setFont('Inter', 'bold', 10, [143, 160, 180]);
    doc.text(`${c.score} / 25`, hx, y + 1, { baseline: 'top' });
    y += 22;
    // dbt teaching line (italic-ish: use muted)
    para(c.dbtLine, { size: 9, color: C.muted, leading: 1.42, gapAfter: 8 });
    // narrative
    para(c.narrative, { size: 10, color: C.body, leading: 1.55, gapAfter: 14 });
    // plateau callout (left rule)
    const plLines = wrap(c.plateau, W - 16);
    const plH = 12 + plLines.length * 10 * 1.5;
    ensure(plH + 8);
    const plTop = y;
    doc.setDrawColor(199, 205, 212); doc.setLineWidth(1.4);
    doc.line(M, plTop, M, plTop + plH);
    setFont('Inter', 'bold', 8, C.faint);
    doc.text('WHY COMPANIES PLATEAU HERE', M + 14, plTop, { baseline: 'top', charSpace: 1.1 });
    setFont('Inter', 'normal', 10, C.body);
    let py = plTop + 12;
    for (const ln of plLines) { doc.text(ln, M + 14, py, { baseline: 'top' }); py += 10 * 1.5; }
    y = plTop + plH + 14;
    // unlocks: treat the "What building this unlocks" heading and the whole
    // two-column grid as one keep-together block. If it does not fit in the
    // space left on this page, move it intact to the next page. Only split it
    // when the block is physically taller than a full printable page, and even
    // then keep the heading with at least the first row. This is generic and
    // runs for every condition, not any specific one.
    const headH = 8 * 1.4 + 10; // unlock eyebrow: size 8 + gapAfter 10
    const gridH = measureCheckGrid(c.unlocks);
    const printable = PAGE_BOTTOM - TOP;
    if (headH + gridH <= printable) ensure(headH + gridH);
    else ensure(headH + checkRowHeight(c.unlocks, 0));
    eyebrow('What building this unlocks', { color: C.faint, gapAfter: 10 });
    checkGrid(c.unlocks);
  }

  // --- priority card ---------------------------------------------------------
  function priorityCard() {
    const p = model.priority;
    const headLines = wrap(p.name, W - 40);
    const whyLines = wrap(p.whyFirst, W - 40);
    const bodyH = heightOf(p.conversations, 10, 1.55, W - 40) + heightOf(p.notYet + ' Strengthening anything lower in the order right now creates very little leverage, because it rests on ' + p.name + ' above it.', 10, 1.55, W - 40);
    const topH = 20 + 8 + 12 + headLines.length * 24 * 1.08 + 10 + whyLines.length * 10 * 1.55 + 20;
    const need = topH + 20 + 14 + 12 + 14 + 12 + bodyH + 40;
    ensure(need + 24);
    y += 24;
    const cardTop = y;
    // header (warm tint)
    doc.setFillColor(C.warmtint[0], C.warmtint[1], C.warmtint[2]);
    const headBlockH = 24 + 8 + 12 + headLines.length * 24 * 1.08 + 10 + whyLines.length * 10 * 1.55 + 20;
    doc.roundedRect(M, cardTop, W, headBlockH, 8, 8, 'F');
    let cy = cardTop + 22;
    setFont('Inter', 'bold', 8, C.warm);
    doc.text(model.priorityHead.toUpperCase(), M + 24, cy, { baseline: 'top', charSpace: 1.1 }); cy += 8 * 1.4 + 10;
    setFont('Syne', 'bold', 24, C.ink);
    for (const ln of headLines) { doc.text(ln, M + 24, cy, { baseline: 'top' }); cy += 24 * 1.08; }
    cy += 8;
    setFont('Inter', 'normal', 10, C.body);
    for (const ln of whyLines) { doc.text(ln, M + 24, cy, { baseline: 'top' }); cy += 10 * 1.55; }
    // body
    y = cardTop + headBlockH + 20;
    const bx = M + 24, bw = W - 48;
    subLabel('The conversation to have');
    para(p.conversations, { x: bx, maxw: bw, size: 10, color: C.body, leading: 1.55, gapAfter: 14 });
    subLabel('What should not happen yet');
    para(p.notYet + ' Strengthening anything lower in the order right now creates very little leverage, because it rests on ' + p.name + ' above it.', { x: bx, maxw: bw, size: 10, color: C.body, leading: 1.55, gapAfter: 4 });
    // outline the whole card
    doc.setDrawColor(C.hair[0], C.hair[1], C.hair[2]); doc.setLineWidth(0.8);
    doc.roundedRect(M, cardTop, W, y - cardTop + 16, 8, 8, 'S');
    y += 16;
    function subLabel(t) { setFont('Inter', 'bold', 8, C.faint); ensure(20); doc.text(t.toUpperCase(), bx, y, { baseline: 'top', charSpace: 1.1 }); y += 8 * 1.4 + 6; }
  }

  // --- first three weeks -----------------------------------------------------
  function weeksBlock() {
    const w = model.firstThreeWeeks;
    y += 24;
    sectionHead('The first three weeks', 'If we walked into your company on Monday',
      'This is how the work on ' + model.priorityName + ' would actually begin. Not a plan on a page. The first three weeks in the building.');
    y += 16;
    const rows = [['Week one', w.week1], ['Week two', w.week2], ['Week three', w.week3]];
    const labelW = 74;
    rows.forEach(([label, text], i) => {
      const lines = wrap(text, W - labelW);
      const rowH = lines.length * 10 * 1.6;
      ensure(rowH + 20);
      if (i) { doc.setDrawColor(238, 240, 243); doc.setLineWidth(0.6); doc.line(M, y, M + W, y); y += 16; }
      const top = y;
      setFont('Inter', 'bold', 8, C.blue);
      doc.text(label.toUpperCase(), M, top + 2, { baseline: 'top', charSpace: 1.1 });
      setFont('Inter', 'normal', 10, C.body);
      let ty = top;
      for (const ln of lines) { doc.text(ln, M + labelW, ty, { baseline: 'top' }); ty += 10 * 1.6; }
      y = top + rowH + 4;
    });
  }

  // --- strongest condition ---------------------------------------------------
  function strongestCard() {
    const s = model.strongest;
    const lines = wrap(s.strongRead, W - 48);
    const need = 24 + 8 + 12 + 27 + 10 + lines.length * 10 * 1.55 + 24;
    ensure(need + 24);
    y += 24;
    const top = y;
    setFont('Inter', 'bold', 8, C.blue);
    doc.text('YOUR STRONGEST CONDITION', M + 24, top + 22, { baseline: 'top', charSpace: 1.1 });
    setFont('Syne', 'bold', 20, C.ink);
    doc.text(s.name, M + 24, top + 22 + 18, { baseline: 'top' });
    setFont('Inter', 'normal', 10, C.body);
    let ty = top + 22 + 18 + 27;
    for (const ln of lines) { doc.text(ln, M + 24, ty, { baseline: 'top' }); ty += 10 * 1.55; }
    const cardH = ty + 22 - top;
    doc.setDrawColor(C.hair[0], C.hair[1], C.hair[2]); doc.setLineWidth(0.8);
    doc.roundedRect(M, top, W, cardH, 8, 8, 'S');
    doc.setFillColor(C.blue[0], C.blue[1], C.blue[2]);
    doc.rect(M, top, W, 3, 'F');
    y = top + cardH + 4;
  }

  // --- the closing dark panel (kept together on one page) --------------------
  function enginePanel() {
    const b = model.buildingTheEngine;
    const padX = 30, innerW = W - 12;
    const leadLines = wrap(b.lead, innerW);
    const bodyLines = wrap(b.body, innerW);
    const stepLines = b.steps.map((s) => wrap(s.d, innerW - 88));
    const closeLines = wrap(b.close, innerW);
    let h = 30 + 8 * 1.4 + 14;
    h += leadLines.length * 17 * 1.28 + 16;
    h += bodyLines.length * 10 * 1.55 + 22;
    stepLines.forEach((sl, i) => { h += (i ? 12 : 0) + Math.max(sl.length, 1) * 10 * 1.5 + 4; });
    // Bottom padding below the closing line, so it is not jammed against the
    // panel's lower edge (breathing room above the footer). The panel still ends
    // well clear of the page footer and stays whole on its page.
    h += 18 + closeLines.length * 10 * 1.55 + 54;
    ensure(h + 24);
    y += 24;
    const top = y;
    doc.setFillColor(C.navy[0], C.navy[1], C.navy[2]);
    doc.rect(0, top, PW, h, 'F');
    let cy = top + 30;
    setFont('Inter', 'bold', 8, C.lightblue);
    doc.text('BUILDING THE ENGINE', M, cy, { baseline: 'top', charSpace: 1.1 }); cy += 8 * 1.4 + 14;
    setFont('Syne', 'bold', 17, C.white);
    for (const ln of leadLines) { doc.text(ln, M, cy, { baseline: 'top' }); cy += 17 * 1.28; }
    cy += 16;
    setFont('Inter', 'normal', 10, C.navytint);
    for (const ln of bodyLines) { doc.text(ln, M, cy, { baseline: 'top' }); cy += 10 * 1.55; }
    cy += 22;
    doc.setDrawColor(255, 255, 255); doc.setGState(new doc.GState({ opacity: 0.14 })); doc.setLineWidth(0.8);
    doc.line(M, cy - 11, M + W, cy - 11); doc.setGState(new doc.GState({ opacity: 1 }));
    b.steps.forEach((s, i) => {
      const sl = stepLines[i];
      if (i) cy += 12;
      setFont('Syne', 'bold', 11, C.lightblue);
      doc.text(s.k, M, cy, { baseline: 'top' });
      setFont('Inter', 'normal', 10, C.navytint);
      let sy = cy;
      for (const ln of sl) { doc.text(ln, M + 88, sy, { baseline: 'top' }); sy += 10 * 1.5; }
      cy = Math.max(cy + 11 * 1.2, sy) + 4;
    });
    cy += 18;
    setFont('Inter', 'normal', 10, C.navytint);
    for (const ln of closeLines) { doc.text(ln, M, cy, { baseline: 'top' }); cy += 10 * 1.55; }
    y = top + h + 8;
  }

  // ==== compose the document =================================================
  masthead();

  sectionHead('Executive summary', 'What this profile says about your company');
  y += 6;
  for (const pgh of model.executiveSummary) para(pgh, { size: 10.5, color: C.body, leading: 1.6, gapAfter: 12 });

  y += 18;
  sectionHead('The five conditions', 'Scored in order',
    'Read top to bottom. Each condition rests on the one above it, so a gap high in the order caps everything below.');
  y += 16;
  ladder();

  y += 22;
  sectionHead('Condition by condition', 'What each score actually means');
  for (const c of model.conditions) conditionBlock(c);

  priorityCard();
  weeksBlock();
  strongestCard();

  y += 24;
  sectionHead('Commercial constraints', 'The bottlenecks this profile reveals',
    'Not a re-listing of scores. These are the binding constraints on growth, read across the whole system.');
  y += 16; markerList(model.constraints, 'warm');

  // Common Failure Pattern: keep the heading and its single paragraph together
  // so the sentence never breaks across a page. Measure the whole block and move
  // it intact to the next page when it does not fit in the space left here (it
  // only splits if it were taller than a full printable page, which it is not).
  y += 24;
  setFont('Syne', 'bold', 19, C.ink);
  const cfpHeadH = 8 * 1.4 + 10 + wrap('Where companies like this usually go wrong', W).length * 19 * 1.1;
  setFont('Inter', 'normal', 10.5, C.body);
  const cfpBodyH = heightOf(model.failurePattern, 10.5, 1.6, W);
  if (cfpHeadH + 6 + cfpBodyH <= PAGE_BOTTOM - TOP) ensure(cfpHeadH + 6 + cfpBodyH);
  sectionHead('Common failure pattern', 'Where companies like this usually go wrong');
  y += 6; para(model.failurePattern, { size: 10.5, color: C.body, leading: 1.6, gapAfter: 0 });

  y += 24;
  sectionHead('What not to do next', 'The wrong problem is the tempting one');
  y += 6; para('Founders almost always solve the most visible problem rather than the first one. With ' + model.priorityName + ' as the gap, the following moves feel productive and quietly make things worse:', { size: 10.5, color: C.body, leading: 1.6, gapAfter: 14 });
  markerList(model.whatNotToDo, 'x');

  y += 24;
  sectionHead('Evidence to collect next', 'Gather proof before you rebuild the motion');
  y += 6; para('These are not tasks. They are the specific commercial evidence that turns ' + model.priorityName + ' from an assumption into an evidence-backed condition the company can operate from:', { size: 10.5, color: C.body, leading: 1.6, gapAfter: 14 });
  markerList(model.evidence, 'blue');

  enginePanel();

  // ==== footers / page numbers (designed inside the PDF) =====================
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    setFont('Inter', 'normal', 8, C.faint);
    doc.text('Gain Advisory, Builder of Commercial Engines', M, FOOTER_Y, { baseline: 'top' });
    doc.text('gainadvisory.com', PW / 2 - doc.getTextWidth('gainadvisory.com') / 2, FOOTER_Y, { baseline: 'top' });
    const pn = `Page ${p} of ${total}`;
    doc.text(pn, PW - M - doc.getTextWidth(pn), FOOTER_Y, { baseline: 'top' });
  }

  return doc.output('blob');
}

// Trigger a direct download of the report PDF, entirely client-side.
export async function downloadReportPDF(model) {
  if (generating) return { skipped: true };
  generating = true;
  try {
    const blob = await buildReportBlob(model);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportFilename(model);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { ok: true };
  } finally {
    generating = false;
  }
}
