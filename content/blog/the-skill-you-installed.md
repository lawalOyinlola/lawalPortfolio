---
title: "Your coding agent runs as you. So does everything you install into it."
description: "A skill passed every scanner, and the scanners were right at the moment they looked. Why the artefact you review and the instruction that runs are two different objects, and how to inventory what your coding agent can actually reach."
date: 2026-10-07
tags: [security, ai, appsec, webdev]
cover: /images/blog/the-skill-you-installed/coverimage.jpg
coverAlt: "A weathered wooden signpost at dusk with a cardboard tag showing a green tick tied to it. Its blank arrow points down a wet country road that disappears into fog. Headline: The scanners were right."
draft: true
---

Your coding agent runs as you. Not as a service account with a carefully scoped role, not in a sandbox somebody signed off on. As you, with your filesystem, your credentials, your repository and your ability to push code.

That is the whole reason it is useful, and it is the reason the things you install into it deserve more scrutiny than they usually get. An agent skill, a plugin or an MCP server is not a document your agent reads. It is a set of instructions your agent follows, with your permissions, while you are doing something else.

Most people's mental model for this is the app store, where a marketplace review means somebody checked. This year a piece of research made a fairly compelling case that the mental model does not survive contact. I came across it through a video by [Ant Davis](https://www.linkedin.com/in/antdaviscyber/) walking through what the researchers did, and his summary is a good five minutes if you want the story before the analysis.

## What the researchers did

A security firm called AIR built an AI agent skill, gave it a convincing name, dressed it to look like a tool from a company you would recognise, and got it accepted into a popular marketplace. Then they ran advertising at the kind of professionals who judge a tool by whether it looks legitimate.

Every scanner that examined it, including ones from well-known security vendors, reported it clean.

They were right. At the moment they looked, it was clean.

The skill referred to a documentation link, and while the scanners were checking, that link served genuine documentation. Once enough people had installed it, the researchers changed what sat behind the link. Now it told the agent to download and run a script. In the published demonstration it collected an email address, which was the polite version of what it could have collected.

I am deliberately not repeating the install count that circulated with this research, because it is self-reported by the firm that ran the experiment and I have not seen it independently confirmed. The number is not the point. The mechanism is the point, and the mechanism does not need a large number to be worth acting on.

## Why no scanner can fix this

Here is the part worth internalising, because it generalises well beyond agent skills.

A scanner examines an artefact at a moment in time. It reads the files, matches them against patterns of known bad behaviour, and returns a verdict about _those bytes_. That verdict is accurate and it is about the past.

The instruction your agent eventually follows is fetched later, over the network, from a location the artefact merely points at. Two different objects, separated by however long it took your team to adopt the tool and an HTTP request.

Security engineering has a name for this shape, time of check to time of use, and it shows up everywhere from filesystem races to payment flows. The general form is simple: whenever the thing you validated and the thing you act on are fetched separately, whoever controls the second one decides what actually happens, regardless of how carefully you validated the first.

![Two inspection forms. The first, at the time of check, records the skill files pointing at a docs link that serves genuine documentation, stamped passed. The second, at the time of use after installs grew, records the same unchanged skill files and the same docs link, which now serves an instruction to download and run a script, stamped not re-inspected.](/images/blog/the-skill-you-installed/check-then-use.png)

Static analysis cannot close that gap. Not because the tools are weak, but because the content being analysed is not the content being executed. You could scan continuously and still lose, since the swap can happen between your scan and the next invocation.

## What actually reduces the risk

Since you cannot detect the swap reliably, you have to remove the ability to swap, or bound what a swap can do.

**Check the publisher and the destination, not the description.** A convincing name and a plausible documentation link is the entire attack. The question is not "does this look professional", it is "does this vendor actually publish this, from a domain they own". Those are different questions and only the second one is checkable.

**Pin and vendor what you keep.** Copy the skill into your repository, review it there, and update it deliberately rather than automatically. A version you reviewed and control is not the same as a name you trusted. And when a tool changes maintainer, treat it as a new tool that needs a new review, because from a supply chain perspective that is exactly what it is.

**Prefer immutable references.** Where something must be fetched, pin it to a commit hash or a content digest, which cannot change underneath you, rather than to a branch, a tag or a bare URL, all of which can. This is the same discipline as pinning a CI action by hash instead of by version tag, for the same reason.

![A checklist asking whether each reference can change after you reviewed it. A branch like main, a version tag like v1.2 and a bare URL can change. A commit hash, a content digest and a vendored copy in your repository stay as reviewed.](/images/blog/the-skill-you-installed/what-can-change.png)

**Give the agent less to lose.** Do not run it in a directory whose environment holds production credentials. Prefer per-project installs over global ones, so a compromised tool reaches one project rather than everything you work on. This is ordinary least privilege, applied to a thing most teams have not yet classified as software that runs with privileges.

A note on where it runs, because it affects the risk materially: an agent skill running in a local coding agent has the same network and filesystem access as any other program on your machine. Sandboxed, API-side execution is a different and smaller risk surface. Know which one you are using before you decide how much to care.

## Run the inventory

Advice is cheap, so here is the check.

You want to know two things: every URL reachable from anything you have installed, and every executable your agent tooling is configured to run. In the [appsec-protocols](https://github.com/lawalOyinlola/appsec-protocols) repository that is one script, run from a clone of it:

```bash
bash ci/scripts/vet-agent-installs.sh
```

It walks the skill and plugin directories, follows symlinked skills, reads the MCP server configuration including the per-project servers that are nested inside your global configuration file, and prints two lists: the URLs, and each server's command with its arguments.

Then you read the output and account for every line. A URL that is not an immutable reference or a vendored copy is a finding. An executable source that is not integrity-locked is a finding. A documentation link from a vendor's own domain is probably fine, and "probably fine, and I looked" is a materially different position from "I never checked".

One detail from building that script is worth passing on, because it is the kind of thing that distinguishes a tool you can trust from one you merely ran.

The output of that script goes straight into an AI agent's context. If the configuration it reads contains credentials, and it prints them, the tool has just moved your secrets into a place you did not intend. So it redacts them. The first implementation redacted by matching a list of known credential names, which passed review twice and then failed on `api-key` because the list contained `api_key`. The fix was to stop matching names and start matching shapes: any parameter whose name looks like a credential, plus any value that looks like a token, gets replaced before printing.

There is now a test that plants credentials in a throwaway configuration, twelve different forms when I wrote it and seventeen today, and fails if any of them reach the output. Run against the previous version of the script, four of the twelve leak. That test is the only reason I am willing to tell you to run the thing.

## If you are the person approving what a team installs

You do not need to read any of the above to ask the questions that matter. Four of them:

1. **"What has each of us installed into our coding agents, and can we produce the list?"** If nobody can produce the list, that is the finding, and it is the same finding as not knowing which dependencies are in production.
2. **"Do any of them fetch instructions from the internet at runtime?"** This is the one that distinguishes a tool from a liability, and it is answerable with a single command.
3. **"Where do our agents run, and what credentials are in reach when they do?"** An agent running in a directory with production keys in the environment is an agent with production keys.
4. **"When a tool we rely on changes hands, what happens?"** The answer you want involves somebody reviewing it again. The common answer is that nobody notices.

None of this requires a policy document. It requires the list to exist and somebody to have read it.

## The limits

This is a baseline for one specific supply chain risk, not a complete threat model for AI tooling.

It does not address [prompt injection](/blog/prompt-injection-is-an-authority-problem) through skill descriptions, malicious behaviour in a skill that never fetches anything at all, compromise of the marketplace itself, or the possibility that a tool is exactly what it claims to be and its author's account is taken over next month. The inventory script tells you what is reachable and configured, not whether the people behind those names are trustworthy, which remains a judgement call that no command returns.

What it does buy you is that you can no longer be surprised by an inventory you never took.

---

This is control 44 of a security baseline I maintain as an agent skill, where every control carries a verification step rather than a claim. I wrote about [how that checklist works](/blog/security-checklist-my-agent-runs) separately. It is public and MIT licensed at [github.com/lawalOyinlola/appsec-protocols](https://github.com/lawalOyinlola/appsec-protocols). The script is [ci/scripts/vet-agent-installs.sh](https://github.com/lawalOyinlola/appsec-protocols/blob/main/ci/scripts/vet-agent-installs.sh), and its limits, along with everything else's, are in [DISCLAIMER.md](https://github.com/lawalOyinlola/appsec-protocols/blob/main/DISCLAIMER.md).
