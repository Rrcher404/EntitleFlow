"use client";

import Link, { type LinkProps } from "next/link";

import { trackEvent } from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/types";

type TrackedLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    eventName?: AnalyticsEventName;
    eventProps?: Record<string, string | number | boolean | null | undefined>;
  };

export function TrackedLink({ eventName, eventProps, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (eventName) {
          trackEvent(eventName, eventProps);
        }
        onClick?.(event);
      }}
    />
  );
}
