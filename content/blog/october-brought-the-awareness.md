---
title: "October brought the awareness after all"
description: "Cybersecurity Awareness Month 2026 brought PHP2Shell, an exploited BeyondTrust zero-day and two critical Next.js RCEs. My dependency audit stayed green for eight days while the Next.js fix sat on npm, and on a repository I had not patched yet, Dependabot was still silent days after the database caught up."
date: 2026-10-28
tags: [security, webdev, devops, cybersecurity]
cover: /images/blog/october-brought-the-awareness/coverimage.jpg
coverAlt: "Four old brass alarm bells in a row on a whitewashed brick wall inside a fire station at dusk. Cloth-covered cables run down from each bell into one grey steel junction box whose heavy lever sits at OFF, with a fallen orange maple leaf on top. Through an arched window and doorway, an autumn street with orange trees and lit lamps. Headline in large cream type, top left: Four tools and one source."
draft: false
devto_published: false
---

October 2026 is Cybersecurity Awareness Month, and it delivered the awareness in the least comfortable way it could: a month's worth of critical vulnerabilities in a single week. I read most of it as someone else's problem, right up until one of them turned out to be sitting in seven of the projects I run, and the tools I trusted to tell me about exactly that had not said a word.

## A week of criticals

The campaigns this year were about habits. The National Cybersecurity Alliance's theme is "Don't Make It Easy for Them", and one of its four habits is updates. Between 14 and 21 October, the vulnerabilities made the case for that habit better than any poster could:

- **PHP2Shell** (CVE-2026-109618 and CVE-2026-109619). Two unauthenticated remote code execution flaws in PHP itself, both rated 9.2 under CVSS v4. Details leaked before the coordinated release, Amazon reported exploitation attempts four days before the patches, and when PHP shipped 8.5.12, 8.4.27, 8.3.36 and 8.2.35 on 21 October, its own release notes said there are no complete mitigations and updating is the only safe choice.
- **BeyondTrust Remote Support** (CVE-2026-102764). An authentication bypass that CISA called critical and added to its Known Exploited Vulnerabilities catalogue on 16 October, with attackers already using it for initial access, persistence, privilege escalation and lateral movement.
- **NGINX** (CVE-2026-15176, CVE-2026-93479 and CVE-2026-97205, plus two more). Memory-safety bugs that can crash a worker process and might allow code execution, each needing a specific configuration to reach. F5 scores the three worst at 9.2 under CVSS v4, while nginx.org rates every one of them medium, which is a useful reminder that a severity is somebody's opinion of your setup. Fixed in 1.30.6 and 1.31.7 on 14 October.
- **Next.js** (CVE-2026-96889 and two others). Two unauthenticated remote code execution flaws, one in the Image Optimization API and one in `use cache` functions, both rated 9.5 critical, plus a denial of service in Server Actions rated 8.2 high. Fixed in 16.4.1, and in 15.5.28 for the 15.x line.
- **Node.js** fixed ten CVEs across its 22.x, 24.x and 26.x lines on 21 October. None is rated critical. The highest are four rated high, one of them an out-of-bounds write in the Brotli decoder that can allow remote code execution.

## None of this was mine, I thought

I do not run PHP, and I have never touched BeyondTrust. So I read PHP2Shell the way you read about a flood in another country: with sympathy, and without going downstairs to check my own basement.

Next.js I do run, on most of what I build. I found out on the morning of 23 October, when `pnpm audit` on this site came back with two criticals and a high against `next@16.3.8`. Seven of the projects I run were on vulnerable versions. Dependabot, which was switched on for most of them and exists to tell me about exactly this, had told me nothing.

![Terminal output of pnpm audit --audit-level critical, run on 26 October 2026 against this site's lockfile from before the fix. It lists two critical Next.js advisories, remote code execution in the Image Optimization API when SVG files are used and remote code execution in use cache functions returning typed arrays, both against next versions 16.0.0 to 16.4.0 and patched in 16.4.1. The summary counts 14 findings, 2 of them critical; the rest include advisories published after 23 October.](/images/blog/october-brought-the-awareness/audit-before-fix.png)

## The timeline

I went back and pulled the timestamps, expecting to write about a gap of a few hours.

![Timeline from 14 to 26 October 2026, in UTC. On 14 October at 17:46 Next.js publishes the three advisories and 16.4.1 ships a minute later. An orange bracket of 8 days runs from there to 22 October, 15:50 to 16:42, when the GitHub Advisory Database lists them: during those 8 days the fix is on npm and every scanner reading that database is blind. The last CI run passes at 14:54 on 22 October, 56 minutes before the listing. Three projects are patched on 23 October between 09:22 and 14:46, with no Dependabot alert before any fix. The new daily audit fails on 3 newer high advisories at 10:23 on 24 October. On 26 October a fourth project, still vulnerable with alerts on, has no Dependabot alert almost four days after the listing.](/images/blog/october-brought-the-awareness/timeline.png)

| When (UTC, 2026) | What happened |
| --- | --- |
| 14 Oct, 17:46 | Next.js publishes the three advisories in its own repository. 16.4.1 ships a minute later, with release notes naming all three. |
| 22 Oct, 14:54 | The last CI run on this site's main branch passes, dependency audit included. |
| 22 Oct, 15:50 to 16:42 | The three advisories enter the GitHub Advisory Database. |
| 23 Oct, 09:22 to 14:46 | I patch three of my projects, 17 to 23 hours after the listing. None of them had received a Dependabot alert for any of the three advisories, in any state, before its fix landed. |
| 23 Oct, 11:16 | I commit the fix for this site, 19 hours and 26 minutes after the first of them was listed. |
| 26 Oct | A fourth project, still on a vulnerable version with Dependabot alerts switched on, has no alert for any of the three, almost four days after the listing. |

The row that matters is not the one I sat down to write about. I came for a 19-hour gap and found an eight-day one: the fix was on npm, with its advisories linked from the release notes, for eight days before any scanner I use could know it existed.

## The scanner was right

It is worth being fair to the tooling here, because the easy version of this post blames it. My CI audit passed at 14:54 on the 22nd because the database it reads did not list those advisories yet. An hour later it did, and the same command against the same lockfile failed. The scanner was right at the moment it looked.

The problem is where it looks. `pnpm audit` and `npm audit` ask the npm registry, which draws on the GitHub Advisory Database. Dependabot reads the same database. OSV, which I checked as a second opinion, lists all three advisories with the same publication times as GitHub, to the second. That is four tools and one source. When the source is eight days behind the vendor, all four are eight days behind with it, and running a fifth would change nothing.

![Wiring diagram. The vendor's Next.js advisories and 16.4.1 release notes, 14 October 17:46, connect over an 8-day review-and-listing wire to one source, the GitHub Advisory Database, 22 October 15:50. From the database, one junction feeds four bells: pnpm audit and npm audit through the npm registry, Dependabot directly, and OSV with the same times to the second. A separate dashed wire runs from the vendor straight to you on day 0: the vendor's own release, which you get by choosing Watch, then Custom, then Releases on the repository.](/images/blog/october-brought-the-awareness/one-source.png)

## That question has a name

Which left the question I should have asked a long time ago: when a vulnerability is announced and nothing tells you, what do you do? The answer is old, and it is called defence in depth. No single control is trusted to catch everything, so each one is placed to catch what the one before it misses. I had applied that idea to my code and to my servers. I had never applied it to how I find out.

Here is what would have closed the gap in my case, starting with the one that closes the most of it.

![Four stacked layers of defence in depth applied to finding out. 1, watch the vendor's releases: day 0, which here would have been 8 days ahead of every scanner I ran. 2, scan on a schedule, not only on a push: within a day of the database listing; the first daily run on 24 October failed on 3 newer high advisories. 3, something in front of the app, a WAF rule or a smaller surface: it buys time, and for PHP2Shell Cloudflare had rules about 9 hours before disclosure, while no vendor rule was found for these Next.js flaws. 4, an alert that reaches a person: email, Slack or a webhook, and a failed scheduled run emails whoever last changed the schedule.](/images/blog/october-brought-the-awareness/layers.png)

**Watch the vendor, not just the database.** The 16.4.1 release notes listed all three advisories, by name and by severity, on 14 October. On GitHub, choosing Watch, then Custom, then Releases on the repository of a framework you depend on sends you that announcement the moment it ships, which here would have been eight days before any scanner. It gets noisy for a project that releases often, but a mail filter on the word "security" handles most of that.

**Scan on a schedule, not only when you push.** My audit ran on pull requests and pushes, which meant a quiet repository was an unassessed one. The slightly embarrassing part is that the CI/CD lab I wrote this month already runs its scans weekly for exactly this reason, and this site's own audit job did not. It now runs daily, and a failed scheduled run emails me. That does not touch the eight days, because it reads the same database, but it turns "whenever I next push" into "within a day of the listing". It earned its place on its first morning. The first scheduled run, at 10:23 UTC on 24 October, failed on three high advisories that had been listed or updated the evening before, one of them against a direct dependency, and it failed again on the 25th and 26th until I patched them. Dependabot raised nothing for those either.

![GitHub Actions page for this site's CI workflow, filtered to scheduled runs and captured on 26 October 2026. Three runs on main, numbers 50, 51 and 52, on 24 October at 10:23, 25 October at 10:50 and 26 October at 12:21, all failed.](/images/blog/october-brought-the-awareness/scheduled-audit-failing.png)

**Put something in front of the app that can be patched faster than the app.** This is the job a WAF does. During PHP2Shell, Cloudflare had rules blocking exploit attempts from 03:02 UTC on 21 October, which it says was about nine hours ahead of public disclosure, switched on for every plan including the free one, while still telling customers to patch. That is the shape of the help a WAF gives: it buys time, and then the patch still has to arrive. I could not find a vendor rule for these Next.js flaws, so here the nearest equivalent sits in the app itself. Limiting `images.remotePatterns` to hosts you trust narrows who can hand the image optimiser a file, and `images.unoptimized` removes it where you do not need it. When I measured [what my own WAF actually blocked](/blog/what-my-waf-actually-blocked), the conclusion was the same: a compensating control, not a fix.

**Make the alert reach a person.** An alert that lands in a dashboard nobody opens is a log entry. Whatever you add should arrive where you already look, whether that is email from a failed scheduled run, a Slack message, or a webhook from a tool that watches your dependency list for you.

## What this does not show

On this site, as far as I can tell, none of the three flaws was reachable. The image flaw lives in an upstream library, and the advisory's own workaround is `sharp` 0.35.5 or later, which this site's lockfile already resolved. I do not use `use cache`, and there are no Server Actions. That is luck rather than design, and I patched anyway, partly because the `use cache` advisory tells you to upgrade even if you have no such functions.

I also do not know why the advisories took eight days to reach the global database, or why Dependabot stayed silent after they did. The GitHub Advisory Database holds two kinds of entry: reviewed advisories, which GitHub curates, and unreviewed ones, which are published automatically from the National Vulnerability Database. Dependabot alerts are generated from the reviewed ones, and I cannot see the review queue. Dependabot also does not raise an alert once the vulnerable version is already gone from the default branch, so the three projects I patched within a day tell you the alert had not arrived by then, not that it never would. The fourth project is the clearer evidence, and it is one repository, not a survey. And I have not compared commercial feeds such as Snyk or Socket on this incident, so I cannot tell you whether they were faster. If you have that data, I would like to see it.

## Check yours in two minutes

This example uses the Next.js advisory GHSA-2464-fhr4-w9xw, so the queries below are hard-coded to it. To check your own stack, swap in the repository and advisory ID of a framework you depend on. The commands compare when the vendor published the advisory with when your scanner could first have known:

```bash
# when the vendor published it
gh api repos/vercel/next.js/security-advisories/GHSA-2464-fhr4-w9xw --jq .published_at

# when the database your scanner reads listed it
gh api advisories/GHSA-2464-fhr4-w9xw --jq .published_at

# what you are actually running
pnpm why next   # or: npm ls next
```

![Terminal output of the two commands. The vendor advisory GHSA-2464-fhr4-w9xw in the Next.js repository was published at 2026-10-14T17:46:48Z. The same advisory in the GitHub Advisory Database was published at 2026-10-22T15:52:53Z.](/images/blog/october-brought-the-awareness/two-dates.png)

For this advisory the first command prints `2026-10-14T17:46:48Z` and the second prints `2026-10-22T15:52:53Z`. The distance between your two dates is a lower bound on the lag between the vendor and the database. It is not the exact period every scanner was blind, because how quickly each scanner refreshed or ingested the listing is something this post did not measure. If your scanner and your Dependabot agree with each other, that is not two opinions. It is one, quoted twice.
