// Commercial Readiness Assessment: REPORT intelligence (interpretation + teaching).
//
// This is the copy that turns a score into a commercial diagnosis. It reads like
// Commercial by Design, not like generic advice: plain, specific, sequential. It
// carries NO scoring (see engine.mjs) and never invents a second methodology.
// Everything here is grounded in the five conditions, the four bands, the
// first-non-Built priority rule, and D2BT (Diagnose, Design, Build, Transfer).
//
// House rule: no em dashes or en dashes anywhere. Regular hyphens only.

export const BAND_RANK = { Built: 4, Forming: 3, Assumed: 2, Absent: 1 };

// What being at this band means for this specific condition. Two sentences: the
// state, then the symptom you would actually observe. Band-specific + condition-
// specific, because a Forming Positioning is a different problem than a Forming Fit.
export const BAND_READ = {
  commercialTruth: {
    Built: 'You know, on evidence, who controls the budget and the pain that opens it, and that knowledge does not live in one person’s memory. A new hire could learn who to sell to and why from something the company owns.',
    Forming: 'You have a real read on the buyer, but it still leans on your best people rather than on tested evidence. The story is mostly right, and it wobbles on the deals that fall outside the familiar pattern.',
    Assumed: 'You hold a confident theory of who buys and why, but it has not been checked against real buyers recently. The team can describe the customer fluently, and that fluency is hiding how little of it has been proven.',
    Absent: 'Who actually buys, and the pain that moves them, is still a guess, and the company is aimed at whoever it inherited from its earliest deals. Positioning describes a market instead of a person, and no hire will correct that.',
  },
  positioning: {
    Built: 'The promise is sharp enough to repel the wrong buyer as clearly as it attracts the right one, and it holds under pressure. Deals start further along because the market already knows what you are.',
    Forming: 'The promise is becoming distinct, but it may still broaden under commercial pressure. It lands with the right buyer on a good day and blurs on the deals where the revenue is tempting.',
    Assumed: 'You believe the positioning is clear, but it would still fit several other companies without changing a word. The team is confident in a message the market cannot yet place.',
    Absent: 'The promise is broad enough to feel safe, which leaves every deal re-explaining what you are. Sales reinvents the pitch on every call, which is the opposite of a system.',
  },
  repeatability: {
    Built: 'Deals close without running through one person, and a new hire can reach productivity from a defined motion rather than a star. The forecast holds when a key person is out.',
    Forming: 'The motion works, but the harder deals still depend on particular people to carry them. It looks like a system until the pipeline meets its first real test of absence.',
    Assumed: 'You describe winning as a process, but the results still trace back to one or two indispensable people. The deck says engine and the deals say individual.',
    Absent: 'Every meaningful deal runs through one person, and the forecast would not survive their absence. It reads as strength and it is a dependency wearing an engine’s clothes.',
  },
  fit: {
    Built: 'The motion matches how the buyer actually decides, and the risks that make them hesitate at the end have been engineered away. Effort lands where the decision is truly made.',
    Forming: 'The motion reflects parts of the buyer’s decision process, but not dependably enough to prevent avoidable stalls. Deals still freeze in places the motion did not account for.',
    Assumed: 'You believe the motion fits the buyer, but stalls still get filed under timing or budget rather than the real risk. The follow-up is diligent and the underlying risk is never removed.',
    Absent: 'The motion is built for the buyer you wish you had, and deals freeze near the finish for reasons you have not named. Enterprise logos meet a two-week process aimed at a six-month decision.',
  },
  adaptability: {
    Built: 'The company changes its playbook on evidence, and the judgment that wins lives in the organization, not in a few heads. It keeps improving without any one person present.',
    Forming: 'The company can adapt, but the learning still concentrates in a few people rather than becoming shared capability. It improves in bursts, tied to who happened to notice.',
    Assumed: 'You believe the company keeps learning, but the playbook mostly changes only when a crisis forces it. Between crises, tactics that worked once get repeated long after the conditions changed.',
    Absent: 'The company changes only under pressure, and what its best people know would leave with them. A playbook held in Sharpie, not pencil.',
  },
};

// Condition-level intelligence (band-independent core). Why it matters, what it
// costs, what strengthening it unlocks, and the concrete work: how to build it,
// what not to do yet, what evidence to collect, and how to read it as a strength.
export const CONDITION = {
  commercialTruth: {
    stakes: 'Commercial Truth is the ground everything else stands on. When it is not settled, the company aims its whole commercial system at a buyer it has assumed rather than proven, so positioning, pricing, and the motion are all built to persuade a person who may not control the budget. The cost does not show up as a single failure. It shows up as effort that never compounds.',
    unlocks: 'Once Commercial Truth is established on evidence, every choice below it gets sharper: positioning has a real target, the motion has a real decision to match, and the team stops re-litigating who the customer is on every deal.',
    whyFirst: 'Nothing below Commercial Truth can be trusted until it is settled. A repeatable motion built on an assumed buyer is not a strength. It is a faster way to the wrong place.',
    buildFirst: 'Go to the market and learn, on evidence, who actually pulls out the budget and the exact pressure that makes them do it. Not the internal theory, the buyer’s own words, drawn from recent won and lost deals. Then write it down where the company owns it, not in one person’s head.',
    conversations: 'The leadership conversation to have is an honest one about how much of your customer definition is evidence and how much is inherited belief, and who owns the work of testing it.',
    notYet: 'Do not scale a motion, rewrite pricing, or hire a closer against a buyer you have not yet proven.',
    evidence: [
      'Interview your last five to ten buyers and capture, in their words, the pressure that opened the budget.',
      'Document who actually controlled the money on recent deals, by role and authority, not who championed you internally.',
      'Review your lost deals for the pattern in who said no and why.',
      'Compare the language buyers use to the language on your site and in your deck.',
      'Separate the user who loves the product from the economic buyer who signs.',
    ],
    whatNotToDo: [
      'Do not hire another salesperson to push harder against an unproven buyer.',
      'Do not spend on demand generation aimed at a persona you have not confirmed.',
      'Do not rewrite pricing before you know what the buyer is actually paying to solve.',
      'Do not buy another CRM to organize a pipeline pointed at the wrong target.',
    ],
    strongRead: 'The company operates from evidence about who buys and why, not inherited theory. This is the strongest foundation a commercial system can have, because everything above it is built on solid ground. Protect it by re-checking it as you enter new segments, since the buyer that was true at one stage is not automatically true at the next.',
  },
  positioning: {
    stakes: 'Positioning is the first thing the market actually meets. When it is generic, every deal begins by re-explaining what you are, and the sales team reinvents the pitch on every call. A promise broad enough to feel safe attracts no one in particular and repels no one, so your people spend their time disqualifying buyers the positioning should have turned away on its own.',
    unlocks: 'Sharp positioning does work the company would otherwise pay salespeople to do: it pulls the right buyer in and turns the wrong one away before anyone spends effort on them, and it gives marketing a real edge to press.',
    whyFirst: 'With Commercial Truth in place, positioning is what turns that truth into something the market can feel. A motion cannot be repeatable through a blurry promise, because every conversation starts from zero.',
    buildFirst: 'Choose who you are for and who you are not for, in language specific enough that the wrong buyer rejects it on sight. Say it the same way to customers, to investors, and to the board. If everyone is a fit, nobody is convinced.',
    conversations: 'The leadership conversation to have is which buyers you are willing to turn away, and whether you will hold that line when an off-profile deal with real revenue appears.',
    notYet: 'Do not pour spend into demand or campaigns behind a promise that could belong to ten other companies.',
    evidence: [
      'Ask three people outside the company to read your positioning and tell you who it is for and who it is not for.',
      'Collect the words your best-fit customers use to describe why you and not a competitor.',
      'List the buyers you have said no to, and confirm the positioning would have turned them away earlier.',
      'Check whether customers, investors, and the board would recognize the same company from how you describe it.',
    ],
    whatNotToDo: [
      'Do not scale demand generation behind a promise the market cannot place.',
      'Do not add features to widen appeal when the problem is a promise that is already too wide.',
      'Do not brief an agency to make the message louder before it is sharper.',
    ],
    strongRead: 'The positioning does real work: it pulls the right buyer in and turns the wrong one away before your team spends effort on them. That is a genuine advantage. Guard it against the pressure to broaden it for a tempting off-profile deal, because the moment it fits everyone it stops working.',
  },
  repeatability: {
    stakes: 'Repeatability is where a talented person’s results turn into a system the company owns, or fail to. When it is weak, every meaningful deal routes through one person, and the results look like a machine right up until that person is stretched or gone. It reads as strength on the board deck and it is a dependency wearing an engine’s clothes.',
    unlocks: 'When the motion is repeatable, the company can add people and expect them to reach productivity from a defined path rather than by absorbing one star’s instincts, and the forecast stops depending on who is in the room.',
    whyFirst: 'With truth and positioning settled, repeatability is what makes them a company rather than a person. This is the condition most often mistaken for strength while it is actually the largest hidden risk.',
    buildFirst: 'Pull the winning motion out of one head and into a system: a defined path a new person can run and get most of it right, the reasons deals win and lose written where the company owns them, and a way to explain why you win as a process rather than a personality.',
    conversations: 'The leadership conversation to have is what actually happens to the forecast when your best person is unavailable for two weeks, and who besides them can carry a live deal today.',
    notYet: 'Do not scale headcount or spend on a motion only one person can actually run.',
    evidence: [
      'Look at your recent closed deals and count how many could have closed without the founder or one key person in the room.',
      'Check whether a second person can carry a live deal from first contact to signature today.',
      'Document how your last commercial hire actually got productive, and whether it was a defined path or an apprenticeship to one person.',
      'Test what happens to the forecast when a key person is out, on leave, or gone.',
    ],
    whatNotToDo: [
      'Do not hire a team to scale a motion that still lives in one person’s head.',
      'Do not set aggressive quota against a pipeline only one person can move.',
      'Do not add tooling to systematize a process no one has actually defined yet.',
    ],
    strongRead: 'Deals close through a defined motion rather than a single hero, and a new person can reach productivity without shadowing a star. The engine can carry load without one person at the center, which is what lets you scale safely. Keep it that way by writing down each new thing that starts to work, before it quietly becomes another dependency.',
  },
  fit: {
    stakes: 'A motion can be repeatable and still be repeatably wrong. Fit is where the motion meets how the buyer actually decides, including the risks that make them hesitate at the very end. When it is off, deals stall near the finish and get filed under timing or budget, the company follows up and waits, and the real risk underneath is never removed.',
    unlocks: 'When the motion fits the decision, effort lands where the decision is actually made: the channel, the cycle, the people involved, and the price all line up with how the real buyer chooses, and late-stage stalls stop being a mystery.',
    whyFirst: 'A repeatable motion aimed at the wrong decision just repeats the wrong conversation faster. Fit is where you align the motion to the buyer you have proven, before you ask the organization to scale it.',
    buildFirst: 'Learn why deals actually stall, account for everyone the buyer has to convince inside their own company, and engineer away the specific risk that makes them freeze, rather than pushing harder. Match the channel, the cycle, and the price to how the real buyer decides.',
    conversations: 'The leadership conversation to have is the real reason your last handful of deals stalled, named honestly, beyond timing and budget.',
    notYet: 'Do not scale a motion that has not yet been validated against how the buyer truly buys.',
    evidence: [
      'Map the buyer’s real decision path, including every internal approval, not the funnel you wish they used.',
      'Diagnose the actual reason your last set of deals stalled, beyond timing and budget.',
      'Name the specific late-stage risks that make buyers hesitate, and how each one is currently handled.',
      'List everyone on the buyer’s side who has to say yes, and whether your motion equips your champion to sell them.',
    ],
    whatNotToDo: [
      'Do not add pipeline pressure to a motion that stalls for reasons you have not named.',
      'Do not shorten the cycle for a buyer who structurally needs longer.',
      'Do not treat a stall as a timing objection and simply follow up.',
    ],
    strongRead: 'The motion matches the buyer’s real decision process, so effort lands where the decision is actually made. That is hard-won and worth protecting. Keep testing it as buyers and segments change, because a motion that fit last year’s buyer can quietly stop fitting this year’s.',
  },
  adaptability: {
    stakes: 'Adaptability decides whether everything above it keeps working after the people who built it move on. When it is weak, the company changes only under crisis, and the judgment that wins lives in a few heads. Documentation is not the same as transferred judgment, and a system that stops improving the moment its architect leaves was rented, not owned.',
    unlocks: 'When adaptability is real, the company revises the motion on evidence rather than waiting for a crisis, and the learning that wins deals becomes shared capability instead of private advantage, so the engine keeps getting better without any one person present.',
    whyFirst: 'Adaptability is the top of the ladder because it protects everything beneath it as the company grows and turns over. It cannot compensate for a weak foundation above it, which is why it is rarely the first thing to fix.',
    buildFirst: 'Move what your best people know out of their heads and into the organization: a playbook that changes on evidence, held in pencil not Sharpie, and a habit of turning one person’s market insight into something the whole company can use.',
    conversations: 'The leadership conversation to have is whether the company would keep improving commercially if the person who built the system left tomorrow.',
    notYet: 'Do not treat strong adaptability as a substitute for settling a weaker condition higher in the order.',
    evidence: [
      'Identify what usually triggers a change in how you sell, and whether it is evidence or a crisis.',
      'Check whether your best people’s hard-won judgment is captured where others can use it.',
      'Trace what happens to a valuable insight from a single deal, and whether it becomes shared capability.',
      'Ask whether the company would keep improving commercially if the person who built the system left.',
    ],
    whatNotToDo: [
      'Do not lean on adaptability to paper over an unproven buyer or an unrepeatable motion.',
      'Do not confuse constant change with learning, or a static playbook with discipline.',
      'Do not let the improvement engine stay in one person’s head because it is working for now.',
    ],
    strongRead: 'The company learns continuously and that learning belongs to the organization, so the engine keeps improving on its own. This is the mark of a system the company owns rather than rents. Use it deliberately: point that learning capacity at the first condition that is not yet built, so your strongest muscle does the heaviest work.',
  },
};

// "The companies we see at this stage usually..." keyed to overall classification.
export const FAILURE_PATTERN = {
  Absent: 'The companies we see at this stage usually try to buy their way past the gap. They hire a salesperson to create urgency, spend on demand generation to fill a pipeline, or add a tool to organize the chaos. None of it holds, because the problem is not effort or activity, it is that the commercial system underneath has not been built. The busyness feels like progress and the fundamentals do not move.',
  Assumed: 'The companies we see at this stage usually mistake conviction for evidence. They have a clear story about the customer, the positioning, or the motion, and enough wins to believe it, so they scale. The assumption holds until volume tests it, and then deals that should close start slipping for reasons the team files under timing or budget. The plateau arrives right at the moment growth was supposed to accelerate.',
  Forming: 'The companies we see at this stage usually scale a half-built condition because everything else is working. The forming condition holds while the founders and best people are close to every deal, so it looks solid enough to press on. As volume rises, that condition becomes the ceiling, and the company adds headcount to compensate for a gap that headcount cannot close. The result is a good company stuck one level below what it could be.',
  Built: 'The companies we see at this level usually relax. The system works, so attention drifts to the next initiative, and the disciplines that built the engine stop being actively maintained. Readiness erodes quietly: the buyer shifts, the positioning softens, the motion loosens, and no single failure announces it. By the time the numbers show it, the company is rebuilding a condition it thought it had banked.',
};

// Executive summary, 250 to 400 words, composed per overall band with the actual
// priority, strength, and total woven in. Returns an array of paragraph strings.
export function execSummary({ band, priorityName, strongName, total, readyThrough, allBuilt }) {
  if (allBuilt) {
    return [
      'Every condition is built. Your responses describe a commercial engine that holds without depending on any single person: Commercial Truth on evidence, positioning that does real work, a motion the company owns and has matched to how buyers actually decide, and the ability to keep learning. This is a strong result, and it is a self-assessment, not a verdict.',
      'Companies that reach this level do not stop being at risk, they change the kind of risk they carry. Readiness erodes as a company grows and turns over: the buyer that was true at one stage shifts, the positioning that repelled the wrong customer softens under new pressure, and the motion that fit last year quietly stops fitting. The failure mode here is complacency, the belief that a system, once built, stays built.',
      'The work now, in the language of Commercial by Design, is to keep the learning loop running so the engine compounds rather than decays. Test this profile against external evidence: real buyers, the pipeline, the forecast under absence. Your total is ' + total + ' out of 125. Treat the strength as a foundation to defend and extend, not a finish line, and point your sharpest condition, ' + strongName + ', at whatever erodes first.',
    ];
  }
  if (band === 'Absent') {
    return [
      'Your commercial engine is not yet built as a system. Read in sequence, the first condition that is not in place is ' + priorityName + ', and it is not merely weak, it is absent. That single fact shapes the whole profile, because the conditions below a gap cannot be trusted until the gap is closed. This is a clear starting point, not a verdict, and it is more useful than a comfortable score would have been.',
      'Companies here usually feel busy and stuck at the same time. Revenue may exist, but it comes from effort, founder energy, and relationships rather than a repeatable system, so growth costs more each quarter instead of less. The instinct is to add: another salesperson, more demand generation, a new tool. Each addition scales the effort without fixing the thing underneath it, which is exactly why companies at this stage plateau. They are pouring fuel into an engine that has not been built.',
      'In Commercial by Design terms, this is where the work begins, not where it stalls. The path is to build ' + priorityName + ' first, on evidence, and then the next condition, in order. Your total across the five conditions is ' + total + ' out of 125, but the number is the least important thing on this page. The order is what matters: a system built from the first condition down compounds, and one assembled out of order does not.',
    ];
  }
  if (band === 'Assumed') {
    return [
      'Your commercial engine is taking shape, but a condition high in the order still rests on assumption rather than evidence. Read in sequence, the first gap is ' + priorityName + ', currently Assumed: the company can describe it fluently, and that fluency is hiding how little of it has actually been proven. Everything below that gap is being built on a confident guess.',
      'Companies at this stage are often the most convinced they are ready. The team speaks about the customer, the positioning, or the motion with real conviction, and closes enough deals to reinforce the story. The trap is that conviction is not the same as evidence, and a motion built on an assumed truth simply travels faster in the wrong direction. This is why companies here plateau just as they start to scale: they add people and spend against a foundation that has never been tested, and the returns quietly diminish.',
      'The classification matters because it tells you where leverage actually is. Strengthening anything below ' + priorityName + ' produces very little, because it rests on the assumption above it. The work, in the language of Commercial by Design, is to replace assumption with evidence, discipline by discipline, in order. Your strongest condition, ' + strongName + ', is a real asset, and the most valuable thing you can do with it is aim that strength at the first condition that is not yet built. Your total is ' + total + ' out of 125, but the shape of the profile matters more than the sum.',
    ];
  }
  // Forming
  const held = readyThrough <= 0 ? 'The foundation is largely in place'
    : readyThrough === 1 ? 'The foundation holds through the first condition'
    : 'The foundation holds through the first ' + readyThrough + ' conditions';
  return [
    'Your commercial engine is largely in place. ' + held + ', then reaches ' + priorityName + ', which is forming but not yet built. This is a strong position, and it is not the finish line. A forming condition works when the right people are in the room and wobbles when they are not.',
    'Companies here are close enough to feel done and far enough that scaling now would lock the weakness in. Growth is real, the motion mostly runs, and the temptation is to press the accelerator. What tends to happen next is that the forming condition becomes the ceiling: as volume rises, the deals that fall outside the familiar pattern expose it, and the system starts to depend on a few people to hold it together. That is how good companies plateau one level below their potential.',
    'In Commercial by Design terms, this is the moment to convert a good motion into an owned engine. Close ' + priorityName + ', in order, and the conditions beneath it stop depending on individual judgment. Your total is ' + total + ' out of 125, but the shape matters more than the sum: a company that is built through the earlier conditions and forming on ' + priorityName + ' is in a very different place than the total alone would suggest.',
  ];
}

// Commercial Constraints: synthesize the binding bottlenecks from the profile.
// Relational, not a re-listing of scores. Returns up to four statements, most
// binding first. `dims` is computeProfile().dimensions (in order).
export function synthesizeConstraints(profile) {
  const dims = profile.dimensions;
  const byId = Object.fromEntries(dims.map((d) => [d.id, d]));
  const rank = (id) => BAND_RANK[byId[id].classification];
  const notBuilt = (id) => byId[id].classification !== 'Built';
  const out = [];

  if (profile.allBuilt) {
    out.push('The binding constraint now is entropy, not capability. Every condition is built, so the risk is quiet erosion as the company grows and turns over. Readiness holds only as long as the learning loop is actively run.');
    return out;
  }
  if (notBuilt('commercialTruth')) {
    out.push('Growth is running on assumptions about the buyer that have not been tested. Everything below Commercial Truth rests on that guess, so effort downstream does not compound.');
  }
  if (rank('positioning') > rank('commercialTruth') && notBuilt('commercialTruth')) {
    out.push('Positioning is ahead of buyer evidence. You have a sharper promise than proof of who it is for, which is a fast way to attract the wrong buyer with real conviction.');
  }
  if (byId.repeatability.classification === 'Absent' || (notBuilt('repeatability') && rank('repeatability') <= rank('commercialTruth'))) {
    out.push('Repeatability is constrained by dependence on specific people. The results look like a system and route through individual judgment, so the forecast would not survive a key absence.');
  }
  if (notBuilt('fit') && rank('fit') >= 3 && rank('repeatability') >= 3) {
    out.push('The motion has not yet earned the right to scale. It runs, but it has not been validated against how the buyer actually decides, so scaling it would multiply the stalls.');
  }
  if (rank('adaptability') >= 3 && (notBuilt('commercialTruth') || byId.positioning.classification === 'Absent')) {
    out.push('Adaptability cannot compensate for a weak foundation above it. The company can learn, but it is learning on top of an unsettled truth, so it improves the wrong things faster.');
  }
  // Always ensure at least one, and cap at four, most binding first.
  if (!out.length) {
    out.push('The binding constraint is the first condition that is not yet built. Until it is closed, the conditions beneath it cannot be trusted to hold under scale.');
  }
  return out.slice(0, 4);
}

// Close every report by reconnecting the diagnosis to the method.
export const BUILDING_ENGINE = {
  lead: 'This profile is the diagnosis. It is the first discipline of the method, not the whole of it.',
  body: 'In Commercial by Design, a commercial engine is built in order: diagnose the truth, design the architecture that fits it, build the motion in the market where it can be tested, and transfer what works into the organization so it survives any one person. You have started at Diagnose. The work from here follows the same sequence.',
  steps: [
    { k: 'Diagnose', d: 'Establish, on evidence, what is actually true about who buys and why. This profile is that first step.' },
    { k: 'Design', d: 'Turn that truth into a commercial architecture: positioning, motion, pricing, and roles designed as one connected system.' },
    { k: 'Build', d: 'Run the motion in the market as a testable hypothesis, held in pencil, and let evidence correct it.' },
    { k: 'Transfer', d: 'Move the working system out of individual heads and into the company, so it compounds instead of depending on a person.' },
  ],
  close: 'A profile is where an engagement starts, not where it ends. The next move is to translate this diagnosis into the specific evidence, sequence, and ownership required to close the first gap.',
};
