# Commercial Readiness Assessment — Results Page: Information Architecture

_Hierarchy only. No colors, fonts, spacing, or motion. Approve the structure before any visual work.
Data sources are labeled: **[engine]** = computed, **[content]** = frozen question/definition text, **[results]** = interpretation copy._

Governing principle (drives the whole hierarchy): **the total is secondary; the shape and the sequence lead.** The single most important block is "First Thing to Build."

Vertical order, top to bottom:

---

## 1 · Header  (orientation, quiet)
- Kicker: "Commercial Readiness Profile"
- Company name **[content: user meta]** — shown only if provided
- Assessment date **[engine/meta]**
- (No score here. No CTA here.)

## 2 · Readiness Profile  (the one-line read)
- **Primary line (dominant):** overall descriptive state **[results.overallStateText]** — e.g. "Readiness holds through the first two conditions"
- **Subordinate, small:** total out of 125 **[engine.total]** — deliberately visually minor
- One-sentence governing principle **[results.SHAPE_OVER_TOTAL]**: "The total is worth less than the shape…"
- Purpose: tell the reader in one glance where readiness stops, not give them a grade.

## 3 · Five-Dimension Sequence  (the shape — sequence must be visible; NO radar)
- An **ordered top-to-bottom stack / ladder** of the five conditions in methodology order (Commercial Truth → Positioning → Repeatability → Fit → Adaptability). Order is fixed, never sorted by score.
- Each row shows: position number **[content.order]** · name **[content.name]** · classification (Built / Forming / Assumed / Absent) **[engine.classification]** · score /25, subordinate **[engine.score]** · one-line classification meaning **[results.CLASSIFICATION_SUMMARY]**
- The **first non-Built condition is marked** as the break point **[engine.isPriority]**; the strongest is lightly marked **[engine.isStrongest]**.
- Visual grammar communicates **dependency** (each condition rests on the one above), not independent axes. A short caption reinforces: weakness high in the order caps everything below it.

## 4 · First Thing to Build  (THE most important block — highest emphasis)
- Shown only when a priority exists (a condition below Built). If all Built, this block is replaced by the all-Built variant (see note).
- Names the first condition below Built **[engine.priorityId → content.name]** + its classification **[engine]**
- Why it comes before the conditions beneath it **[results.DIMENSION_GUIDANCE[id].whyFirst]**
- The risk it creates right now **[results…risk]**
- What improving it actually means **[results…whatItMeans]**
- How it affects the dimensions beneath it **[results…effectBelow]**
- If a lower condition scores high on a weak higher one, include **[results.FALSE_STRENGTH]**: "A strong, repeatable motion built on an Assumed Commercial Truth is a faster way to the wrong place."

## 5 · Strongest Condition  (relative strength, hedged)
- Names the highest-scoring condition(s) **[engine.strongestIds → content.name]**; on a tie, explains the tie rather than picking one **[engine.strongestTied]**
- Framed as **relative** strength, not verified capability **[results.strongestText]** — "Your responses suggest…", never "You have proven…"

## 6 · What This Means  (honesty / calibration)
- This is a self-assessment, reflecting the participant's current view, not proof **[results.WHAT_THIS_MEANS]**
- Disagreement across leaders is itself diagnostic
- Evidence may confirm or challenge the score
- The next stage of diagnosis tests it against customers, pipeline, motion, and behavior without key people

## 7 · Recommended Next Step  (the offer, in words)
- Primary action framed in copy: use the result as the starting point for a focused conversation about what to build first
- Secondary: read Commercial by Design (link resolves to the current manuscript/insights surface if the book is not yet public — no dead link)

## 8 · CTA + Result Handling  (actions)
- **Primary CTA button:** "Schedule a Commercial Readiness Review"
- **Secondary CTA:** "Read Commercial by Design"
- Result handling: Print / save (print stylesheet), Copy summary, Start over (clears saved answers)
- Optional email capture — offered here, AFTER the result, never before. Explicit consent. No silent subscribe.

---

### Notes on emphasis
- Dominant blocks: **2 (the one-line read)** and **4 (First Thing to Build)**.
- Subordinate everywhere: the numeric total and per-dimension /25 scores.
- Sections 6–8 descend in intensity: calibrate, then invite, then act.

### All-Built variant
When every condition is Built, block 4 is replaced by **[results.ALL_BUILT]**: acknowledge a self-assessed ready engine, recommend testing against external evidence, suggest periodic reassessment. No manufactured problem to force a CTA.
