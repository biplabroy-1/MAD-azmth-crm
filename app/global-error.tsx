"use client";

import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Dynamically import Sentry only on the client
    import('@sentry/nextjs')
      .then((Sentry) => {
        Sentry.captureException(error);
      })
      .catch((importError) => {
        // Optionally log the import error or handle it as needed
        console.error("Failed to load Sentry:", importError);
      });
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
