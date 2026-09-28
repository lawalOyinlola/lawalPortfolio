---
title: "How a security checklist became a skill"
platform: linkedin
companion_to: ../../blog/security-checklist-my-agent-runs.md
status: posted
carousel: carousel.pdf
posted_url: https://lnkd.in/p/di4QdVA6
posted_date: 2026-09-28
---

# LinkedIn: how a security checklist became a skill

**Posted 2026-09-28:** https://lnkd.in/p/di4QdVA6

Posted as a **document** (Add a document → `carousel.pdf`, title: "Agreeing isn't testing"),
with the first comment added straight after.

## Copy this

```text
For most of this year I have been writing up one application security control at a time. That started as a checklist I kept ignoring, for the reason everybody ignores a checklist: it told me what should be true and never what to run to find out.

So every item got rewritten as something you run. "Sessions are invalidated on password change" became: log in on two browsers, change the password in one, refresh the other, expect a 401. Eighty two controls, eighty two checks, and a control only counts as done once its check has actually been run.

It is a skill now, so my coding agent loads it before it writes auth, database access, uploads, endpoints, payments or deploy config, rather than after, when a finding is a rewrite instead of a line. Here is what it covers.

🔑 Secrets: where keys live, who can read them, what your commit history still remembers
🗄️ Data access: row level security, ownership checks, encryption at rest
🪪 Identity: session cookies, password hashing, JWT verification, OAuth configuration
⏱️ Rate limiting: login, the whole API, and bot protection
💉 Injection: SQL and NoSQL, path traversal, SSRF, shell commands, unsafe deserialisation
📥 Input and output: validation at the boundary, output encoding, uploads, what your API returns
🔒 Transport: security headers, HTTPS and HSTS, CORS
📦 Dependencies: scanning for known flaws, and vetting the package itself
🤖 AI features: prompt injection, model output as untrusted input, usage and cost caps
🧩 Your agent: the skills, plugins and MCP servers you install into it
🛠️ Operations: audit logs, secrets leaking into logs, alerting, backups and restores, least privilege, tenant isolation, webhooks, payments
🚧 CI: making the gate unbypassable, so none of the above is optional

Worth saying plainly: this is a baseline, not a threat model. Working all of it does not make an application secure, it makes 44 common and specific security failures less likely, and it has nothing to say about the business logic flaw that belongs to your product alone. It will not tell you that you are secure either. It reports which controls pass, which fail, and what was never checked.

Free, MIT licensed, link in the comments.

#ApplicationSecurity #CyberSecurity #SecureCoding #DevSecOps #BuildInPublic
```

## First comment

```text
The long version, with the before and after: https://lawaloyinlola.com/blog/security-checklist-my-agent-runs
Repo: https://github.com/lawalOyinlola/appsec-protocols

Three skills, 82 controls, each with a verification step. MIT licensed, and the OWASP ASVS mapping is in the repo if you want to see where the coverage actually sits.
```

## Carousel (`carousel.pdf`, 5 pages, 16:9)

| # | Image | Source |
| --- | --- | --- |
| 1 | Agreeing isn't testing | `public/images/blog/security-checklist-my-agent-runs/coverimage.jpg` |
| 2 | Same control. One of them can fail. | `the-rewrite.jpg` (this folder) |
| 3 | The two-browser test | `public/images/blog/security-checklist-my-agent-runs/two-browser-test-v2.jpg` |
| 4 | What it covers, 82 controls. 82 checks. | `what-it-covers.jpg` (this folder) |
| 5 | What it does not cover | `public/images/blog/security-checklist-my-agent-runs/what-it-does-not-cover.jpg` |

Blog images are referenced, not copied: `public/` is what the site serves, and a second copy
would drift. The PDF pages are downscaled to 2000px wide to keep the file under 3 MB.

Rebuild after changing any image:

```bash
S=$(mktemp -d); B=public/images/blog/security-checklist-my-agent-runs; L=content/linkedin/security-checklist-my-agent-runs
i=0; for f in $B/coverimage.jpg $L/the-rewrite.jpg $B/two-browser-test-v2.jpg $L/what-it-covers.jpg $B/what-it-does-not-cover.jpg; do
  i=$((i+1)); sips -s format jpeg -s formatOptions 80 -Z 2000 "$f" --out $S/$i.jpg >/dev/null; sips -s format pdf $S/$i.jpg --out $S/$i.pdf >/dev/null
done
"/System/Library/Automator/Combine PDF Pages.action/Contents/MacOS/join" -o $L/carousel.pdf $S/{1,2,3,4,5}.pdf
```

## What each slide shows

Posted as a document, which takes no per-page alt text, so the carousel title and the post
carry the meaning on LinkedIn. Kept here as a record, and for reuse if any of these images
go out again as a standalone post.

1. Agreeing isn't testing. A ticked checklist line next to an inspection tag that records the test, the expected result of 401 and the actual result of 401.
2. The same control written two ways: a ticked statement, and a test with an expected result.
3. Two browsers logged in; change the password in one; the other should get a 401. If it stays logged in, that is the bug.
4. The twelve groups the controls cover, from secrets to CI. 82 controls, 82 checks.
5. The 44 security controls cover a small, specific area. Threat modelling, business logic, cryptographic design, physical and personnel security and industry regulation sit outside it.

## Notes

- The limits line changed from the draft: 82 became "44 … security", since 38 of the 82
  controls are legal and project setup, not security failures.
- The list uses one emoji per line as the bullet, not `•`. Four first-round picks were dropped:
  ♿️ for data access (the accessibility symbol, read as a pun, drops it), 👨🏾‍🍼 for dependencies
  (unrelated pun), 🚫 for rate limiting (reads as "blocked", not "limited"), 📄 for operations
  (means nothing here).
- The audit screenshot is left out: without the blog's caption it shows a FAIL with no context.
