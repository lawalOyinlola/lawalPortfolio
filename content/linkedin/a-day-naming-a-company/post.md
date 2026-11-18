---
title: "A whole day naming a company that doesn't exist"
platform: linkedin
companion_to: none yet
status: posted
posted_url: https://lnkd.in/p/eVui6bqH
posted_date: 2026-11-18
---

# LinkedIn: A whole day naming a company that doesn't exist

Post with one image, `name-check.png` (this folder, 2160×2700, a 4:5 portrait). Add the first
comment straight after posting. The image's source is `name-check.svg`; edit that and re-render,
never the PNG:

```bash
cd content/linkedin/a-day-naming-a-company
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1080,1350 \
  --screenshot="$PWD/name-check.png" "file://$PWD/name-check.svg"
```

## Copy this

```text
I spent an entire day choosing a name for a company that doesn't exist. For a LAB.

That sounds like procrastination with extra steps, so here is why. Over the past few months I've published six security labs and built a portfolio of case studies across GRC, SOC work and ethical hacking. Each one taught me something, and each one lived alone. The pentest lab rooted a box on an operating system long out of support. The detection lab caught those same attacks in a SIEM, and the phishing lab caught a click. In a real company, all three findings would land on the same desk and become entries in one risk register, each with an owner, a control and a retest. In my portfolio they sat on separate pages that never spoke to each other.

So the next labs all happen to one company. SigKollect is a made-up payments company in Lagos with no security lead, no policies and no access reviews yet. Its governance, its risk register, its identity management and the AI assistant it wants to build are all labs now, and a finding in one becomes a risk in the next. Most labs end at "screenshot taken, VM deleted". I wanted this one to be worth keeping.

Once it's a company, the name matters. The first one I tried came from a GRC course case study, and a real fintech has almost the same name. The next belonged to a real UK company. Six names failed before SigKollect cleared a web search, the company registers in Nigeria, Ireland and the UK, a domain lookup and the EU trademark database.

A fictional company that shares its name with a real one isn't fiction. It's an accusation with a disclaimer.

None of the new labs exist yet, so this proves nothing about the building. It does show a habit worth keeping: check the boring thing before it becomes the expensive thing.

A lab that ends at the screenshot proves you followed the steps. A lab that feeds the next one shows you know WHY the steps exist.

#CyberSecurity #GRC #SOC #EthicalHacking #LearningInPublic
```

## First comment

```text
View my security labs: https://lawaloyinlola.com/security/labs
Case studies: https://github.com/lawalOyinlola/cybersecurity-portfolio
```

## Image alt text (LinkedIn: Add alt text)

```text
A cream form titled "Name check", with "Time taken: an entire day" in the corner. The proposed name is SigKollect, "a payments company in Lagos. It does not exist", and a green stamp reads "No match found". Six searches are listed, each marked in green: web search, no match; company register Nigeria, no match; company register Ireland, no match; company register UK, no match; domain lookup (.com), unregistered; EU trademark database, no match. Under "Names rejected before this one" are six blacked-out names, each struck through in red. At the foot: "A fictional company that shares its name with a real one isn't fiction. It's an accusation with a disclaimer."
```

## Notes

- Lawal's direction (2026-11-17): the day spent on a name, why a lab is worth that effort, the
  portfolio so far, links in the comment.
- Application security is left out on purpose, so it can carry a follow-up post (Litir Triage,
  the AI assistant built to be attacked). The CI/CD and WAF labs are AppSec and are published, so
  adding "and application security" to the niche list is a one-word change if Lawal wants it.
- The AI-agent angle (satnav versus driving instructor, the decision log, the changed
  recommendation) is held for a separate post.
- Load-bearing lines: "It's an accusation with a disclaimer" (wit, and the real reason the name
  check matters), set as its own paragraph for emphasis, and the two-line close.
- Emphasis (revision 2, Lawal's request): CAPS on "LAB" in the hook and "WHY" in the close, one
  quote ("screenshot taken, VM deleted"), and one stand-alone paragraph. Kept rare so each lands.
- Revision 2 also removed "the habit I want to be hired for" (read as an advert) and the "linked in
  the first comment" line. The comment now opens with "View my security labs".
- Held back: the course and its case-study company name, and the names of the real companies.
- Image: the six rejected names are blacked out, because the post does not name the real companies.
  The bars are all the same width, so they do not hint at any name's length.

## Claims

| Claim | Verified at |
| --- | --- |
| An entire day spent on the name | Lawal's own account |
| Six published security labs | `content/labs/*.md`, all six `draft: false` on 2026-11-17; master CV §13 "met: six" |
| Case studies across GRC, SOC and ethical hacking | `cybersecurity-portfolio/labs/` (internal audit, access control, threat model, incident response, Wazuh, pentest) |
| Pentest lab rooted a box on an unsupported OS | Pentest lab: Metasploitable 2, findings resolve to one root cause, an unsupported OS |
| Detection lab caught the same attacks; phishing lab caught the click | `detection-siem-lab.md` capstone; `phishing-simulation-lab.md` rules 100300 and 100301 |
| SigKollect: Lagos, payments, no security lead, no policies, no access reviews | `labs_infra/company-labs-plan.md` §2.2, D-20 |
| First name from a course case study matches a real fintech; next was a real UK company | D-10; `company-labs-plan.md` §2.3 |
| Six names failed | `company-labs-plan.md` §2.3 (the names are held back here, as in the post and the image) |
| SigKollect cleared web, CAC, CRO, Companies House, domain, TMview | D-12 |
| Image: each search result ("no match", .com "unregistered") | D-12: web, Companies House and whois by the agent on 2026-10-29; CAC screenshot, CRO and TMview reported by Lawal on 2026-10-30 |
