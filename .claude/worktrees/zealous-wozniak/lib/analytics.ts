"use client";

import type { AnalyticsEventName } from "@/lib/types";
import { track } from "@vercel/analytics";

export function trackEvent(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean | null | undefined>,
) {
  track(name, properties);
}
