"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import ErrorScreen, { digestOf, RetryButton } from "@/components/ErrorScreen";
import { ppMori } from "./fonts";
import "./globals.css";

/**
 * The last resort: an error in the root layout itself, which error.tsx cannot
 * catch because it sits inside that layout. This replaces the whole document,
 * so it brings its own <html>, <body>, styles and font, and there is no navbar
 * or footer. metadata exports are not supported here, hence the <title>.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={ppMori.variable}>
      <body
        className={`${ppMori.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <title>Something broke</title>
        <ErrorScreen
          status="500"
          statusText="Something broke"
          title="That's on my side"
          description="The site failed to load. It isn't something you did. Try again, or come back in a few minutes. If it keeps happening, email me the reference and I'll find out why."
          digest={digestOf(error)}
          plainLinks
          report
          actions={<RetryButton onClick={retry} />}
        />
      </body>
    </html>
  );
}
