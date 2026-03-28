"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormSuccessState } from "@/components/forms/form-success-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { earlyAccessLeadSchema } from "@/lib/leads/schema";
import type { EarlyAccessFormValues } from "@/lib/types";
import { cn } from "@/lib/utils";

type EarlyAccessFormProps = {
  sourcePath: string;
};

export function EarlyAccessForm({ sourcePath }: EarlyAccessFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EarlyAccessFormValues>({
    resolver: zodResolver(earlyAccessLeadSchema),
    defaultValues: {
      intent: "early-access",
      fullName: "",
      email: "",
      company: "",
      companyType: "",
      primaryNcJurisdiction: "",
      note: "",
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
        setSubmitError(body.error || "We could not save your early-access request. Please try again.");
        return;
      }

      trackEvent("early_access_form_submit", { sourcePath: values.sourcePath, companyType: values.companyType });
      setSubmitted(true);
      form.reset();
    });
  });

  if (submitted) {
    return (
      <FormSuccessState
        description="You are on the list for launch updates, guide releases, and pilot availability. If your workflow needs attention sooner, you can move straight into a founder-led walkthrough."
        secondaryHref="/walkthrough"
        secondaryLabel="Need help sooner? Request a walkthrough"
        title="You joined early access"
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("intent")} />
      <input type="hidden" {...form.register("sourcePath")} value={sourcePath} />
      <Field label="Full name" error={form.formState.errors.fullName?.message} htmlFor="early-access-full-name">
        <Input id="early-access-full-name" placeholder="Taylor Morgan" {...form.register("fullName")} />
      </Field>
      <Field label="Work email" error={form.formState.errors.email?.message} htmlFor="early-access-email">
        <Input id="early-access-email" placeholder="taylor@firm.com" type="email" {...form.register("email")} />
      </Field>
      <Field label="Company" error={form.formState.errors.company?.message} htmlFor="early-access-company">
        <Input id="early-access-company" placeholder="Blue Ridge Civil" {...form.register("company")} />
      </Field>
      <Field label="Company type" error={form.formState.errors.companyType?.message} htmlFor="early-access-company-type">
        <NativeSelect id="early-access-company-type" {...form.register("companyType")}>
          <option value="">Select a company type</option>
          <option value="Architecture firm">Architecture firm</option>
          <option value="Civil / site firm">Civil / site firm</option>
          <option value="Developer / builder">Developer / builder</option>
          <option value="Permit expeditor / consultant">Permit expeditor / consultant</option>
          <option value="Other">Other</option>
        </NativeSelect>
      </Field>
      <Field
        label="Primary NC jurisdiction"
        error={form.formState.errors.primaryNcJurisdiction?.message}
        htmlFor="early-access-jurisdiction"
      >
        <Input id="early-access-jurisdiction" placeholder="Greensboro" {...form.register("primaryNcJurisdiction")} />
      </Field>
      <Field label="Optional note" error={form.formState.errors.note?.message} htmlFor="early-access-note">
        <Textarea
          id="early-access-note"
          placeholder="We want better visibility into comments and resubmittals across a few repeat NC jurisdictions."
          {...form.register("note")}
        />
      </Field>

      {submitError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      ) : null}

      <Button className="w-full justify-center" disabled={isPending} size="lg" type="submit">
        {isPending ? "Saving your request..." : "Join early access"}
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
