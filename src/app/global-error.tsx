"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import ErrorScreen, { RetryButton } from "@/components/ErrorScreen";
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
  error: Error & { digest?: string };
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
          description="The site hit an error while loading. It is not something you did. Try again, and if it keeps happening, the reference below is what finds it in the logs."
          reference={error.digest}
          actions={<RetryButton onClick={retry} />}
        />
      </body>
    </html>
  );
}
