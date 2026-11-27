---
title: "Eleven fixes from one code review"
description: "No scanner reported any of them. A coding agent ran a security-review skill I wrote over my own multi-tenant app, and I reviewed every patch. The result: eleven small security commits, including an XSS sink, a token compared with ===, and a sign-in that never checked the issuer."
date: 2026-11-27
tags: [security, appsec, webdev, nextjs]
cover: /images/blog/eleven-fixes-from-one-code-review/coverimage.jpg
coverAlt: "A printer's proof sheet on a bright yellow desk, its lines shown as abstract black bars indented like code, with eleven red proofreading marks each ticked in the margin. A red pencil lies beside it with its point touching the page. Headline: None had been flagged by a scanner."
draft: false
devto_published: false
---

A map popup on a fleet-tracking dashboard shows a vehicle's name, its status and its type. The code that builds it looks like this:

```tsx
new mapboxgl.Popup({ offset: 25 }).setHTML(
  `<div class="p-2">
     <p class="font-bold">${vehicle.name}</p>
     <p>Status: ${vehicle.status}</p>
   </div>`
);
```

It works, it passes the linter, and nobody ever complained about it. But `vehicle.name` is a field a member of one organisation types in, and the popup is rendered in the browser of everyone else who can see that vehicle. Give a vehicle the name `<img src=x onerror=...>` and `setHTML` turns the name into markup instead of text. That is a stored cross-site scripting hole, sitting in a component nobody had reason to suspect.

The fix is to stop building HTML out of strings. Create the elements, set `textContent`, hand the finished node to the map:

```tsx
const name = document.createElement('p');
name.textContent = vehicle.name;
container.append(name /* ...status, type */);
return new mapboxgl.Popup({ offset: 25 }).setDOMContent(container);
```

![A member of one organisation types an image tag with an onerror attribute as a vehicle name. Before: the name goes through setHTML in a template string, becomes markup and runs in the browser of everyone else who can see that vehicle, which is stored cross-site scripting. After: the name is set with textContent and handed over with setDOMContent, so it stays text, the popup shows the characters and nothing runs.](/images/blog/eleven-fixes-from-one-code-review/markup-or-text.png)

That was one of eleven commits from a single review pass on a multi-tenant app I maintain. I will say plainly how that pass ran, because it matters for how to read the rest. I wrote the review skill, a coding agent ran it, found the issues and drafted the patches, and I read every finding and every patch before it merged. The value was in what the review was told to look for and in checking each answer, not in who typed the fix. None of the eleven had been flagged by a scanner, because none of them is a known-vulnerable package or a leaked key. My last post was about [controls that passed while the thing next to them was broken](/blog/three-controls-that-looked-switched-on). These are the other kind: small decisions in the app's own code that looked fine in isolation and only show up when someone reads them.

## A token compared the ordinary way

The CSRF check used a double-submit cookie: the browser sends a token in a header and the same token in a cookie, and the server checks they match. The check was one line.

```ts
if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
  throw new ForbiddenException('Invalid or missing CSRF token');
}
```

`!==` on strings returns as soon as it finds the first character that differs, so in principle the time it takes leaks how much of a guess was right. Over the internet that signal is very faint, and I would not rank this as the most dangerous line in the codebase. But a secret comparison is the one place where the careful version costs nothing, so it became a constant-time comparison. The missing-token check stays in front of it, and a length check comes first, because `timingSafeEqual` throws on buffers of different sizes:

```ts
if (!csrfHeader || !csrfCookie) {
  throw new ForbiddenException('Invalid or missing CSRF token');
}
const a = Buffer.from(csrfHeader);
const b = Buffer.from(csrfCookie);
if (a.length !== b.length || !timingSafeEqual(a, b)) {
  throw new ForbiddenException('Invalid or missing CSRF token');
}
```

## A sign-in that never asked who issued the token

The Google sign-in path took the token the browser sent, asked Google's token endpoint about it, checked the token was meant for this app, and returned the account's `sub` as the user's Google ID. Nothing in between asked who had issued it. Google's own guide to verifying these tokens lists the issuer as one of the checks, so the fix adds it: `iss` must be one of the two values Google uses for its own tokens:

```ts
if (data.iss !== 'https://accounts.google.com' && data.iss !== 'accounts.google.com') {
  throw new UnauthorizedException('Invalid Google credential.');
}
```

I would not call this an open door. Google's endpoint only vouches for tokens Google signed, so the issuer check is a second lock rather than the first, and account linking had a separate, larger problem that I fixed in its own change. The point of this commit is narrower: a login path that reads identity out of a token should check every claim it relies on, and this was one nobody had checked.

## The rest, quickly

A login field with no maximum length let anyone send a megabyte-long password for bcrypt to chew on, so the login DTO got `@MaxLength(128)`, and the login form got the same 64-character limit as sign-up. The list endpoints in the admin area returned every row in the table, so they gained `page` and `limit` parameters and a cap on how many rows one page can return. A vehicle colour string went straight into a CSS `color` property, so it is now checked against a hex-colour pattern first and ignored if it does not match. Transferring ownership of an organisation could pick an admin who was inactive or suspended, which is no longer allowed. Superadmin routes got a second guard at the proxy layer, as a convenience and not as the authority, since the API enforces the role either way. And the rate limiter's error message was trimmed so it stopped saying exactly how long to wait.

![A proof sheet of the fixes this post names, from a review pass of eleven commits. Map popup: built HTML with setHTML, now textContent and setDOMContent. CSRF check: compared with !==, now timingSafeEqual with a length check first. Google sign-in: never checked the issuer, now iss must be one of Google's two values. Login field: no maximum length, now MaxLength 128, with 64 on the login form. Admin list endpoints: returned every row, now page and limit with a cap per page. Vehicle colour: went straight into CSS color, now checked against a hex pattern. Ownership transfer: could pick an inactive or suspended admin, no longer allowed. Superadmin routes: a second guard at the proxy, for convenience. Rate limiter message: said exactly how long to wait, now trimmed. No scanner had flagged any of them.](/images/blog/eleven-fixes-from-one-code-review/fixes-named.png)

## What none of this was

A review like this does not replace the scanners. The same app runs static analysis, dependency scanning and secrets scanning in CI, and those catch a different class of problem, one that does not need anyone to read anything. What the ones in this pipeline did not do was notice that a string was being used as markup, or that a token was trusted without asking who made it. Some static analysers can follow user input into an HTML sink, and a better-tuned rule might have caught the popup. But both are properties of how the code is used rather than of what it contains, and that is where a reader is more reliable than a pattern.

It also does not cover everything. The review covered the parts of the app that handle identity, input and tenant boundaries, which is a narrow slice. I did not test any of this against an attacker, and a few of the fixes, the timing comparison above all, close risks that are more theoretical than practical.

You can run a rough version of this review on your own code in two minutes. These two searches find the first two patterns above, and every hit is worth reading once:

```bash
grep -rnE "setHTML\(|innerHTML|dangerouslySetInnerHTML" src
grep -rnE "(csrf|token|secret|signature|hmac)[A-Za-z_]* *(===|!==)" src
```

If either comes back with a line where user-supplied text becomes markup, or a secret is compared with a plain equals sign, you have found your first commit.
