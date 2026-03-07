"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-2xl font-semibold">Something went wrong in the ocean</h2>
      <p className="text-muted-foreground">Please try refreshing this section.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
