import type { Metadata } from "next";
import ErrorScreen from "@/components/ErrorScreen";

export const metadata: Metadata = {
  title: "Page not found",
  // Overrides the root layout's "index, follow" so it doesn't sit beside Next's noindex
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <ErrorScreen
      status="404"
      statusText="Not Found"
      title="Out of scope"
      description="Nothing lives at this address. The link may be old or mistyped, or the page moved when the site was reorganised. Everything that does exist is one step away."
    />
  );
}
