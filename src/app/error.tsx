"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import ErrorScreen, { RetryButton } from "@/components/ErrorScreen";

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
  error: Error & { digest?: string };
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
      description="This page hit an error while loading. It is not something you did. Try again, and if it keeps happening, the reference below is what finds it in the logs."
      reference={error.digest}
      actions={<RetryButton onClick={retry} />}
    />
  );
}
