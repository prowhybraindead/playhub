"use client";

import { useTranslation } from "@/components/providers/i18n-provider";

export function T({ children }: { children: string }) {
  const { t } = useTranslation();
  return <>{t(children)}</>;
}
