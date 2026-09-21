import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Static-site CSP (no nonces). A nonce-based policy would force every page to
// render dynamically and give up CDN caching, so scripts keep 'unsafe-inline'
// and the other directives carry the weight. See tasks/security-audit.md (20).
// img-src allows any https origin: icons come from cdn.simpleicons.org and
// api.iconify.design, and blog assets may be served from NEXT_PUBLIC_ASSET_ORIGIN.
// upgrade-insecure-requests is production-only: localhost is exempt from it,
// but the dev server is also reachable over the LAN (Next prints that address),
// and there every http asset would be upgraded to https and fail.
const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';${isDev ? "" : "\n  upgrade-insecure-requests;"}
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
