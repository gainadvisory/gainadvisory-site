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

// Per-question scoring help. Content layer, NOT engine: these strings are never
// read by scoring. Each entry explains, in plain executive language, what the
// statement means in practice and what to weigh when choosing a frequency, so a
// participant can tell an occasional individual act from a capability the company
// demonstrates consistently. One entry per question, in question order.
export const QUESTION_HELP = {
  commercialTruth: [
    'This is about the economic buyer, the person who can release the money, not the user who loves the product or the champion who advocates internally. Consider whether your team can name that person by role and authority on most live deals, or whether they usually find out late, one deal at a time.',
    'The test is language, not theory. Can your team repeat the problem the way the buyer describes it, in the buyer’s words and stakes, rather than your product framing. Consider whether that phrasing is shared across the team and drawn from real conversations, or whether each seller improvises their own version.',
    'Consider where your reasons-to-buy actually come from: recent evidence from real buyers, win-loss conversations, and lost deals, or a story the team told itself early and never retested. The distinction is whether the belief would survive contact with a dozen current buyers, not whether it feels convincing internally.',
    'Early customers often come from the founder’s network and are not representative. Consider whether you have deliberately checked, recently, that the buyer you target is the right one, or whether your definition of the customer is simply the shape of whoever bought first. Frequency matters more than a one-time exercise.',
    'This asks whether your knowledge of the buyer lives in the company or in one person’s head. Consider whether a capable new hire could learn who to target and why from written, shared material, or whether that understanding would walk out the door with your strongest seller.',
  ],
  positioning: [
    'Generic positioning describes a category, not you. Consider whether a competitor could paste your positioning onto their site with no edits. If it would fit ten other companies, it is not positioning, it is wallpaper. The test is specificity that only your company could credibly claim.',
    'Strong positioning is a filter, not a net. Consider whether your promise actively makes the wrong-fit buyer self-select out, or whether it is agreeable enough that everyone leans in and your team burns cycles disqualifying late. Repelling the wrong buyer is a feature, not a risk.',
    'Consider handing your positioning to someone outside the company. Could they state, in a sentence, who it serves and who it does not, without you explaining. If they hesitate or ask what you mean, the clarity lives in your team’s heads, not on the page.',
    'Saying no is the hard part. Consider whether you have an explicit definition of who you do not serve, and whether you hold it when a poor-fit deal with real revenue appears. Choosing on a slide is easy. The test is whether the line survives a tempting quarter.',
    'Consider whether your description of the company shifts by audience. A consistent promise across customers, investors, and the board signals real clarity. Divergent stories usually mean the positioning is still unsettled, and the differences reveal where the team itself has not agreed on what you are.',
  ],
  repeatability: [
    'Consider your recent closed deals. How many advanced to signature without the founder or one indispensable person personally carrying them. Occasional founder involvement is fine. The question is whether meaningful deals can and do close without that person in the room, or whether every real deal still routes through them.',
    'This is about depth, not headcount. Consider whether at least two people can independently run a deal from first contact to signature, or whether others can only assist while one person does the real work. A motion only one person can run is a dependency wearing the costume of a system.',
    'Consider how your last commercial hire got up to speed: through a defined, documented motion they could follow, or by watching one talented person and absorbing what they could. Shadowing transfers some instinct but not a system, and it does not scale past the star’s available hours.',
    'Consider your answer to why you win. If it centers on a person’s talent, relationships, or hustle, the result is not yet transferable. If it names repeatable steps and choices anyone competent could execute, you have a process. Personality-driven wins are real, but they do not survive that person.',
    'Consider what happens to the pipeline when a key person takes two weeks off. If deals stall and the forecast wobbles, revenue depends on presence, not a system. Consistently means the motion holds through absence. This is the clearest real-world test of whether the company owns the engine.',
  ],
  fit: [
    'Consider whether your process mirrors the buyer’s real decision path, including their internal steps, approvals, and timing, or an idealized version that is convenient for you. Motions built on wishful buyer behavior feel efficient until deals stall on steps you never accounted for.',
    'Timing and budget are usually symptoms, not causes. Consider whether your team has diagnosed the actual reason deals freeze, an unaddressed risk, a missing stakeholder, unclear value, or whether stalls get logged under convenient labels that end the inquiry before the real cause is found.',
    'Late-stage hesitation is usually perceived risk, not lost interest. Consider whether you know the specific fears that surface near signature, security, switching cost, internal politics, and have deliberately engineered them out, or whether you push harder and hope. Removing the risk beats adding pressure.',
    'Few real purchases are made by one person. Consider whether your motion equips your champion to sell internally to finance, security, legal, and leadership, or whether you engage one contact and assume they will carry the rest. Deals often stall in rooms you are never in.',
    'Consider your response to repeated losses or stalls. Do you treat them as evidence and change the motion, or as a reason to do more of the same with more effort. Pushing harder on a motion the market is rejecting mistakes persistence for progress.',
  ],
  adaptability: [
    'Consider what usually triggers change in how you sell: evidence that the market shifted, acted on early, or a crisis that left no choice. Companies that only change under duress are always adapting late. Consistently means revising on signal, before the pain forces your hand.',
    'Consider whether your best people’s hard-won judgment is captured where others can use it, or held privately as individual instinct. This is not about documents for their own sake. It is whether the knowledge that wins deals would remain in the company if those people left.',
    'Consider what happens to a valuable insight from a single deal. Does it get shared and absorbed into how everyone sells, or does it stay with the person who found it. Individual learning is common. The test is whether learning becomes organizational capability rather than private advantage.',
    'Pencil, not Sharpie means the motion is treated as a testable hypothesis: stable enough to run consistently, but easy to revise when market evidence proves something should change. Consider whether you hold the motion firmly enough to get a clean read, yet loosely enough to change it when the evidence is clear.',
    'This is the final test of ownership. Consider whether commercial improvement depends on one architect’s continued presence, or whether the capacity to learn and improve is now embedded in the organization. A system that stops getting better the moment its builder leaves was rented, not owned.',
  ],
};
