"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        className: "bg-card text-card-foreground border border-border"
      }}
    />
  );
}
