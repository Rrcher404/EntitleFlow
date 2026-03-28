import { z } from "zod";

export const walkthroughLeadSchema = z.object({
  intent: z.literal("walkthrough"),
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.email("Enter a valid work email."),
  company: z.string().trim().min(2, "Company is required."),
  companyType: z.string().trim().min(2, "Company type is required."),
  activeNcJurisdictions: z.string().trim().min(2, "Share at least one NC jurisdiction."),
  annualProjectVolume: z.string().trim().min(1, "Approximate project volume is required."),
  biggestWorkflowIssue: z.string().trim().min(10, "Tell us a bit more about the workflow issue."),
  issueCategory: z.enum(["comments", "resubmittals", "status visibility", "portal sprawl", "other"]),
  sourcePath: z.string().trim().min(1),
});

export const earlyAccessLeadSchema = z.object({
  intent: z.literal("early-access"),
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.email("Enter a valid work email."),
  company: z.string().trim().min(2, "Company is required."),
  companyType: z.string().trim().min(2, "Company type is required."),
  primaryNcJurisdiction: z.string().trim().min(2, "Primary NC jurisdiction is required."),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  sourcePath: z.string().trim().min(1),
});

export const marketingLeadSchema = z.discriminatedUnion("intent", [walkthroughLeadSchema, earlyAccessLeadSchema]);

export type MarketingLeadSchema = z.infer<typeof marketingLeadSchema>;
