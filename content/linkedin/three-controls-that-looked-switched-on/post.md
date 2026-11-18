---
title: "Three controls that looked switched on"
platform: linkedin
companion_to: ../../blog/three-controls-that-looked-switched-on.md
status: draft
---

# LinkedIn: Three controls that looked switched on

Post with one image, `controls-card.png` (this folder, 2160×2700, a 4:5 portrait). Publish the blog first,
then add the first comment straight after this. The image's source is `controls-card.svg`; edit that and
re-render, never the PNG:

```bash
cd content/linkedin/three-controls-that-looked-switched-on
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1080,1350 \
  --screenshot="$PWD/controls-card.png" "file://$PWD/controls-card.svg"
```

## Copy this

```text
Three green lights on the panel, three switches up, and behind the glass, three wires that stopped an inch short of anything. That was three of my security controls, and every check I had said they were fine.

The deploy gate waited for the security scan on the exact commit that triggered it, which is what it was written to do. Then the server ran git reset --hard origin/main. On a quiet day that is the same commit. On a busy afternoon it is the next one, whose scan has not finished. The fix was to hand the server the SHA the gate verified and reset to that instead.

The secrets scanner read my full git history on every push, except the merge commits. By default git prints no diff for a merge, so a key pasted in while resolving a conflict sits in no commit the scanner ever reads. Turning merges on found 13 findings, every one a secret I had already rotated or marked a false positive, seen again through the merge that carried it.

The rate limiter trusted one proxy hop and read the client's address from X-Forwarded-For. The NGINX config in the repo set that header. The one running on the server was older and did not, so every visitor looked like 127.0.0.1 and shared one login limit, and a client could send its own header and pick the address it was limited as.

None of these was a missing control. Each one leaned on a fact next door: the commit the server would fetch, the patch git would print, the header a proxy would send. My checks all looked at the control, and the control was fine.

One you can run in a minute: send your own API a request with the header X-Forwarded-For: 203.0.113.7, then look at the address your logs recorded. If it says 203.0.113.7, a client can choose its own identity in your app. If it says 127.0.0.1, every client is the same person to your rate limiter.

The other two checks, and the fixes in full, are in the first comment.

#ApplicationSecurity #DevSecOps #CyberSecurity #CICD #WebSecurity
```

## First comment

```text
The full write-up, with a two-minute check for each of the three: https://lawaloyinlola.com/blog/three-controls-that-looked-switched-on
```

## Image alt text (LinkedIn: Add alt text)

```text
A dark green instrument-panel card titled "Three controls that looked switched on", under the label "Configured, reviewed and passing". Three panels, each with a lit green lamp and the word passing. Deploy gate: checked the security scan on the commit that triggered it; missed that the server ran git reset --hard origin/main, which on a busy day is the next commit, still unscanned; fix, reset to the SHA the gate verified. Secrets scanner: checked every commit in the full git history; missed that git prints no diff for a merge, so a key pasted in while resolving a conflict was never read; fix, --diff-merges=separate. Rate limiter: checked trust exactly one proxy hop; missed that the live NGINX never set X-Forwarded-For, so every visitor was 127.0.0.1, or whatever address they sent; fix, proxy_set_header X-Forwarded-For. Footer: None was a missing control. Each one leaned on a fact next door that nobody checked.
```

## Notes

- The opening is the blog's cover in words: lamps lit, switches up, wires short of their terminals. It sets up the whole post before any jargon appears.
- The load-bearing paragraph is "None of these was a missing control." It is the reason the three stories belong in one post.
- The check in the post is the header test, because it needs only curl and a log. The deploy and merge checks need more context and stay in the blog.
- The command is described in words, not written as a curl line with a URL, so LinkedIn does not linkify it.
- Held back: the 1,411 Juice Shop copies and the run time, the `tuxdb` to `uxdb` change, the edge rate limit and the 200-request test. All are in the blog.

## Related

- Blog: [Three controls that looked switched on](../../blog/three-controls-that-looked-switched-on.md)
- Lab: the CI/CD security pipeline, which drops merge-commit duplicates by rule and secret

## Claims

| Claim | Verified at |
| --- | --- |
| Gate waits for checks on the triggering commit; the deploy used to reset to `origin/main` | Trakkam `.github/workflows/deploy.yml`, git history |
| Deploy now resets to the verified SHA | Trakkam `.github/workflows/deploy.yml:182`, `deploy.sh:108` (`git reset --hard "$DEPLOY_SHA"`) |
| `git log -p` prints no diff for a merge by default; `--diff-merges=separate` prints it | git documentation; reproducible with the commands in the blog |
| 13 findings, all already triaged, seen again through merge commits | Trakkam `.gitleaksignore`, "DUPLICATES" section, checked 2026-10-28 |
| App trusts one proxy hop | Trakkam `backend/src/main.ts:39` (`app.set('trust proxy', 1)`) |
| Repo NGINX config set `X-Forwarded-For`, live config did not; fixed with `proxy_set_header` | Server config diff and fix, recorded in the blog post |
