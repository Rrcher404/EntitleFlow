"use client";

import { type LinkProps } from "next/link";

import { TrackedLink } from "@/components/site/tracked-link";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { AnalyticsEventName } from "@/lib/types";

type TrackedLinkButtonProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    eventName?: AnalyticsEventName;
    eventProps?: Record<string, string | number | boolean | null | undefined>;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    className?: string;
    children: React.ReactNode;
  };

export function TrackedLinkButton({
  eventName,
  eventProps,
  variant,
  size,
  className,
  children,
  ...props
}: TrackedLinkButtonProps) {
  return (
    <Button asChild className={className} size={size} variant={variant}>
      <TrackedLink eventName={eventName} eventProps={eventProps} {...props}>
        {children}
      </TrackedLink>
    </Button>
  );
}
