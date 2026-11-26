---
title: "Security Governance From Nothing: A Ten-Document Pack for a Payments Company"
description: "Build the governance layer of a security programme for a fictional Lagos payments company: a gap analysis, a charter, a RACI, a risk appetite, a framework choice, a meeting cadence, KPIs, an AI use policy and a regulatory assessment read against the primary texts, then publish it as one versioned pack."
date: 2026-11-25
updated: 2026-11-26
cover: /images/labs/security-governance-from-nothing/coverimage.png
coverAlt: "Two pages from the governance pack, framed on a deep green background and outlined in cream. On the left, the pack's cover: SigKollect Limited, Information Security Governance Pack, a worn red stamp reading Fictional, lab exercise, and a document control table for version 1.0, 25 November 2026, issued for approval, prepared by Lawal Oyinlola of IAM LAWAL Ltd. Overlapping its lower right is page 14 of 43, the RACI matrix: twenty security activities against twelve roles, each row with one A, and below it the note on who accepts a risk within the appetite."
tags: [grc, governance, risk-appetite, nist-csf, cis-controls, ndpa, gdpr, pci-dss]
platform: "Self-hosted"
target: "A fictional payments company (SigKollect)"
difficulty: "Medium"
os: "N/A"
categories: [grc, governance, compliance]
tools: ["NIST CSF 2.0", "CIS Controls v8.1", "ISO/IEC 27001", Markdown, Python, "Headless Chrome"]
cves: []
skills: [gap-analysis, raci, risk-appetite, framework-selection, kpis, regulatory-scoping]
status: own-lab
series: "GRC labs · The SigKollect programme"
order: 0
draft: true
---

> **⚠️ A lab, not legal advice.** SigKollect, its people, its figures and its history are invented,
> and so is the consulting engagement. Nothing here is client work. The regulatory module reads real
> laws, but it is an analysis for a lab: it does not tell a real company what applies to it, and
> nothing in the pack claims compliance. Where a real company would need a lawyer, the lab says so.

SigKollect is a payments company in Lagos with about 150 people and merchants in Nigeria and the EU.
In 2026 it had five security events: a forgotten server, a five-week patch, probes on its payment
page, a phishing click and a customer question nobody could answer. Every one of them was found by
chance. None was found by a control. Then a large EU merchant sent a security questionnaire before
signing, and the founders could not answer most of it.

That is the situation most small companies are in when someone first asks them about security. They
have engineers and some tools, but nobody owns security, nobody has decided how much risk is
acceptable, and nobody knows which laws reach them. Buying another scanner does not fix that. What is
missing is governance: who decides, on what authority, against which standard, how often, and how
anyone will know it is working.

In this lab you build that layer from nothing, as ten documents that each depend on the ones before.
You finish with a versioned pack that a board could approve and a customer could read. I built it as
an external consultant from my own company, IAM ⅃AWA⅃ Ltd, and I made plenty of mistakes on the way.
They are in here too, at the step where each one happened, because they are the most useful part.

## What you are building

| # | Document | The question it answers |
|---|---|---|
| 0 | Company context | Who is this company, and what has already gone wrong? |
| 1 | Gap analysis | What governance is missing today, and what comes first? |
| 2 | Charter | Who authorises the programme, who runs it, and what must it achieve by when? |
| 3 | RACI matrix | Who does each security activity, who owns it, and who is asked or told? |
| 4 | Risk appetite | How much risk will the company accept, of which kind, and who may accept it? |
| 5 | Framework selection | Which standard does the programme follow, and why that one? |
| 6 | Governance cadence | Which meetings take which decisions, and what cannot wait for a meeting? |
| 7 | KPIs | How will anyone know the programme is working? |
| 8 | AI use policy | What may staff do with AI tools, and with which data? |
| 9 | Regulatory applicability | Which laws and standards actually apply? |

The order matters. Evidence comes first, because a gap with no evidence is an opinion. Authority
comes next, because a RACI with no charter behind it is a list of suggestions. Then the limits (the
appetite), the yardstick (the framework), the rhythm (the cadence) and the measures. The AI policy
and the regulatory assessment come last because they apply everything before them.

You need a text editor and a way to write tables. I wrote everything in Markdown so the documents
could live in Git, be reviewed as diffs, and be built into a PDF at the end (module 11). A
spreadsheet works for the scoring steps.

## 1. Write the company brief

**Goal:** one invented company, described well enough that every later document can cite it.

A single company beats ten unrelated exercises. When the pentest lab's forgotten server becomes
SigKollect's event E-1, a finding in one lab turns into a risk in the next, and the whole programme
reads as one story instead of a stack of worksheets.

Write these sections:

- **Profile:** legal name, size, location, customers, products, cloud, revenue. Mark any figure you
  derived for the scenario as invented. SigKollect's revenue of about $6 million on about $500
  million processed is a scenario figure, not a sourced one.
- **People:** a table of names, roles, who reports to whom and team sizes. Leave the security lead
  as *vacant*. The governance work is what creates that role.
- **Data held:** what data, whose, and any note that changes the risk. SigKollect holds card data
  through a processor, Nigerian identity numbers (BVN, NIN) and bank details for payouts.
- **Security state:** what exists today, honestly. No security lead, no written policies, no access
  reviews, no incident plan.
- **Events:** each with a date, what happened and what it revealed.

| # | Event | What it revealed |
|---|---|---|
| E-1 | A legacy reporting server, left running after the Azure move, on an unsupported OS. Nobody knew who owned it | No asset inventory, no system owners |
| E-2 | A critical framework fix took five weeks to reach production | No dependency scanning, no patching target |
| E-3 | SQL injection probes against the payment-link page, seen by chance. Logs kept 14 days | No WAF, no alerting, short log retention |
| E-4 | A support agent entered a password on a phishing page. The support tool had no MFA | No MFA, no training, no incident plan |
| E-5 | The EU merchant asked how a brute-force attack would be detected. Nobody could answer | No central logging, no detection rules |

Each of these is backed by a lab I had already published: the pentest, the CI/CD pipeline, the WAF,
the phishing bridge and the Wazuh detection lab. That is the point of building the company around
your own evidence. When the charter later says "E-4 showed one stolen password is enough", the
reader can go and watch it happen.

**Checkpoint:** every event names what it revealed, and you can say for each one how it was found.
If none was found by a control, you have your opening argument.

## 2. Run the gap analysis

**Goal:** a table of what governance is missing, each gap backed by evidence and given a priority.

List the governance areas a programme needs, then describe the current state of each one at your
company. I used fifteen: charter, security lead, a GRC function, policies, risk appetite, steering
committee, framework, board reporting, the three lines model, KPIs, access reviews, awareness
training, incident response, asset inventory and supplier risk.

| # | Area | Current state | Gap | Priority | Why this priority | Evidence |
|---|---|---|---|---|---|---|
| | | | | H / M / L | | Event or profile section |

Three rules keep the table honest:

1. **Record what exists today, not what has been approved.** My first draft marked "security lead"
   as no gap, because the founders had approved the role. An approved hire is a plan, not a control.
   Nobody held the job, so it is a gap, and a high one.
2. **Every row cites evidence.** "Access reviews: none ever" cites the people section, where access
   is granted on request in Slack and IT is not always told about leavers, and E-4, which showed that
   one stolen password is enough.
3. **Keep control gaps out.** No MFA, no dependency scanning and no central logging are real
   problems, but they are controls, not governance. Put them on a separate list for the risk
   register (the next lab in this series). A gap analysis that mixes the two ends up arguing about
   firewalls instead of ownership.

Give the priority a reason, especially where you rate something lower than it feels. The three lines
model at SigKollect is a real gap, but the missing second line is already the security lead row.
Rating it high as well counts the same gap twice.

SigKollect came out with seven high gaps, led by the charter and the security lead, then incident
response, the asset inventory, access reviews, policies and the risk appetite.

**Checkpoint:** every row has evidence, and you can name your top three with a reason for the order.
Mine were the security lead and charter together (accountability first), then the incident response
plan (three reporting clocks may apply, module 10), then the asset inventory (E-1).

## 3. Write the charter

**Goal:** a document that gives the programme authority, an owner, a scope and dated objectives.

The charter is the document everything else points back to. Write these sections:

1. **Purpose:** one paragraph on why the programme exists, citing the events and the trigger.
2. **Scope:** what is in (systems, data, people, suppliers) and what is out.
3. **Authority:** who authorises it (the board), who sponsors and funds it (the CEO), who runs it
   (the security lead), and the reporting line.
4. **Objectives:** each with a measure, a target date and the gap it closes.
5. **Roles:** one line per role, from the board to all staff.
6. **Principles:** a short list the rest of the pack can cite.
7. **Review:** when the charter is reviewed, and what triggers an early review.

The reporting line is the decision worth arguing about. SigKollect's security lead reports to the
CEO, not the CTO, with a direct line to the board. The CTO owns delivery, and security has to be able
to raise a risk in the CTO's area without passing it through the CTO. Add a way to escalate when the
executive team cannot resolve something: at SigKollect, the security lead can go directly to the
investor-appointed director.

![SigKollect's governance structure. The board of directors approves the charter and the risk appetite. The CEO, the executive sponsor, reports to the board and chairs a monthly steering committee. The security lead reports to the CEO and has a dashed direct line to the board for the quarterly report and escalation to the investor-appointed director. Below sit the three lines of defence: the first line owns the risk (CTO and Head of Engineering, IT, system and data owners, all staff), the second line oversees and challenges (the security lead, the Head of Compliance who is also the data protection officer, the monthly risk review), and the third line is an external review once a year.](/images/labs/security-governance-from-nothing/governance-structure.svg)

Objectives need a measure and a date, or nobody can tell whether they were met:

| # | Objective | Measure | Target date | Gap it closes |
|---|---|---|---|---|
| a | Appoint a security lead | Role filled, reporting line as in section 3 | 30 April 2027 | Row 2 |
| b | Build an asset inventory | Every Azure subscription, SaaS tool and server listed, each with a named owner | 31 March 2027 | Row 14, E-1 |
| g | Answer the EU merchant's questionnaire | Every answer backed by evidence, or stated as a known gap with a date | 28 February 2027 | The trigger |

SigKollect has eight objectives, a to h, between 28 February and 30 April 2027. Objective h (register
with the data protection regulator and designate a data protection officer) did not exist in the
first version. Module 10 found the duty and added it. A charter that cannot change when you learn
something is a worse charter.

One principle matters more than the others: **risk is accepted on purpose.** Only a person with the
authority can accept a risk, the acceptance is written down, and above the appetite only the board
can accept it. Modules 4 and 5 lean on that sentence.

**Checkpoint:** every objective has a measure, a date and a gap from module 2, and every high gap is
closed by at least one objective.

## 4. Build the RACI

**Goal:** a matrix of security activities against roles, with exactly one owner per activity.

| Letter | Meaning | Question to ask |
|---|---|---|
| **R**, Responsible | Does the work | Whose hands are on it? |
| **A**, Accountable | Owns the outcome and signs it off | Who answers for it if it goes wrong? |
| **C**, Consulted | Gives input **before** the work is done | Whose opinion is needed first? |
| **I**, Informed | Is told **after** it is done | Who needs to know the result? |

Write the rules down before you fill in a letter:

1. Exactly one A in each row. Two A's means nobody is accountable.
2. At least one R in each row.
3. One person can be both (`A/R`).
4. Blank cells are fine.
5. Segregation of duties: the person who does something is not the only one who checks or approves it.

Then list the activities. SigKollect has twenty, from approving the charter and the appetite to
patching, incident response, the two regulator reports and answering customer questionnaires,
across twelve roles.

| # | Activity | Board | CEO | SC | SL | CTO | IT | HoP | HoC | SO |
|---|---|---|---|---|---|---|---|---|---|---|
| 10a | Tell IT about a leaver on their last day | | | | | | I | A/R | | |
| 10b | Remove a leaver's access | | | | I | | A/R | | | I |
| 14 | Report a personal data breach to regulators | | C | | C | | | | A/R | C |

Row 10 was mine to get wrong. I first made the Head of People accountable for removing leavers'
access. They start the leaver process, but they have no authority over systems, so they cannot be
accountable for what happens inside them. The fix was to split the row: People is accountable for
telling IT on the day, and IT is accountable for removing the access.

Two rows needed notes once the rest of the pack existed. Row 4, accepting a risk within the appetite,
cannot name one role, because the risk appetite (module 5) names a different approver for each
category. So the A is "the approver the risk appetite names", the system owner prepares and records
the acceptance, and nobody approves an acceptance they prepared themselves. Row 10b needed an
independent check, and a check that comes after the work is not a C. That check became a KPI
(module 8).

**Checkpoint:** read every row against the five rules, then against the charter's roles. If any row
lets someone approve their own work, or has an A the charter does not give authority to, fix it.

## 5. Set the risk appetite

**Goal:** a statement, per category of risk, of how much the company will accept, written as
something you can measure.

Start with a scale and fix its direction before you use it:

| Appetite | Treat if score above | What it means |
|---|---|---|
| Averse | 4 | Only low risks may stay |
| Minimal | 6 | Low risks and the lowest medium risks may stay |
| Cautious | 9 | Medium risks may stay. High and critical risks are treated |
| Open | 12 | Most high risks are treated. Some may stay for a clear reward |
| Eager | 14 | Critical risks are always treated or taken to the board |

The scores are likelihood times impact, each from 1 to 5, which is how the risk register in the next
lab will score risks.

For each category, write five things:

| Category | Appetite | Statement | Tolerance | Who may accept |
|---|---|---|---|---|
| Customer and merchant data (identity, bank, card data) | Averse | No known exposure is accepted. Only the smallest residual risks may stay while the controls work | Zero confirmed exposures. MFA for every user of systems holding this data. Every suspected exposure reaches the security lead within 1 hour | The CEO only |

The tolerance is the part that matters. "We take data protection seriously" cannot be measured. "Zero
confirmed exposures, MFA for every user, one hour to the security lead" can, and module 8 measures it.

I read the scale backwards the first time and rated customer data **Eager**, as in eager to protect
it. Eager means eager to accept risk. For a payments company holding identity and bank data, it is
the opposite of what I meant. If you take one thing from this module, check which end of the scale
means "less risk accepted" before you place anything on it.

Two rules make the appetite usable:

- **When a risk fits two categories, the lower appetite wins.** A new AI feature is a technology risk
  (Open), but an AI feature that reads customer data is also a customer data risk (Averse). It is
  handled as Averse.
- **"Zero" is about the outcome, the threshold is about the risk.** Customer data has a tolerance of
  zero confirmed exposures and a threshold of 4, not 0. No system that holds data has zero risk. The
  threshold says only the smallest risks may remain while the controls do their job.

![SigKollect's seven risk categories on the appetite scale, from Averse to Eager, with the score above which each level must treat a risk: 4, 6, 9, 12 and 14. Customer data and legal compliance sit at Averse. Availability, financial loss, suppliers and reputation sit at Minimal. Technology change including AI sits at Open. Nothing sits at Cautious or Eager. A dashed arrow from Open back to Averse shows the rule that when a risk fits two categories, the lower appetite wins, so an AI feature that reads customer data is handled under customer data.](/images/labs/security-governance-from-nothing/risk-appetite-scale.svg)

**Checkpoint:** every category has a tolerance you could put a number on, and an approver who is not
the person who would prepare the acceptance.

## 6. Choose the framework

**Goal:** a framework chosen by scoring it against the company's situation, with the reasoning
written down.

First, separate three things people mix up. Laws and regulations are mandatory (the NDPA, the GDPR).
Contractual standards are mandatory once signed (PCI DSS, through the card processor). Frameworks
are the choice: a model to build and measure the programme against. The framework does not replace
the laws. It is how you meet them.

SigKollect's candidates were ISO/IEC 27001:2022, the NIST Cybersecurity Framework 2.0 and the CIS
Critical Security Controls v8.1. Score them with a weighted matrix:

1. Write the criteria from the company's situation, not from the frameworks' brochures.
2. Give each criterion a weight from 1 (nice to have) to 3 (essential).
3. **Fix the direction of every criterion before scoring.** On cost and effort, the cheaper and
   lighter framework fits better, so it scores higher.
4. Score each framework from 1 to 3 per criterion, multiply by the weight, and add up.

| # | Criterion | Weight | ISO 27001 | NIST CSF 2.0 | CIS Controls |
|---|---|---|---|---|---|
| 1 | Answers the EU merchant's questionnaire | 3 | 3 | 2 | 2 |
| 2 | Can be certified | 2 | 3 | 1 | 1 |
| 3 | Cost | 2 | 1 | 3 | 3 |
| 4 | Effort to start | 3 | 1 | 2 | 3 |
| 5 | Covers governance and risk | 3 | 3 | 2 | 1 |
| 6 | Gives engineers concrete controls | 2 | 2 | 1 | 3 |
| 7 | Helps with Nigerian rules | 1 | 2 | 2 | 2 |
| 8 | Fits the charter's 2027 targets | 3 | 2 | 3 | 2 |
| | **Weighted total** | | **41** | **39** | **40** |

My first attempt gave every criterion a weight of 3, which is the same as having no weights, and
scored cost and effort the wrong way round, so the expensive, heavy framework scored highest on cost.
That version gave ISO 27001 an 18-point lead (63, 45 and 42). Fixing both mistakes turned it into a
near tie.

A near tie means the totals do not decide, so **write the tie-breaker down before you look at which
framework it favours.** SigKollect's was its situation: no security budget and no security lead until
April 2027, so ease of starting and completing the work comes before certification. The decision:

| Role | Framework | Its job |
|---|---|---|
| Primary | NIST CSF 2.0 | Structures the programme and the questionnaire answers |
| Technical baseline | CIS Controls v8.1, Implementation Group 1 | Tells engineers how to close the gaps behind E-1 to E-5 |
| Later target | ISO/IEC 27001:2022 | Certification, once the programme has run under a security lead |

Write down what you rejected and why, and when you would revisit. ISO 27001 now had the highest
total, but a certificate proves a management system that has run for a while, and today SigKollect
would only be certifying paperwork. Revisit when the security lead is in post, or when a key customer
makes a certificate a contract condition.

**Checkpoint:** someone who disagrees with your choice can see exactly which weight or score they
disagree with.

## 7. Set the governance cadence

**Goal:** a calendar of meetings, each defined by the decisions it takes, and a list of what cannot
wait for a meeting.

The rule I used: **every meeting takes decisions. A meeting that only shares information is an
email.** For each meeting, write the chair, the members, how often, what it decides (with the RACI
row it carries out), its inputs and the record it keeps.

| Meeting | How often | What it decides |
|---|---|---|
| Board (security item) | Quarterly | Approves the charter and the appetite. Accepts or refuses risks above the appetite |
| Security steering committee | Monthly | Approves policies. Sets priorities. Tracks objectives a to h. Advises the board on the appetite |
| Risk review | Monthly, a week before the committee | Scores new risks, assigns owners, sends risks above the appetite up |
| Incident review | Within 5 working days of a significant incident | Root cause, actions with owners and dates, register and policy changes |

My review caught two problems here. The risk review and the steering committee were deciding the
same things, so one of them had no reason to exist. And the cadence said the steering committee
"approves" the appetite while the RACI said it was only consulted. The fix went the RACI's way: the
committee advises and the board decides.

Then the board report. SigKollect's board has three directors and about fifteen minutes for security,
so the report is five slides, sent five working days ahead, with a written colour rule (green: on
track; amber: up to a month late or close to the limit; red: more than a month late or outside the
appetite). The security lead presents it, with the CEO present, which keeps the charter's direct line
to the board real.

Finally, what cannot wait. Measure "within" from the moment someone first knows:

| Event | Who is told | Within |
|---|---|---|
| Suspected personal data breach | 1. Security lead. 2. CEO and Head of Compliance | 1 hour, then 4 hours |
| Suspected cyber incident | 1. Security lead. 2. CEO | 1 hour, then 4 hours |
| Risk found outside the appetite | 1. CEO. 2. Board chair | 1 working day, then 5 working days |

My first version had the CEO hearing about a data breach "within 72 hours". That is the regulator's
deadline, not an internal step, and it would have left no time at all to decide anything. The
internal steps now take at most 4 hours, and each regulator notification has its own decision and
sending limits, worked out in module 10.

![The 72-hour clock. Someone notices at hour 0 and reports at once, without blame. The security lead is told within 1 hour. The CEO and Head of Compliance are told within 4 hours. Then a band for assessing the risk, containing it and deciding who must be told. Regulator limits fall at 72 hours for the NDPC under NDPA section 40(2), the EU supervisory authority under GDPR Article 33(1), and ngCERT through the sector CERT under the Cybercrimes Act section 21, which must be told immediately. If the risk to people is high, they are told immediately under NDPA section 40(3). Every clock starts when SigKollect becomes aware of, or detects, the event.](/images/labs/security-governance-from-nothing/breach-clock.svg)

**Checkpoint:** every A that the board or the steering committee holds in the RACI has a meeting that
takes it, and no internal step uses a regulator's deadline as its own.

## 8. Choose the KPIs

**Goal:** a short list of measures, each with a target, a source, an owner and the meeting that
reads it.

Know the difference first. A **KPI** (key performance indicator) measures progress towards a goal:
policies approved, suppliers assessed. A **KRI** (key risk indicator) warns that a risk is growing:
users without MFA on customer data, notifications sent late. A programme needs both.

| # | Measure | How it is calculated | Target | Type | Owner | Seen by |
|---|---|---|---|---|---|---|
| 1 | Charter objectives on track | Objectives a to h that are green ÷ 8 | 8 of 8 by 30 April 2027 | KPI | Security lead | Committee monthly, board quarterly |
| 6 | MFA on systems with customer data | Users with MFA ÷ all users of those systems | 100% | KRI | IT | Risk review monthly, board quarterly |

SigKollect has fourteen measures, mapped to the CSF functions, and the board sees five of them: is
the programme on track, is any risk waiting for us, is customer data protected, are we meeting the
law, and are customers getting answers.

Write the rules for the measures too. Each measure has one owner. A measure that misses for two
months in a row goes to the committee as a decision, not an update. A KRI past its tolerance is a
risk outside the appetite and follows the cadence. A number with no source is not reported.

The mistakes in this module were all loopholes:

- **My first training rule** gave new joiners an exception if they had assigned work in their first
  month. Every new joiner has assigned work, so the exception covered everyone. The fix: a short
  essentials module before they touch customer data, with no exceptions, and the full course within
  two months.
- **The patching clock** started "when the vulnerability is found or a fix is published, whichever is
  later". For a vulnerability under active attack with no fix, that clock never starts. Now an
  actively exploited one gets 72 hours from discovery, fix or no fix, and goes to the CEO if neither
  a fix nor an approved workaround is in place.
- **The leaver measure** first compared the leaver list with IT tickets, which proves a ticket
  exists, not that access is gone. It now counts a removal only when a timestamped record, in every
  system where the leaver had an account, shows it happened by the deadline. And it only counts
  leavers whose deadline has passed, so someone who left yesterday does not drag the number down.

Leave out what you cannot measure yet. SigKollect has no Detect measure, because it cannot detect
anything today (E-5). A measure with no way to collect it would show red in every report and tell
the board nothing new. Write down when it will be added.

**Checkpoint:** for every measure, you can name the system the number comes from. If you cannot, the
measure is a wish.

## 9. Write the AI use policy

**Goal:** a policy that lets staff use AI tools without sending the wrong data to the wrong place.

The policy cannot work without data classes, and SigKollect has none yet, so the policy defines four
until the information security policy replaces them:

| Class | Examples | Allowed in |
|---|---|---|
| Restricted | Card data, BVN, NIN, bank details, secrets, security logs | Only a SigKollect-controlled deployment approved for Restricted data |
| Confidential | Customer records other than identity, bank and card data, staff records, contracts, source code | Approved tools whose register entry allows it |
| Internal | Internal documents and notes with no customer or staff data | Approved tools |
| Public | Published content | Any tool |

Then the rules that matter:

1. **Start from suppliers you have already assessed.** SigKollect begins with the AI features of
   Google Workspace, GitHub and Azure, but each feature is still assessed, because an AI feature can
   have different data terms from the product it sits in.
2. **A named approval path.** The security lead assesses, the CTO approves (the appetite's
   technology row), and the CEO approves if the tool will receive Restricted data. Restricted is
   exactly the identity, bank and card data that the appetite's customer data row covers, so the
   row's approver approves the tool. This is the appetite from module 5 doing its job.
3. **A person is responsible for every output,** and AI does not make a final decision about a
   person without human review. The NDPA (section 37) gives people the right not to be subject to a
   decision based solely on automated processing with significant effects.
4. **A second reviewer** for AI-written code that touches payments, authentication, access control,
   cryptography or customer data.
5. **No AI system combines private data, untrusted content and a way to send data out**, unless a
   person approves each outgoing action. Simon Willison calls that combination the lethal trifecta,
   and it is how prompt injection turns into data theft.

**Checkpoint:** pick a real AI tool your team uses and run it through your approval path. If you
cannot say which data class it may receive and who approved it, the policy is not finished.

## 10. Check which laws apply

**Goal:** a table of the laws and standards that may apply, each with a result, a confidence level,
a source type and a review date, checked against the primary text.

Answer the jurisdiction questions before you read a single law: where is the company incorporated,
where do the people whose data it holds live, is it B2C or B2B, and how is it distributed?
SigKollect is incorporated in Nigeria and holds data on people in Nigeria and the EU, so US and UK
rules are out before you start.

Then read each rule's own text, not a summary of it. Use a law-firm summary only where you cannot find
the primary text, and label the row as secondary.

| # | Rule | Result | Confidence |
|---|---|---|---|
| R-1 | Nigeria Data Protection Act 2023 and the GAID 2025 | Applies. A data controller of major importance at the highest level | High |
| R-2 | CBN Risk-Based Cybersecurity Framework 2024 | Unclear. It covers banks only | Medium |
| R-3 | Cybercrimes Act 2015, amended 2024, section 21 | Applies. Report to ngCERT immediately | High |
| R-4 | EU GDPR | Likely applies (Article 3(2)), with an EU representative (Article 27) | Medium |
| R-5 | PCI DSS v4.0.1 | Applies by contract, as a service provider | Medium |
| R-6 | EU DORA | Not applicable | Medium |
| R-7 | EU AI Act | Out of scope for this phase (a programme decision) | n/a |

The primary texts overturned three of my first assumptions:

- **The CBN framework.** I assumed the Central Bank's 2024 cybersecurity framework covered payment
  companies. Its own scope covers commercial, merchant, non-interest and payment service banks. It
  replaced a 2018 framework that did name payment service providers, so what covers SigKollect now
  is genuinely unclear, and the pack says so instead of guessing.
- **PCI DSS.** A payment gateway is a PCI service provider, not a merchant. The PCI Council says SAQ
  D for Service Providers is the only self-assessment questionnaire for service providers, so the
  merchant questionnaires were never an option.
- **The Cybercrimes Act.** Summaries said "report within 72 hours" and disagreed on when the clock
  starts. The official text, which I found in WIPO Lex after the government site would not load,
  has two duties: section 21(1) says report to ngCERT **immediately**, now through the sectoral CERT
  or security operations centre, and section 21(3), as amended in 2024, makes it an offence not to
  report within 72 hours **of detection**. The 72 hours is a backstop, not a deadline to plan to. A
  code review on the published case study questioned this row, and the primary text settled it.

The NDPA result changed the charter. The data regulator's 2025 directive names payment gateway
service providers and fintechs at its highest level, which brings registration, a data protection
officer and yearly audit returns. That became objective h, and the Head of Compliance became the
data protection officer.

Then work through one real event as a test. At E-4, the phishing click, three clocks could have
started at once:

| Notification | Decided by | Sent by |
|---|---|---|
| ngCERT, through the sectoral CERT | As soon as a detected incident meets the section 21(1) test, without waiting for the investigation | Immediately. 24 hours after detection is the outer limit |
| NDPC, and the EU authority where SigKollect is the controller | Without undue delay, within 24 hours of being told at most | Without undue delay, and within 48 hours at most, with what is known first and the rest in phases (NDPA section 40(9), GDPR Article 33(4)) |
| NDPC and every other relevant authority (GAID Article 33(4)) | As soon as immediate information may help contain imminent breaches on a national scale, containment measures may be necessary at national, sectoral or individual level, or the breach may affect members of the general public. No finding of risk to individuals is needed first | Immediately |
| The controller that engaged SigKollect (GDPR Article 33(2)), or under the NDPA the controller or processor that engaged it (section 40(1)), where SigKollect is a processor | No separate decision: the notice is owed as soon as SigKollect becomes aware of a breach in data it processes for them | At once on becoming aware, with what is known. New information goes as soon as it is available, without waiting to be asked, and their requests are answered. 48 hours is the outer limit, not the deadline |
| Affected people | For a breach reportable to the NDPC, the clock starts when SigKollect becomes aware of the breach, not when the assessment ends (GAID Article 33(3), read with NDPA section 40(2)). Otherwise, as soon as the risk to them is judged high (NDPA section 40(3)) | Immediately |

**Checkpoint:** every row says where its answer came from, how sure you are, and when it will be
checked again. Any row that needs a lawyer says which kind.

## 11. Build the pack

**Goal:** the ten documents as one versioned PDF and an editable DOCX, built from the Markdown so the
two can never drift apart.

Working files collect templates, hints and review notes. Keep them, but copy each finished document
into a separate `final/` folder with the working material removed. The finals are what you build
from.

Then build the pack with one script. Mine is a short Python script with no dependencies that:

1. converts each final from Markdown to HTML (tables, lists, figures inlined as SVG);
2. adds a cover with a document control table, a "fictional, lab exercise" stamp and a document
   register;
3. prints the HTML to PDF with headless Chrome;
4. writes the DOCX with macOS `textutil`, replacing each figure with a note that it is in the PDF.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --no-pdf-header-footer --print-to-pdf="pack.pdf" "file://$PWD/pack.html"
```

CSS paged media does the rest. `@page` margin boxes put the page numbers and a "fictional company"
marker on every page, and a named page (`@page wide { size: A4 landscape; }`) turns the pages with
wide tables sideways while the rest stay portrait.

Before publishing, check what the files carry besides the text: the PDF and DOCX metadata (author,
paths, usernames), a secrets scan on the repository, and a search for any internal reference that
should not leave your workspace.

**Checkpoint:** change one sentence in a final, run the script, and see it in both the PDF and the
DOCX. If you have to edit the PDF by hand, the pack will drift.

## What this does not cover

The pack is a design. It has not been run: no meeting has met, and no KPI has a baseline. The control
gaps from module 2 are not fixed here; they go to the risk register. The regulatory module is an
analysis for a lab, and two of its questions (what now covers a payment company under the CBN, and
whether SigKollect is a controller or a processor for each EU data set) would need a Nigerian payments
lawyer and an EU data protection lawyer. The sectoral CERT that takes a payment company's reports is
not checked against a primary source.

## Lab status

This is lab 1 of the SigKollect programme. The risk register (lab 2) takes the control gaps from
module 2 and the events from module 1 and scores them against the appetite from module 5. Identity
and access with Keycloak (lab 3) builds the joiner, mover and leaver process that the RACI and the
leaver measure describe.

## Where this sits

The full pack, the ten documents as Markdown and a case study of this lab are in my
[cybersecurity portfolio](https://github.com/lawalOyinlola/cybersecurity-portfolio/tree/main/labs/sigkollect-governance).
For a different kind of GRC work, the
[HanTech security assessment](https://github.com/lawalOyinlola/cybersecurity-portfolio/tree/main/labs/hantech-security-assessment)
takes scanner findings on a legacy server to a risk-rated report, controls and policies: the
assessor's side of the same kind of programme.
