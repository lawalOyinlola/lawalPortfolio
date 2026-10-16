"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import ErrorScreen, { digestOf, RetryButton } from "@/components/ErrorScreen";

/**
 * Catches a runtime error in any page under the root layout, so the navbar
 * and footer stay up and the visitor gets a way back instead of a blank
 * screen. The error's message is never shown: in production a server error
 * arrives as a generic message plus a digest, and a client error could carry
 * details that are not for visitors. The digest is what matches the server
 * log, so that is what the page offers to quote.
 */
export default function ErrorPage({
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
    <ErrorScreen
      status="500"
      statusText="Something broke"
      title="That's on my side"
      description="This page failed to load. It isn't something you did. Try again, or pick another page below. If it keeps happening, email me the reference and I'll find out why."
      digest={digestOf(error)}
      report
      actions={<RetryButton onClick={retry} />}
    />
  );
}
