---
title: "The AI endpoint that charges you money when somebody abuses it"
description: "Abuse of a normal endpoint costs you capacity. Abuse of an endpoint that calls a model costs you money per request while everything looks healthy. Four controls, and the quota bug that charges you for every rejection."
date: 2026-10-07
tags: [security, ai, appsec, webdev]
cover: /images/blog/the-ai-feature-that-bills-you/coverimage.jpg
coverAlt: "A laptop on a dark desk shows a calm status screen of green dots and lines. Beside it, a brass meter behind glass glows amber as its number wheels turn. Headline: Everything looks healthy."
draft: true
---

Every other part of your product costs you capacity when someone abuses it. Servers work harder, response times climb, and if it gets bad enough you add machines. Unpleasant, recoverable, and broadly proportional to how much traffic you are getting.

The endpoint that calls a language model is different in one specific way: it bills you per request, on someone else's meter, whether the caller is a customer, a script or a stranger who found it. Abuse there does not degrade your service. It transfers money out of your account, in real time, while everything looks healthy.

That difference is worth understanding by whoever watches the budget, not only by whoever writes the code, because the failure is financial before it is technical.

## Who you are actually defending against

The mental image of an attacker is unhelpful here. Nobody has to break anything, find a vulnerability, or take any interest in your product at all. They have to call an endpoint in a loop.

There are two populations worth thinking about separately.

The first is people who want free access to a model. An unauthenticated endpoint sitting in front of a paid model is a free API key that somebody else pays for, and there are people who systematically look for those. They are not attacking you, they are harvesting you, and your product is incidental.

The second, and in my experience the more likely, is nobody at all. A retry loop with no backoff. A test script somebody left running over a weekend. An integration that treats a timeout as a reason to immediately try again, forever. Most of the frightening bills in this category are self-inflicted, which matters because it means the controls have to be ordinary engineering discipline rather than security theatre.

## Four controls, in the order they pay off

**Require authentication on anything that reaches a model.** Including the demo. Including the free tier. Including the little summarise button nobody uses. An anonymous AI endpoint is a public one, and the cheapest fix on this list is also the most commonly skipped, usually because the endpoint in question was meant to be temporary.

**Give every user and organisation a quota, counting requests and tokens.** Tokens matter as much as request count, and this is the part people miss: a hundred calls with a long document pasted into each one can cost more than ten thousand short ones. A quota that counts only requests will report healthy while the bill triples. Enforce it on your server, reset it on a window you chose deliberately, and return a clear error when it is hit.

**Cap the size of every individual call.** Set a maximum output length, cap the input length before you send it, and reject anything oversized in your own code rather than paying the provider to discover it was too big. This is the control that turns a pathological single request into a rejected one.

**Set a spend limit and a billing alert with the provider.** This is not a duplicate of your quota logic. It is what catches the bug _in_ your quota logic, and it is the only control on this list that does not depend on your own code being right. Whatever you believe your application enforces, the provider account is the last line, and it is the one that turns a bad month into a bad afternoon.

![A statement listing the four controls in the order a request meets them. Sign-in, in your code, asks who is calling and stops anonymous callers. The quota, in your code, asks whether requests and tokens are left and stops retry loops and long pasted documents. The size cap, in your code, asks whether one call is too big and stops an oversized request. The spend limit and billing alert, in the provider account, stops a bug in the first three. Result: a known worst case per user, and a known ceiling overall.](/images/blog/the-ai-feature-that-bills-you/four-layers.png)

## The test, and the expensive way to fail it

Take a test user, exhaust their quota, and keep calling.

You want two things to be true. The caller gets a clear rejection, and your provider dashboard shows no billed calls after the quota was hit.

The second half is the one worth checking carefully, because the expensive failure mode is a system that returns an error to the user _after_ calling the model. The user sees a refusal, your metrics look correct, and you are paying for every rejection. That is a quota that costs you money to enforce, and it is more common than it sounds, because the natural place to add a check is wherever the response comes back.

![Two statements side by side. When the quota is checked after the call, the request arrives, the model is called and billed, the quota check fails, and a refusal is shown, so every rejection is billed. When the quota is checked before the call, the request arrives, the quota check fails, the request is rejected and the model is never called, so nothing is billed.](/images/blog/the-ai-feature-that-bills-you/when-the-quota-runs.png)

## If you own the budget rather than the code

Three questions, and the answers tell you where you are:

1. **"Can anyone call our AI features without logging in?"** If yes, you have an unbounded liability and the fix is small. This includes the marketing demo, which is usually the thing nobody remembers is still live.
2. **"What is the most a single customer can cost us in a day?"** A good answer is a number, because a number means someone implemented a cap. "It depends on usage" means there is no ceiling, only a trend.
3. **"Is there a hard spend limit at the provider, and who gets alerted?"** If the alert goes to a shared inbox or a channel, it goes nowhere. This is the control most likely to be missing, because it lives in a billing console rather than in the codebase.

## The limits

Capping cost is not the same as securing an AI feature. It does nothing about [prompt injection](/blog/prompt-injection-is-an-authority-problem), nothing about what the model is allowed to do on a user's behalf, and nothing about what happens to the data you send upstream.

It also will not protect you from a genuinely distributed abuse campaign on its own, where per-user quotas get spread across many accounts. That needs account-level signals and rate limiting at the edge, which is a different control.

What it buys is that your AI feature has a known worst case per user and a known ceiling overall, which is the minimum required before you can reason about it as a business decision rather than an open-ended commitment.

Without it, the most a single customer can cost you in a day is whatever they decide.

---

This is control 30 of a security baseline I maintain as an agent skill, where every control carries a verification step rather than a claim. I wrote about [how that checklist works](/blog/security-checklist-my-agent-runs) separately. It is public and MIT licensed at [github.com/lawalOyinlola/appsec-protocols](https://github.com/lawalOyinlola/appsec-protocols), and its limits are stated in [DISCLAIMER.md](https://github.com/lawalOyinlola/appsec-protocols/blob/main/DISCLAIMER.md).
