// Commercial Readiness Assessment — frozen CONTENT (Gain Advisory).
// Source of truth = the Commercial by Design manuscript + Jason's frozen spec
// (2026-07-18). Questions are verbatim. Do NOT paraphrase.
//
// This module holds only questions, definitions, and common failures. It carries
// NO scoring logic (see engine.mjs) and NO interpretation/recommendation copy
// (see results.mjs), so the engine + methodology can be reused (e.g. by GTMology)
// without inheriting any website-specific language.
//
// House rules: no person or company named except Jason; no em dashes.

export const RESPONSE_OPTIONS = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Usually' },
  { value: 5, label: 'Consistently' },
];

// The five conditions, IN SEQUENCE. The order is load-bearing methodology, not a
// display choice: the priority logic walks it top to bottom (see engine.mjs).
export const DIMENSIONS = [
  {
    id: 'commercialTruth',
    order: 1,
    name: 'Commercial Truth',
    definition: 'Whether the company knows, on evidence, who actually buys and why.',
    commonFailure: 'Selling to the beneficiary who enjoys the outcome instead of the buyer who feels the pain and controls the budget.',
    questions: [
      'We can name the specific person who controls the budget for what we sell, not only the person who uses it or admires it.',
      'We can state, in the buyer’s own words, the pain that opens that budget.',
      'Our belief about why customers buy rests on evidence from real buyers, not on our internal theory of the market.',
      'We have recently tested our assumption about who the buyer is, rather than inherited it from our earliest deals.',
      'If our best salesperson left tomorrow, a new person could learn who to sell to and why from something other than that person’s memory.',
    ],
  },
  {
    id: 'positioning',
    order: 2,
    name: 'Positioning',
    definition: 'Whether the promise attracts the right buyer and repels the wrong one.',
    commonFailure: 'A promise broad enough to feel safe, which is another way of saying generic enough to be ignored.',
    questions: [
      'Our positioning would not fit ten other companies without changing a word.',
      'Our promise repels the wrong buyer as clearly as it attracts the right one.',
      'A stranger reading our positioning would know immediately who it is for and who it is not for.',
      'We have deliberately chosen who we do not serve, and we hold that line under pressure.',
      'We describe what we do the same way to customers, to investors, and to the board.',
    ],
  },
  {
    id: 'repeatability',
    order: 3,
    name: 'Repeatability',
    definition: 'Whether the motion closes deals that do not run through one person.',
    commonFailure: 'Mistaking a talented person’s results for a system the company owns.',
    questions: [
      'Deals close that do not run through the founder or one indispensable individual.',
      'More than one person can carry a deal from first contact to signature.',
      'New commercial hires reach productivity by following a defined motion, not by shadowing a single star.',
      'We can explain why we win in terms of a process, not a personality.',
      'Our forecast holds when a key person is out, on leave, or gone.',
    ],
  },
  {
    id: 'fit',
    order: 4,
    name: 'Fit',
    definition: 'Whether the motion matches how the real buyer actually decides.',
    commonFailure: 'Treating a stall as a timing objection and following up, instead of finding the risk hiding underneath it.',
    questions: [
      'Our sales motion matches how the buyer actually makes this decision, not how we wish they would.',
      'We know the real reasons our deals stall, and they are not filed under timing or budget.',
      'We have identified and removed the specific risks that make our buyer hesitate at the end.',
      'The way we sell accounts for everyone the buyer has to convince inside their own company.',
      'When the market tells us the motion is wrong, we change the motion instead of pushing harder.',
    ],
  },
  {
    id: 'adaptability',
    order: 5,
    name: 'Adaptability',
    definition: 'Whether the company keeps learning, and whether that learning belongs to the organization.',
    commonFailure: 'Documenting the steps and believing the judgment transferred with them.',
    questions: [
      'We change our commercial playbook because the market moved, not because a crisis finally forced us to.',
      'What our best people know about winning lives in the organization, not only in their heads.',
      'When someone learns something important in the market, it becomes something the whole company can use.',
      'We revise the motion on evidence, and we hold it firmly enough to actually test it. Pencil, not Sharpie.',
      'The company would keep improving commercially even if the person who built the system left.',
    ],
  },
];

export const DIMENSION_ORDER = DIMENSIONS.map((d) => d.id);
