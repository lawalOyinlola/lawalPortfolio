---
title: "October brought the awareness after all"
platform: linkedin
companion_to: ../../blog/october-brought-the-awareness.md
status: draft
---

# LinkedIn: October brought the awareness after all

Post with one image, `october-board.png` (this folder, 2160×2700, a 4:5 portrait). Post the blog first,
then add the first comment straight after this. The image's source is `october-board.svg`; edit that and
re-render, never the PNG:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1080,1350 \
  --screenshot="$PWD/october-board.png" "file://$PWD/october-board.svg"
```


## Copy this

```text
October 2026 is Cybersecurity Awareness Month, and nobody could say they missed it. Between 14 and 21 October alone:

• PHP2Shell: two unauthenticated remote code execution flaws in PHP itself, rated 9.2. Details leaked before the coordinated release, Amazon reported exploitation attempts four days before the patch, and PHP says updating is the only safe choice.
• NGINX: five fixes on 14 October, three of them memory bugs that F5 scores 9.2 and nginx.org rates medium. Same bugs, two opinions, and only your config decides which one is right.
• BeyondTrust Remote Support: a critical authentication bypass, already exploited and added to CISA's Known Exploited Vulnerabilities catalogue on 16 October.
• Next.js: two critical unauthenticated remote code execution flaws rated 9.5, one in image optimisation and one in use cache, plus a denial of service rated 8.2.
• Node.js: ten CVEs fixed across three release lines. None critical, four rated high, one of them a Brotli decoder bug that can allow remote code execution.

I read most of that as someone else's problem, since I don't run PHP. Then a dependency audit flagged Next.js in seven of the projects I run, and when I pulled the timestamps, the fix had been on npm for eight days before any scanner I use could see it. On a project I hadn't patched yet, Dependabot was still silent almost four days after the database caught up.

So here is what I'm taking from awareness month. Defence in depth usually gets said about code and servers, but it applies just as much to how you find out. If every alert you rely on reads the same database, you have one alert. Watch the vendor's releases as well, scan on a schedule and not only when you push, and keep something in front of the app, like a WAF, that can be patched faster than the app.

The full timeline, and a two minute check that shows how far behind your own scanner was, are in the comments.

#CyberSecurityAwarenessMonth #CyberSecurity #ApplicationSecurity #DevSecOps #VulnerabilityManagement
```

## First comment

```text
The full timeline and the two minute check: https://lawaloyinlola.com/blog/october-brought-the-awareness
```

## Image alt text (LinkedIn: Add alt text)

```text
A card titled "October 2026: Awareness month, in five advisories". PHP2Shell, CVE-2026-109618 and CVE-2026-109619: unauthenticated RCE in PHP itself, exploit attempts reported 4 days before the patch, 9.2 critical. BeyondTrust Remote Support, CVE-2026-102764: authentication bypass exploited in the wild, on CISA's KEV catalogue from 16 October, critical. NGINX, CVE-2026-15176 and four more: three memory bugs behind specific configs, scored 9.2 by F5 and medium by nginx.org, plus request-body injection in HTTP/3 and session forgery with TLS session tickets. Next.js, CVE-2026-96889 and two more: two unauthenticated RCEs rated 9.5 critical and a DoS rated 8.2 high, the one that was in seven of my projects. Node.js, 10 CVEs across 22.x, 24.x and 26.x: none critical, 4 of 10 rated high, including a Brotli decoder bug that can allow RCE. Disclosed between 14 and 21 October 2026; scores are CVSS v4 where one is given.
```

## Notes

- The post stays on the month's events, as asked. The personal part is one paragraph and exists to set up the defence in depth line, which is the load-bearing sentence: "If every alert you rely on reads the same database, you have one alert."
- "Eight days" is the vendor advisory (14 Oct, 17:46 UTC) to the GitHub Advisory Database listing (22 Oct, 15:50 UTC). The blog carries the exact times; the post rounds to days.
- Node.js is included with its rating stated, because it was announced this month but nothing in it is critical.
- Held back: the project names, and which were patched when. All seven are on fixed versions before this goes out.

## Related

- Blog: [October brought the awareness after all](../../blog/october-brought-the-awareness.md)
- Earlier: [What my WAF actually blocked](../../blog/what-my-waf-actually-blocked.md)

## Claims

| Claim | Verified at |
| --- | --- |
| National Cybersecurity Alliance 2026 theme "Don't Make It Easy for Them", updates is one of four habits | Search results citing NCA, 2026-10-23 |
| PHP2Shell: CVE-2026-109618 and CVE-2026-109619, CVSS v4 9.2, fixed in 8.5.12, 8.4.27, 8.3.36, 8.2.35 on 21 Oct; "no complete mitigations, updating is the only safe choice" | php.net news and release notes |
| Details leaked before coordinated release; Amazon saw exploitation attempts four days before patches | SecurityWeek, "PHP2Shell: Mass Exploitation Looms for Leaked Critical PHP Flaws", updated 22 Oct |
| BeyondTrust CVE-2026-102764: CISA calls it critical, actively exploited, added to KEV 16 Oct | cisa.gov alerts, 16 Oct 2026 |
| Next.js: GHSA-2464-fhr4-w9xw (CVE-2026-96889) and GHSA-673q-mjm6-r5xr, CVSS v4 9.5 critical; GHSA-p3m5-59mp-jv5r (CVE-2026-94482) 8.2 high; fixed 16.4.1 and 15.5.28 | `gh api advisories/<id>` |
| Vendor advisories published 14 Oct 17:46 UTC; 16.4.1 released 17:47 UTC with release notes naming all three | `gh api repos/vercel/next.js/security-advisories/<id>`, `gh release view v16.4.1 -R vercel/next.js` |
| GitHub Advisory Database listing 22 Oct 15:50 to 16:42 UTC; OSV times identical | `gh api advisories/<id>`, `api.osv.dev/v1/vulns/<id>` |
| Node.js 21 Oct: 10 CVEs, 4 high, 3 medium, 3 low, none critical; CVE-2026-111497 Brotli out-of-bounds write allowing RCE | nodejs.org, "Wednesday, October 21, 2026 Security Releases" |
| NGINX: CVE-2026-15176, CVE-2026-93479, CVE-2026-97205 published 14 Oct, F5 CVSS v4 9.2; nginx.org rates all five medium; fixed 1.30.6 and 1.31.7 | NVD (source f5sirt), nginx.org/en/security_advisories.html |
| Seven projects on vulnerable Next.js versions | `package.json` and lockfiles of the local checkouts, 2026-10-23 |
| Three projects patched 23 Oct (09:22 to 14:46 UTC) had no Dependabot alert for the three advisories in any state before the fix; one project still on next 16.3.6 with alerts on had none on 26 Oct | `gh api repos/<owner>/<repo>/dependabot/alerts`, lockfile on the default branch |
| Cloudflare PHP2Shell rules live from 03:02 UTC 21 Oct, "about 9 hours ahead of public disclosure", all plans including Free, customers should still patch | blog.cloudflare.com, "Cloudflare deploys protections against php2shell vulnerability" |
| Last green CI on main 22 Oct 14:54 UTC; fix committed 23 Oct 11:16:31 UTC | `gh run list`, `git log` |
| No Dependabot alert for the three advisories in any state on the three repos at 23 Oct 12:43 UTC | `gh api repos/<owner>/<repo>/dependabot/alerts` |
