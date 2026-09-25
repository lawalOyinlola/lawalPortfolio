---
title: "A security checklist my coding agent has to run"
description: "Most security checklists say what should be true and never get tested. Here is what happened when every item was rewritten as something you run, and packaged as a skill a coding agent loads before it writes the code."
date: 2026-09-25
tags: [security, appsec, ai, webdev]
cover: /images/blog/security-checklist-my-agent-runs/coverimage.jpg
coverAlt: "Two versions of the same checklist item. On the left, a clipboard line that has been ticked. On the right, an inspection tag for the same control, with a test written on it, a result of 401, and a date it was run."
draft: false
devto_id: 4742944
devto_url: https://dev.to/lawaloyinlola/a-security-checklist-my-coding-agent-has-to-run-4n39-temp-slug-179257
devto_published: false
---

Most security checklists are written in a way that guarantees they will be ignored, and the first one I wrote was one of those. It listed things that should be true about an application. Sessions should be invalidated when a password changes. Uploads should be validated by their content rather than their filename. Every line was correct, and I never tested a single one, because a sentence that says what should be true never says what you would do to find out.

That is the whole failure mode. You read the item, you agree with it, and agreeing feels close enough to checking that you tick it and move on. Nothing in the format ever forces the moment where you find out you were wrong.

So I rewrote the thing from the other end. Every control now comes with a step you run, and a control is not done until that step has been run and given back the result it promised.

## What the rewrite looks like

Here is the declarative version of a session control, the kind you find in most checklists:

> Verify that session tokens are invalidated when the password is changed.

And here is what it became, lightly trimmed from control 9:

> Kill every session on password change or reset, not just the current one. The whole point of a reset is evicting an attacker who already has a live session, so leaving their other sessions valid defeats it. Store a `sessionsValidAfter` timestamp per user and reject anything issued earlier.
>
> **Verify:** log in on two browsers, change the password in one, refresh the other. Expect a 401.

![The two-browser test: log in on two browsers, change the password in one, and the other should get a 401 on its next request. If it stays logged in, that is the bug.](/images/blog/security-checklist-my-agent-runs/two-browser-test.jpg)

The second version takes thirty seconds to act on, and it can fail. That is the only difference that matters, and it is the difference between a checklist and a test.

Doing the same to every control gave me the constraint the whole project hangs on: one verification step per control, with no exceptions. There are 82 controls across three skills and 82 verification steps, and you do not have to take my word for either number, because it is countable:

```bash
for f in skills/*/SKILL.md; do
  echo "$(basename $(dirname $f)): controls=$(grep -cE '^### [0-9]+\.' $f) verify=$(grep -cE '^[[:space:]]*- \*\*Verify:\*\*' $f)"
done
# legal-compliance: controls=20 verify=20
# project-kickoff: controls=18 verify=18
# security-protocols: controls=44 verify=44
```

The totals on their own are not enough, and this is how I found out. The first version of this loop only compared them, and they matched while control 12 had no verify step at all and control 15 had two, so both sides still read 44. So the totals are now the summary, not the proof: a per-control check, [`ci/scripts/check-verify-steps.sh`](https://github.com/lawalOyinlola/appsec-protocols/blob/main/ci/scripts/check-verify-steps.sh), fails any control without exactly one step, and it runs on every pull request.

## Why it is a skill and not a document

A document gets read when you remember it exists, which is usually after the code is written. By then a finding means a rewrite, and a rewrite has to argue with a deadline. The same finding before the first line is written is a decision, and a decision costs nothing.

That timing is why the checklist ships as an agent skill: an instruction file that a coding agent such as Claude Code loads on its own when it is about to write the kind of code the file covers. When mine is about to write authentication, database access, an upload handler, an API endpoint, a payment flow, an LLM call or deploy configuration, it loads the [security skill](https://github.com/lawalOyinlola/appsec-protocols/blob/main/skills/security-protocols/SKILL.md) first and writes the code against it. Before a launch, it runs the whole thing as an audit and writes a result for each control to a file, which is a different and more honest thing to hand someone than a green summary.

![An excerpt from the audit file: control 20, security headers, marked FAIL; control 21, force HTTPS, marked PASS, with a note listing what was not checked.](/images/blog/security-checklist-my-agent-runs/audit-excerpt.jpg)

_Part of the audit the skill wrote when I ran it against this site. The missing headers have since been added._

It is also built so it cannot tell me what I want to hear. Its own reporting rule forbids "all secure" as an output. It reports which controls pass, which fail, and which were never checked, because unchecked is a real state, and hiding it inside a pass is how a checklist turns back into theatre.

## What it covers

The controls are grouped by the phase of the work where they have to be enforced, not by severity, so the group you need is the one you are already working in.

- **Secrets and keys.** Where a secret lives, who can read it today, what your commit history still remembers after you deleted it, and why the client bundle is never the answer.
- **Data access.** Row level security with a real policy rather than just switched on, an ownership check on every record lookup, encryption at rest for the columns that deserve it, and whitelisted fields so a request body cannot set `role`.
- **Identity and sessions.** Cookie flags, password hashing with a real work factor, killing every session on password change, JWT verification that pins the algorithm, and OAuth configuration.
- **Rate limiting.** Login and password reset, then the rest of the API, which is the part almost everyone skips, plus bot protection checked on the server rather than trusted from a widget.
- **Input and output.** Parameterised queries, the NoSQL operator injection that parameterising does not fix, schema validation at the boundary, output encoding where the data is used, uploads checked by magic bytes, and API responses serialised on purpose rather than handed a database row.
- **Transport and supply chain.** Security headers, HTTPS and HSTS, a CORS allowlist that is not a reflected origin, dependency scanning that fails the build, and vetting the package itself, since a scanner knows nothing about a malicious package that is three days old.
- **Request surface.** CSRF where cookies authenticate, request size caps at every layer, the endpoints you never metered, the ones you never meant to publish, and the staging environment running production data behind a guessable URL.
- **AI features.** Prompt injection, treated as something to survive rather than something to prevent with careful wording, model output handled as untrusted input, and usage caps, because a metered endpoint with no ceiling is a bill somebody else gets to write.
- **Your own agent.** The skills, plugins and MCP servers you install run with your permissions, and a skill that fetches its instructions from a URL is remote code you have not reviewed.
- **Injection beyond SQL.** Path traversal, SSRF including the cloud metadata endpoint, shell commands built from user input, and deserialisation formats that execute code as a side effect of parsing.
- **Operations.** Audit trails with an actor and an IP, secrets kept out of logs and logs kept out of public reach, alerts that reach a person, backups you have actually restored, least privilege, tenant isolation, webhook signature checks, and payment decisions that stay on the server.
- **The gate itself.** Branch protection that includes administrators, required checks that match the jobs that actually run, and actions pinned by commit hash, because every control enforced in CI assumes nobody can route around CI.

Two sibling skills sit next to it in the same repository, in the same format and under the same rule about verification: one for legal and compliance questions, and one for the decisions that have to exist before the first feature commit.

## What this is not

It is a baseline, not a threat model. Working through all 44 security controls does not make an application secure. It makes 44 specific and common failures less likely, which is worth having and is not the same claim.

![The 44 controls cover a small, specific area. Threat modelling, business logic, cryptographic design, physical and personnel security and industry regulation all sit outside it.](/images/blog/security-checklist-my-agent-runs/what-it-does-not-cover.jpg)

It does not cover threat modelling for your particular product, business logic flaws, cryptographic design, physical or personnel security, or anything specific to your industry's regulations. The legal skill is not legal advice and does not pretend to be, and where the exposure is real it tells you to go and find a lawyer. The CI configuration in the repository checks the subset of controls that a machine can check and nothing more, so a green pipeline is evidence about that subset and silence about the rest.

The full version of all of that is in [DISCLAIMER.md](https://github.com/lawalOyinlola/appsec-protocols/blob/main/DISCLAIMER.md), and it is worth reading before you use any of this.

## Take it

Everything is public and MIT licensed at [github.com/lawalOyinlola/appsec-protocols](https://github.com/lawalOyinlola/appsec-protocols). Take the whole thing, take one group, or take the two lines that catch the bug you actually have. The controls are mapped to OWASP ASVS 5.0 in the repository, if you want to see where the coverage sits and where it does not. If you run it against something real and a control does not survive contact, tell me, because that is the feedback it needs.

If you only take one thing, take the two-browser test. Log in twice, change your password in one window, and refresh the other. If it is still logged in, your password reset does not evict anyone, including the person it was meant for.
