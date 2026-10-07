---
title: "The three questions you get asked at 2am"
description: "When something goes wrong, three questions get asked and most teams cannot answer any of them. Why application logs are not an audit trail, how the record becomes a liability, and five questions a non-technical leader can ask about it."
date: 2026-10-07
tags: [security, appsec, devops, webdev]
cover: /images/blog/the-three-questions-at-2am/coverimage.jpg
coverAlt: "A two-colour risograph illustration of an empty corner shop at night, seen from a security camera mounted in the corner. A wall clock hangs above the door, and a very long receipt curls from the till across the floor. Headline: What happened? Who did it? When?"
draft: true
---

Something has gone wrong. A customer has emailed to say their account did something they did not do, or a support agent has noticed an export they cannot explain, or an engineer has found a record that changed at a time nobody was working.

Whoever picks that up asks the same three questions, in the same order, every time.

**What happened? Who did it? When?**

Most teams cannot answer any of them. Not because they were careless, and not because they have no data, but because the data they collected answers a different question entirely. That gap is worth understanding whether you write the code or sign off on the risk, because it is the difference between an incident that ends in a paragraph and one that ends in a regulator's inbox.

## Logs are not the same thing as a record

Almost every application produces logs. They are generated automatically, there are usually millions of lines of them, and they feel like an answer.

Here is what a typical line says: a request arrived, it went to this address, it came back successfully, it took ninety milliseconds. Multiply that by a few million and you have a very precise account of your traffic, and almost nothing about your business.

The closest everyday comparison is a security camera pointed at the front door of a shop. It shows you that people came in and left. It does not tell you what was bought, who bought it, or what was taken off the shelf and never paid for. If something goes missing, the camera narrows things down and then stops being useful, and you go looking for the till receipts instead.

The receipts are the thing most applications never keep. A record of _events that mattered_, rather than requests that happened:

- Someone signed in, or tried to and failed
- Someone changed a password, or an email address
- Someone was made an administrator, or had a permission removed
- An administrator acted on another person's account
- Data was exported

Five categories. That is the whole list for most products, and it is short enough that no one can credibly argue it is a big project.

## Four fields, and why each one earns its place

Each entry needs four things. **When it happened, who did it, where they were connecting from, and what changed.** Timestamp, actor, source IP address, and the change itself.

It is worth being specific about why, because this is the part that decides whether the record is usable at 2am or just comforting.

The **timestamp** lets you build a sequence, which is what an investigation actually is. The **actor** is the account that acted, and it must be the account the server authenticated, never a name the request supplied about itself. The **source address** is what separates "our own admin, from the office, at a normal hour" from "the same admin account, from a country we do not operate in, at four in the morning", which is one of the clearest signs of an account takeover after the fact. And **what changed** has to include the before and the after, because "role updated" tells you nothing you can act on.

![On the left, three request log lines, one of them a PATCH to a user at 02:14:09 that returned 200 in 90 milliseconds. It says a request arrived and succeeded, and nothing about who acted or what changed. On the right, the same moment as an audit record laid out like a till receipt: when, 02:14:09 UTC; who, account 1187 from the session; from, the source IP address; what changed, role from viewer to admin. The receipt is marked append-only.](/images/blog/the-three-questions-at-2am/camera-and-receipt.png)

Two properties matter as much as the fields. The record has to be **append-only**, meaning entries can be added but never edited or deleted, including by your most senior administrator. An audit trail an insider can quietly tidy up is not evidence, and if you are ever in front of an auditor or an insurer, that is precisely the property they will ask about.

And it has to be **kept long enough to be useful**. Industry incident reports consistently put the time between a breach starting and someone noticing it in the range of months rather than days, so a record that rolls off after thirty days will routinely be empty exactly when it is needed. Pick a retention period deliberately and write down why you picked it.

## Now the awkward part: your record is a liability

You have just built a detailed account of who did what inside your product. That account is valuable to you, and it is valuable to anyone who should not have it.

Logs are where a well-protected secret tends to end up. Not because anyone decided to put it there, but because a tired engineer added one debugging line that printed the entire incoming request, and the entire incoming request includes the authentication token, the session cookie and sometimes the password. The secret that was carefully kept out of the codebase, out of the browser and out of the repository is now sitting in plain text in a file that half the company can read.

There is an uncomfortable version of the shop analogy here. If your security camera is angled so that it records the keypad every time someone enters the alarm code, you have not installed security equipment. You have installed a machine that manufactures a copy of your alarm code, once per visitor, and stores them all in one place.

Three habits prevent this:

**Redact at the logger, not at the call site.** Configure your logging library once so that authorization headers, cookies and known sensitive fields are stripped wherever they appear. The alternative, remembering to redact at every point in the code that logs something, fails the first time somebody is in a hurry, which is the same time they are most likely to be debugging.

**Remember the error reporter.** Crash and error tracking tools capture surrounding context to be helpful, and that context regularly includes headers and request bodies. The main application log gets audited for this. The error tracker usually does not.

![A debug line prints the whole request, including the authorization header, the session cookie and the password. It passes through the logger, which strips those fields wherever they appear, so the log file receives each one as redacted. One rule in the logger covers every call site, and the error reporter needs the same rule.](/images/blog/the-three-questions-at-2am/redact-at-the-logger.png)

**Treat the log store like production data.** No world-readable file sitting under the web root, no log dashboard that answers without a login. If your logs are reachable by anyone who finds the URL, then everything in them is public, and you just spent a quarter making sure everything in them is interesting.

## And then nobody reads any of it

This is where the whole thing quietly fails, and it fails at well-run companies as easily as anywhere else.

Collecting and storing is the part that feels like progress, so it gets done. Reading is the part nobody owns. Two years later there is a beautiful, complete, append-only record of an incident that started four months ago and was noticed by a customer.

The fix is not more dashboards. It is a short list of things that are worth interrupting a human being for:

- A spike in failed logins, which is someone working through a password list
- A spike in server errors, which is either an outage or an attack in progress
- A new administrator, or any new privileged role
- An unusual volume of data being exported
- A sudden jump in what a metered third party is costing you, which is often the first visible sign of [abuse](/blog/the-ai-feature-that-bills-you)

Send those to a person. Not to a channel, not to a dashboard, to a person whose phone will make a noise. Then tune them relentlessly, because an alert channel everyone has muted is worse than having no alerts at all: it looks like coverage, it appears on your security questionnaire as coverage, and it is not coverage.

## For the people who own the risk rather than the code

If you lead a team rather than write the code, these five questions will tell you where you stand, and the wrong answer to each one is specific enough that you will recognise it:

1. **"Show me the last time someone was made an admin in our product."** A good answer takes under a minute and includes who did it and from where. A bad answer is a search through application logs. The worst answer is "we would have to ask engineering to query the database", because that means the evidence and the thing being investigated live in the same place.
2. **"If an administrator deleted their own trail, would we know?"** The answer you want is that they cannot.
3. **"How far back does that record go, and why that long?"** Any answer with a reason is fine. "Whatever the default was" is the finding.
4. **"What wakes a person up, as opposed to appearing on a dashboard?"** If the list is empty, the detection capability is a customer noticing.
5. **"When did we last check that our logs contain no passwords or tokens?"** If the answer is never, it is a ten-minute check, and it is the one on this list most likely to find something.

None of those questions require you to be technical. All of them are hard to answer vaguely, which is the point.

## For the people who do write the code

Two checks, both doable this afternoon.

Change a user's role in your own application, then go and find that change in your audit record. You want the actor and the source address on it, and you want to have found it without writing a custom query.

Then search your most recent log file for the words `authorization`, `bearer`, `password` and `session`, and try loading your log or monitoring dashboard while signed out. The first search should come back empty. The second should come back with a 401 or a login page, never the data. If either one surprises you, you have found something worth fixing before lunch.

## What this does not give you

Being precise about limits is part of the discipline, so: this is a baseline for detection and recovery, not a security operations centre, and not a compliance programme.

It will not detect a sophisticated attacker who avoids all five alert conditions. It says nothing about threat modelling for your particular product, about business logic abuse that looks exactly like legitimate use, or about the industry-specific obligations that may apply to you. What it does is make sure that when something goes wrong, the three questions have answers, and that the answers are not stored somewhere an attacker can edit.

That is a low bar. Most products do not clear it.

---

These are controls 35, 36 and 38 of a security baseline I maintain as an agent skill, where every control carries a verification step rather than a claim. I wrote about [how that checklist works](/blog/security-checklist-my-agent-runs) separately. It is public and MIT licensed at [github.com/lawalOyinlola/appsec-protocols](https://github.com/lawalOyinlola/appsec-protocols), and the limits above are stated in full in [DISCLAIMER.md](https://github.com/lawalOyinlola/appsec-protocols/blob/main/DISCLAIMER.md).
