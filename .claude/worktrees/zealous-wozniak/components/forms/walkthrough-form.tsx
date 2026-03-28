"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormSuccessState } from "@/components/forms/form-success-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { walkthroughLeadSchema } from "@/lib/leads/schema";
import type { WalkthroughFormValues } from "@/lib/types";
import { cn } from "@/lib/utils";

type WalkthroughFormProps = {
  sourcePath: string;
};

type SubmissionState = {
  leadId: string;
} | null;

export function WalkthroughForm({ sourcePath }: WalkthroughFormProps) {
  const [submission, setSubmission] = useState<SubmissionState>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const calendlyUrl = useMemo(
    () => process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/your-handle/entitleflow-walkthrough",
    [],
  );

  const form = useForm<WalkthroughFormValues>({
    resolver: zodResolver(walkthroughLeadSchema),
    defaultValues: {
      intent: "walkthrough",
      fullName: "",
      email: "",
      company: "",
      companyType: "",
      activeNcJurisdictions: "",
      annualProjectVolume: "",
      biggestWorkflowIssue: "",
      issueCategory: "comments",
      sourcePath,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSubmitError(null);

    startTransition(async () => {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const body = (await response.json()) as { error?: string; leadId?: string };

      if (!response.ok || !body.leadId) {
        setSubmitError(body.error || "We could not save your walkthrough request. Please try again.");
        return;
      }

      trackEvent("walkthrough_form_submit", { sourcePath: values.sourcePath, companyType: values.companyType });
      setSubmission({ leadId: body.leadId });
      form.reset({ ...form.getValues(), fullName: "", email: "", company: "", activeNcJurisdictions: "", annualProjectVolume: "", biggestWorkflowIssue: "" });
    });
  });

  if (submission) {
    return (
      <FormSuccessState
        description="Your walkthrough request is in. The next step is booking a founder-led session focused on your current review-cycle friction, resubmittal process, and approval visibility needs."
        nextStepEventName="calendly_handoff_click"
        nextStepHref={calendlyUrl}
        nextStepLabel="Pick a walkthrough time"
        secondaryHref="/pricing"
        secondaryLabel="See launch pricing"
        title="Walkthrough request received"
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("intent")} />
      <input type="hidden" {...form.register("sourcePath")} value={sourcePath} />
      <Field label="Full name" error={form.formState.errors.fullName?.message} htmlFor="walkthrough-full-name">
        <Input id="walkthrough-full-name" placeholder="Taylor Morgan" {...form.register("fullName")} />
      </Field>
      <Field label="Work email" error={form.formState.errors.email?.message} htmlFor="walkthrough-email">
        <Input id="walkthrough-email" placeholder="taylor@firm.com" type="email" {...form.register("email")} />
      </Field>
      <Field label="Company" error={form.formState.errors.company?.message} htmlFor="walkthrough-company">
        <Input id="walkthrough-company" placeholder="Blue Ridge Civil" {...form.register("company")} />
      </Field>
      <Field label="Company type" error={form.formState.errors.companyType?.message} htmlFor="walkthrough-company-type">
        <NativeSelect id="walkthrough-company-type" {...form.register("companyType")}>
          <option value="">Select a company type</option>
          <option value="Architecture firm">Architecture firm</option>
          <option value="Civil / site firm">Civil / site firm</option>
          <option value="Developer / builder">Developer / builder</option>
          <option value="Permit expeditor / consultant">Permit expeditor / consultant</option>
          <option value="Other">Other</option>
        </NativeSelect>
      </Field>
      <Field
        label="Active NC jurisdictions"
        error={form.formState.errors.activeNcJurisdictions?.message}
        htmlFor="walkthrough-jurisdictions"
      >
        <Textarea
          id="walkthrough-jurisdictions"
          placeholder="Greensboro, Raleigh, Wake County"
          {...form.register("activeNcJurisdictions")}
        />
      </Field>
      <Field
        label="Approximate annual project volume"
        error={form.formState.errors.annualProjectVolume?.message}
        htmlFor="walkthrough-volume"
      >
        <NativeSelect id="walkthrough-volume" {...form.register("annualProjectVolume")}>
          <option value="">Select a range</option>
          <option value="1-10 active projects">1-10 active projects</option>
          <option value="11-25 active projects">11-25 active projects</option>
          <option value="26-50 active projects">26-50 active projects</option>
          <option value="50+ active projects">50+ active projects</option>
        </NativeSelect>
      </Field>
      <Field
        label="Biggest workflow issue"
        error={form.formState.errors.biggestWorkflowIssue?.message}
        htmlFor="walkthrough-issue"
      >
        <Textarea
          id="walkthrough-issue"
          placeholder="We lose track of reviewer comments between civil, architecture, and client updates."
          {...form.register("biggestWorkflowIssue")}
        />
      </Field>
      <Field label="Primary issue category" error={form.formState.errors.issueCategory?.message} htmlFor="walkthrough-category">
        <NativeSelect id="walkthrough-category" {...form.register("issueCategory")}>
          <option value="comments">Comments</option>
          <option value="resubmittals">Resubmittals</option>
          <option value="status visibility">Status visibility</option>
          <option value="portal sprawl">Portal sprawl</option>
          <option value="other">Other</option>
        </NativeSelect>
      </Field>

      {submitError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      ) : null}

      <Button className="w-full justify-center" disabled={isPending} size="lg" type="submit">
        {isPending ? "Saving your request..." : "Request a walkthrough"}
      </Button>
    </form>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <p className={cn("text-sm text-red-600", !error && "sr-only")} role={error ? "alert" : undefined}>
        {error || "No error"}
      </p>
    </div>
  );
}
