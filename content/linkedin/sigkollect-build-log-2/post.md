---
title: "SigKollect build log, part 2: the company brief"
platform: linkedin
series: SigKollect build log
part: 2
companion_to: none
status: posted
posted_url: https://lnkd.in/p/e6NJGaMQ
posted_date: 2026-11-27
---

# LinkedIn: SigKollect build log, part 2

Post as a document (carousel): upload `carousel.pdf` (2 pages: the events ledger, then finding and evidence). Fallback: a two-image post with `events-ledger.png`, then `finding-evidence.png` (both 2160×2700, 4:5 portrait). No first comment needed. Next in the series: part 3, the gap analysis. The image sources are the `.svg` files; edit those and re-render, never the PNGs:

```bash
(
  cd content/linkedin/sigkollect-build-log-2
  for f in events-ledger finding-evidence; do
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
      --force-device-scale-factor=2 --window-size=1080,1350 \
      --screenshot="$PWD/$f.png" "file://$PWD/$f.svg"
  done
)
```

The carousel PDF is built from the same SVGs, so its text stays vector. Rebuild it after any SVG change:

```bash
python3 tasks/linkedin-carousel.py content/linkedin/sigkollect-build-log-2 "SigKollect log 2: Five events, none found by a control." events-ledger finding-evidence
```

`tasks/` is gitignored; if the script is gone, put the PNGs into a PDF in any tool, one per page, in the order above. The IAM ⅃AWA⅃ LTD wordmark on the cards comes from `tasks/linkedin-wordmark.py` (real L's flipped with `scale(-1 1)`).

Document title (LinkedIn asks for one when you upload `carousel.pdf`, 58 characters at most; it is also the PDF's own title): **SigKollect log 2: Five events, none found by a control.**

## Copy this

```text
Every document in a security programme should point at something real. For a company that doesn't exist, that something has to be written first, so the first deliverable in the SigKollect build log is the company brief.

It covers what SigKollect sells, the data it holds and who reports to whom. Then it gives five security events from 2026: a forgotten server still holding merchant payout reports, a critical fix that took five weeks to reach production, injection probes on the payment page, a support agent who typed a password into a phishing page, and a customer question nobody could answer. Every one was found by chance: a cost review, a partner's email, an engineer debugging, an honest agent, a customer's questionnaire. None was found by a control, and that pattern is what the gap analysis starts from.

The decision that mattered most was how to connect the brief to the labs I had already published. Those labs ran against practice targets, not SigKollect, so presenting them as past SigKollect work would contradict the pages they live on. Instead, each invented event links to a published lab as evidence that the attack and the control both work. A finding is true at the client. Evidence shows a control works. Keep those two apart and a case study stays honest.

The events also got exact invented months instead of "over the past year". That looks fussy until the risk register needs a likelihood score, and "has this happened here before, and when" is part of the answer.

Part 3 is the gap analysis, with the row I marked "no gap" that turned out to be the biggest gap of all.

#CyberSecurity #GRC #RiskManagement #SecurityGovernance #SigKollectBuildLog
```

## Image alt text (LinkedIn: Add alt text, one per image)

Image 1, `events-ledger.png`:

```text
A kraft-paper ledger headed "Incident history, 2026" and "Company brief, section 3". The headline reads "Five events. None found by a control." Five rows, each with the event, the month, who found it, and a red stamp reading NO under "A control?". E-1, The forgotten server, August 2026, found by a cloud cost review. E-2, Five weeks to patch, April to May 2026, found by a partner's email. E-3, Probes on the payment page, June 2026, found by an engineer debugging. E-4, The merchant dispute email, September 2026, found by an honest agent. E-5, The unanswered question, October 2026, found by a customer's question. Footer: "Every event is invented. Every one was found by chance." SigKollect build log, Part 2. A red rubber stamp in the corner reads "Prepared by IAM LAWAL LTD, Lawal Oyinlola".
```

Image 2, `finding-evidence.png`:

```text
A kraft-paper card headed "Finding and evidence" and "Decision D-27". The headline reads "A finding is true at the client. Evidence shows the control works." Five solid boxes on the left, the findings at SigKollect, each joined by a dashed arrow to a dotted box on the right, a published lab. E-1, The forgotten server, to the Pentest lab: root on an unsupported OS, two paths. E-2, Five weeks to patch, to the CI/CD lab: Semgrep, Trivy, Gitleaks, a deploy gate. E-3, Probes on the payment page, to the WAF lab: ModSecurity and the OWASP Core Rule Set. E-4, The merchant dispute email, to the Phishing bridge lab: a campaign, the click caught in Wazuh. E-5, The unanswered question, to the Detection lab: Wazuh, Suricata, attack to alert. Footer: "The labs ran against practice targets, not SigKollect. They prove the technique and the control." SigKollect build log, Part 2. A red rubber stamp in the corner reads "Prepared by IAM LAWAL LTD, Lawal Oyinlola".
```

## Notes

- Lawal's direction (2026-11-26): the brief gets its own post between the opener and the gap
  analysis.
- Posted 2026-11-27 as a document with the title "SigKollect log 2: Five events, none found by a
  control." The "Next" link in part 1's Related list was restored at the same time.
- The load-bearing paragraph is the third: finding versus evidence of capability (D-27). It is what
  makes a fictional company credible in a portfolio rather than a costume.
- The five events are named in plain words so the reader sees the mechanism before any GRC term.
- "Exact invented months" (D-28) is the small, checkable decision that pays off in lab 2.
- Held back: the third parties, the org chart, the regulations list (R-1 to R-7). Part 3 or later.
- Brand (2026-11-26, Lawal): IAM ⅃AWA⅃ LTD on every card, drawn with real L's flipped in the SVG
  (the U+2143 glyph falls back to a lower font in SF Mono). Alt text says IAM LAWAL LTD.
- Images (2026-11-26): a case-file look on kraft, ink and red stamps, different from part 1's route
  card on purpose (Lawal: each post can take its own direction, and more than one image). Image 1
  shows the pattern, image 2 shows the D-27 split between finding and evidence.

## Related

- Earlier: [Part 1, what I'm building](../sigkollect-build-log-1/post.md)
- Next: Part 3, the gap analysis (link added when it is posted)

## Claims

| Claim | Verified at |
| --- | --- |
| The brief covers products, data held and structure | `labs_infra/sigkollect/brief.md` §1 and §2 (published as `labs/sigkollect-governance/documents/00-company-context.md`) |
| Five events in 2026, as described | `brief.md` §3, E-1 to E-5 |
| Each found by chance, none by a control | `brief.md` §3, "What the history shows" |
| The gap analysis starts from that pattern | `brief.md` §3, "That pattern is the main input to the lab 1 gap analysis" |
| Published labs ran against practice targets, not SigKollect; events link to them as evidence | `labs_infra/programme/decisions.md` D-27 (option B) |
| Exact invented months, for likelihood scoring | D-28 |
| Image 1: event names, months, who found each | `brief.md` §3 timeline and events; "What the history shows" |
| Image 2: each event's lab and what it shows | `brief.md` §3, "Evidence of capability" under E-1 to E-5 |
