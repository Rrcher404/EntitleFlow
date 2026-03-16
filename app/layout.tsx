import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Instrument_Sans, Manrope } from "next/font/google";

import { buildMetadata } from "@/lib/site-config";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = buildMetadata({
  title: "Permit chaos, comments, and resubmittals",
  description:
    "EntitleFlow NC is development approval operations software for North Carolina firms that need cleaner reviewer comment workflows and better approval visibility.",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${instrumentSans.variable} bg-background text-foreground antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
