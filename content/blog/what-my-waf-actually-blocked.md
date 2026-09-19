---
title: "What my WAF actually blocked, and what my app already stops on its own"
description: "I ran 26 attack payloads against a production app with ModSecurity on and off. It blocked 12: five my app already rejected, and seven it stopped a step earlier than the app's own defences. The class behind most real breaches never showed up in either column."
date: 2026-09-14
tags: [security, webdev, devops, cybersecurity]
cover: /images/blog/what-my-waf-actually-blocked/coverimage.png
coverAlt: "12 payloads the WAF blocked, 7 the app didn't already stop. What twelve blocked requests actually proved: measuring a WAF against an app that already defends itself."
draft: false
devto_id: 4651595
devto_url: https://dev.to/lawaloyinlola/what-my-waf-actually-blocked-and-what-my-app-already-stops-on-its-own-2ij2
devto_published: true
---

A request arrives at your server for `/api/vehicles/1' OR '1'='1`. Before a single line of your application code runs, something in front of it reads that string, recognises the shape of a SQL injection attempt, and answers 403.

That something is a web application firewall, and last month I spent a weekend trying to work out whether mine was actually earning its place.

## First, what the thing actually is

It is software. Twenty years ago you might have racked a physical appliance for this, but today a WAF is one of three things, all of them software: a module inside the web server you already run, a standalone reverse proxy that traffic passes through on its way in, or a cloud service like Cloudflare that filters at the DNS layer before anything reaches your machines at all.

Mine is the first kind. ModSecurity, running as a module inside the NGINX that already sits at the edge of the application, which means no extra network hop, no new machine, and no new bill. The rules it runs come from the OWASP Core Rule Set, a community-maintained collection of patterns for injection, cross-site scripting, traversal and the rest. ModSecurity is the engine; the rule set is the fuel.

The distinction that matters is which layer it reads. A network firewall works at the level of IP addresses and ports, so it can decide that traffic from this address to port 443 is allowed, and that is the end of its knowledge. It cannot see inside the request. A WAF works one layer up, reading the URL, the headers, the JSON body, the cookies. That is the entire reason it can spot the payload in the first paragraph, where a network firewall would see a perfectly ordinary POST to a perfectly ordinary port and wave it through.

## And why you would want one

Three honest reasons, in the order they actually matter.

The first is defence in depth. If a real vulnerability exists in your code, a WAF can block the exploit request before it reaches the vulnerable line, which buys you time between a flaw existing and that flaw being fixed. The second is virtual patching: when something you depend on has a disclosed vulnerability and you cannot ship a fix today, a rule blocking the known exploit pattern closes the door while you work. The third, and the reason a great many WAFs exist at all, is that an auditor asked for one. PCI DSS effectively requires it for systems handling card data.

Notice what is absent from that list. Nothing there says a WAF makes your application secure. It is a compensating control, which means it compensates for a weakness rather than removing one, and holding onto that distinction is the whole point of what follows.

## What I built

I put it in front of the same production Next.js and NestJS application I already gate with a CI/CD security pipeline. That pipeline catches problems in code before it ships; this was the runtime half of the same argument, and running both against one real system beats running either against a tutorial target.

The setup was a local rig, because attacking a client's production system is precisely what you do not do. Two listeners in front of a production-mode build of the app, one with the rule engine live, one with it switched off. Same TLS, same proxy path, same everything, except that single switch.

That second listener is the reason any of this counts as a measurement rather than a demonstration. Without it, a blocked request is only a claim. With it, a block counts only when the identical payload gets through on the other port, which makes every number in the rest of this piece a difference between two observations rather than an assertion.

One detail that took longer than it should have: the app had to run in production mode. In development it relaxes its own defences, turning CSRF off and dropping the secure flag on cookies, so measuring a WAF against a development build would have compared it to a weaker application than the real one and flattered the result. Production behaviour, synthetic data. That combination was most of the setup work.

Then twenty six attack payloads across six classes, run three times: once with no WAF, once with it watching and logging but not blocking, once with it live. Then tuned, then re-run at a higher paranoia setting.

## The number that looked like a win

At the tuned setting the firewall blocked twelve of the twenty six.

My first instinct, and very nearly the sentence I published, was that all twelve were payloads the application had already handled by itself. It is a clean line. It is also not quite what the data said, and finding that out was the most useful hour of the project.

So I went back to the baseline phase, the one with no WAF at all, and looked up what the application had done with those same twelve. Five of them it had already rejected outright: a UUID validator killing a malformed identifier before any query ran, an explicit date check on a history endpoint returning 400 before the value reached the database. Real rejections. The firewall blocking those afterwards added nothing at all.

The other seven told a different story, because the application's baseline answer to those was not a rejection. It was 200, or 201. It had accepted the request.

## Why accepting a payload is not the same as being vulnerable

This is where it stopped being disappointing and started being interesting. The cross-site scripting payloads, both reflected and stored, were accepted by the application every time in the baseline. That sounds alarming until you follow what happens next. The reflected ones get rendered back to the browser and React escapes them on the way out, so what appears on screen is inert text rather than running code. The stored ones get written to the database exactly as submitted, and then sit there, because nothing in the application ever executes a database field as code.

Both of those are genuinely safe outcomes, and neither of them is a rejection. The safety happens downstream, after acceptance.

Which is exactly where the seven earned their place. The firewall stopped those payloads in transit, before they were ever reflected or written at all. The application would have been fine without it, because its own safety net was waiting further down. But the WAF closed the gap one step earlier, and that matters more than it sounds, because downstream safety nets are precisely the thing that quietly breaks when somebody refactors a template eighteen months from now and does not know why the escaping was there. The firewall does not care about that refactor. It never let the payload in.

So the honest version is narrower and more useful than my first draft: five of twelve were pure overlap, seven were a real second layer in front of controls that already held. Both true at once, and only one of them survived into the first summary I wrote.

## The class that never appeared in either column

Then there is the part that needed no correcting, because the numbers were identical from the start.

I seeded two synthetic tenants and tried to read one tenant's data while logged in as the other. Same route, same valid session, a different vehicle identifier in the URL. With the firewall on: 404. With it off: 404. Every variant, every time.

That is not the WAF failing quietly. It is the WAF having no job to do. A request for someone else's record is, byte for byte, indistinguishable from a request for your own. There is no pattern in it that says attack, because nothing about its shape is malicious. The only thing separating the two is a fact living in a database row rather than in the bytes on the wire, and a signature-matching filter was never built to know that fact. The application's own authorisation check, one condition in a query confirming the record belongs to the requester's organisation, was the entire defence in both columns.

That class is called broken object level authorisation, or insecure direct object reference in the older naming. It is mundane to exploit, since it requires changing one value in a URL, and it appears in breach writeups constantly for exactly the reason above: it is invisible to this kind of control by construction.

![What actually stops each attack class: application, WAF, or neither](/images/blog/what-my-waf-actually-blocked/what-stops-each-class.svg)

## The tuning, which was not where I expected

WAF folklore says the false positives will come from content. Long tokens, JSON bodies full of coordinates, names with apostrophes tripping an injection rule.

None of that happened at paranoia level one. What happened instead was structural. The Core Rule Set blocks the PATCH and DELETE methods by default, and this is a REST API that depends on both, so with blocking switched on and nothing tuned, every legitimate profile edit and record update returned 403. A user renaming their own vehicle got a firewall error.

The fix was one targeted exclusion restoring those verbs for the API paths, and the discipline there is worth naming: fix the specific rule, never reach for the paranoia dial. Turning the sensitivity down would have fixed the same false positive while silently giving back real detection elsewhere, and you would never know which. After the exclusion, the legitimate PATCH returned 200 and all twelve attack blocks were still in place. That is what a surgical fix looks like when you can prove it.

Raising the paranoia level to two then answered a question I would otherwise have guessed at. It caught nothing the tuned level one had missed. It fired more rules on attacks already being blocked, and it introduced two fresh false positives on legitimate traffic: a strong password that happened to contain a comment sequence, and a business name containing an ampersand. More paranoia, in this specific application, was pure cost.

![The tuning curve: attacks blocked stays flat, false positives do not](/images/blog/what-my-waf-actually-blocked/paranoia-tradeoff.svg)

One genuine bypass did turn up. Injection payloads the firewall caught in a query string or JSON body sailed past it when the identical payload sat in a URL path segment instead, because the core injection rules inspect arguments rather than path segments. In this application the UUID validator rejects those anyway, so nothing was exposed. Against an application that consumed a raw path segment, that is a live bypass at every level I tested.

## What this does not cover

Rate abuse and user enumeration were scoped out. Both are decided by the application's own throttler and the wording of its responses rather than by any rule at this paranoia level, so there was nothing for a WAF-versus-control comparison to isolate. I also did not test a cloud WAF, so nothing here transfers automatically to Cloudflare or AWS WAF, whose rule sets and defaults differ.

## Something to run

If you want the thirty second version of the finding that mattered most, go looking for the pattern no firewall will catch for you. In an ORM-backed codebase, that means finding every query that fetches a record by identifier without also constraining it to the caller:

```bash
grep -rn "findFirst\|findUnique\|findByPk" src/ | grep -vi "organizationid\|tenantid\|userid\|ownerid"
```

Every line that comes back is a query trusting an identifier from the request without checking who is asking. Most will be fine and deliberately scoped elsewhere. The ones that are not are the class of bug that identical 404s in both my columns proved a firewall will never see.

---

Twelve blocked requests looked like twelve wins. Five were the application agreeing with itself through an extra layer. Seven were the firewall genuinely doing something the code could not do until later. And the class that decides most real breaches never touched either column, because it was never a pattern-matching problem to begin with.

A WAF buys you time. It does not buy you a query that checks who is asking.
