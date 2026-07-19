// Commercial Readiness Assessment: REPORT intelligence.
//
// This is not assessment output. It is the opening chapter of a commercial
// diagnosis. It is written to sound excerpted from Commercial by Design: plain,
// architectural, sequential, opinionated. Not a consultant, not software, not
// generic advice. It teaches D2BT while it reads, because the assessment is how
// most people first meet the method.
//
// It carries NO scoring (see engine.mjs) and invents no second methodology.
// Everything is grounded in the five conditions, the four bands, the sequence
// rule (weakness at the top contaminates everything below it), Diagnose, Design,
// Build, Transfer, and the engine-versus-dependency test.
//
// The shape of every condition is deliberate:
//   condition -> commercial consequence -> system consequence -> engine
//   consequence -> what evidence settles it -> what gets unlocked.
//
// House rule: no em dashes or en dashes anywhere. Regular hyphens only.

export const BAND_RANK = { Built: 4, Forming: 3, Assumed: 2, Absent: 1 };

// A condition reads differently when it is weak, forming, or built. Rather than
// twenty near-duplicate paragraphs, the narrative has three tiers.
export function tierOf(band) {
  if (band === 'Built') return 'built';
  if (band === 'Forming') return 'building';
  return 'weak'; // Assumed, Absent
}

// Each condition is a discipline of the method. Naming that relationship is how
// the report teaches D2BT without lecturing.
export const DBT = {
  commercialTruth: { tag: 'Diagnose', line: 'This is Diagnose. Before anything is prescribed, you establish what is actually true about who buys and why. Commercial Truth is what Diagnose produces, or what its absence leaves missing.' },
  positioning: { tag: 'Design', line: 'This is where Design begins. Positioning turns Commercial Truth into a Commercial Architecture the market can read in a sentence.' },
  repeatability: { tag: 'Build', line: 'This is Build. It decides whether the motion the company operates belongs to the company, or to one person.' },
  fit: { tag: 'Build, tested', line: 'This is where the market confirms or rejects the architecture. A motion is not validated until it matches how the buyer actually decides.' },
  adaptability: { tag: 'Transfer', line: 'This is Transfer and the learning loop. It decides whether what the company knows becomes shared capability, or hardens into stale process held by a few people.' },
};

// Why companies plateau at this condition. Not why fixing it helps. Why growth
// stops here.
export const PLATEAU = {
  commercialTruth: 'Companies rarely stall because they stop working hard. They stall because everyone is working from a slightly different assumption about who the customer is and why they buy.',
  positioning: 'Companies rarely lose because the product is weak. They lose because the buyer cannot quickly understand why this company, and not another, exists for them.',
  repeatability: 'Companies plateau when every important commercial conversation still routes through the same one or two people. Growth is then capped at their available hours.',
  fit: 'Companies confuse effort with traction. A motion that does not match how the buyer actually decides does not get cheaper as you scale it. It gets more expensive.',
  adaptability: 'Companies stop learning long before they stop growing. By the time the revenue number shows the problem, the market has usually already moved.',
};

// What establishing this condition unlocks. Concrete, downstream, checkable.
export const UNLOCKS = {
  commercialTruth: ['Positioning becomes simpler', 'Qualification improves', 'Marketing narrows', 'Sales cycles shorten', 'Product hears one commercial language'],
  positioning: ['The right buyer self-selects in', 'The wrong buyer self-selects out', 'Every campaign starts from a sharper premise', 'Sales stops re-explaining what you are', 'The story holds from first touch to the board'],
  repeatability: ['A new hire can reach productivity from a defined path', 'Deals close without the founder in the room', 'The forecast survives a key absence', 'Winning becomes a process you can teach', 'The company can add load without adding risk'],
  fit: ['Effort lands where the decision is actually made', 'Late-stage stalls stop being a mystery', 'The champion can sell internally without you', 'Cycle and price match how the buyer decides', 'Scaling multiplies wins instead of stalls'],
  adaptability: ['The playbook changes on evidence, not on crisis', 'One person’s insight becomes shared capability', 'The engine keeps improving without its architect', 'The company reads the market before the numbers do', 'What works is held in pencil, ready to be revised'],
};

// The teaching narrative for each condition, by tier. Follows the consequence
// chain. This is the heart of the report.
export const NARRATIVE = {
  commercialTruth: {
    weak: 'Your company is very likely selling successfully today. That does not mean the company knows why. Early growth usually comes from a founder’s instinct for the buyer, and that instinct is real. The danger begins the moment instinct becomes the operating system, when the company can no longer answer, on evidence, who actually buys, why they buy, what opens the budget, and what would disprove today’s assumptions. Every decision downstream then inherits that uncertainty. Positioning becomes interpretation. Hiring becomes luck. Forecasting becomes confidence rather than evidence. The engine is running, and it has no stable foundation under it.',
    building: 'You have a real, working read on the buyer, and it is close to solid. What is missing is the last step from conviction to evidence. On the familiar deals your read holds. On the ones that fall outside the pattern, the company is still reading the buyer through its best people rather than through something it owns. That gap is small now, and it widens under scale, because every new hire and every new segment inherits a truth that was never quite written down.',
    built: 'The company operates from evidence about who buys and why, and that knowledge does not live in one person’s head. This is the most valuable position a commercial system can hold, because everything above it now stands on proven ground rather than inherited belief. The work here is not to build but to defend. Re-test the truth as you enter new segments, because the buyer who was true at one stage is not automatically the buyer at the next.',
  },
  positioning: {
    weak: 'A stranger reading your positioning cannot yet tell, in one line, who it is for and who it is not for. That is not a copy problem. It is the market meeting a promise broad enough to feel safe, which means it attracts no one in particular and turns no one away. Your sales team then does the work the positioning should have done, re-explaining what you are on every call and disqualifying buyers who should never have entered. The motion cannot become repeatable through a blurry promise, because every conversation starts from zero.',
    building: 'The promise is becoming distinct, and on a good day it lands. What has not yet hardened is the discipline to hold it when a tempting off-profile deal appears. Positioning that flexes under revenue pressure is positioning the market cannot rely on, and the cost surfaces later, as a pipeline full of buyers who were never really a fit.',
    built: 'The promise does real work. It pulls the right buyer in and turns the wrong one away before your team spends effort on them. That is a genuine commercial asset. The only threat to it is entropy, the slow pressure to broaden it for a deal that does not belong, because the moment it fits everyone it stops working for anyone.',
  },
  repeatability: {
    weak: 'The results look like a system, and they route through a person. That is the most expensive illusion in a commercial organization, because on a good day an engine and a dependency look identical. They separate the moment the person is stretched, distracted, or gone. Until the winning motion is pulled out of one head and into something the company owns, the forecast is really a forecast of one person’s availability, and every new hire is asked to absorb instinct instead of running a defined path. Traction is not an engine.',
    building: 'A defined motion is emerging, and the easier deals now run without a hero. The harder deals still route back to one or two people, which means the system holds under normal conditions and bends under pressure. The distance left to travel is the distance between a motion that works when the right people are present and one the company owns whether they are or not.',
    built: 'Deals close through a defined motion rather than a single hero, and a new person can reach productivity without shadowing a star. This is what lets the company carry more load without carrying more risk. Protect it by writing down each new thing that starts to work, before it quietly becomes the next dependency.',
  },
  fit: {
    weak: 'The motion is built for the buyer you wish you had, not the one you have. That is why deals freeze near the finish and get filed under timing or budget, when the real cause is a risk the motion never accounted for. A motion that does not match how the buyer actually decides does not fail loudly. It gets more expensive as it scales, because you spend more to push harder against a decision the buyer makes in a room you are not in.',
    building: 'The motion reflects real parts of how the buyer decides, and it still leaves gaps the buyer falls into. Stalls are less frequent than they were and not yet rare, which means the architecture is mostly right and not yet confirmed by the market. The work is to close the specific places where the motion and the real decision still diverge.',
    built: 'The motion matches how the buyer actually decides, and the risks that make them hesitate at the end have been engineered away. Effort lands where the decision is truly made, which is what turns a repeatable motion into a validated one. Keep testing it as buyers and segments shift, because a motion that fit last year’s buyer can quietly stop fitting this year’s.',
  },
  adaptability: {
    weak: 'The company changes when a crisis forces it, and the judgment that wins lives in a few heads. That is a system the company rents rather than owns, and it works until the people who hold the judgment are stretched or leave. Documentation is not the same as transferred capability. A playbook held in Sharpie stops being right the moment the market moves, which it always does.',
    building: 'The company can adapt, and the learning still concentrates in a few people rather than becoming shared capability. It improves in bursts, tied to whoever happened to notice. The step left is to make the learning institutional, so the engine keeps getting better without depending on the person who noticed first.',
    built: 'The company changes its playbook on evidence, and the judgment that wins belongs to the organization rather than to a few heads. This is the mark of a system the company owns. It keeps improving without any one person present. Point that learning capacity deliberately at whatever erodes first, so your strongest muscle does the heaviest work.',
  },
};

// Condition-level guidance used by the priority, strongest, evidence, and
// what-not-to-do sections. Architectural, not procedural.
export const CONDITION = {
  commercialTruth: {
    whyFirst: 'Nothing below Commercial Truth can be trusted until it is settled, because every condition beneath it is built to serve a buyer this condition defines. A repeatable motion built on an assumed buyer is not a strength. It is a faster way to the wrong place.',
    conversations: 'The conversation to have is an honest one about how much of your customer definition is evidence and how much is inherited belief, and who owns the work of testing it.',
    notYet: 'Do not scale a motion, rewrite pricing, or hire a closer against a buyer you have not yet proven.',
    evidence: [
      'The words your last five to ten buyers used to justify the spend, captured in their language rather than yours.',
      'Who actually controlled the budget on recent deals, by role and authority, not who championed you internally.',
      'The pattern in your lost deals: who said no, and what they were really saying no to.',
      'Where the language buyers use and the language on your site diverge, because that gap is the truth you are missing.',
    ],
    whatNotToDo: [
      'Do not hire another salesperson to push harder against an unproven buyer.',
      'Do not spend on demand generation aimed at a persona you have not confirmed.',
      'Do not rewrite pricing before you know what the buyer is actually paying to solve.',
      'Do not buy another tool to organize a pipeline pointed at the wrong target.',
    ],
    strongRead: 'The company operates from evidence about who buys and why, not inherited theory. This is the strongest foundation a commercial system can have, because everything above it stands on proven ground. Preserve it by re-checking it as you enter new segments, since the buyer that was true at one stage is not automatically the buyer at the next.',
  },
  positioning: {
    whyFirst: 'With Commercial Truth in place, positioning is what turns that truth into something the market can feel. A motion cannot be repeatable through a blurry promise, because every conversation starts by re-explaining what you are.',
    conversations: 'The conversation to have is which buyers you are willing to turn away, and whether you will hold that line when an off-profile deal with real revenue appears.',
    notYet: 'Do not pour spend into demand or campaigns behind a promise that could belong to ten other companies.',
    evidence: [
      'Whether three people outside the company, reading your positioning cold, can name who it is for and who it is not for.',
      'The exact language your best-fit customers use to describe why you and not a competitor.',
      'The off-profile deals you took, and whether a sharper promise would have turned them away earlier.',
      'Whether customers, investors, and the board would recognize the same company from how each is told the story.',
    ],
    whatNotToDo: [
      'Do not scale demand generation behind a promise the market cannot place.',
      'Do not add features to widen appeal when the problem is a promise that is already too wide.',
      'Do not brief an agency to make the message louder before it is sharper.',
    ],
    strongRead: 'The positioning does real work. It pulls the right buyer in and turns the wrong one away before your team spends effort on them. Guard it against the pressure to broaden it for a tempting off-profile deal, because the moment it fits everyone it stops working.',
  },
  repeatability: {
    whyFirst: 'With truth and positioning settled, repeatability is what makes them a company rather than a person. This is the condition most often mistaken for strength while it is actually the largest hidden risk. The test is simple: can someone who is not the founder run the motion and get the same result.',
    conversations: 'The conversation to have is what actually happens to the forecast when your best person is unavailable for two weeks, and who besides them can carry a live deal today.',
    notYet: 'Do not scale headcount or spend on a motion only one person can actually run. A founder is not something a company can hire twelve of.',
    evidence: [
      'How many of your recent closed deals could have closed without the founder or one key person in the room.',
      'Whether a second person can carry a live deal from first contact to signature today.',
      'How your last commercial hire actually reached productivity: a defined path, or an apprenticeship to one person.',
      'What the forecast does when a central person is out, on leave, or gone.',
    ],
    whatNotToDo: [
      'Do not hire a team to scale a motion that still lives in one person’s head.',
      'Do not set aggressive quota against a pipeline only one person can move.',
      'Do not add tooling to systematize a process no one has actually defined yet.',
    ],
    strongRead: 'Deals close through a defined motion rather than a single hero, and a new person can reach productivity without shadowing a star. The engine can carry load without one person at the center, which is what lets you scale safely. Keep it that way by writing down each new thing that starts to work, before it quietly becomes another dependency.',
  },
  fit: {
    whyFirst: 'A repeatable motion aimed at the wrong decision just repeats the wrong conversation faster. Fit is where the motion meets how the buyer actually decides, before you ask the organization to scale it. Before you scale the selling, prove the selling.',
    conversations: 'The conversation to have is the real reason your last handful of deals stalled, named honestly, past the labels of timing and budget.',
    notYet: 'Do not scale a motion that has not yet been validated against how the buyer truly buys.',
    evidence: [
      'The buyer’s real decision path, including every internal approval, not the funnel you wish they used.',
      'The actual reason your last set of deals stalled, past timing and budget.',
      'The specific late-stage risks that make buyers hesitate, and how each one is handled today.',
      'Everyone on the buyer’s side who has to say yes, and whether your motion equips your champion to sell them.',
    ],
    whatNotToDo: [
      'Do not add pipeline pressure to a motion that stalls for reasons you have not named.',
      'Do not shorten the cycle for a buyer who structurally needs longer.',
      'Do not treat a stall as a timing objection and simply follow up.',
    ],
    strongRead: 'The motion matches the buyer’s real decision process, so effort lands where the decision is actually made. Keep testing it as buyers and segments change, because a motion that fit last year’s buyer can quietly stop fitting this year’s.',
  },
  adaptability: {
    whyFirst: 'Adaptability is the top of the ladder because it protects everything beneath it as the company grows and turns over. It cannot compensate for a weak foundation above it, which is why it is rarely the first thing to fix.',
    conversations: 'The conversation to have is whether the company would keep improving commercially if the person who built the system left tomorrow.',
    notYet: 'Do not treat strong adaptability as a substitute for settling a weaker condition higher in the order.',
    evidence: [
      'What usually triggers a change in how you sell: evidence read early, or a crisis that left no choice.',
      'Whether your best people’s hard-won judgment is captured where others can reach it.',
      'What happens to a valuable insight from a single deal, and whether it becomes shared capability.',
      'Whether the company would keep improving commercially if the person who built the system left.',
    ],
    whatNotToDo: [
      'Do not lean on adaptability to paper over an unproven buyer or an unrepeatable motion.',
      'Do not confuse constant change with learning, or a static playbook with discipline.',
      'Do not let the improvement engine stay in one person’s head because it is working for now.',
    ],
    strongRead: 'The company learns continuously and that learning belongs to the organization, so the engine keeps improving on its own. Use it deliberately: point that learning capacity at the first condition that is not yet built, so your strongest muscle does the heaviest work.',
  },
};

// "The companies we see at this stage usually..." keyed to overall band.
export const FAILURE_PATTERN = {
  Absent: 'The companies we see at this stage usually try to buy their way past the gap. They hire a salesperson to create urgency, spend on demand generation to fill a pipeline, or add a tool to organize the chaos. Each decision is individually sensible, and none of it holds, because the problem is not effort. The problem is that no one designed the whole. The busyness feels like progress and the fundamentals do not move.',
  Assumed: 'The companies we see at this stage usually mistake conviction for evidence. They have a clear story about the customer, the positioning, or the motion, and enough wins to believe it, so they scale. The assumption holds until volume tests it, and then deals that should close start slipping for reasons the team files under timing or budget. The plateau arrives right at the moment growth was supposed to accelerate.',
  Forming: 'The companies we see at this stage usually scale a half-built condition because everything else is working. The forming condition holds while the founders and best people are close to every deal, so it looks solid enough to press on. As volume rises, that condition becomes the ceiling, and the company adds headcount to compensate for a gap headcount cannot close. The result is a good company stuck one level below what it could be.',
  Built: 'The companies we see at this level usually relax. The system works, so attention drifts to the next initiative, and the disciplines that built the engine stop being actively maintained. Readiness erodes quietly: the buyer shifts, the positioning softens, the motion loosens, and no single failure announces it. By the time the numbers show it, the company is rebuilding a condition it thought it had banked.',
};

// Executive summary, per overall band, weaving the actual priority, strength, and
// total. Sets the frame: this is a diagnosis, and the work is to build.
export function execSummary({ band, priorityName, strongName, total, readyThrough, allBuilt }) {
  if (allBuilt) {
    return [
      'Every condition is built. Your responses describe a commercial engine that holds without depending on any single person: Commercial Truth on evidence, positioning that does real work, a motion the company owns and has matched to how buyers actually decide, and the ability to keep learning. This is a strong result, and it is a self-assessment, not a verdict.',
      'Companies that reach this level do not stop being at risk, they change the kind of risk they carry. Readiness erodes as a company grows and turns over: the buyer that was true at one stage shifts, the positioning that repelled the wrong customer softens under new pressure, and the motion that fit last year quietly stops fitting. The failure mode here is complacency, the belief that a system, once built, stays built.',
      'The work now is to keep the learning loop running so the engine compounds rather than decays. Test this profile against external evidence: real buyers, the pipeline, the forecast under absence. Your total is ' + total + ' out of 125. Treat the strength as a foundation to defend and extend, and point your sharpest condition, ' + strongName + ', at whatever erodes first. Build the engine. Do not be it.',
    ];
  }
  if (band === 'Absent') {
    return [
      'Your commercial engine is not yet built as a system. Read in sequence, the first condition that is not in place is ' + priorityName + ', and it is not merely weak, it is absent. That single fact shapes the whole profile, because the conditions below a gap cannot be trusted until the gap is closed. This is a clear starting point, not a verdict, and it is more useful than a comfortable score would have been.',
      'Companies here usually feel busy and stuck at the same time. Revenue may exist, and it comes from effort, founder energy, and relationships rather than a system, so growth costs more each quarter instead of less. The instinct is to add: another salesperson, more demand, a new tool. Each addition is individually sensible and scales the effort without designing the whole, which is exactly why companies at this stage plateau. The problem is not a lack of effort.',
      'The work is to build ' + priorityName + ' first, on evidence, and then the next condition, in order. Your total across the five conditions is ' + total + ' out of 125, and the number is the least important thing on this page. The order is what matters. A commercial engine is built by design, in sequence, not assembled out of order and hoped into place.',
    ];
  }
  if (band === 'Assumed') {
    return [
      'Your commercial engine is taking shape, and a condition high in the order still rests on assumption rather than evidence. Read in sequence, the first gap is ' + priorityName + ', currently Assumed: the company can describe it fluently, and that fluency is hiding how little of it has actually been proven. We demand evidence from product. This is the place the company is still accepting an assumption from commercial.',
      'Companies at this stage are often the most convinced they are ready. The team speaks about the customer, the positioning, or the motion with real conviction, and closes enough deals to reinforce the story. The trap is that conviction is not evidence, and a motion built on an assumed truth simply travels faster in the wrong direction. This is why companies here plateau just as they start to scale: they add people and spend against a foundation that has never been tested, and the returns quietly diminish.',
      'The classification matters because it tells you where leverage actually is. Strengthening anything below ' + priorityName + ' produces very little, because it rests on the assumption above it. The work is to replace that assumption with evidence, discipline by discipline, in order. Your strongest condition, ' + strongName + ', is a real asset, and the most valuable thing you can do with it is aim it at the first condition that is not yet built. Your total is ' + total + ' out of 125; the shape of the profile matters more than the sum.',
    ];
  }
  const held = readyThrough <= 0 ? 'The foundation is largely in place'
    : readyThrough === 1 ? 'The foundation holds through the first condition'
    : 'The foundation holds through the first ' + readyThrough + ' conditions';
  return [
    'Your commercial engine is largely in place. ' + held + ', then reaches ' + priorityName + ', which is forming but not yet built. This is a strong position, and it is not the finish line. A forming condition works when the right people are in the room and wobbles when they are not.',
    'Companies here are close enough to feel done and far enough that scaling now would lock the weakness in. Growth is real, the motion mostly runs, and the temptation is to press the accelerator. What tends to happen next is that the forming condition becomes the ceiling: as volume rises, the deals outside the familiar pattern expose it, and the system starts to depend on a few people to hold it together. That is how good companies plateau one level below their potential.',
    'This is the moment to convert a good motion into an engine the company owns. Close ' + priorityName + ', in order, and the conditions beneath it stop depending on individual judgment. Your total is ' + total + ' out of 125, and the shape matters more than the sum: built through the earlier conditions and forming on ' + priorityName + ' is a very different place than the total alone would suggest.',
  ];
}

// Commercial Constraints: synthesize the binding bottlenecks from the profile.
// Relational, not a re-listing of scores. Up to four, most binding first.
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
    out.push('The motion has not yet earned the right to scale. It runs, and it has not been validated against how the buyer actually decides, so scaling it would multiply the stalls.');
  }
  if (rank('adaptability') >= 3 && (notBuilt('commercialTruth') || byId.positioning.classification === 'Absent')) {
    out.push('Adaptability cannot compensate for a weak foundation above it. The company can learn, and it is learning on top of an unsettled truth, so it improves the wrong things faster.');
  }
  if (!out.length) {
    out.push('The binding constraint is the first condition that is not yet built. Until it is closed, the conditions beneath it cannot be trusted to hold under scale.');
  }
  return out.slice(0, 4);
}

// "If I walked into your company Monday morning" - the fractional CCO's first
// three weeks, tailored to the priority condition. A narrative of how the work
// would actually be done. Not a task list. This is what makes it tangible.
export const MONDAY = {
  commercialTruth: {
    week1: 'I would spend the first week on evidence, not opinions. I would sit in on live sales calls, listen back through recent wins and losses in the buyer’s own words, and read the last two quarters of closed and lost opportunities for the pattern in who actually controlled the budget. The point of week one is not to fix anything. It is to separate what the company knows from what it believes.',
    week2: 'In week two I would talk to your recent buyers directly, the ones who signed and the ones who walked, and compare the language they use to the language on your site and in your deck. Where those two diverge is exactly where Commercial Truth is missing. I would also map who really pulls out the budget, by role and authority, across your last set of deals.',
    week3: 'By week three I would write the Commercial Truth down where the company owns it, not where one person remembers it: who buys, why they buy, what opens the budget, and what evidence would disprove it. That document becomes the thing every later decision is checked against. Three weeks in, the company would be operating from evidence instead of instinct, and every downstream choice would inherit certainty rather than doubt.',
  },
  positioning: {
    week1: 'I would spend the first week testing how the market actually reads you. I would hand your positioning to people outside the company and see whether they can say, in a sentence, who it is for and who it is not for. I would listen to sales calls for the moment the rep has to re-explain what you are, because that moment is the positioning failing in real time.',
    week2: 'In week two I would gather the language your best-fit customers use to describe why you and not a competitor, and I would look hard at the deals you took that you should have turned away. Positioning is as much about who you refuse as who you attract, so I would find where the line has quietly moved under revenue pressure.',
    week3: 'By week three I would sharpen the promise to the point where the wrong buyer rejects it on sight, and make it read the same way to customers, investors, and the board. Three weeks in, the positioning would be doing work your sales team is currently doing by hand, and every conversation would start further along.',
  },
  repeatability: {
    week1: 'I would spend the first week finding out how much of the motion lives in one person’s head. I would look at recent closed deals and ask, honestly, how many could have closed without the founder or one key person in the room, and I would sit with your last commercial hire to learn whether they were handed a path or an apprenticeship.',
    week2: 'In week two I would pull the winning motion out into the open: the real sequence of a deal, the reasons you win and lose, the qualification that separates a genuine opportunity from a hopeful one. I would test whether a second person can carry a live deal end to end today, because that is the real measure of a system.',
    week3: 'By week three I would write the motion down as something a new person can run and get most of it right, and I would stress-test the forecast against a key absence. Three weeks in, winning would look less like a person and more like a process the company owns.',
  },
  fit: {
    week1: 'I would spend the first week going after the truth behind your stalls. I would review the deals that froze near the finish and get past the timing and budget labels to the risk underneath, and I would map the buyer’s real decision path, including every internal approval the current motion ignores.',
    week2: 'In week two I would name the specific late-stage risks that make your buyer hesitate and see how each one is handled today, usually by pushing harder rather than removing it. I would find everyone on the buyer’s side who has to say yes, and check whether your motion equips your champion to sell them when you are not in the room.',
    week3: 'By week three I would re-align the motion to the decision: the channel, the cycle, the people, and the price matched to how the buyer actually chooses. Three weeks in, effort would start landing where the decision is really made, and the stalls that felt like bad luck would turn out to be design.',
  },
  adaptability: {
    week1: 'I would spend the first week learning how the company actually changes. I would trace the last few meaningful shifts in how you sell and ask whether they came from evidence read early or from a crisis that left no choice. I would find where your best people’s hard-won judgment lives, and whether anyone else can reach it.',
    week2: 'In week two I would follow a single valuable insight from a recent deal and see what happened to it: whether it became shared capability or died in one inbox. That path, more than any deck, tells you whether the company learns as an organization or as a few individuals.',
    week3: 'By week three I would build the habit that makes learning institutional: a playbook held in pencil, revised on evidence, with a rhythm for turning what one person notices into something the whole company can use. Three weeks in, the engine would be improving on its own, not waiting for the person who usually notices first.',
  },
};

// Close every report by reconnecting the diagnosis to the method and creating the
// pull toward the work.
export const BUILDING_ENGINE = {
  lead: 'This is a diagnosis. Gain Advisory is about what comes after it.',
  body: 'A commercial engine is built by design, in order: Diagnose what is actually true, Design the architecture that fits it, Build the motion in the market where it can be tested, and Transfer what works into the organization so it survives any one person. This profile is Diagnose, drawn from twenty-five answers. The full diagnosis is drawn from your calls, your pipeline, your buyers, and your team, and it is where the engine actually gets built.',
  steps: [
    { k: 'Diagnose', d: 'Establish, on evidence, what is actually true about who buys and why. This profile is the first cut.' },
    { k: 'Design', d: 'Turn that truth into a Commercial Architecture: positioning, motion, pricing, and roles designed as one connected system.' },
    { k: 'Build', d: 'Run the motion in the market as a testable hypothesis, held in pencil, and let evidence correct it.' },
    { k: 'Transfer', d: 'Move the working system out of individual heads and into the company, so it compounds instead of depending on a person.' },
  ],
  close: 'Commercial by design, not by accident. Build the engine. Do not be it.',
};
