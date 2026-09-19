---
title: "Ethical hacking is not a toolset, it is a mindset with a permission slip"
description: "Hacker, ethical hacker and penetration tester are not the same thing, and one of the differences is an invoice versus a criminal record. The mindset, the seven-stage method, and the black, grey and white box styles, laid out plainly."
date: 2026-09-10
tags: [cybersecurity, security, appsec, penetrationtesting]
cover: /images/blog/ethical-hacking-is-not-a-toolset/coverimage.png
coverAlt: "Same skill set. One difference. The locksmith is invited to test the locks, with permission in writing before anything runs. The burglar breaks in to take something, with no permission and none asked for."
draft: false
devto_id: 4625357
devto_url: https://dev.to/lawaloyinlola/ethical-hacking-is-not-a-toolset-it-is-a-mindset-with-a-permission-slip-436a
devto_published: true
---

Most confusion around ethical hacking is vocabulary, not difficulty. People use hacker, ethical hacker and penetration tester interchangeably, then argue past each other about what is legal and what is not. The distinctions are simple once they are laid out, and they matter, because one of them is the difference between an invoice and a criminal record.

This is the first of a short series. It covers three things: the mindset, the method and the styles. The lab and the language, meaning how to build a sealed environment to practise in and how to live on the Linux command line, come next.

## The mindset

Start with the uncomfortable part. An ethical hacker and a criminal have the same skill set. The same tools, the same techniques, often the same curiosity about how a thing comes apart. The difference is not capability. It is motivation and permission.

Take the locksmith and the burglar. Both can open your door. One was invited, tests the lock, and tells you which one is weak. The other takes your television. Skill is neutral. Intent and authorisation are not.

![Same skill set, one difference: permission](/images/blog/ethical-hacking-is-not-a-toolset/hackers-skill-set.png)

### The three hats

The naming comes from old westerns, where the hero wore white and the villain wore black.

**White hat.** The professional. Works with permission, inside an agreed scope, reports what he finds and helps fix it. This is the locksmith, and this is the target.

**Grey hat.** Pokes at systems nobody asked him to touch. Often means well, sometimes even reports the flaw afterwards, and still breaks the law doing it. My honest read on grey hats is less generous than the textbook one: a grey hat to me is simply a black hat caught in the act and in denial. Good intentions discovered after the fact are not the same as permission obtained before it.

**Black hat.** The criminal. Not a distant abstraction either. He is over your shoulder while you type, in the bin behind your office, or already sitting on your network, quietly.

![The three hats and where each one stands on permission](/images/blog/ethical-hacking-is-not-a-toolset/kinds-of-hackers.png)

One correction worth making while we are here. Hackers do not wear hoodies, do not work exclusively at night, and are not defined by a stock photo. The people doing this professionally look like the people doing any other engineering job.

### Ethical hacking is not the same as penetration testing

These two get used interchangeably and they are not the same size.

Ethical hacking is the whole thing: the mindset, the skill set and the process of looking for weakness with permission. It is ongoing and open ended.

Penetration testing is ethical hacking with a scope of work. It has an agreed target, a start date, an end date, and a report at the end of it.

Every penetration test is ethical hacking. Not every piece of ethical hacking is a penetration test.

## The one rule that keeps you employable

Never touch a system you do not have written permission to test.

No permission, no test. That is the whole rule, and it is worth more than any tool you will learn.

Skill does not make an action legal. Permission does. The exact same scan, run with the same command, against the same kind of target, is a paid engagement on a client's network and a crime on a stranger's. Nothing about the technique changes. Only the paperwork does.

This applies further than people expect. Not a friend's website because he said it was fine over WhatsApp. Not a company you admire and want to impress. Not a login page you stumbled onto and got curious about. Get it in writing, every time, and keep the writing.

Two ideas carry that rule in practice. The rules of engagement set out what you may test, when you may test it, how far you may go, and who to call when something breaks. The scope is the fence: the exact list of targets you are allowed to touch. Anything outside the fence is off limits even when it looks easy, and especially when it looks easy. Find something new mid engagement and you ask first and wait for a yes. When you are not sure, you stop.

## The method

Hacking is not random. Real engagements follow a path, and each stage feeds the next. What you learn while looking around decides what you scan, and what you scan decides what you try to break.

Seven stages, start to finish:

1. **Pre-engagement.** Agree the rules, the scope and the permission, in writing.
2. **Reconnaissance.** Gather everything you can about the target, mostly without touching it.
3. **Scanning.** Probe for open doors: live hosts, ports, services, versions.
4. **Access.** Use what you found to get in.
5. **Maintaining access.** Hold that foothold long enough to prove impact.
6. **Covering tracks.** Understand how an attacker would hide the evidence.
7. **Reporting.** Write down everything, clearly, for the people who have to fix it.

![The seven stages, with the two an attacker never has](/images/blog/ethical-hacking-is-not-a-toolset/hacking-stages.png)

Look closely at that list and one thing stands out. Stages two through six are exactly what an attacker does. Same sequence, same tools, often the same afternoon. Judge by the middle of the list alone and a penetration test and a breach are indistinguishable.

What actually separates the two is the first stage and the last. The pentester asks permission before, and explains everything after. The attacker does neither. Remove pre-engagement and reporting and you are not doing security work, you are committing an offence with good documentation habits.

Stage six deserves a footnote, because it reads strangely in an ethical context. A real attacker covers his tracks to stay hidden. An ethical hacker studies the technique so he can describe it, then does the opposite: logs every step, records every change, and hands it all over. Anything you altered gets restored. Nothing you found gets hidden.

## The styles

Before a test starts, both sides agree how much of the map the tester gets. That single decision changes the cost, the timeline and the realism of the whole engagement.

**Black box.** Little to no information, sometimes just a company name or a domain. Closest to what a genuine outsider faces, and the slowest, because a good chunk of the budget goes on discovering things the client already knew.

**Grey box.** Some information, often a normal user account and a rough idea of the architecture. The practical middle ground, and the one most engagements land on, because it simulates the realistic threat of an attacker who already has a foothold or a stolen credential.

**White box.** Everything: network diagrams, credentials, configuration, sometimes the source code. The fastest and most thorough option, and the best value when the goal is coverage rather than theatre.

![Black box, grey box and white box, by how much you are told](/images/blog/ethical-hacking-is-not-a-toolset/how-much-map.png)

There is a temptation to treat black box as the serious option because it feels most like a real attack. It is not automatically the better buy. If the goal is to find as many real weaknesses as possible in a fixed number of days, telling the tester more usually finds more.

## What can actually be tested

A penetration test is not one activity. The target decides the tools, the techniques and the skills you need.

| Target | What it covers |
| --- | --- |
| Network | Servers, firewalls, internal and external infrastructure |
| Web application | Websites, portals, APIs |
| Mobile | Android and iOS applications |
| Wireless | Wi-Fi networks and their authentication |
| Cloud | AWS, Azure, GCP configuration and identity |
| Social engineering | Phishing and the human layer |
| Configuration review | Settings, builds, hardening baselines |
| Everything else | IoT, hardware, physical access |

Coming from frontend and full stack engineering, the web application and cloud rows are where existing knowledge transfers most directly, and that is deliberately where I am aiming.

## Three things worth holding onto

Permission is not paperwork you clear on the way to the interesting part. It is the thing that makes the interesting part legal.

The process is the profession. Anyone can run a scanner. Scoping the work properly and writing a report someone can act on is the part that gets paid for.

The report is the product. Nobody is buying the exploit. They are buying the explanation of how it happened and what to change.

Next in this series: the lab and the language. How to build a sealed environment where you can break things freely, and the handful of Linux commands you end up living inside.
