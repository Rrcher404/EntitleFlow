import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import { buildMetadata } from "@/lib/site-config";
import { fontClassNames } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = buildMetadata({
  title: "Permit chaos, comments, and resubmittals",
  description:
    "EntitleFlow NC is development approval operations software for North Carolina firms that need cleaner reviewer comment workflows and better approval visibility.",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fontClassNames} bg-background text-foreground antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
