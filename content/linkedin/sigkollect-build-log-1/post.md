---
title: "SigKollect build log, part 1: what I'm building"
platform: linkedin
series: SigKollect build log
part: 1
companion_to: none
status: posted
posted_url: https://lnkd.in/p/ezU-pXxw
posted_date: 2026-11-26
---

# LinkedIn: SigKollect build log, part 1

Post with one image, `route-card.png` (this folder, 2160×2700, a 4:5 portrait). No first comment needed. Next in the series: part 2, the company brief. The image's source is `route-card.svg`; edit that and re-render, never the PNG:

```bash
cd content/linkedin/sigkollect-build-log-1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1080,1350 \
  --screenshot="$PWD/route-card.png" "file://$PWD/route-card.svg"
```

## Copy this

```text
I'm building a security programme for a company that doesn't exist, and I'll share the progress here every few days. SigKollect is a made-up payments firm in Lagos with about 150 staff, five security scares in 2026 and nobody in charge of security. I'm the consultant brought in to fix that, one lab at a time, and each lab feeds the next:

• GRC: a gap analysis, a governance charter, a risk appetite, and a risk register built on evidence
• Identity and access: roles, joiners, movers and leavers, access reviews, segregation of duties
• Application security: an AI email assistant, built to be attacked and then contained
• Later: cloud security on Azure, and a SOC that uses AI to read its alerts

Each post covers one decision and why I made it, including the ones the primary legal texts made me reverse. It started with a whole day spent choosing the name, which I wrote about in an earlier post. I'm calling this the SigKollect build log, and part 2 is the company brief: five invented security events, and why none of them pretends to be real client work.

#CyberSecurity #GRC #IdentityAndAccessManagement #ApplicationSecurity #SigKollectBuildLog
```

## Image alt text (LinkedIn: Add alt text)

```text
A dark green card headed "SigKollect build log, Part 1". The headline reads "One company. Every lab feeds the next." Under it: "A made-up payments firm in Lagos, about 150 staff, nobody in charge of security." A route line runs down the card with eight stops. The first, The name, an entire day, six names rejected, is filled in. The second, Company brief, five events, none found by a control, is circled in red and tagged Part 2. The other six follow on a dashed line: Gap analysis, 15 areas, 7 of them high; Governance pack, charter, RACI, appetite, regulators; Risk register, evidence to scored risks; Identity and access, joiners, movers, leavers, reviews; AI email assistant, attack it, then contain it; Cloud and SOC, Azure, and AI reading the alerts. Footer: "SigKollect is fictional. The documents and the decisions are real." Signed Lawal Oyinlola, IAM LAWAL LTD.
```

## Notes

- The series opener: it names the group ("SigKollect build log") near the close and ends on a teaser
  that part 2 must deliver by name: the company brief, and why no event pretends to be client work
  (D-27). Part 2 then promises part 3, the gap analysis and the security-lead row.
- A real list (four parallel phases), so bullets are right here.
- "Five security scares": E-5 is an unanswered question rather than an attack. "Scares" covers all
  five without calling each one an incident.
- Kept short on purpose (Lawal asked for very brief).
- 2026-11-26 Lawal's direction: open on the company brief as the first step, with a hint at the
  day spent naming it (the naming post went out on 2026-11-18; "in an earlier post" is a
  description, not a link, and does not go stale). Same day, Lawal moved the brief to its own
  post (part 2), so part 1 only hints at it and the gap analysis becomes part 3. `#LearningInPublic` removed; `#CyberSecurity` takes its place. "The ones I get
  wrong" became "the ones the primary legal texts made me reverse" (D-55, D-57: the Cybercrimes
  Act, CBN and PCI assumptions overturned).

## Related

- Earlier: [A whole day naming a company that doesn't exist](../a-day-naming-a-company/post.md)

## Claims

| Claim | Verified at |
| --- | --- |
| SigKollect: Lagos, payments, about 150 staff, nobody in charge of security | `labs_infra/sigkollect/brief.md` §1 and §2 (vacant security lead) |
| Five security events in 2026 | `labs_infra/sigkollect/brief.md` §3, E-1 to E-5 |
| The phases | `labs_infra/programme/prd.md` §5 and §8, `labs_infra/programme/plan.md` §3 (cloud and SOC later, D-21) |
| A whole day choosing the name, written about in an earlier post | `content/linkedin/a-day-naming-a-company/post.md` (posted 2026-11-18) |
| Primary legal texts reversed decisions | `labs_infra/programme/decisions.md` D-55, D-57; `labs/sigkollect-governance/analysis.md` key findings |
| Card: six names rejected | `content/linkedin/a-day-naming-a-company/post.md` ("Six names failed") |
| Card: gap analysis, 15 areas, 7 of them high | `labs_infra/lab1-governance/gap-analysis.md` rows 1 to 15 (H: rows 1, 2, 4, 5, 11, 13 and 14) |
| Card: the order of the stops (name, brief, gap analysis, governance pack, risk register, identity, AI assistant, cloud and SOC) | `labs_infra/programme/plan.md` §5 "Order of work" (name and brief, lab 1, lab 2, lab 3, the assistant, then cloud and the SOC) and §4 (the gap analysis is lab 1's first deliverable) |
| Card: the brief tagged Part 2 | This post's copy: "part 2 is the company brief" |
| No event pretends to be real client work | `labs_infra/programme/decisions.md` D-27 (option B) |
